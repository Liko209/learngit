import { DefaultChunkStrategy } from '../DefaultChunkStrategy';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

describe('DefaultChunkStrategy', () => {
  describe('split()', () => {
    const logs = ',,,,,,,,,,,,,,'.split(',').map((it, index) => {
      return logEntityFactory.build({
        size: 100,
        message: `${index}`,
      });
    });
    it('should split into chunks by limit', () => {
      const chunkStrategy = new DefaultChunkStrategy();
      const chunks = chunkStrategy.split(logs, 102, 0);
      expect(chunks.length).toEqual(logs.length);
    });
    it('should split into chunks by limit', () => {
      const chunkStrategy = new DefaultChunkStrategy();
      const chunks = chunkStrategy.split(logs, 306, 0);
      expect(chunks.length).toEqual(Math.ceil(logs.length / 3));
    });
    it('should not split into chunks when single size > limit', () => {
      const chunkStrategy = new DefaultChunkStrategy();
      const chunks = chunkStrategy.split(logs, 101, 0);
      expect(chunks.length).toEqual(0);
    });
  });
});
