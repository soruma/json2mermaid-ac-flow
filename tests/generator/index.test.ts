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
    expect(mermaid).toContain('start_id["PlayAudio\n(start-id)"]');
    expect(mermaid).toContain('end_id["Disconnect\n(end-id)"]');
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

  it('should correctly label nodes based on identifier type (UUID vs comment)', () => {
    const flowWithUUID: Flow = {
      Version: '2019-10-30',
      StartAction: 'uuid-action-1',
      Actions: [
        {
          Identifier: '6cfb35a2-4d8e-4fc3-be56-3a2807119a93', // UUID
          Type: 'StartNode',
          Transitions: {
            NextAction: 'comment-action',
          },
        },
        {
          Identifier: 'transfer-queue', // Comment
          Type: 'ProcessQueue',
          Transitions: {
            NextAction: 'end-node',
          },
        },
        {
          Identifier: 'end-node',
          Type: 'Disconnect',
          Transitions: {},
        },
      ],
    };

    const mermaid = generateMermaid(flowWithUUID);
    expect(mermaid).toContain('graph TD');
    // UUID identifier should only show Type, no (identifier) appended
    expect(mermaid).toContain('6cfb35a2_4d8e_4fc3_be56_3a2807119a93["StartNode"]');
    // Comment identifier should show Type and (identifier) appended
    expect(mermaid).toContain('transfer_queue["ProcessQueue\n(transfer-queue)"]');
    expect(mermaid).toContain('end_node["Disconnect\n(end-node)"]');
    expect(mermaid).toContain('6cfb35a2_4d8e_4fc3_be56_3a2807119a93 --> comment_action');
    expect(mermaid).toContain('transfer_queue --> end_node');
  });
});
