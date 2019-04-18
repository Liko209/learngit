/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-11 14:30:14
 * Copyright © RingCentral. All rights reserved.
 */

import { SequenceProcessorHandler } from '../SequenceProcessorHandler';
import { IProcessor } from '../IProcessor';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';

class MockProcessor implements IProcessor {
  process = jest.fn();
  canContinue = jest.fn();
  name = jest.fn();
}
let handler: SequenceProcessorHandler;
describe('SequenceProcessorHandler', () => {
  beforeEach(() => {
    handler = new SequenceProcessorHandler('test', undefined, 2);
    Object.assign(handler, { _isExecuting: true });
  });
  describe('addProcessor', () => {
    it('should add processor success', () => {
      const processor = new MockProcessor();
      const result = handler.addProcessor(processor);
      expect(result).toBeTruthy();
      expect(handler.getProcessors().length).toEqual(1);
    });
    it('should not over max queue - 1', () => {
      handler = new SequenceProcessorHandler(
        'test',
        undefined,
        2,
        (totalProcessors: IProcessor[]) => {
          const lastProcessor = totalProcessors.shift();
          if (lastProcessor && lastProcessor.cancel) {
            lastProcessor.cancel();
          }
        },
      );
      for (let i = 0; i < 4; i = i + 1) {
        const processor = new MockProcessor();
        processor.name.mockReturnValue(i);
        handler.addProcessor(processor);
      }
      expect(handler.getProcessors().length).toEqual(2);
    });

    it('should not over max queue - 2', () => {
      handler = new SequenceProcessorHandler(
        'test',
        undefined,
        2,
        (totalProcessors: IProcessor[]) => {
          const lastProcessor = totalProcessors.shift();
          if (lastProcessor && lastProcessor.cancel) {
            lastProcessor.cancel();
          }
        },
      );
      const processors = [];
      for (let i = 0; i < 4; i = i + 1) {
        const processor = new MockProcessor();
        processor.name.mockReturnValue(i);
        processors.push(processor);
      }
      handler.addProcessors(processors);
      // another one is excuted
      expect(handler.getProcessors().length).toEqual(1);
    });

    it('should not add duplicate processor max queue', () => {
      for (let i = 0; i < 2; i = i + 1) {
        const processor = new MockProcessor();
        processor.name.mockReturnValue(1);
        handler.addProcessor(processor);
      }
      expect(handler.getProcessors().length).toEqual(1);
    });
  });
  describe('notification event', () => {
    it('should move on when wake up from sleep mode and _isExecuting', () => {
      const processor = new MockProcessor();
      const result = handler.addProcessor(processor);
      expect(result).toBeTruthy();
      expect(handler.getProcessors().length).toEqual(1);

      notificationCenter.emitKVChange(SERVICE.WAKE_UP_FROM_SLEEP);
      expect(handler.getProcessors().length).toEqual(0);
    });
  });
});
