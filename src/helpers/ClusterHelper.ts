
import { Helper } from './Helper';
import { HelperDelegate } from 'handlebars';
import { getProperty } from '../lib/helpers';
import crypto from 'crypto';

export class ClusterHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  _getDummyNode(): string {
    return `"dummy-${crypto.randomBytes(10).toString('hex')}" [ image="" label="" height="0" ]`;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      let content = opts.fn(this);
      const { env, name, label } = opts.hash;
      
      // insert dummy node into empty cluster
      if (content.trim() === '') { content = this._getDummyNode(); } 

      const props = ['bgcolor', 'style', 'margin']
        .reduce((prev, curr) => {
          const value = getProperty({ env, prop: curr, type: this.ref });
          const prop = value ? `${curr}="${value}"` : '';
          return `${prev}\n${prop}`;
        }, '');
      return `
      subgraph "cluster-${name}" {
        label="${label ?? name}"
        ${props}
        ${content}
      }`;
    }
  }
}