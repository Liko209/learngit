import { LogMemoryCollector } from '../memoryCollector/LogMemoryCollector';
import { FixSizeMemoryLogCollection } from '../FixSizeMemoryLogCollection';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

describe('LogMemoryCollector', () => {
  it('xx', async () => {
    const collection = new FixSizeMemoryLogCollection();
    const collector = new LogMemoryCollector(collection);
    collector.onLog(logEntityFactory.build());
    expect(collector.getCollection().push).toBeCalled();
  });
});
