import * as fs from 'fs';
import * as path from 'path';
import { program } from '../src/cli';

describe('CLI logic', () => {
  const inputPath = path.join(__dirname, 'test-cli-input.json');
  const outputPath = path.join(__dirname, 'test-cli-output.mmd');

  beforeAll(() => {
    const validFlow = {
      Version: '2019-10-30',
      StartAction: 'start',
      Actions: [
        {
          Identifier: 'start',
          Type: 'PlayAudio',
          Transitions: { NextAction: 'end' },
        },
        {
          Identifier: 'end',
          Type: 'Disconnect',
          Transitions: {},
        },
      ],
    };
    fs.writeFileSync(inputPath, JSON.stringify(validFlow));
  });

  afterAll(() => {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  it('should process arguments and generate output file', async () => {
    // 正常終了を期待して実行。console.log をキャプチャする。
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // 引数を渡して parse を実行
    program.parse(['node', 'test', inputPath, '-o', outputPath]);

    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain('graph TD');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully converted'));

    logSpy.mockRestore();
  });

  it('should handle missing input file gracefully', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`process.exit called with ${code}`);
    });

    expect(() => {
      program.parse(['node', 'test', 'non-existent.json']);
    }).toThrow('process.exit called with 1');

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
