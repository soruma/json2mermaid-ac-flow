import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('E2E CLI test', () => {
  const binPath = path.resolve(__dirname, '../dist/bin.js');
  const inputPath = path.resolve(__dirname, './fixtures/sample-flow.json');
  const outputPath = path.resolve(__dirname, './fixtures/sample-flow.mmd');

  beforeAll(() => {
    // 事前にビルドされていることを前提とする。念のためビルド。
    execSync('npm run build');
  });

  afterEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('should convert sample flow JSON to Mermaid file via CLI', () => {
    // CLI を実行
    const command = `node ${binPath} ${inputPath} -o ${outputPath}`;
    const stdout = execSync(command).toString();

    // 標準出力の確認
    expect(stdout).toContain('Successfully converted to');
    expect(stdout).toContain('sample-flow.mmd');

    // ファイル生成の確認
    expect(fs.existsSync(outputPath)).toBe(true);

    // ファイル内容の確認
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain('graph TD');
    expect(content).toContain('start_node["PlayAudio\nWelcome to our service\n(start-node)"]');
    expect(content).toContain('check_hours{"営業時間の確認\n(check-hours)"}');
    expect(content).toContain('check_hours -- |False| --> play_closed_msg');
    expect(content).toContain('check_hours -- |Error: NoMatchingCondition| --> play_error_msg');
  });

  it('should output English labels when --lang en is specified', () => {
    const command = `node ${binPath} ${inputPath} -o ${outputPath} --lang en`;
    execSync(command);

    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain('check_hours{"CheckHoursOfOperation\n(check-hours)"}');
  });

  it('should generate default output filename when -o is not provided', () => {
    const defaultOutputPath = path.resolve(__dirname, './fixtures/sample-flow.mmd');

    // -o オプションなしで実行
    const command = `node ${binPath} ${inputPath}`;
    execSync(command);

    expect(fs.existsSync(defaultOutputPath)).toBe(true);
    fs.unlinkSync(defaultOutputPath);
  });
});
