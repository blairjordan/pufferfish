import fs from 'fs';
import Handlebars from 'handlebars';
import { Styles } from '../styles';
import { Style } from '../../types';

const loadTemplateFile = (filename: string): string | undefined => fs.readFileSync(filename, 'utf8');
const compile = (filename: string): HandlebarsTemplateDelegate | undefined => Handlebars.compile(loadTemplateFile(filename));

const getProperty = (opts: any): Style | string => {
  const { env, type, prop } = opts;
  const find = styles => styles.find((f: Style) => f.type === type && f.prop === prop);

  const envStyle = env ? find(Styles[env]) : undefined;
  const generalStyle = find(Styles.general);
  const found = envStyle ?? generalStyle;

  return found ? found.value : '';
}

const injectLinkNodes = (raw, graph) => {
  let substituted = raw;
  const nodes: Array<any> = [];
  graph.forEachNode(n => {
    if (n.id && n.data && n.data.parent) {
      nodes.push({ id: n.id, parent: n.data.parent, ...(n.data.type) ? n.data.type : {}  });
    }
  });
  graph.forEachLink(l => {
    const [fromVnet, toVnet] = [l.fromId, l.toId];
    const [fromCluster, toCluster] = [
      nodes.find(n => n.parent === l.fromId),
      nodes.find(n => n.parent === l.toId)
    ];

    const [from, to] = [
      fromCluster ? (nodes.find(n => n.parent === fromCluster.id) ?? fromCluster) : {id: fromVnet.replace('cluster-', '')},
      toCluster ? (nodes.find(n => n.parent === toCluster.id) ?? toCluster) : {id: toVnet.replace('cluster-', '')}
    ];

    substituted = substituted.replace(`"${fromVnet}" -> "${toVnet}"`, `"${from.id}" -> "${to.id}"`)
  });
  return substituted;
}

export {
  loadTemplateFile,
  compile,
  injectLinkNodes,
  getProperty
};