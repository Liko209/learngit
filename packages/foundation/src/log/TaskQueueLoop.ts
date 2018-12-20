/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 10:42:12
 * Copyright © RingCentral. All rights reserved.
 */
import { Task } from './task';
import { IDeque, IQueueLoop, LoopController, TaskCompletedHandler, TaskErrorHandler } from './types';
import { MemoryQueue } from './MemoryQueue';

export class TaskQueueLoop implements IQueueLoop, IDeque<Task>{
  static DEFAULT_LOOP_CONTROLLER: LoopController = {
    onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.abort(),
    onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
    onLoopCompleted: async () => { },
  };
  private _loopController: LoopController;
  private _isLooping: boolean;
  private _isSleeping: boolean;
  private _taskQueue: MemoryQueue<Task>;
  private _timeoutId: NodeJS.Timeout;
  constructor(_loopController?: LoopController) {
    this._loopController = _loopController || TaskQueueLoop.DEFAULT_LOOP_CONTROLLER;
    this._taskQueue = new MemoryQueue();
  }

  isAvailable(): boolean {
    return !this._isSleeping;
  }

  sleep(timeout: number): void {
    this._isSleeping = true;
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this._isSleeping = false;
    },                           timeout);
  }

  wake(): void {
    this._isSleeping = false;
    clearTimeout(this._timeoutId);
  }

  async loop() {
    if (this._isLooping || !this.isAvailable()) {
      return;
    }
    this._isLooping = true;
    let task = this.getHead();
    const setTask = (replaceTask: Task) => {
      task = replaceTask;
    };
    const errorHandler: TaskErrorHandler = this.createErrorHandler(setTask);
    const completedHandler: TaskCompletedHandler = this.createCompletedHandler(setTask);

    while (task) {
      try {
        await task.onExecute();
        await this._loopController.onTaskCompleted(completedHandler);
      } catch (error) {
        await task.onError(error);
        await this._loopController.onTaskError(error, errorHandler);
      }
    }
    await this._loopController.onLoopCompleted();
  }

  createErrorHandler(setTask: (task: Task) => void): TaskErrorHandler {
    return {
      retry: async () => {
        setTask(this.getHead());
      },
      ignore: async () => {
        const task = this.peekHead();
        await task.onIgnore();
        setTask(this.getHead());
      },
      abort: async () => {
        const task = this.peekHead();
        await task.onAbort();
        setTask(this.getHead());
      },
      abortAll: async () => {
        let task = this.peekHead();
        while (task) {
          await task.onAbort();
          task = this.peekHead();
        }
        setTask(task);
      },
      sleep: (timeout: number) => {
        this.sleep(timeout);
      },
    };
  }

  createCompletedHandler(setTask: (task: Task) => void): TaskCompletedHandler {
    return {
      next: async () => {
        const task = this.peekHead();
        await task.onCompleted();
        setTask(this.getHead());
      },
      abortAll: async () => {
        let task = this.peekHead();
        await task.onCompleted();
        task = this.peekHead();
        while (task) {
          await task.onAbort();
          task = this.peekHead();
        }
        setTask(task);
      },
      sleep: (timeout: number) => {
        this.sleep(timeout);
      },
    };
  }

  addHead(e: Task): void {
    this._taskQueue.addHead(e);
  }

  peekHead(): Task {
    return this._taskQueue.peekHead();
  }

  getHead(): Task {
    return this._taskQueue.getHead();
  }

  addTail(e: Task): void {
    this._taskQueue.addTail(e);
  }

  peekTail(): Task {
    return this._taskQueue.peekTail();
  }

  getTail(): Task {
    return this._taskQueue.getTail();
  }

  peekAll(): Task[] {
    return this._taskQueue.peekAll();
  }

  size(): number {
    return this._taskQueue.size();
  }

}
