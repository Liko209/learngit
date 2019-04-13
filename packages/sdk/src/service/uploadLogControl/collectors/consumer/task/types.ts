/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 11:19:43
 * Copyright © RingCentral. All rights reserved.
 */

interface IDeque<E> {
  addHead(e: E): void;
  peekHead(): E;
  getHead(): E;
  addTail(e: E): void;
  peekTail(): E;
  getTail(): E;
  peekAll(): E[];
  size(): number;
}

interface IQueueLoop {
  loop(): Promise<void>;
  isAvailable(): boolean;
  sleep(timeout: number): void;
  wake(): void;
  abortAll(): void;
}

type OnTaskErrorController = {
  retry: () => Promise<void>;
  ignore: () => Promise<void>;
  abort: () => Promise<void>;
  abortAll: () => Promise<void>;
};

type OnTaskCompletedController = {
  next: () => Promise<void>;
  abortAll: () => Promise<void>;
};

type LoopProgressCallback = {
  onTaskError: (
    error: Error,
    loopController: OnTaskErrorController,
  ) => Promise<void>;
  onTaskCompleted: (loopController: OnTaskCompletedController) => Promise<void>;
  onLoopCompleted: () => Promise<void>;
};

export {
  IDeque,
  IQueueLoop,
  LoopProgressCallback,
  OnTaskErrorController,
  OnTaskCompletedController,
};
