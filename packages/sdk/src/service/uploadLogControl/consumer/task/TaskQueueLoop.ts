/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 10:42:12
 * Copyright © RingCentral. All rights reserved.
 */
import {
  Task,
  IDeque,
  IQueueLoop,
  OnTaskCompletedController,
  OnTaskErrorController,
} from './types';
import { MemoryQueue } from './MemoryQueue';

export class TaskQueueLoop implements IQueueLoop, IDeque<Task> {
  private _isLooping: boolean;
  private _isSleeping: boolean;
  private _taskQueue: MemoryQueue<Task>;
  private _timeoutId: NodeJS.Timeout;
  private _onTaskError: (
    task: Task,
    error: Error,
    handler: OnTaskErrorController,
  ) => Promise<void>;
  private _onTaskCompleted: (
    task: Task,
    loopController: OnTaskCompletedController,
  ) => Promise<void>;
  private _onLoopCompleted: () => Promise<void>;

  constructor() {
    this._taskQueue = new MemoryQueue();
    this.setOnTaskError(
      async (task: Task, error: Error, loopController: OnTaskErrorController) =>
        await loopController.abort(),
    );
    this.setOnTaskCompleted(
      async (task: Task, loopController: OnTaskCompletedController) =>
        await loopController.next(),
    );
    this.setOnLoopCompleted(async () => {});
  }

  setOnTaskError(
    callback: (
      task: Task,
      error: Error,
      OnTaskErrorController: OnTaskErrorController,
    ) => Promise<void>,
  ): TaskQueueLoop {
    this._onTaskError = callback;
    return this;
  }

  setOnTaskCompleted(
    callback: (
      task: Task,
      loopController: OnTaskCompletedController,
    ) => Promise<void>,
  ): TaskQueueLoop {
    this._onTaskCompleted = callback;
    return this;
  }

  setOnLoopCompleted(callback: () => Promise<void>): TaskQueueLoop {
    this._onLoopCompleted = callback;
    return this;
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
    if (this._isLooping || this._isSleeping) {
      return;
    }
    this._isLooping = true;
    let task = this.getHead();
    const setTask = (replaceTask: Task) => {
      task = replaceTask;
    };
    const errorController: OnTaskErrorController = this.createErrorController(
      setTask,
    );
    const completedController: OnTaskCompletedController = this.createCompletedHandler(
      setTask,
    );

    while (task) {
      try {
        await task.onExecute();
        await this._onTaskCompleted(task, completedController);
      } catch (error) {
        await task.onError(error);
        await this._onTaskError(task, error, errorController);
      }
    }
    this._isLooping = false;
    await this._onLoopCompleted();
  }

  createErrorController(setTask: (task: Task) => void): OnTaskErrorController {
    return {
      retry: async () => {
        setTask(this.getHead());
      },
      ignore: async () => {
        const task = this.peekHead();
        task && (await task.onIgnore().catch());
        setTask(this.getHead());
      },
      abort: async () => {
        const task = this.peekHead();
        task && (await task.onAbort().catch());
        setTask(this.getHead());
      },
      abortAll: async () => {
        let task = this.peekHead();
        while (task) {
          await task.onAbort().catch();
          task = this.peekHead();
        }
        setTask(task);
      },
    };
  }

  createCompletedHandler(
    setTask: (task: Task) => void,
  ): OnTaskCompletedController {
    return {
      next: async () => {
        const task = this.peekHead();
        task && (await task.onCompleted().catch());
        setTask(this.getHead());
      },
      abortAll: async () => {
        let task = this.peekHead();
        task && (await task.onCompleted().catch());
        task = this.peekHead();
        while (task) {
          await task.onAbort().catch();
          task = this.peekHead();
        }
        setTask(task);
      },
    };
  }

  abortAll(): void {
    const tasks = this._taskQueue.peekAll();
    tasks.forEach((task: Task) => {
      task.onAbort().catch();
    });
  }

  addHead(e: Task): void {
    this._taskQueue.addHead(e);
    this.loop();
  }

  peekHead(): Task {
    return this._taskQueue.peekHead();
  }

  getHead(): Task {
    return this._taskQueue.getHead();
  }

  addTail(e: Task): void {
    this._taskQueue.addTail(e);
    this.loop();
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
