import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
for (const name of ['control', 'output']) {
  await mkdir(`dist/renderer/${name}`, { recursive: true });
  await build({entryPoints: [`src/renderer/${name}/${name}.ts`], bundle: true, outfile: `dist/renderer/${name}/${name}.js`, platform: 'browser', target: 'chrome140'});
  for (const ext of ['html', 'css']) await copyFile(`src/renderer/${name}/${ext === 'html' ? 'index' : name}.${ext}`, `dist/renderer/${name}/${ext === 'html' ? 'index' : name}.${ext}`);
}
