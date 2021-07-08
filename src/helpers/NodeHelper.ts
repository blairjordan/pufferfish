

import { Helper } from './Helper';
import { HelperDelegate, SafeString } from 'handlebars';
import { Images } from '../images';

export class NodeHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { name, url, label } = opts.hash;
      const image = Images[this.ref] ?? '';
      return new SafeString(`"${name}" [
        image="${image}"
        label="${label ?? name}"
        ${url ? `URL="${url}"`: ''}
        type="${this.ref}"
        ${this.ref === 'descriptor' ? `height="0.1"`: ''}
      ]`);
    }
  }
}