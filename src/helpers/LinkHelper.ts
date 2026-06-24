import { HelperDelegate, SafeString } from 'handlebars';
import { Helper } from './Helper';
import { getProperty } from '../lib/helpers';

export class LinkHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { from, to } = opts.hash;
      const color = getProperty({ prop: 'color', type: this.ref });
      const penwidth = getProperty({ prop: 'penwidth', type: this.ref }) || 1;
      return new SafeString(`
      "cluster-${from}" -> "cluster-${to}" [
        ltail="cluster-${from}"
        lhead="cluster-${to}"
        color="${color}"
        type="${this.ref}"
        style=filled
        penwidth="${penwidth}"
      ]
      `);
    };
  }
}
