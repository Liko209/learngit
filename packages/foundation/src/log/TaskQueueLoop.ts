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
  private loopController: LoopController;
  private isLooping: boolean;
  private isSleeping: boolean;
  private taskQueue: MemoryQueue<Task>;
  private timeoutHandler: any;
  constructor(loopController?: LoopController) {
    this.loopController = loopController || TaskQueueLoop.DEFAULT_LOOP_CONTROLLER;
    this.taskQueue = new MemoryQueue();
  }

  isAvailable(): boolean {
    return !this.isSleeping;
  }

  sleep(timeout: number): void {
    this.isSleeping = true;
    clearTimeout(this.timeoutHandler);
    this.timeoutHandler = setTimeout(() => {
      this.isSleeping = false;
    },                               timeout);
  }

  wake(): void {
    this.isSleeping = false;
    clearTimeout(this.timeoutHandler);
  }

  async loop() {
    if (this.isLooping || !this.isAvailable()) {
      return;
    }
    this.isLooping = true;
    let task = this.getHead();
    const setTask = (replaceTask: Task) => {
      task = replaceTask;
    };
    const errorHandler: TaskErrorHandler = this.createErrorHandler(setTask);
    const completedHandler: TaskCompletedHandler = this.createCompletedHandler(setTask);

    while (task) {
      try {
        await task.onExecute();
        await this.loopController.onTaskCompleted(completedHandler);
      } catch (error) {
        await task.onError(error);
        await this.loopController.onTaskError(error, errorHandler);
      }
    }
    await this.loopController.onLoopCompleted();
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
    this.taskQueue.addHead(e);
  }

  peekHead(): Task {
    return this.taskQueue.peekHead();
  }

  getHead(): Task {
    return this.taskQueue.getHead();
  }

  addTail(e: Task): void {
    this.taskQueue.addTail(e);
  }

  peekTail(): Task {
    return this.taskQueue.peekTail();
  }

  getTail(): Task {
    return this.taskQueue.getTail();
  }

  peekAll(): Task[] {
    return this.taskQueue.peekAll();
  }

  size(): number {
    return this.taskQueue.size();
  }

}
