import crypto from 'crypto';
import { HelperDelegate } from 'handlebars';
import { Helper } from './Helper';
import { getDefault, getProperty } from '../lib/helpers';

const dummyNode = (): string =>
  `"dummy-${crypto.randomBytes(8).toString('hex')}" [shape=point width=0 height=0 style=invis]`;

export class ClusterHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { env, name, label } = opts.hash;
      const body = opts.fn(this).trim() || dummyNode();
      const fontsize = getDefault('cluster-fontsize', '12');
      const fontcolor = getDefault('label-fontcolor', '#222222');

      const styleProps = ['bgcolor', 'style', 'margin', 'pencolor', 'penwidth']
        .map(prop => {
          const value = getProperty({ env, prop, type: this.ref });
          return value ? `${prop}="${value}"` : '';
        })
        .filter(Boolean)
        .join('\n        ');

      return `
      subgraph "cluster-${name}" {
        label="${label ?? name}"
        labeljust="c"
        labelloc="t"
        fontsize=${fontsize}
        fontcolor="${fontcolor}"
        ${styleProps}
        ${body}
      }`;
    };
  }
}
