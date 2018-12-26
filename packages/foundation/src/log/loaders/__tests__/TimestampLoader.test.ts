import { TimestampLoader } from '../TimestampLoader';
import { logEntityFactory } from '../../__tests__/factory';
describe('TimestampLoader', () => {

  describe('handle()', () => {
    it('should add timestamp into log entity', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TimestampLoader();
      delete mockLog.timestamp;
      expect(loader.handle(mockLog)['timestamp']).not.toBeNull();
    });
  });
});
