/*
 * @Author: Paynter Chen
 * @Date: 2019-04-14 09:04:49
 * Copyright © RingCentral. All rights reserved.
 */
import { ConsumerCollector } from '../ConsumerCollector';
import { FixSizeMemoryLogCollection } from '../../FixSizeMemoryLogCollection';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';
import { ILogConsumer } from '../../types';
import { spyOnTarget } from '../../../../../__tests__/utils';

describe('ConsumerCollector', () => {
  describe('onLog()', () => {
    it('should collect to collection when there has not consumer', () => {
      const collection = spyOnTarget(new FixSizeMemoryLogCollection());
      const collector = new ConsumerCollector(collection);
      const mockData = logEntityFactory.build({ size: 1 });
      collector.onLog(mockData);
      expect(collection.push).toBeCalledTimes(1);
    });
    it('should consume by consumer after setConsumer', () => {
      const collection = spyOnTarget(new FixSizeMemoryLogCollection());
      const collector = new ConsumerCollector(collection);
      const mockConsumer: ILogConsumer = spyOnTarget({
        logProducer: collector,
        canConsume: () => true,
        consume: log => {},
      });
      const mockData1 = logEntityFactory.build({ size: 1 });
      collector.onLog(mockData1);
      expect(collection.push).toBeCalledTimes(1);
      expect(collection.push).lastCalledWith(mockData1);

      collector.setConsumer(mockConsumer);
      expect(mockConsumer.consume).toBeCalledTimes(1);
      expect(mockConsumer.consume).lastCalledWith([mockData1]);
    });
    it('should collect log to consumer when consumer exist', () => {
      const collection = spyOnTarget(new FixSizeMemoryLogCollection());
      const collector = new ConsumerCollector(collection);
      const mockConsumer: ILogConsumer = spyOnTarget({
        logProducer: collector,
        canConsume: () => true,
        consume: log => {},
      });
      collector.setConsumer(mockConsumer);
      const mockData1 = logEntityFactory.build({ size: 1 });
      collector.onLog(mockData1);

      expect(collection.push).not.toBeCalled();
      expect(mockConsumer.consume).toBeCalledTimes(1);
      expect(mockConsumer.consume).toBeCalledWith(mockData1);
    });

    it('should collect log to collection when consumer canConsume === false', () => {
      const collection = spyOnTarget(new FixSizeMemoryLogCollection());
      const collector = new ConsumerCollector(collection);
      const mockConsumer: ILogConsumer = spyOnTarget({
        logProducer: collector,
        canConsume: () => false,
        consume: log => {},
      });
      collector.setConsumer(mockConsumer);
      const mockData1 = logEntityFactory.build({ size: 1 });
      collector.onLog(mockData1);

      expect(collection.push).toBeCalledTimes(1);
      expect(collection.push).toBeCalledWith(mockData1);
      expect(mockConsumer.consume).not.toBeCalled();
    });
  });
});
