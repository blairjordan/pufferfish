import * as Helper from '../helpers';
import { PufferfishConfig } from './config';

const buildTemplates = (config: PufferfishConfig) => ({
  ext: '.hbs',
  helpers: [
    new Helper.Digraph('diagram'),
    ...Object.keys(config.helpers.nodes).map(ref => new Helper.Node(ref)),
    ...config.helpers.clusters.map(ref => new Helper.Cluster(ref)),
    ...config.helpers.links.map(ref => new Helper.Link(ref))
  ],
  partials: []
});

export {
  buildTemplates
}
