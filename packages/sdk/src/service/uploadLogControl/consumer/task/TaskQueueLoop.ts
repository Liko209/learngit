/*
 * @Author: Paynter Chen
 * @Date: 2018-12-20 10:42:12
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IDeque,
  IQueueLoop,
  OnTaskCompletedController,
  OnTaskErrorController,
} from './types';
import { Task } from './Task';
import { MemoryQueue } from './MemoryQueue';

export class TaskQueueLoop implements IQueueLoop, IDeque<Task> {
  private _isLooping: boolean;
  private _isSleeping: boolean;
  private _taskQueue: MemoryQueue<Task> = new MemoryQueue();
  private _timeoutId: NodeJS.Timeout;

  onTaskError = async (
    task: Task,
    error: Error,
    loopController: OnTaskErrorController,
  ) => await loopController.abort()

  onTaskCompleted = async (
    task: Task,
    loopController: OnTaskCompletedController,
  ) => await loopController.next()

  onLoopCompleted = async () => {};
  name: string;

  constructor(options?: Partial<TaskQueueLoop>) {
    options &&
      Object.keys(options).forEach(key => {
        this[key] = options[key];
      });
  }

  setOnTaskError(
    callback: (
      task: Task,
      error: Error,
      OnTaskErrorController: OnTaskErrorController,
    ) => Promise<void>,
  ): TaskQueueLoop {
    this.onTaskError = callback;
    return this;
  }

  setOnTaskCompleted(
    callback: (
      task: Task,
      loopController: OnTaskCompletedController,
    ) => Promise<void>,
  ): TaskQueueLoop {
    this.onTaskCompleted = callback;
    return this;
  }

  setOnLoopCompleted(callback: () => Promise<void>): TaskQueueLoop {
    this.onLoopCompleted = callback;
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
        await this.onTaskCompleted(task, completedController);
      } catch (error) {
        await task.onError(error);
        await this.onTaskError(task, error, errorController);
      }
      if (!task) {
        task = this.peekHead();
      }
    }
    this._isLooping = false;
    await this.onLoopCompleted();
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
        const tasks = this.peekAll();
        tasks.forEach(async task => {
          await task.onAbort().catch();
        });
        setTask(this.getHead());
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

  async abortAll(): Promise<void> {
    let currentTask;
    if (this._isLooping) {
      currentTask = this._taskQueue.peekHead();
    }
    const tasks = this._taskQueue.peekAll();
    currentTask && this._taskQueue.addTail(currentTask);
    tasks.forEach(async (task: Task) => {
      await task.onAbort().catch();
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
