import { readFileSync, copyFileSync } from 'node:fs'
const legacy = JSON.parse(
  readFileSync(new URL('./legacy-trees.json', import.meta.url), 'utf8').replace(
    /^\uFEFF/,
    '',
  ),
).trees

// IDs alone are insufficient: preserve changed records and anything created by POST.
export function removeLegacySeed(db, databasePath) {
  const matches = (tree) =>
    !tree.requestKey &&
    legacy.some(
      (old) =>
        Object.keys(tree).length === Object.keys(old).length &&
        Object.keys(old).every(
          (key) => JSON.stringify(tree[key]) === JSON.stringify(old[key]),
        ),
    )
  const retained = db.trees.filter((tree) => !matches(tree))
  if (retained.length === db.trees.length) return 0
  copyFileSync(
    databasePath,
    `${databasePath}.before-seed-removal-${Date.now()}`,
  )
  const removed = db.trees.length - retained.length
  db.trees = retained
  return removed
}
