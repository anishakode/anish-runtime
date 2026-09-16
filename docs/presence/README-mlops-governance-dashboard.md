# MLOps Governance Dashboard

Model monitoring with drift detection, data-quality checks, and an audit trail —
built around the idea that a governance system is only useful if you can see why
it fired.

Inspected live at
**[anish-runtime.vercel.app/work/mlops-governance-dashboard](https://anish-runtime.vercel.app/work/mlops-governance-dashboard)**,
where the PSI and KS maths in this repository run in the browser against seeded
data, and you can break the model and watch the incident unfold.

## What this is, and what it is not

**It is** a FastAPI service implementing the governance surface: model registry,
monitoring runs, drift and data-quality metrics, approvals, waivers, and an
append-only audit sink. The statistical code is the real thing — the portfolio
lab reproduces it directly from
[`drift.py`](backend/app/utils/drift.py) and
[`stats.py`](backend/app/utils/stats.py).

**It is not** running in production and never has been. There is no live traffic,
no real model behind it, no uptime to quote. Treat every number you see as coming
from data you supplied.

One thing worth stating plainly, because a dependency list invites the wrong
assumption: `requirements.txt` declares `mlflow`, `redis`, `celery`, and
`evidently`. The surface actually implemented in this repository is the FastAPI
API plus the drift, quality, policy and audit utilities. The portfolio's
architecture view deliberately refuses to draw an MLflow or Redis box for exactly
this reason — a declared dependency is not a shipped component.

## How it is laid out

```
backend/app/
  api/monitoring.py        monitoring + drift endpoints
  core/database.py         SQLAlchemy session and engine
  core/security.py         password hashing, token handling
  deps/auth.py             JWT dependency for protected routes
  models/                  model, monitoring, approval, waiver, audit tables
  crud/                    the matching persistence layer
  services/audit.py        audit event construction
  utils/drift.py           PSI, with the 0.10 / 0.25 severity bands
  utils/stats.py           KS two-sample statistic
  utils/policy.py          promotion / governance rules
  utils/audit_sink.py      append-only event writer
  metrics.py               Prometheus counters and gauges
backend/migrations/        Alembic migrations
mlops-ui/                  React front end
```

The drift path is the interesting part. PSI bins the current distribution onto
the reference histogram's edges and sums `(c − r) · ln(c / r)`; KS takes the
maximum gap between the two empirical CDFs. They disagree in useful ways — PSI
notices mass moving between bins, KS notices the largest single displacement —
and the portfolio lab has a lens built specifically around that disagreement.

## Running it

Requires Python 3.11 and a Postgres instance.

```bash
pip install -r requirements.txt

export DATABASE_URL=postgresql+psycopg2://mlops_user:mlops_pass@localhost:5432/mlops_governance
export JWT_SECRET=change-me

alembic -c backend/alembic.ini upgrade head
uvicorn backend.main:app --reload
```

The API then serves on `http://localhost:8000`, with `/health` reporting the
tables it can see. The React front end lives in `mlops-ui/` and has its own
`package.json`.

## Tests and CI

```bash
pytest -q
```

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and
pull request: Python 3.11 against a Postgres 15 service container, with a health
check gate before the suite.

Being straight about coverage — `tests/test_smoke.py` is the only test file, and
it checks two things: that `/health` responds with its table list, and that
`/api/models` answers with 200, 401, or 403 depending on how auth is configured.
That is a smoke test, not a test suite. The statistical functions in
`utils/drift.py` and `utils/stats.py` have no tests in this repository; they are
pinned and exercised from the portfolio's own suite instead.

## Provenance

The portfolio cites this repository at a fixed commit rather than a branch, so
the evidence cannot drift underneath the claim:

- Repository — [`a2ba6fc`](https://github.com/anishakode/MLOps-Governance-Dashboard/tree/a2ba6fc45aaece5c3241569271bcca77124da2b4)
- [`backend/app/utils/drift.py`](https://github.com/anishakode/MLOps-Governance-Dashboard/blob/a2ba6fc45aaece5c3241569271bcca77124da2b4/backend/app/utils/drift.py)
- [`backend/app/utils/stats.py`](https://github.com/anishakode/MLOps-Governance-Dashboard/blob/a2ba6fc45aaece5c3241569271bcca77124da2b4/backend/app/utils/stats.py)
- [`backend/app/utils/audit_sink.py`](https://github.com/anishakode/MLOps-Governance-Dashboard/blob/a2ba6fc45aaece5c3241569271bcca77124da2b4/backend/app/utils/audit_sink.py)
- [`backend/app/utils/policy.py`](https://github.com/anishakode/MLOps-Governance-Dashboard/blob/a2ba6fc45aaece5c3241569271bcca77124da2b4/backend/app/utils/policy.py)

Machine-readable index of every claim made about this project:
[anish-runtime.vercel.app/evidence.json](https://anish-runtime.vercel.app/evidence.json)
