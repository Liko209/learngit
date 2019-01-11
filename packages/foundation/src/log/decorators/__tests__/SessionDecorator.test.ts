import { SessionDecorator } from '../SessionDecorator';
import { LogEntity } from '../../types';
describe('SessionDecorator', () => {

  describe('decorate()', () => {
    it('should generate sessionId', async () => {
      const decorator = new SessionDecorator();
      const log = new LogEntity();
      expect(log.sessionId).toBeUndefined();
      decorator.decorate(log);
      expect(log.sessionId).not.toBeUndefined();
    });

    it('should generate auto increase sessionIndex', async () => {
      const decorator = new SessionDecorator();
      const log = new LogEntity();
      expect(log.sessionIndex).toBeUndefined();
      decorator.decorate(log);
      expect(log.sessionIndex).toEqual(0);
      decorator.decorate(log);
      expect(log.sessionIndex).toEqual(1);
    });
  });
});
