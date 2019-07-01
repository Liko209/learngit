/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-01 14:39:12
 * Copyright © RingCentral. All rights reserved.
 */
import { AttachedSequenceProcessorHandler } from '../AttachedSequenceProcessorHandler';
import { SequenceProcessorHandler } from '../SequenceProcessorHandler';
import { IProcessor } from '../IProcessor';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const sleep = async (ms: number) =>
  await new Promise(resolve => {
    setTimeout(resolve, ms);
  });

class MyProcessor implements IProcessor {
  constructor(
    public option: { name: string; sleepTime: number; names?: string[] },
  ) {}

  async process() {
    this.option.names && this.option.names.push(this.name());
    await sleep(this.option.sleepTime);
    return true;
  }

  name() {
    return this.option.name;
  }

  canContinue() {
    return true;
  }
}

describe('AttachedSequenceProcessorHandler', () => {
  let sequenceProcessorHandler: SequenceProcessorHandler;

  function setUp() {
    sequenceProcessorHandler = new SequenceProcessorHandler({
      name: 'MyProcessorQueue',
    });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('addProcessor', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should be attached to SequenceProcessorHandler', () => {
      const attachedSequenceProcessorHandler = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler' },
      );

      const processor = new MyProcessor({ name: 'test1', sleepTime: 1 });
      const spyOnAddProcessor = jest.spyOn(
        sequenceProcessorHandler,
        'addProcessor',
      );
      const spyOnExecuteFunc = jest.spyOn(sequenceProcessorHandler, 'execute');
      attachedSequenceProcessorHandler.addProcessor(processor);
      expect(spyOnAddProcessor).toBeCalled();
      expect(spyOnExecuteFunc).toBeCalled();
    });

    it('Processor should be called fairly if execution time are same', async (done: any) => {
      const attachedSequenceProcessorHandler1 = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler1' },
      );

      const attachedSequenceProcessorHandler2 = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler2' },
      );

      const processorsNames: string[] = [];

      for (let i = 0; i < 2; i++) {
        const processor = new MyProcessor({
          name: `a${i}`,
          sleepTime: 10,
          names: processorsNames,
        });
        attachedSequenceProcessorHandler1.addProcessor(processor);
      }

      for (let i = 0; i < 2; i++) {
        const processor = new MyProcessor({
          name: `b${i}`,
          sleepTime: 10,
          names: processorsNames,
        });
        attachedSequenceProcessorHandler2.addProcessor(processor);
      }

      setTimeout(() => {
        expect(processorsNames).toHaveLength(4);
        expect(processorsNames).toEqual(['a0', 'b0', 'a1', 'b1']);
        done();
      }, 50);
    });

    it('Processor should be called fairly if execution time are different', async (done: any) => {
      const attachedSequenceProcessorHandler1 = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler1' },
      );

      const attachedSequenceProcessorHandler2 = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler2' },
      );

      const processorsNames: string[] = [];

      for (let i = 0; i < 4; i++) {
        const processor = new MyProcessor({
          name: `a${i}`,
          sleepTime: 5,
          names: processorsNames,
        });
        attachedSequenceProcessorHandler1.addProcessor(processor);
      }

      for (let i = 0; i < 2; i++) {
        const processor = new MyProcessor({
          name: `b${i}`,
          sleepTime: 10,
          names: processorsNames,
        });
        attachedSequenceProcessorHandler2.addProcessor(processor);
      }

      setTimeout(() => {
        expect(processorsNames).toHaveLength(6);
        expect(processorsNames).toEqual(['a0', 'b0', 'a1', 'b1', 'a2', 'a3']);
        done();
      }, 70);
    });
  });

  describe('cancelProcessors', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should be attached to SequenceProcessorHandler', () => {
      const attachedSequenceProcessorHandler = new AttachedSequenceProcessorHandler(
        sequenceProcessorHandler,
        { name: 'attachedSequenceProcessorHandler' },
      );

      for (let i = 0; i < 10; i++) {
        const processor = new MyProcessor({ name: `task_${i}`, sleepTime: 10 });
        attachedSequenceProcessorHandler.addProcessor(processor);
      }

      const spyOnRemoveProcessorFunc = jest.spyOn(
        sequenceProcessorHandler,
        'removeProcessorByName',
      );

      attachedSequenceProcessorHandler.cancelAll();

      expect(spyOnRemoveProcessorFunc).toBeCalledTimes(9);
    });
  });
});
