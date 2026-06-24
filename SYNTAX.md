# Pufferfish Syntax (LLM Reference)

Handlebars DSL → architecture diagrams. One template → one PNG.

## Skeleton

```handlebars
{{#diagram title="App"}}
  {{#internet name="net"}}
    {{#region name="us-east-1" label="AWS (us-east-1)"}}
      {{#env env="prod" name="prod"}}
        {{#vnet name="api-vpc" env="prod"}}
          {{#subnet name="api-sub" env="prod" label="API"}}
            {{aws-ec2 name="api" label="API"}}
            {{aws-rds name="db" label="Postgres"}}
          {{/subnet}}
        {{/vnet}}
        {{data-transfer from="api" to="db"}}
      {{/env}}
    {{/region}}
  {{/internet}}
{{/diagram}}
```

## Block helpers (clusters — wrap children)

| helper     | purpose                         | attrs                       |
|------------|---------------------------------|-----------------------------|
| `diagram`  | outermost wrapper (one per file)| `title`                     |
| `internet` | the public internet boundary    | `name`, `label`             |
| `region`   | cloud region                    | `name`, `label`             |
| `env`      | environment grouping            | `name`, `env=dev\|prod`     |
| `vnet`     | virtual network / VPC           | `name`, `env`               |
| `subnet`   | subnet (nestable in vnet)       | `name`, `env`, `label`      |

## Node helpers (leaves — render with icon)

**Azure** (config: `pufferfish.config.json`):
`vm`, `vmss`, `aks`, `container-instance`, `functions`, `app-service`, `acr`, `vnet`*, `subnet-icon`, `bastion`, `ag`, `lb`, `front-door`, `firewall`, `nsg`, `traffic-mgr`, `vnet-gateway`, `ddos`, `waf`, `dns`, `ip`, `cosmosdb`, `sql`, `redis`, `synapse`, `storage`, `data-lake`, `keyvault`, `service-bus`, `logic-apps`, `api-mgmt`, `event-hub`, `data-factory`, `databricks`, `log-analytics`, `ml`, `cognitive`, `openai`, `monitor`, `app-insights`, `automation`, `devops`

**AWS** (config: `examples/aws.pufferfish.config.json`):
`aws-cloud`, `aws-vpc`, `aws-ec2`, `aws-lambda`, `aws-fargate`, `aws-ecs`, `aws-eks`, `aws-beanstalk`, `aws-batch`, `aws-s3`, `aws-efs`, `aws-fsx`, `aws-backup`, `aws-rds`, `aws-aurora`, `aws-dynamodb`, `aws-elasticache`, `aws-neptune`, `aws-redshift`, `aws-glue`, `aws-athena`, `aws-kinesis`, `aws-opensearch`, `aws-sagemaker`, `aws-bedrock`, `aws-sqs`, `aws-sns`, `aws-eventbridge`, `aws-step-functions`, `aws-cloudfront`, `aws-route53`, `aws-apigw`, `aws-elb`, `aws-direct-connect`, `aws-iam`, `aws-kms`, `aws-secrets`, `aws-cognito`, `aws-waf`, `aws-shield`, `aws-guardduty`, `aws-inspector`, `aws-cloudwatch`, `aws-cloudformation`, `aws-xray`, `aws-codebuild`, `aws-codepipeline`, `aws-codecommit`, `aws-iot`

**GCP** (config: `examples/gcp.pufferfish.config.json`):
`gce`, `gke`, `cloud-run`, `cloud-functions`, `app-engine`, `anthos`, `gcs`, `filestore`, `cloud-sql`, `spanner`, `firestore`, `bigtable`, `memorystore`, `bigquery`, `dataflow`, `dataproc`, `composer`, `pubsub`, `tasks`, `scheduler`, `vertex-ai`, `automl`, `vpc`, `lb`, `cdn`, `dns`, `cloud-nat`, `vpn`, `interconnect`, `firewall`, `cloud-armor`, `api-gateway`, `apigee`, `iam`, `kms`, `secret-manager`, `logging`, `monitoring`, `trace`, `cloud-build`, `cloud-deploy`, `artifact-registry`, `iot-core`

**Generic:** `descriptor` (text-only annotation, no icon)

\* `vnet` exists as both a block helper (cluster) and a node helper (icon). In templates the block form (`{{#vnet ...}}...{{/vnet}}`) wins because Handlebars dispatches block vs. inline at parse time.

Node attrs: `name` (unique ID, required), `label` (display text), `url` (turns the node into a clickable link in SVG/PDF/imap output — PNG can't carry links).

## Link helpers (edges)

| helper          | color  | typical use                   |
|-----------------|--------|-------------------------------|
| `vnet-peer`     | yellow | VNet/VPC peering              |
| `vnet-dns`      | blue   | DNS resolution                |
| `data-transfer` | gray   | generic data flow             |

`{{vnet-peer from="ID" to="ID" label="optional"}}` — `from`/`to` may be **node names** or **cluster names**. Endpoints must be in the same template; misspelled names produce warnings. Pass `label="..."` to draw text on the connector.

## Rules

- `env="dev"` → green clusters; `env="prod"` → red/orange clusters.
- Links target the cluster boundary if the name is a cluster, the node directly otherwise.
- Declare links at the **outermost scope that contains both endpoints**. Inner-scope links may create phantom nodes if an endpoint isn't visible.
- Each helper invocation is one statement; whitespace is ignored.
- Use `descriptor` for legends or callouts: `{{descriptor name="legend" label="Empty vnets are valid"}}`.
- Empty clusters render fine: `{{#vnet name="placeholder" env="prod"}}{{/vnet}}`.

## Choosing pufferfish configs

- `pufferfish.config.json` — Azure helpers (default)
- `examples/aws.pufferfish.config.json` — AWS helpers
- `examples/gcp.pufferfish.config.json` — GCP helpers
- `examples/mixed.pufferfish.config.json` — Multi-cloud (Azure + AWS) in one diagram

Pass `--config PATH` to the CLI, or set `PUFFERFISH_CONFIG=PATH`.

## Clickable diagrams

Pass `url=...` on any node and render as SVG (or PDF) — the node becomes a clickable link:

```handlebars
{{aws-ec2 name="api" label="API" url="https://console.aws.amazon.com/ec2/v2/home?#Instances:instanceId=i-abc"}}
```

```bash
docker run --rm -i ghcr.io/blairjordan/pufferfish render - -f svg < diagram.hbs > diagram.svg
```

## Theming

Open `styles.json` to recolour anything. Three sections:

- `defaults[]` — diagram background, font family, font sizes, edge color/width, icon size, fallback box colors, nodesep/ranksep. Each entry is `{type:"default", prop, value}`.
- `general[]` — per-type cluster and link styling (`bgcolor`, `style`, `margin`, `color`, `penwidth` for `region`/`vnet`/`subnet`/`env`/`vnet-peer`/`vnet-dns`/`data-transfer`).
- `<env-name>[]` — per-environment overrides. The defaults ship with `dev` (green) and `prod` (orange/red); add `staging`/`uat`/anything you like by dropping a new section.

Point at a different file with `--styles-file PATH` (or update `assets.stylesFile` in the config).

## One-line generation

```bash
echo '<your template>' | docker run --rm -i ghcr.io/blairjordan/pufferfish render - > diagram.png
```
