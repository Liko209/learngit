/*
 * @Author: Paynter Chen
 * @Date: 2019-04-13 19:29:58
 * Copyright © RingCentral. All rights reserved.
 */
export class Task {
  public onExecute: () => Promise<void> = () => Promise.resolve();
  public onError: (error: Error) => Promise<void> = () => Promise.resolve();
  public onAbort: () => Promise<void> = () => Promise.resolve();
  public onIgnore: () => Promise<void> = () => Promise.resolve();
  public onCompleted: () => Promise<void> = () => Promise.resolve();
  public retryCount: number = 0;

  constructor(options?: Partial<Task>) {
    options &&
      Object.keys(options).forEach(key => {
        this[key] = options[key];
      });
  }

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
