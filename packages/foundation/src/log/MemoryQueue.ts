/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 10:42:09
 * Copyright © RingCentral. All rights reserved.
 */
import { IDeque } from './types';

export class MemoryQueue<E> implements IDeque<E> {
  private queue: E[] = [];
  addHead(e: E): void {
    this.queue = [e].concat(this.queue || []);
  }
  peekHead(): E {
    const head = this.queue[0];
    this.queue = this.queue.slice(1);
    return head;
  }
  getHead(): E {
    return this.queue[0];
  }
  addTail(e: E): void {
    this.queue = this.queue.concat([e]);
  }
  peekTail(): E {
    const tail = this.queue[this.queue.length - 1];
    this.queue = this.queue.slice(0, this.queue.length - 1);
    return tail;
  }
  getTail(): E {
    return this.queue[this.queue.length - 1];
  }
  peekAll(): E[] {
    const all = this.queue;
    this.queue = [];
    return all;
  }
  size(): number {
    return this.queue.length;
  }
}
