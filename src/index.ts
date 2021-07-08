import fs from 'fs';
import yargs from 'yargs';
import { Templates }from './lib/templates';
import { THelper } from '../types';
import { compile, injectLinkNodes } from './lib/helpers';
import { Dot } from './lib/dot';
import { exit } from 'process';

const argv = yargs.options({
  template:        { type: 'string', demandOption: true },
  out:       { type: 'string', demandOption: true}
}).argv; 

const { template, out } = argv;

if (!(template && out)) {
  console.log('Usage: build --template [inputfile.hbs] --out [outfile.dot]');
  exit();
}

const registerTemplateHelpers = (helpers: THelper[], partials: THelper[]): void => {
  partials.forEach(partial => partial.register());
  helpers.forEach(helper => helper.register());
};

registerTemplateHelpers(
  Templates.helpers, 
  Templates.partials
);

const templateCompiled = compile(template);

if (templateCompiled) {
  const compiled = templateCompiled({});
  const graph = Dot.load({ dotGraph: compiled });
  const final = injectLinkNodes(compiled, graph);
  fs.writeFileSync(out, final);
}
