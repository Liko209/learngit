import { TimestampDecorator } from '../TimestampDecorator';
import { logEntityFactory } from '../../__tests__/factory';
describe('TimestampDecorator', () => {

  describe('decorate()', () => {
    it('should add timestamp into log entity', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TimestampDecorator();
      delete mockLog.timestamp;
      expect(loader.decorate(mockLog)['timestamp']).not.toBeNull();
    });
  });
});
