import { HelperDelegate, SafeString } from 'handlebars';
import { Helper } from './Helper';

export class DigraphHelper extends Helper {
  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const content = opts.fn(this);
      return new SafeString(`
      digraph {
        compound=true;
        splines=true;
        pad="0.5";
        nodesep="0.55";
        ranksep="0.8";
        outputorder="edgesfirst";
        fontname="Helvetica";
        bgcolor="white";

        node [
          fontname="Helvetica"
          shape=plaintext
          margin=0
          fontsize=11
        ];

        edge [
          fontname="Helvetica"
          minlen=2
          color="#888888"
          penwidth=1
          dir=both
          arrowsize=0.7
        ]

        ${content}
      }`);
    };
  }
}
