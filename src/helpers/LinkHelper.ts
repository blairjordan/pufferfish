import { HelperDelegate, SafeString } from 'handlebars';
import { Helper } from './Helper';
import { getProperty } from '../lib/helpers';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class LinkHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { from, to, label } = opts.hash;
      const color = getProperty({ prop: 'color', type: this.ref });
      const penwidth = getProperty({ prop: 'penwidth', type: this.ref }) || 1;
      const labelAttr = label ? `label="${escapeHtml(String(label))}"` : '';
      return new SafeString(`
      "cluster-${from}" -> "cluster-${to}" [
        ltail="cluster-${from}"
        lhead="cluster-${to}"
        color="${color}"
        type="${this.ref}"
        style=filled
        penwidth="${penwidth}"
        ${labelAttr}
      ]
      `);
    };
  }
}
