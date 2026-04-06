import * as fs from 'fs';
import * as path from 'path';
import { convertJsonToMermaid } from '../src';

describe('convertJsonToMermaid', () => {
  const tempJsonPath = path.join(__dirname, 'test-integration.json');

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
    fs.writeFileSync(tempJsonPath, JSON.stringify(validFlow));
  });

  afterAll(() => {
    if (fs.existsSync(tempJsonPath)) {
      fs.unlinkSync(tempJsonPath);
    }
  });

  it('should convert a flow JSON file to a Mermaid string', () => {
    const result = convertJsonToMermaid(tempJsonPath);
    expect(result).toContain('graph TD');
    expect(result).toContain('start["PlayAudio\n(start)"]');
    expect(result).toContain('end["Disconnect\n(end)"]');
    expect(result).toContain('start --> end');
  });
});
