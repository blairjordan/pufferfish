import fs from 'fs';
import path from 'path';
import { DefaultNodeImages } from '../images';

type StyleValue = string | number;

type StyleEntry = {
  type: string;
  prop: string;
  value: StyleValue;
};

export type StylesByEnvironment = Record<string, StyleEntry[]>;

type TranslatorConfig = {
  engine: string;
};

type AssetsConfig = {
  imageDir: string;
  stylesFile: string;
};

type HelperConfig = {
  nodes: Record<string, string>;
  clusters: string[];
  links: string[];
};

export type PufferfishConfig = {
  translator: TranslatorConfig;
  assets: AssetsConfig;
  helpers: HelperConfig;
};

const DEFAULT_CONFIG_PATH = path.resolve(process.cwd(), 'pufferfish.config.json');

const DEFAULT_CONFIG: PufferfishConfig = {
  translator: {
    engine: 'handlebars'
  },
  assets: {
    imageDir: './images',
    stylesFile: './styles.json'
  },
  helpers: {
    nodes: DefaultNodeImages,
    clusters: ['internet', 'region', 'env', 'subnet', 'vnet'],
    links: ['vnet-peer', 'vnet-dns', 'data-transfer']
  }
};

const readJsonFile = <T>(filename: string): T => JSON.parse(fs.readFileSync(filename, 'utf8')) as T;

const resolveFromBase = (baseDirectory: string, maybeRelativePath: string): string => (
  path.isAbsolute(maybeRelativePath)
    ? maybeRelativePath
    : path.resolve(baseDirectory, maybeRelativePath)
);

const mergeConfig = (override: Partial<PufferfishConfig>): PufferfishConfig => ({
  translator: {
    ...DEFAULT_CONFIG.translator,
    ...override.translator
  },
  assets: {
    ...DEFAULT_CONFIG.assets,
    ...override.assets
  },
  helpers: {
    nodes: {
      ...DEFAULT_CONFIG.helpers.nodes,
      ...(override.helpers?.nodes ?? {})
    },
    clusters: override.helpers?.clusters ?? DEFAULT_CONFIG.helpers.clusters,
    links: override.helpers?.links ?? DEFAULT_CONFIG.helpers.links
  }
});

const loadPufferfishConfig = (configPath?: string): { config: PufferfishConfig; configPath: string } => {
  const resolvedConfigPath = path.resolve(configPath ?? DEFAULT_CONFIG_PATH);
  const loadedConfig = fs.existsSync(resolvedConfigPath)
    ? readJsonFile<Partial<PufferfishConfig>>(resolvedConfigPath)
    : {};
  const mergedConfig = mergeConfig(loadedConfig);
  const configDirectory = path.dirname(resolvedConfigPath);

  return {
    configPath: resolvedConfigPath,
    config: {
      ...mergedConfig,
      assets: {
        imageDir: resolveFromBase(configDirectory, mergedConfig.assets.imageDir),
        stylesFile: resolveFromBase(configDirectory, mergedConfig.assets.stylesFile)
      }
    }
  };
};

const loadStyles = (stylesFile: string): StylesByEnvironment => readJsonFile<StylesByEnvironment>(stylesFile);

export {
  DEFAULT_CONFIG_PATH,
  loadPufferfishConfig,
  loadStyles
};
