import { RTCEngine } from '../rtcEngine';
import { RTCAccount } from '../rtcAccount';

describe('Engine', async () => {
  describe('getInstance', () => {
    it('instance will be created', async () => {
      const engine = RTCEngine.getInstance();
      expect(engine).not.toBeNull();
    });

    it('create account', async () => {
      const account = RTCEngine.getInstance().createAccount(null);
      expect(account).not.toBeNull();
    });
  });
});
