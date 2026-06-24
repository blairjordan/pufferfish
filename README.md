# Pufferfish

> **Diagrams-as-code for cloud architecture.** Multi-cloud, version-controllable, LLM-ready. Stop fighting your whiteboard tool — `git diff` your topology like everything else.

Architecture diagrams from a tiny Handlebars DSL. Designed so an LLM can read [SYNTAX.md](SYNTAX.md), write a template, and render it with one Docker command.

Built-in icon sets for **AWS** (1,000+ icons), **Azure** (650+ icons), and **GCP** (200+ icons).

## Example output

| | |
|---|---|
| ![Azure comprehensive](screenshots/azure-comprehensive.png?raw=true) | ![AWS Bedrock stack](screenshots/aws-bedrock.png?raw=true) |
| **Azure** — hub-and-spoke vnets, 20+ services across compute / data / integration / AI | **AWS** — GenAI stack with Bedrock, SageMaker, EKS, Fargate, Aurora, EventBridge |
| ![GCP](screenshots/gcp.png?raw=true) | ![Mixed cloud](screenshots/mixed-cloud.png?raw=true) |
| **GCP** — GKE, Cloud Run, Vertex AI, BigQuery, Pub/Sub, Spanner | **Multi-cloud** — Azure + AWS in one diagram |

## Quickstart

```bash
# 1. Have your LLM read the syntax.
docker run --rm ghcr.io/blairjordan/pufferfish syntax

# 2. Pipe a template in, get a PNG out.
echo '{{#diagram title="API"}}
  {{#internet name="net"}}
    {{#region name="use1"}}
      {{#env env="prod" name="prod"}}
        {{#vnet name="api-vpc" env="prod"}}
          {{aws-ec2  name="api" label="API"}}
          {{aws-rds  name="db"  label="Postgres"}}
        {{/vnet}}
        {{data-transfer from="api" to="db"}}
      {{/env}}
    {{/region}}
  {{/internet}}
{{/diagram}}' | docker run --rm -i \
  -e PUFFERFISH_CONFIG=/usr/src/app/examples/aws.pufferfish.config.json \
  ghcr.io/blairjordan/pufferfish render - > diagram.png
```

Two commands. The LLM only needs `syntax` + the template it generated. Image is `linux/amd64` + `linux/arm64`, published to GitHub Container Registry on every push to main.

## LLM agent prompt (copy/paste)

> You can generate architecture diagrams via the `ghcr.io/blairjordan/pufferfish` Docker image. To learn the DSL, run `docker run --rm ghcr.io/blairjordan/pufferfish syntax`. To render, pipe a template into `docker run --rm -i ghcr.io/blairjordan/pufferfish render -` and write the resulting PNG to disk. For AWS use `-e PUFFERFISH_CONFIG=/usr/src/app/examples/aws.pufferfish.config.json`; for GCP `examples/gcp.pufferfish.config.json`; for cross-cloud `examples/mixed.pufferfish.config.json`.

## CLI

```
pufferfish syntax                       print the DSL reference
pufferfish helpers                      list available node/cluster/link helpers
pufferfish render IN [OUT]              render template IN to PNG
pufferfish render - [-|OUT]             stdin → stdout (or file)
pufferfish render IN -f svg out.svg     pick output format (png|svg|pdf|dot)
```

Env: `PUFFERFISH_CONFIG` (alternate config path), `PUFFERFISH_HOME` (install root).

## Local dev (no Docker)

Skip this if you're using the Docker image — graphviz is already inside it.

```bash
yarn install
./bin/fetch-icons.sh        # one-time: extract icon zips from vendor/ into aws-icons/, azure-icons/, gcp-icons/
yarn build
node dist/index.js --template templates/main.hbs --out main.dot
dot -Tpng main.dot -o main.png
```

Host deps for this path: `unzip` and `graphviz`. Everything else (node modules, icons) is local to the repo.

Test suite + fixture render:

