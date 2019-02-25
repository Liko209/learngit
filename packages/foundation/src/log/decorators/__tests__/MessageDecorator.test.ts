import { MessageDecorator } from '../MessageDecorator';
import { logEntityFactory } from '../../__tests__/factory';
describe('MessageDecorator', () => {
  describe('decorate()', () => {
    it('should generate message to log', async () => {
      const decorator = new MessageDecorator();
      const log = logEntityFactory.build({
        params: ['hello', { name: 'min' }, 'world'],
        message: undefined,
      });
      expect(log.message).toBeUndefined();
      decorator.decorate(log);
      expect(log.message).not.toBeUndefined();
    });
    it('should not generate message again when message exist', async () => {
      const decorator = new MessageDecorator();
      const log = logEntityFactory.build({
        params: ['hello', { name: 'min' }, 'world'],
        message: 'hal',
      });
      decorator.decorate(log);
      expect(log.message).toEqual('hal');
    });
  });
});
