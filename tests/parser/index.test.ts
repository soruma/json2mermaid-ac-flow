import * as fs from 'fs';
import * as path from 'path';
import { parseFlowFile } from '../../src/parser';

describe('parseFlowFile', () => {
  const tempFilePath = path.join(__dirname, 'test-flow.json');

  beforeAll(() => {
    const validFlow = {
      Version: '2019-10-30',
      StartAction: 'start-id',
      Actions: [
        {
          Identifier: 'start-id',
          Type: 'PlayAudio',
          Transitions: {
            NextAction: 'end-id',
          },
        },
        {
          Identifier: 'end-id',
          Type: 'Disconnect',
          Transitions: {},
        },
      ],
    };
    fs.writeFileSync(tempFilePath, JSON.stringify(validFlow));
  });

  afterAll(() => {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  it('should parse a valid flow file successfully', () => {
    const flow = parseFlowFile(tempFilePath);
    expect(flow.Version).toBe('2019-10-30');
    expect(flow.Actions).toHaveLength(2);
    const firstAction = flow.Actions[0];
    expect(firstAction).toBeDefined();
    if (firstAction) {
      expect(firstAction.Identifier).toBe('start-id');
    }
  });

  it('should throw error when file does not exist', () => {
    expect(() => parseFlowFile('non-existent.json')).toThrow();
  });

  it('should throw error when file content is not valid JSON', () => {
    const invalidJsonPath = path.join(__dirname, 'invalid.json');
    fs.writeFileSync(invalidJsonPath, 'invalid-json');
    expect(() => parseFlowFile(invalidJsonPath)).toThrow();
    fs.unlinkSync(invalidJsonPath);
  });
});
