/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-11 15:24:52
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from '../IProcessor';
import { AbstractProcessor } from '../AbstractProcessor';

class MyProcessorQueue extends AbstractProcessor {
  execute() {
    return Promise.resolve(true);
  }
}

class MyProcessor implements IProcessor {
  constructor(private _name: string) {}

  process() {
    return Promise.resolve(true);
  }

  name() {
    return this._name;
  }

  canContinue() {
    return true;
  }
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AbstractProcessor', () => {
  let queue: MyProcessorQueue;

  function setUp() {
    queue = new MyProcessorQueue('MyProcessorQueue');
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('name', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should return name of the processor', () => {
      expect(queue.name()).toEqual('MyProcessorQueue');
    });
  });

  describe('getProcessors', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return no processors when is empty', () => {
      expect(queue.getProcessors()).toEqual([]);
    });

    it('should return all processors', () => {
      queue.addProcessor(new MyProcessor(''));
      expect(queue.getProcessors()).toHaveLength(1);
    });
  });

  describe('addProcessor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add processor to the queue successfully when no processor before', () => {
      const p = new MyProcessor('');
      queue.addProcessor(p);
      expect(queue.getProcessors()).toEqual([p]);
    });

    it('should not add processor to the queue when queue has a processor with same name', () => {
      const p = new MyProcessor('a');
      const p1 = new MyProcessor('a');
      queue.addProcessor(p);
      expect(queue.getProcessors()).toEqual([p]);

      queue.addProcessor(p1);
      expect(queue.getProcessors()).toEqual([p]);
    });
  });

  describe('removeProcessor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should remove processor by matched name', () => {
      const p = new MyProcessor('a');
      queue.addProcessor(p);
      expect(queue.removeProcessor(p)).toBeTruthy();
      expect(queue.getProcessors()).toEqual([]);
    });

    it('should not remove processor by matched name', () => {
      const p = new MyProcessor('a');
      const p1 = new MyProcessor('a');
      queue.addProcessor(p);
      expect(queue.removeProcessor(p1)).toBeTruthy();
      expect(queue.getProcessors()).toEqual([]);
    });
  });

  describe('removeProcessorByName', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should be able to remove processor by matched name', () => {
      const p = new MyProcessor('a');
      queue.addProcessor(p);
      expect(queue.removeProcessorByName('a')).toBeTruthy();
      expect(queue.getProcessors()).toEqual([]);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should be able to clear all processors', () => {
      const p = new MyProcessor('a');
      queue.addProcessor(p);
      expect(queue.getProcessors()).toEqual([p]);
      queue.clear();
      expect(queue.getProcessors()).toEqual([]);
    });
  });
});
