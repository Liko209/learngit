import { StringifyDecorator } from '../StringifyDecorator';
import { logEntityFactory } from '../../__tests__/factory';
describe('StringifyDecorator', () => {
  describe('decorate()', () => {
    it('should generate message to log', async () => {
      const decorator = new StringifyDecorator();
      const log = logEntityFactory.build({
        params: [
          'hello',
          { name: 'Bruce' },
          () => {},
          new RegExp('a'),
          /a/g,
          true,
          undefined,
          null,
          true,
          123,
        ],
        message: undefined,
      });
      decorator.decorate(log);
      expect(log.params).toEqual([
        'hello',
        JSON.stringify({ name: 'Bruce' }),
        '[object Function]',
        '/a/',
        '/a/g',
        'true',
        'undefined',
        'null',
        'true',
        '123',
      ]);
    });
  });
});
