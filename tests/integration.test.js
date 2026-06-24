/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const { buildDiagram } = require(path.join(repoRoot, 'dist', 'index.js'));
const templatePath = path.join(repoRoot, 'templates', 'main.hbs');
const imageDirectory = path.join(repoRoot, 'images');
const stylesPath = path.join(repoRoot, 'styles.json');
const fixtureManifest = path.join(repoRoot, 'fixtures', 'manifest.txt');

test('renders sample template without invalid cluster warnings', () => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pufferfish-'));
  const dotPath = path.join(tempDirectory, 'main.dot');

  buildDiagram({
    template: templatePath,
    out: dotPath,
    config: path.join(repoRoot, 'pufferfish.config.json'),
    imageDir: imageDirectory,
    stylesFile: stylesPath
  });

  const dotSource = fs.readFileSync(dotPath, 'utf8');
  assert.ok(dotSource.includes('"dns" -> "edge-nonprod-ip"'));
  assert.ok(!dotSource.includes('ltail="cluster-dns"'));
  assert.ok(!dotSource.includes('ltail="cluster-dns-internal-nonprod"'));
  assert.ok(dotSource.includes('lhead="cluster-edge-nonprod-useast-vnet"'));
});

test('registers custom node helpers from config', () => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pufferfish-config-'));
  const templatePath = path.join(tempDirectory, 'custom.hbs');
  const configPath = path.join(tempDirectory, 'pufferfish.config.json');
  const dotPath = path.join(tempDirectory, 'custom.dot');

  fs.writeFileSync(templatePath, '{{#diagram}}{{aws-ec2 name="instance" label="Instance"}}{{/diagram}}');
  fs.writeFileSync(configPath, JSON.stringify({
    translator: {
      engine: 'handlebars'
    },
    assets: {
      imageDir: path.join(repoRoot, 'images'),
      stylesFile: stylesPath
    },
    helpers: {
      nodes: {
        'aws-ec2': 'vm.png'
      }
    }
  }));

  buildDiagram({
    template: templatePath,
    out: dotPath,
    config: configPath
  });

  const dotSource = fs.readFileSync(dotPath, 'utf8');
  assert.ok(dotSource.includes('"instance" ['));
  assert.ok(dotSource.includes('>Instance<'));
  assert.ok(dotSource.includes('<IMG SRC='));
});

test('builds every fixture and references existing images', () => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pufferfish-fixtures-'));
  const fixtures = fs.readFileSync(fixtureManifest, 'utf8')
    .trim()
    .split('\n')
    .map(line => line.split('|'));

  fixtures.forEach(([name, template, config]) => {
    const dotPath = path.join(tempDirectory, `${name}.dot`);

    buildDiagram({
      template: path.join(repoRoot, template),
      out: dotPath,
      config: path.join(repoRoot, config)
    });

    const dotSource = fs.readFileSync(dotPath, 'utf8');
    const imagePaths = [...dotSource.matchAll(/<IMG SRC="([^"]*)"/g)]
      .map(match => match[1])
      .filter(Boolean);

    assert.ok(dotSource.includes('digraph {'));
    assert.ok(!dotSource.includes('ltail="cluster-dns"'));
    assert.ok(!dotSource.includes('lhead="cluster-dns"'));
    imagePaths.forEach(imagePath => assert.ok(fs.existsSync(imagePath), `missing image asset: ${imagePath}`));
  });
});
