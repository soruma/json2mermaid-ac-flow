import { FlowSchema } from '../../src/schema/flow';

describe('FlowSchema', () => {
  it('should validate a valid basic flow', () => {
    const validFlow = {
      Version: '2019-10-30',
      StartAction: 'start-id',
      Metadata: {
        Name: 'Test Flow',
      },
      Actions: [
        {
          Identifier: 'start-id',
          Type: 'PlayAudio',
          Parameters: {
            Text: 'Hello',
          },
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

    const result = FlowSchema.safeParse(validFlow);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Version).toBe('2019-10-30');
      expect(result.data.Actions).toHaveLength(2);
    }
  });

  it('should validate a flow with errors and conditions', () => {
    const validFlow = {
      Version: '2019-10-30',
      StartAction: 'start-id',
      Actions: [
        {
          Identifier: 'start-id',
          Type: 'GetUserInput',
          Transitions: {
            NextAction: 'default-id',
            Errors: [
              {
                NextAction: 'error-id',
                ErrorType: 'NoMatchingCondition',
              },
            ],
            Conditions: [
              {
                NextAction: 'option1-id',
                Condition: {
                  Comparison: 'Equals',
                  Value: '1',
                },
              },
            ],
          },
        },
      ],
    };

    const result = FlowSchema.safeParse(validFlow);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid flow (missing required fields)', () => {
    const invalidFlow = {
      Version: '2019-10-30',
      // StartAction is missing
      Actions: [],
    };

    const result = FlowSchema.safeParse(invalidFlow);
    expect(result.success).toBe(false);
  });
});
