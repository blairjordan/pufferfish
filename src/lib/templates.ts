import * as Helper from '../helpers';

const Templates = {
  ext: '.hbs',
  helpers: [
    new Helper.Digraph('diagram'),
    new Helper.Node('vm'),
    new Helper.Node('ag'),
    new Helper.Node('devops'),
    new Helper.Node('azure'),
    new Helper.Node('dns'),
    new Helper.Node('sql'),
    new Helper.Node('descriptor'),
    new Helper.Node('ip'),
    new Helper.Cluster('internet'),
    new Helper.Cluster('region'),
    new Helper.Cluster('env'),
    new Helper.Cluster('subnet'),
    new Helper.Cluster('vnet'),
    new Helper.Link('vnet-peer'),
    new Helper.Link('vnet-dns'),
    new Helper.Link('data-transfer'),
  ],
  partials: []
}

export {
  Templates
}
