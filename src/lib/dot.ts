/* eslint-disable @typescript-eslint/camelcase */

import parseDot from 'dotparser';
import createGraph, { Graph } from 'ngraph.graph';

export class Dot {
  static load(opts) {
    const { dotGraph, appendTo } = opts;
    const dotAST = parseDot(dotGraph);
    if (dotAST.length > 1 && appendTo !== undefined) {
      throw new Error('Dot file contains multiple graphs. Cannot use `saveTo` in this case');
    }

    const graph = appendTo ?? createGraph();
  
    // by default load will only load first graph:
    return Dot.loadOne(graph, dotAST[0]);
  }

  static loadOne(graph: Graph, ast) {
    Dot.loadSubgraph(graph, ast);
    return graph;
  }

  static loadSubgraph(graph: Graph, ast) {
    const children = ast.children;
    if (!children) return graph;

    const addedNodes = [];

    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (child.type === 'edge_stmt') {
        Dot.concat(addedNodes, Dot.processEdgeStatement(graph, child));
      } else if (child.type === 'node_stmt') {
        Dot.concat(addedNodes, Dot.processNodeStatement(graph,
          {...child, 
          attr_list: [
            ...child.attr_list, 
            ...(ast.type === 'subgraph') ? [ {type: 'attr', id: 'parent', eq: ast.id } ] : []] // inject parent
          }));
      }
      if (child.type === 'subgraph') {
        // inject subgraphs as nodes
        Dot.processNodeStatement(graph, {
          type: 'node_stmt',
          node_id: { type: 'node_id', id: child.id },
          attr_list: (ast.type === 'subgraph') ? [ {type: 'attr', id: 'parent', eq: ast.id } ] : []
        });
        Dot.concat(addedNodes, Dot.loadSubgraph(graph, child));
      }
    }

    return addedNodes;
  }

  static processEdgeStatement(graph: Graph, edgeAST) {
    const edges = edgeAST.edge_list;
    if (edges.length === 0) return; // wat?

    const first = edges[0];
    const addedNodes = [];
    let prevNode = Dot.addNode(graph, first, {});
    Dot.concat(addedNodes, prevNode);

    const attributes = Dot.parseAttributesAsData(edgeAST.attr_list);
    for (let i = 1; i < edges.length; ++i) {
      const nextNode = Dot.addNode(graph, edges[i], {});
      Dot.concat(addedNodes, nextNode);

      Dot.addLink(graph, prevNode, nextNode, attributes);
      prevNode = nextNode;
    }

    return addedNodes;
  }

  static processNodeStatement(graph: Graph, nodeStatement) {
    return Dot.addNode(graph, nodeStatement.node_id, nodeStatement.attr_list);
  }

  static concat(head, tail) {
    for (let i = 0; i < tail.length; ++i) {
      head.push(tail[i]);
    }
    return head;
  }

  static addNode(graph: Graph, nodeAST, attributesList) {
    if (nodeAST.type === 'node_id') {
      const data = Dot.mergeNodeDataIfNeeded(
        Dot.parseAttributesAsData(attributesList),
        graph.getNode(nodeAST.id)
      );
      if (data) {
        graph.addNode(nodeAST.id, data);
      } else {
        graph.addNode(nodeAST.id);
      }
      return [nodeAST.id];
    } else if (nodeAST.type === 'subgraph') {
      return Dot.loadSubgraph(graph, nodeAST);
    }
  }

  static addLink(graph: Graph, from, to, data) {
    for (let i = 0; i < from.length; ++i) {
      for (let j = 0; j < to.length; ++j) {
        graph.addLink(from[i], to[j], data);
      }
    }
  }

  static parseAttributesAsData(attributesList) {
    if (!attributesList || !attributesList.length) return;
    const data = Object.create(null);
    for (let i = 0; i < attributesList.length; ++i) {
      const attr = attributesList[i];
      if (attr.type !== 'attr' || attr.id === undefined) continue;
      data[attr.id] = attr.eq;
    }
    return data;
  }

  static mergeNodeDataIfNeeded(newData, oldNode) {
    if (!oldNode || !oldNode.data) return newData;
    return Object.assign(oldNode.data, newData);
  }
}