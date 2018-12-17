import { RTCEngine } from '../rtcEngine';
import { RTCAccount } from '../rtcAccount';

describe('Engine', async () => {
  describe('getInstance', () => {
    it('Should create instance', async () => {
      const engine = RTCEngine.getInstance();
      expect(engine).not.toBeNull();
    });

    it('Create account without listener', async () => {
      const account = RTCEngine.getInstance().createAccount(null);
      expect(account).not.toBeNull();
    });
  });
});
