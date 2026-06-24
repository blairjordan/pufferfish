import path from 'path';
import { HelperDelegate, SafeString } from 'handlebars';
import { Helper } from './Helper';
import { getDefault } from '../lib/helpers';
import { getRuntimeOptions } from '../lib/runtime';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const resolveImagePath = (imageName: string, imageDirectory: string): string => {
  if (!imageName) return '';
  const absolute = path.isAbsolute(imageName) ? imageName : path.resolve(imageDirectory, imageName);
  return absolute.replace(/\\/g, '/');
};

const renderHtmlNode = (id: string, image: string, label: string, ref: string, url?: string): string => {
  const size = getDefault('icon-size', '56');
  const fontsize = getDefault('node-fontsize', '11');
  const color = getDefault('label-fontcolor', '#222222');
  const safeLabel = escapeHtml(label);
  const urlAttr = url ? ` URL="${url}"` : '';
  const html = [
    '<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">',
    `<TR><TD FIXEDSIZE="TRUE" WIDTH="${size}" HEIGHT="${size}"><IMG SRC="${image}" SCALE="TRUE"/></TD></TR>`,
    `<TR><TD CELLPADDING="2"><FONT POINT-SIZE="${fontsize}" COLOR="${color}">${safeLabel}</FONT></TD></TR>`,
    '</TABLE>>'
  ].join('');
  return `"${id}" [shape=plaintext margin=0 label=${html} type="${ref}"${urlAttr}]`;
};

const renderDescriptorNode = (id: string, label: string, ref: string, url?: string): string => {
  const color = getDefault('descriptor-color', '#555555');
  const fontsize = getDefault('node-fontsize', '11');
  const urlAttr = url ? ` URL="${url}"` : '';
  return `"${id}" [shape=plaintext label="${label}" type="${ref}" height="0.1" fontsize=${fontsize} fontcolor="${color}"${urlAttr}]`;
};

const renderTextNode = (id: string, label: string, ref: string, url?: string): string => {
  const fill = getDefault('fallback-fillcolor', '#f5f5f5');
  const border = getDefault('fallback-bordercolor', '#cccccc');
  const urlAttr = url ? ` URL="${url}"` : '';
  return `"${id}" [shape=box style="rounded,filled" fillcolor="${fill}" color="${border}" label="${label}" type="${ref}"${urlAttr}]`;
};

export class NodeHelper extends Helper {
  constructor(ref: string) {
    super();
    this.ref = ref;
  }

  getHandlerFn(): HelperDelegate {
    return (opts) => {
      const { name, url, label } = opts.hash;
      const { imageDirectory, nodeImages } = getRuntimeOptions();
      const imageName = nodeImages[this.ref];
      const image = resolveImagePath(imageName, imageDirectory);
      const nodeLabel = label ?? name;

      if (this.ref === 'descriptor') return new SafeString(renderDescriptorNode(name, nodeLabel, this.ref, url));
      if (!image) return new SafeString(renderTextNode(name, nodeLabel, this.ref, url));
      return new SafeString(renderHtmlNode(name, image, nodeLabel, this.ref, url));
    };
  }
}
