import path from 'path';
import { StylesByEnvironment } from './config';

type RuntimeOptions = {
  imageDirectory: string;
  nodeImages: Record<string, string>;
  styles: StylesByEnvironment;
};

const runtimeOptions: RuntimeOptions = {
  imageDirectory: path.resolve(process.cwd(), 'images'),
  nodeImages: Object.create(null),
  styles: Object.create(null)
};

const normalizePath = (value: string): string => value.replace(/\\/g, '/');

const setRuntimeOptions = (opts: Partial<RuntimeOptions>): void => {
  runtimeOptions.imageDirectory = normalizePath(path.resolve(opts.imageDirectory ?? runtimeOptions.imageDirectory));
  runtimeOptions.nodeImages = opts.nodeImages ?? runtimeOptions.nodeImages;
  runtimeOptions.styles = opts.styles ?? runtimeOptions.styles;
};

const getRuntimeOptions = (): RuntimeOptions => runtimeOptions;

export {
  getRuntimeOptions,
  setRuntimeOptions
};
