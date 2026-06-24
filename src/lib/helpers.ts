import fs from 'fs';
import Handlebars from 'handlebars';
import { Graph } from 'ngraph.graph';
import { Style } from '../../types';
import { getRuntimeOptions } from './runtime';

const loadTemplateFile = (filename: string): string => fs.readFileSync(filename, 'utf8');

const compile = (filename: string, engine = 'handlebars'): HandlebarsTemplateDelegate => {
  if (engine !== 'handlebars') throw new Error(`Unsupported translator engine: ${engine}`);
  return Handlebars.compile(loadTemplateFile(filename));
};

const getProperty = (opts: { env?: string; type: string; prop: string }): string => {
  const { env, type, prop } = opts;
  const { styles } = getRuntimeOptions();
  const find = (entries: Style[]): Style | undefined => entries?.find(s => s.type === type && s.prop === prop);
  const envHit = env ? find(styles[env] ?? []) : undefined;
  const generalHit = find(styles.general ?? []);
  const value = (envHit ?? generalHit)?.value;
  return value === undefined ? '' : String(value);
};

const getDefault = (prop: string, fallback: string): string => {
  const { styles } = getRuntimeOptions();
  const hit = (styles.defaults ?? []).find(s => s.prop === prop);
  return hit?.value === undefined ? fallback : String(hit.value);
};

type GraphNode = { id: string; parent?: string };

const findDeepestDescendant = (nodes: GraphNode[], rootId: string): GraphNode | undefined => {
  const child = nodes.find(n => n.parent === rootId);
  if (!child) return undefined;
  return findDeepestDescendant(nodes, child.id) ?? child;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectIds = (raw: string): { clusters: Set<string>; nodes: Set<string> } => {
  const clusters = new Set<string>();
  const nodes = new Set<string>();
  for (const m of raw.matchAll(/subgraph\s+"(cluster-[^"]+)"/g)) clusters.add(m[1]);
  for (const m of raw.matchAll(/"([^"]+)"\s*\[/g)) {
    if (!m[1].startsWith('cluster-')) nodes.add(m[1]);
  }
  return { clusters, nodes };
};

const buildEdgeAttrs = (
  fromCluster: boolean,
  toCluster: boolean,
  fromId: string,
  toId: string,
  data: Record<string, string>
): string => {
  const fontcolor = getDefault('label-fontcolor', '#222222');
  const attrs = [
    fromCluster ? `ltail="${fromId}"` : '',
    toCluster ? `lhead="${toId}"` : '',
    data.color ? `color="${data.color}"` : '',
    data.type ? `type="${data.type}"` : '',
    data.style ? `style=${data.style}` : '',
    `penwidth="${data.penwidth ?? 1}"`,
    data.label ? `label="${data.label}"` : '',
    data.label ? `fontcolor="${fontcolor}"` : '',
    data.label ? 'fontsize=10' : ''
  ].filter(Boolean);
  return attrs.join('\n        ');
};

const injectLinkNodes = (raw: string, graph: Graph): string => {
  const { clusters, nodes: knownNodes } = collectIds(raw);
  const graphNodes: GraphNode[] = [];
  graph.forEachNode(n => {
    if (n.id && n.data && n.data.parent) graphNodes.push({ id: String(n.id), parent: String(n.data.parent) });
  });

  let out = raw;
  graph.forEachLink(link => {
    const fromId = String(link.fromId);
    const toId = String(link.toId);
    const fromIsCluster = clusters.has(fromId);
    const toIsCluster = clusters.has(toId);
    const fromBare = fromId.replace(/^cluster-/, '');
    const toBare = toId.replace(/^cluster-/, '');

    if (!fromIsCluster && !knownNodes.has(fromBare)) {
      console.warn(`pufferfish: link endpoint "${fromBare}" is not a known node or cluster — check spelling/scope`);
    }
    if (!toIsCluster && !knownNodes.has(toBare)) {
      console.warn(`pufferfish: link endpoint "${toBare}" is not a known node or cluster — check spelling/scope`);
    }

    const fromAnchor = fromIsCluster ? (findDeepestDescendant(graphNodes, fromId)?.id ?? fromBare) : fromBare;
    const toAnchor = toIsCluster ? (findDeepestDescendant(graphNodes, toId)?.id ?? toBare) : toBare;

    const attrs = buildEdgeAttrs(fromIsCluster, toIsCluster, fromId, toId, (link.data ?? {}) as Record<string, string>);
    const edgePattern = new RegExp(`${escapeRegExp(`"${fromId}" -> "${toId}"`)}\\s*\\[(?:.|\\n)*?\\]`);
    out = out.replace(edgePattern, `"${fromAnchor}" -> "${toAnchor}" [\n        ${attrs}\n      ]`);
  });
  return out;
};

export {
  loadTemplateFile,
  compile,
  injectLinkNodes,
  getProperty,
  getDefault
};
