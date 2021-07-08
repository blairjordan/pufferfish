
import { Helper } from './Helper';
import { HelperDelegate, SafeString } from 'handlebars';

export class DigraphHelper extends Helper {
  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const content = opts.fn(this);
      return new SafeString(`
      digraph {
        compound=true;
      
        # Default node style
        node [
          imagepos="tc"
          shape=none
          labelloc="b"
          height="0.90"
          fontsize=14
        ];
      
        # Default arrow style
        edge [
          minlen=4
          color="#888888"
          penwidth=1
          dir=both
        ]
        
        ${content}
      }`);
    }
  }
}