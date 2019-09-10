import { ErrorChunkStrategy } from '../ErrorChunkStrategy';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';
import { LOG_LEVEL } from 'foundation/log';

describe('ErrorChunkStrategy', () => {
  describe('split()', () => {
    const logs = [
      logEntityFactory.build({
        size: 100,
        message: `0`,
        level: LOG_LEVEL.INFO,
      }),
      logEntityFactory.build({
        size: 100,
        message: `1`,
        level: LOG_LEVEL.INFO,
      }),
      logEntityFactory.build({
        size: 100,
        message: `2`,
        level: LOG_LEVEL.ERROR,
      }),
      logEntityFactory.build({
        size: 100,
        message: `3`,
        level: LOG_LEVEL.ERROR,
      }),
      logEntityFactory.build({
        size: 100,
        message: `4`,
        level: LOG_LEVEL.INFO,
      }),
    ];
    it('should chunks include first error', () => {
      const chunkStrategy = new ErrorChunkStrategy();
      const chunks = chunkStrategy.split(logs, 102);
      expect(chunks.length).toEqual(1);
      expect(chunks[0]).toEqual('2\t\n');
    });
    it('should chunks include first error & pre logs', () => {
      const chunkStrategy = new ErrorChunkStrategy();
      const chunks = chunkStrategy.split(logs, 306);
      expect(chunks.length).toEqual(1);
      expect(chunks[0]).toEqual('1\t\n2\t\n3\t\n');
    });
    it('should chunks be empty', () => {
      const chunkStrategy = new ErrorChunkStrategy();
      const chunks = chunkStrategy.split(logs, 101);
      expect(chunks.length).toEqual(0);
    });
  });
});
