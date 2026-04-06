import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('SVG Snapshot Test', () => {
  const binPath = path.resolve(__dirname, '../dist/bin.js');
  const mmdcPath = path.resolve(__dirname, '../node_modules/.bin/mmdc');
  const inputPath = path.resolve(__dirname, './fixtures/sample-flow.json');
  const mmdOutputPath = path.resolve(__dirname, './fixtures/sample-flow-svg-test.mmd');
  const svgOutputPath = path.resolve(__dirname, './fixtures/sample-flow-svg-test.svg');

  beforeAll(() => {
    execSync('npm run build');
  });

  afterEach(() => {
    [mmdOutputPath, svgOutputPath].forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  it('should generate SVG that matches snapshot', () => {
    // 1. JSON → .mmd を生成
    execSync(`node ${binPath} ${inputPath} -o ${mmdOutputPath}`);
    expect(fs.existsSync(mmdOutputPath)).toBe(true);

    // 2. .mmd → SVG を生成
    execSync(`${mmdcPath} -i ${mmdOutputPath} -o ${svgOutputPath}`);
    expect(fs.existsSync(svgOutputPath)).toBe(true);

    // 3. SVG の内容を読み込みスナップショットと比較
    const svgContent = fs.readFileSync(svgOutputPath, 'utf-8');
    expect(svgContent).toMatchSnapshot();
  });
});
