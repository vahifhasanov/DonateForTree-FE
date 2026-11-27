// Local Express API for lab 7. No payment integration.
import express from 'express'
import bcrypt from 'bcryptjs'
import { createServer } from 'node:http'
import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeLegacySeed } from '../mock/migrations/remove-legacy-seed.js'
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import {
  PRICE_PER_TREE,
  REGIONS,
  plantingCoordinates,
  validateCredentials,
  validatePlanting,
} from '../src/utils/trees.js'

const seedPath = fileURLToPath(new URL('../mock/seed.json', import.meta.url))
const hash = (password, salt) => scryptSync(password, salt, 64).toString('hex')
const publicUser = ({ id, name, email }) => ({ id, name, email })
const publicTree = (tree) => {
  const { requestKey, ...data } = tree
  void requestKey
  return data
}
const apiError = (status, message) =>
  Object.assign(new Error(message), { status })

export function createApi(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = JSON.parse(
    readFileSync(
      existsSync(databasePath) ? databasePath : seedPath,
      'utf8',
    ).replace(/^\uFEFF/, ''),
  )
  const sessions = new Map()
  if (existsSync(databasePath)) removeLegacySeed(db, databasePath)
  function persist() {
    const temporaryPath = `${databasePath}.tmp`
    writeFileSync(temporaryPath, JSON.stringify(db, null, 2))
    renameSync(temporaryPath, databasePath)
  }
  if (
    !db.users.some(
      (user) =>
        user.id === 'demo' ||
        user.email?.trim().toLowerCase() === 'demo@example.com',
    )
  ) {
    db.users.push({
      id: 'demo',
      name: 'Demo Gardener',
      email: 'demo@example.com',
      passwordHash: bcrypt.hashSync('DemoTree2026!', 10),
    })
  }
  // Preserve accounts with old plaintext credentials, replacing only the password.
  for (const user of db.users) {
    if (typeof user.password === 'string') {
      if (bcrypt.truncates(user.password)) {
        user.salt = randomBytes(16).toString('hex')
        user.passwordHash = hash(user.password, user.salt)
      } else {
        user.passwordHash = bcrypt.hashSync(user.password, 10)
        delete user.salt
      }
      delete user.password
    }
  }
  persist()
  function currentUser(req) {
    const token = (/^Bearer ([a-f0-9]{64})$/.exec(
      req.headers.authorization || '',
    ) || [])[1]
    const session = sessions.get(token)
    if (!session || session.expires < Date.now()) {
      sessions.delete(token)
      throw apiError(401, 'Your session has expired. Please log in again.')
    }
    const user = db.users.find((item) => item.id === session.userId)
    if (!user) throw apiError(401, 'Please log in again.')
    return user
  }
  function startSession(user) {
    for (const [key, session] of sessions)
      if (session.expires < Date.now()) sessions.delete(key)
    const token = randomBytes(32).toString('hex')
    sessions.set(token, { userId: user.id, expires: Date.now() + 86400000 })
    return { user: publicUser(user), token }
  }
  const app = express()
  app.disable('x-powered-by')
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
      res.writeHead(403)
      res.end()
      return
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Idempotency-Key',
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    next()
  })
  app.use(express.json({ limit: '16kb' }))
  const send = (res, data, status = 200) => res.status(status).json(data)
  function requireAuth(req, res, next) {
    try {
      req.user = currentUser(req)
      next()
    } catch (error) {
      next(error)
    }
  }
  function jsonObject(req, res, next) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
      return next(apiError(400, 'Expected a JSON object.'))
    next()
  }
  app.get('/trees', (req, res) => send(res, db.trees.map(publicTree)))
  app.get('/trees/:id', (req, res) => {
    const tree = db.trees.find((item) => item.id === req.params.id)
    if (!tree) throw apiError(404, 'Tree not found.')
    return send(res, publicTree(tree))
  })
  app.get('/auth/me', requireAuth, (req, res) =>
    send(res, publicUser(req.user)),
  )
  app.get('/my-trees', requireAuth, (req, res) =>
    send(
      res,
      db.trees.filter((tree) => tree.userId === req.user.id).map(publicTree),
    ),
  )
  app.post(['/auth/register', '/auth/login'], jsonObject, (req, res) => {
    const body = req.body
    const signup = req.path === '/auth/register'
    const error = validateCredentials(body ?? {}, signup)
    if (error) throw apiError(400, error)
    if (signup && bcrypt.truncates(body.password))
      throw apiError(400, 'Password must not exceed 72 UTF-8 bytes.')
    const email = body.email.trim().toLowerCase()
    let user = db.users.find(
      (item) => item.email?.trim().toLowerCase() === email,
    )
    if (signup) {
      if (user) throw apiError(409, 'This email is already registered.')
      user = {
        id: randomUUID(),
        name: body.name.trim(),
        email,
        passwordHash: bcrypt.hashSync(body.password, 10),
      }
      db.users.push(user)
      try {
        persist()
      } catch (error) {
        db.users.pop()
        throw error
      }
    } else {
      let valid = false
      if (user?.salt && /^[a-f0-9]{128}$/.test(user.passwordHash)) {
        valid = timingSafeEqual(
          Buffer.from(hash(body.password, user.salt), 'hex'),
          Buffer.from(user.passwordHash, 'hex'),
        )
        if (valid && !bcrypt.truncates(body.password)) {
          const previous = { ...user }
          user.passwordHash = bcrypt.hashSync(body.password, 10)
          delete user.salt
          try {
            persist()
          } catch (error) {
            Object.assign(user, previous)
            throw error
          }
        }
      } else if (user?.passwordHash && !bcrypt.truncates(body.password)) {
        valid = bcrypt.compareSync(body.password, user.passwordHash)
      }
      if (!valid) throw apiError(401, 'Incorrect email or password.')
    }
    return send(res, startSession(user), signup ? 201 : 200)
  })
  app.post('/auth/logout', requireAuth, (req, res) => {
    sessions.delete(req.headers.authorization.slice(7))
    return send(res, { success: true })
  })
  app.post('/trees', requireAuth, jsonObject, (req, res) => {
    const body = req.body
    const user = req.user
    const error = validatePlanting(body ?? {})
    if (error) throw apiError(400, error)
    const requestKey = req.headers['idempotency-key']
    if (
      typeof requestKey !== 'string' ||
      requestKey.length < 8 ||
      requestKey.length > 100
    )
      throw apiError(400, 'A valid planting request key is required.')
    const existing = db.trees.find(
      (tree) => tree.userId === user.id && tree.requestKey === requestKey,
    )
    if (existing) {
      if (
        ['quantity', 'species', 'region'].some(
          (field) => existing[field] !== body[field],
        )
      )
        throw apiError(
          409,
          'This request key was already used for different planting parameters.',
        )
      return send(res, publicTree(existing))
    }
    const { quantity, species, region } = body
    const place = REGIONS.find((item) => item.id === region)
    const coordinates = plantingCoordinates(
      region,
      db.trees.filter((tree) => tree.region === region).length,
    )
    const tree = {
      id: randomUUID(),
      userId: user.id,
      quantity,
      species,
      region,
      location: place.location,
      coordinates,
      total: quantity * PRICE_PER_TREE,
      plantedAt: new Date().toISOString().slice(0, 10),
      requestKey,
    }
    db.trees.push(tree)
    try {
      persist()
    } catch (error) {
      db.trees.pop()
      throw error
    }
    return send(res, publicTree(tree), 201)
  })
  app.use((req, res, next) => next(apiError(404, 'API endpoint not found.')))
  app.use((error, req, res, next) => {
    void next
    const status =
      error.status >= 400 && error.status < 600 ? error.status : 500
    res.status(status).json({
      message:
        status === 500
          ? 'The API could not save or read data.'
          : error.type === 'entity.parse.failed'
            ? 'Invalid JSON request.'
            : error.message,
    })
  })
  return createServer(app)
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.API_PORT || 3001)
  createApi(
    resolve(
      process.env.API_DB_PATH ||
        process.env.DEMO_DB_PATH ||
        'mock/db.local.json',
    ),
  ).listen(port, '127.0.0.1', () => {
    console.log(`Express API: http://127.0.0.1:${port}`)
  })
}
