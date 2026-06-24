import { HelperDelegate, SafeString } from 'handlebars';
import { Helper } from './Helper';
import { getDefault } from '../lib/helpers';

export class DigraphHelper extends Helper {
  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const content = opts.fn(this);
      const bg = getDefault('diagram-bgcolor', 'white');
      const font = getDefault('font-family', 'Helvetica');
      const nodeFontsize = getDefault('node-fontsize', '11');
      const edgeColor = getDefault('edge-color', '#888888');
      const edgePenwidth = getDefault('edge-penwidth', '1');
      const edgeArrowsize = getDefault('edge-arrowsize', '0.7');
      const edgeMinlen = getDefault('edge-minlen', '2');
      const nodesep = getDefault('nodesep', '0.55');
      const ranksep = getDefault('ranksep', '0.8');

      return new SafeString(`
      digraph {
        compound=true;
        splines=true;
        pad="0.5";
        nodesep="${nodesep}";
        ranksep="${ranksep}";
        outputorder="edgesfirst";
        fontname="${font}";
        bgcolor="${bg}";

        node [
          fontname="${font}"
          shape=plaintext
          margin=0
          fontsize=${nodeFontsize}
        ];

        edge [
          fontname="${font}"
          minlen=${edgeMinlen}
          color="${edgeColor}"
          penwidth=${edgePenwidth}
          dir=both
          arrowsize=${edgeArrowsize}
        ]

        ${content}
      }`);
    };
  }
}
