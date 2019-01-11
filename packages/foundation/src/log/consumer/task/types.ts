/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 11:19:43
 * Copyright © RingCentral. All rights reserved.
 */
class Task {
  public onExecute: () => Promise<void> = () => Promise.resolve();
  public onError: (error: Error) => Promise<void> = () => Promise.resolve();
  public onAbort: () => Promise<void> = () => Promise.resolve();
  public onIgnore: () => Promise<void> = () => Promise.resolve();
  public onCompleted: () => Promise<void> = () => Promise.resolve();
  public retryCount: number = 0;

  setOnExecute(onExecute: () => Promise<void>): Task {
    this.onExecute = onExecute;
    return this;
  }

  setOnError(onError: (error: Error) => Promise<void>): Task {
    this.onError = onError;
    return this;
  }

  setOnAbort(onAbort: () => Promise<void>): Task {
    this.onAbort = onAbort;
    return this;
  }

  setOnIgnore(onIgnore: () => Promise<void>): Task {
    this.onIgnore = onIgnore;
    return this;
  }

  setOnCompleted(onCompleted: () => Promise<void>): Task {
    this.onCompleted = onCompleted;
    return this;
  }
}

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
  retry: () => Promise<void>,
  ignore: () => Promise<void>,
  abort: () => Promise<void>,
  abortAll: () => Promise<void>,
};

type OnTaskCompletedController = {
  next: () => Promise<void>,
  abortAll: () => Promise<void>,
};

type LoopProgressCallback = {
  onTaskError: (error: Error, loopController: OnTaskErrorController) => Promise<void>,
  onTaskCompleted: (loopController: OnTaskCompletedController) => Promise<void>,
  onLoopCompleted: () => Promise<void>,
};

export {
  Task,
  IDeque,
  IQueueLoop,
  LoopProgressCallback,
  OnTaskErrorController,
  OnTaskCompletedController,
};
