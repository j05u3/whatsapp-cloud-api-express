import { resolveIncomingMessageSender } from '../src/expressRouter';

describe('resolveIncomingMessageSender', () => {
  it('preserves phone-number based webhook payloads', () => {
    expect(
      resolveIncomingMessageSender({ from: '51999999999' }, [
        {
          wa_id: '51999999999',
          profile: { name: 'Jenny' },
        },
      ])
    ).toEqual({
      from: '51999999999',
      from_user_id: undefined,
      username: undefined,
      name: 'Jenny',
    });
  });

  it('supports username-based webhook payloads', () => {
    expect(
      resolveIncomingMessageSender({ from_user_id: 'PE.123456789' }, [
        {
          user_id: 'PE.123456789',
          profile: {
            username: 'jenny_example',
            name: 'Jenny',
          },
        },
      ])
    ).toEqual({
      from: 'PE.123456789',
      from_user_id: 'PE.123456789',
      username: 'jenny_example',
      name: 'Jenny',
    });
  });
});
