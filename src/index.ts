import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { buildTemplates }from './lib/templates';
import { THelper } from '../types';
import { compile, injectLinkNodes } from './lib/helpers';
import { Dot } from './lib/dot';
import { exit } from 'process';
import { setRuntimeOptions } from './lib/runtime';
import { loadPufferfishConfig, loadStyles } from './lib/config';

type CliArgs = {
  template: string;
  out: string;
  config: string;
  imageDir?: string;
  stylesFile?: string;
};

type BuildDiagramOptions = CliArgs;

const registerTemplateHelpers = (helpers: THelper[], partials: THelper[]): void => {
  partials.forEach(partial => partial.register());
  helpers.forEach(helper => helper.register());
};

const buildDiagram = ({ template, out, config, imageDir, stylesFile }: BuildDiagramOptions): void => {
  const loadedConfig = loadPufferfishConfig(config);
  const resolvedImageDirectory = path.resolve(imageDir ?? loadedConfig.config.assets.imageDir);
  const resolvedStylesFile = path.resolve(stylesFile ?? loadedConfig.config.assets.stylesFile);

  setRuntimeOptions({
    imageDirectory: resolvedImageDirectory,
    nodeImages: loadedConfig.config.helpers.nodes,
    styles: loadStyles(resolvedStylesFile)
  });

  const templates = buildTemplates(loadedConfig.config);

  registerTemplateHelpers(
    templates.helpers,
    templates.partials
  );

  const templateCompiled = compile(template, loadedConfig.config.translator.engine);

  if (templateCompiled) {
    const compiled = templateCompiled({});
    const graph = Dot.load({ dotGraph: compiled });
    const final = injectLinkNodes(compiled, graph);
    fs.writeFileSync(out, final);
  }
};

const main = (): void => {
  const argv = yargs.options({
    template: { type: 'string', demandOption: true },
    out: { type: 'string', demandOption: true },
    config: { type: 'string', default: './pufferfish.config.json' },
    'image-dir': { type: 'string' },
    'styles-file': { type: 'string' }
  }).argv;

  const { template, out, config, imageDir, stylesFile } = argv as CliArgs;

  if (!(template && out)) {
    console.log('Usage: build --template [inputfile.hbs] --out [outfile.dot] [--config ./pufferfish.config.json] [--image-dir ./images] [--styles-file ./styles.json]');
    exit();
  }

  buildDiagram({ template, out, config, imageDir, stylesFile });
};

if (require.main === module) {
  main();
}

export {
  buildDiagram
};
