
import { Helper } from './Helper';
import { HelperDelegate, SafeString } from 'handlebars';
import { getProperty } from '../lib/helpers';

export class LinkHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { from, to } = opts.hash;
      return new SafeString(`
      "cluster-${from}" -> "cluster-${to}" [
        ${from ? `ltail="cluster-${from}"`: ''}
        ${to ? `lhead="cluster-${to}"`: ''}
        color="${getProperty({ prop: 'color', type: this.ref })}"
        type="${this.ref}"
        style=filled
        penwidth="${getProperty({ prop: 'penwidth', type: this.ref }) || 1}"
      ]
      `);
    }
  }
}