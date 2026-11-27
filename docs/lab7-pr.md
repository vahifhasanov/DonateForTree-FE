# Lab 7: Express backend and authentication

Replace the lab 6 demonstration HTTP dispatcher with a local Express 5 API in
`server/`, preserving the React API contracts, map, hooks and page design.
Registration stores bcryptjs hashes; existing scrypt accounts remain usable and
upgrade after a successful login. Random 256-bit Bearer sessions protect private
collections and planting creation. JSON storage preserves users, plantings and
per-user Idempotency-Key records across restarts; failed writes roll back changes.

Keep `npm run dev`, `npm run api` and `npm run dev:all`, with Windows-compatible
process startup and error handling. Document endpoints, migration, isolated tests
and report screenshots in README and docs/lab7-report.md.

Validation: lint and production build pass; Vitest passes 58/58 tests using temporary
databases. Formatting and git diff checks pass. E2E details are recorded in docs/lab7-report.md.
The initial Electron E2E run passed 69/76; seven failures were 30-second
`cy.screenshot()` timeouts. The Chrome attempt stopped with `* is not a valid URL`
before completing its first spec. The repeat Electron run outside the sandbox passed 73/76; three remaining failures
were also cy.screenshot() timeouts. Business (3/3) and routing (15/15) passed in both
full Electron runs. A fully passing E2E run is not claimed.

Base: `main`. Head: `lab7`, created from the current `lab6` commit f3e195c.
Because main still contains lab 5, this PR also includes the required lab 6 foundation.
Local data, tokens, screenshots and secrets are excluded. This PR must not be merged automatically.
