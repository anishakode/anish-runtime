# Boring_AI

A deterministic codemod for migrating `web3.py` from v6 to v7 — the mechanical
parts done by rules that either match or don't, with AI kept to the residue that
genuinely needs judgement.

Reviewed live at
**[anish-runtime.vercel.app/work/boring-ai](https://anish-runtime.vercel.app/work/boring-ai)**.

## The argument

Most of a version migration is not interesting. `middlewares=` became
`middleware=`, RPC kwargs went snake_case, the middleware onion changed shape,
`sign_and_send` wants a builder. These are mechanical, they are the bulk of the
work, and a language model is the wrong tool for them — not because it can't, but
because you cannot tell afterwards whether it did. A rule that matched is a fact
you can check into version control; a generated diff is something you have to
re-read every time.

So the split here: a JSSG rule set handles everything mechanical and is covered
by input/expected fixtures, and AI is optional, for the leftovers. The name is
the thesis.

## What is and is not claimed

**Claimed:** the transformations below are implemented as rules and each is
pinned by a fixture pair that CI runs.

**Not claimed:** that this migrates an arbitrary `web3.py` codebase end to end.
It handles the patterns it has fixtures for. Anything outside that set is
untouched and still yours to do — which is the intended behaviour, not a gap, and
there is a fixture asserting exactly that (see below).

## Layout

```
packages/web3py-v6-v7/
  codemod.yaml        package manifest — v0.5.1, MIT, python target
  workflow.yaml       the workflow the codemod runs
  rules/config.yml    the rule set
  scripts/codemod.ts  driver
  scripts/transform.sh, setup.sh, cleanup.sh
  tests/              input.py / expected.py fixture pairs
docs/                 comparison report, evaluation report, project journal
```

## Running it

```bash
cd packages/web3py-v6-v7
npm install
./scripts/setup.sh
./scripts/transform.sh
```

## Tests and CI

Ten fixture pairs, each an `input.py` and the `expected.py` it must produce:

| Fixture                        | What it pins                                     |
| ------------------------------ | ------------------------------------------------ |
| `middlewares-kwarg`            | `middlewares=` → `middleware=`                   |
| `middleware-onion-class`       | onion API reshaping                              |
| `rpc-kwargs-snakecase`         | RPC keyword casing                               |
| `rpc-kwargs-dictctor-only`     | casing only where a dict constructor is involved |
| `sign-and-send-builder`        | `sign_and_send` builder form                     |
| `sign-and-send-builder-inject` | the same with injection                          |
| `websocket-provider-v2`        | provider v2 shape                                |
| `combined-phase1`              | several transforms interacting in one file       |
| `geth-poa-factory-unchanged`   | **that valid code is left alone**                |

That last one is the one worth pointing at. A codemod that rewrites too eagerly
is worse than one that rewrites too little, because the damage is silent — so
there is a fixture whose expected output is byte-identical to its input, and it
fails if the tool touches it.

[`.github/workflows/codemod-ci.yml`](.github/workflows/codemod-ci.yml) runs on
every push and pull request that touches the package.

## Provenance

- Repository — [`3ccb205`](https://github.com/anishakode/Boring_AI/tree/3ccb20543dad3af4ae814e1aecddc9b371398002)
- [`packages/web3py-v6-v7`](https://github.com/anishakode/Boring_AI/tree/3ccb20543dad3af4ae814e1aecddc9b371398002/packages/web3py-v6-v7)

Machine-readable index of every claim made about this project:
[anish-runtime.vercel.app/evidence.json](https://anish-runtime.vercel.app/evidence.json)