```bash
npm test           # unit + integration
npm run fixtures   # render every fixture under fixtures/ to output/fixtures/
```

## Templates outside this repo

Templates are data, not source. Mount a volume of `.hbs` files at runtime — don't fork this repo to store diagrams.

```bash
docker run --rm -v "$PWD/my-templates:/work" -w /work ghcr.io/blairjordan/pufferfish render app.hbs app.png
```

## Configuration

`pufferfish.config.json` declares which helpers exist and where their icons live.

- `translator.engine` — `handlebars` (only engine today)
- `assets.imageDir` — base dir for icon files (resolved relative to the config)
- `assets.stylesFile` — JSON file of theme + cluster/link colors
- `helpers.nodes` — helper name → icon path
- `helpers.clusters` — block helpers that wrap children
- `helpers.links` — edge helpers

Add new icons by dropping PNGs anywhere reachable from `imageDir` and adding helper mappings. Override via `--config PATH` or `PUFFERFISH_CONFIG`.

## Theming

Every color and font in the diagram is data-driven via `styles.json` — nothing visual is hardcoded.

- `defaults[]` — diagram bg, font family, node/cluster font sizes, edge color/width/arrows, icon size, fallback box colors, layout spacing (`nodesep`, `ranksep`).
- `general[]` — cluster (`bgcolor`, `style`, `margin`) and link (`color`, `penwidth`) styling by type.
- `<env>[]` — per-environment overrides. `dev` is green, `prod` is orange/red; add `staging` or anything else by dropping a new section.

Ship a custom theme with `--styles-file my-theme.json` (or set `assets.stylesFile` in the config). The image accepts a volume mount:

```bash
docker run --rm -i -v "$PWD/my-theme.json:/usr/src/app/styles.json" \
  ghcr.io/blairjordan/pufferfish render - < t.hbs > out.png
```

## Clickable diagrams

Add `url=` to any helper and render as SVG. The node becomes a clickable link:

```handlebars
{{aws-ec2 name="api" label="API" url="https://example.com/api"}}
```

```bash
docker run --rm -i ghcr.io/blairjordan/pufferfish render - -f svg > diagram.svg
```

PNG can't carry hyperlinks — use `svg`, `pdf`, or `imap` formats for clickable output.

## Icon catalog

Icons ship as zips under `vendor/` (~17MB total) and extract into top-level dirs that the Docker build and `npm` scripts auto-populate. The extracted dirs are gitignored — you never commit thousands of PNGs.

- `vendor/aws-icons.zip` → `aws-icons/` (1,097 PNGs, official AWS Architecture Icons)
- `vendor/azure-icons.zip` → `azure-icons/` (667 PNGs, converted from Azure SVGs)
- `vendor/gcp-icons.zip` → `gcp-icons/` (216 PNGs, converted from Google Cloud legacy icons)

Run `./bin/fetch-icons.sh` (or `npm run icons`) to (re-)extract. Each cloud has a config in `examples/` that maps short helper names to icon paths — add a new helper by editing the config, no code changes required.

## Fixtures

`fixtures/` contains stress-test templates rendered by `npm run fixtures`:

- `azure-comprehensive.hbs` — 20+ Azure services across hub/spoke vnets
- `aws-bedrock.hbs` — full GenAI stack (Bedrock, SageMaker, EKS, Fargate, Aurora, Redshift, EventBridge, …)
- `gcp-basic.hbs` — GKE, Cloud Run, Vertex AI, BigQuery, Pub/Sub, Spanner, …
- `mixed-cloud.hbs` — Azure + AWS in one diagram
- `*-nested-subnets.hbs` — deep subnet nesting
- `azure-edge-cases.hbs` — empty vnets, node-to-node, cross-env links
- `link-matrix.hbs` — every link type in one diagram

## Why "Pufferfish"

The Japanese pufferfish is nature's greatest artist: <https://www.youtube.com/watch?v=VQr8xDk_UaY>
