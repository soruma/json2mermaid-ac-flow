import { generateMermaid } from '../../src/generator';
import { Flow } from '../../src/schema/flow';

describe('generateMermaid', () => {
  it('should generate a simple Mermaid graph', () => {
    const flow: Flow = {
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

    const mermaid = generateMermaid(flow);
    expect(mermaid).toContain('graph TD');
    expect(mermaid).toContain('start_id["PlayAudio: start-id"]');
    expect(mermaid).toContain('end_id["Disconnect: end-id"]');
    expect(mermaid).toContain('start_id --> end_id');
  });

  it('should generate Mermaid edges with labels for errors and conditions', () => {
    const flow: Flow = {
      Version: '2019-10-30',
      StartAction: 'action1',
      Actions: [
        {
          Identifier: 'action1',
          Type: 'GetUserInput',
          Transitions: {
            NextAction: 'action-default',
            Errors: [
              {
                NextAction: 'action-error',
                ErrorType: 'NoMatchingCondition',
              },
            ],
            Conditions: [
              {
                NextAction: 'action-cond1',
              },
            ],
          },
        },
        { Identifier: 'action-default', Type: 'Disconnect', Transitions: {} },
        { Identifier: 'action-error', Type: 'Disconnect', Transitions: {} },
        { Identifier: 'action-cond1', Type: 'Disconnect', Transitions: {} },
      ],
    };

    const mermaid = generateMermaid(flow);
    expect(mermaid).toContain('action1 -- |Error: NoMatchingCondition| --> action_error');
    expect(mermaid).toContain('action1 -- |Condition 1| --> action_cond1');
    expect(mermaid).toContain('action1 --> action_default');
  });
});
