/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 10:42:09
 * Copyright © RingCentral. All rights reserved.
 */
import { IDeque } from './types';

export class MemoryQueue<E> implements IDeque<E> {
  private _queue: E[] = [];

  addHead(e: E): void {
    this._queue = [e].concat(this._queue || []);
  }

  peekHead(): E {
    const head = this._queue[0];
    this._queue = this._queue.slice(1);
    return head;
  }

  getHead(): E {
    return this._queue[0];
  }

  addTail(e: E): void {
    this._queue = this._queue.concat([e]);
  }

  peekTail(): E {
    const tail = this._queue[this._queue.length - 1];
    this._queue = this._queue.slice(0, this._queue.length - 1);
    return tail;
  }

  getTail(): E {
    return this._queue[this._queue.length - 1];
  }

  peekAll(): E[] {
    const all = this._queue;
    this._queue = [];
    return all;
  }

  size(): number {
    return this._queue.length;
  }
}
