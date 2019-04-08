import { MemoryQueue } from '../MemoryQueue';

describe('MemoryQueue', () => {

  describe('addHead()', () => {
    it('should add to head correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addHead('a');
      memoryQueue.addHead('b');
      expect(memoryQueue.peekAll()).toEqual(['b', 'a']);
    });
  });
  describe('peekHead()', () => {
    it('should peek head correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addHead('a');
      memoryQueue.addHead('b');
      expect(memoryQueue.peekHead()).toEqual('b');
      expect(memoryQueue.peekHead()).toEqual('a');
    });

    it('should return null when queue is empty', () => {
      const memoryQueue = new MemoryQueue<string>();
      expect(memoryQueue.peekHead()).toBeUndefined();
      expect(memoryQueue.peekHead()).toBeUndefined();
    });
  });

  describe('getHead()', () => {
    it('should get head correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addHead('a');
      memoryQueue.addHead('b');
      expect(memoryQueue.getHead()).toEqual('b');
      expect(memoryQueue.getHead()).toEqual('b');
    });
  });

  describe('addTail()', () => {
    it('should add to tail correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addTail('a');
      memoryQueue.addTail('b');
      expect(memoryQueue.peekAll()).toEqual(['a', 'b']);
    });
  });

  describe('peekTail()', () => {
    it('should peek tail correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addTail('a');
      memoryQueue.addTail('b');
      expect(memoryQueue.peekTail()).toEqual('b');
      expect(memoryQueue.peekTail()).toEqual('a');
    });

    it('should return null when queue is empty', () => {
      const memoryQueue = new MemoryQueue<string>();
      expect(memoryQueue.peekTail()).toBeUndefined();
      expect(memoryQueue.peekTail()).toBeUndefined();
    });
  });

  describe('getTail()', () => {
    it('should get tail correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addTail('a');
      memoryQueue.addTail('b');
      expect(memoryQueue.getTail()).toEqual('b');
      expect(memoryQueue.getTail()).toEqual('b');
    });
  });

  describe('size()', () => {
    it('should be correctly', () => {
      const memoryQueue = new MemoryQueue<string>();
      memoryQueue.addHead('a');
      memoryQueue.addHead('b');
      expect(memoryQueue.size()).toEqual(2);
    });
  });
});
