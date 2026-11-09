# OctoFit test record

Date: 2026-11-09
Branch: `build-octofit-app`

## Passing checks

| Command | Result |
| --- | --- |
| `npm run test:data --prefix octofit-tracker/backend` | 5/5 tests passed |
| `npm run test:api --prefix octofit-tracker/backend` | 4/4 tests passed |
| `npm test --prefix octofit-tracker/backend` | 9/9 tests passed |
| `npm test --prefix octofit-tracker/frontend` | 15/15 tests passed |
| `npm run build --prefix octofit-tracker/backend` | Passed |
| `npm run build --prefix octofit-tracker/frontend` | Passed |
| `npm run seed --prefix octofit-tracker/backend` | Passed twice; seed remained idempotent |
| `git diff --check` | Passed |
| `npm run test:api --prefix octofit-tracker/backend -- -t "creates and lists valid activities while rejecting invalid input"` | 1 passed, 3 skipped |

## API smoke checks

- `GET http://localhost:8000/api/activities` completed successfully.
- Empty `POST /api/activities` completed successfully and returned the expected client-error response.

## Exercise validator

`node --test tests/exercise-validation.test.mjs` reported 33 passed and 7 failed. The failures are outside the application implementation: existing workflow metadata checks fail, and the scaffold expectation fails because the architecture step is now complete.

## Final repository state

- Commit: `9d8b016 Validate seed upserts`
- Branch: `build-octofit-app`
- Working tree was clean and synchronized with `origin` at the time of recording.
