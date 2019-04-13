import { TaskQueueLoop } from '../TaskQueueLoop';
import { OnTaskCompletedController, OnTaskErrorController } from '../types';
import { Task } from '../Task';
import { FunctionPropertyNames } from '../../../../../../types';

const createCallbackObserver = (): [Function, Promise<any>] => {
  let callback = () => {};
  let called = false;
  const observer = new Promise(resolve => {
    callback = async () => {
      !called && (await resolve());
      called = true;
    };
  });
  return [callback, observer];
};

describe('TaskQueueLoop', () => {
  const spyOnTarget = <T>(target: T) => {
    for (const key in target) {
      if (
        target.hasOwnProperty(key) &&
        Object.prototype.toString.call(target[key]) === '[object Function]'
      ) {
        jest.spyOn(target, (key as any) as FunctionPropertyNames<T>);
      }
    }
    return target;
  };

  const createTaskQueueLoop = (options?: Partial<TaskQueueLoop>) => {
    return spyOnTarget(new TaskQueueLoop(options));
  };
  const createTask = (options?: Partial<Task>) => {
    return spyOnTarget(new Task(options));
  };

  describe('sleep()', () => {
    it('should sleep until timeout', async () => {
      const taskQueueLoop = new TaskQueueLoop();
      taskQueueLoop.sleep(100);
      expect(taskQueueLoop.isAvailable()).toBeFalsy();
      await new Promise(resolve => {
        setTimeout(resolve, 101);
      });
      expect(taskQueueLoop.isAvailable()).toBeTruthy();
    });

    it('should not superposition sleep time', async () => {
      const taskQueueLoop = new TaskQueueLoop();
      taskQueueLoop.sleep(100);
      taskQueueLoop.sleep(100);
      expect(taskQueueLoop.isAvailable()).toBeFalsy();
      await new Promise(resolve => {
        setTimeout(resolve, 101);
      });
      expect(taskQueueLoop.isAvailable()).toBeTruthy();
    });
  });

  describe('wake()', () => {
    it('should wake from sleep', async () => {
      const taskQueueLoop = new TaskQueueLoop();
      taskQueueLoop.sleep(100);
      taskQueueLoop.wake();
      expect(taskQueueLoop.isAvailable()).toBeTruthy();
    });
  });

  describe('loop()', () => {
    it('should loop normal', async () => {
      const [callback, observer] = createCallbackObserver();
      const spyLoopCompleted = jest.fn().mockResolvedValue('');
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => await loopController.abort(),
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.next(),
        )
        .setOnLoopCompleted(async () => {
          spyLoopCompleted();
          callback();
        });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(tasks[1].onExecute).toBeCalledTimes(1);
      expect(tasks[1].onAbort).toBeCalledTimes(0);
      expect(tasks[1].onError).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(0);

      expect(tasks[2].onExecute).toBeCalledTimes(1);
      expect(tasks[2].onAbort).toBeCalledTimes(0);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);

      expect(spyLoopCompleted).toBeCalledTimes(1);
    });
  });

  describe('loopController', () => {
    it('should retry task N times then abort task', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = createTaskQueueLoop({
        onTaskError: async (
          task: Task,
          error: Error,
          loopController: OnTaskErrorController,
        ) => {
          // retry tree times, then abort
          if (task.retryCount < 3) {
            task.retryCount += 1;
            await loopController.retry();
          } else {
            await loopController.abort();
          }
        },
        onTaskCompleted: async (task, loopController) => loopController.next(),
        onLoopCompleted: async () => callback(),
      });
      const [task1, task2] = [
        createTask({
          onExecute: async () => {
            throw '';
          },
          onError: async () => {},
        }),
        createTask(),
      ];
      taskQueueLoop.addTail(task1);
      taskQueueLoop.addTail(task2);
      await observer;
      expect(task1.onExecute).toBeCalledTimes(1 + 3);
      expect(task1.onError).toBeCalledTimes(1 + 3);
      expect(task1.retryCount).toEqual(3);
      expect(task1.onAbort).toBeCalledTimes(1);
      expect(task2.onExecute).toBeCalledTimes(1);
    });

    it('should abort all task when TaskQueueLoop.onTaskError call loopController.abortAll()', async () => {
      const [callback, observer] = createCallbackObserver();
      const extraTask = createTask();
      const taskQueueLoop = createTaskQueueLoop({
        onTaskError: async (
          task: Task,
          error: Error,
          loopController: OnTaskErrorController,
        ) => {
          await loopController.abortAll();
          // abortAll is async, abortAll only abort task in that moment
          taskQueueLoop.addTail(extraTask);
        },
        onTaskCompleted: async (task, loopController) => loopController.next(),
        onLoopCompleted: async () => callback(),
      });

      const [task1, task2] = [
        createTask({
          onExecute: async () => {
            throw '';
          },
          onError: async () => {},
        }),
        createTask(),
      ];
      taskQueueLoop.addTail(task1);
      taskQueueLoop.addTail(task2);
      await observer;
      expect(task1.onError).toBeCalled();
      expect(task1.onAbort).toBeCalled();
      expect(task2.onAbort).toBeCalled();
      expect(extraTask.onExecute).toBeCalled();
      expect(extraTask.onAbort).not.toBeCalled();
      expect(taskQueueLoop.isAvailable()).toBeTruthy();
      expect(taskQueueLoop.size()).toEqual(0);
    });

    it('should ignore work', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = createTaskQueueLoop({
        onTaskError: async (
          task: Task,
          error: Error,
          loopController: OnTaskErrorController,
        ) => await loopController.ignore(),
        onTaskCompleted: async (task, loopController) => loopController.next(),
        onLoopCompleted: async () => callback(),
      });

      const [task1, task2] = [
        createTask({
          onExecute: async () => {
            throw '';
          },
          onError: async () => {},
        }),
        createTask(),
      ];
      taskQueueLoop.addTail(task1);
      taskQueueLoop.addTail(task2);
      await observer;
      expect(task1.onError).toBeCalled();
      expect(task1.onAbort).not.toBeCalled();
      expect(task2.onExecute).toBeCalled();
    });
  });

  describe('createErrorHandler()', () => {
    it('should abort correctly when throw error: task1=>success, task2=>error, errorHandler.abort, task2.onAbort, task3=>task3.onExecute()', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => await loopController.abort(),
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.next(),
        )
        .setOnLoopCompleted(async () => {
          callback();
        });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(async error => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onCompleted).toBeCalledTimes(1);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(tasks[1].onAbort).toBeCalledTimes(1);
      expect(tasks[1].onCompleted).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(0);

      expect(tasks[2].onExecute).toBeCalledTimes(1);
      expect(tasks[2].onAbort).toBeCalledTimes(0);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onCompleted).toBeCalledTimes(1);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);
    });

    it('should abortAll correctly when throw error: task1=>success, task2=>error, errorHandler.abortAll, task2.onAbort, task3=>task3.onAbort()', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => await loopController.abortAll(),
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.next(),
        )
        .setOnLoopCompleted(async () => {
          callback();
        });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(async error => {
            expect(error.message).toEqual('testError');
            // await errorHandler.abortAll();
          })
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onCompleted).toBeCalledTimes(1);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(tasks[1].onAbort).toBeCalledTimes(1);
      expect(tasks[1].onCompleted).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(0);

      expect(tasks[2].onExecute).toBeCalledTimes(0);
      expect(tasks[2].onAbort).toBeCalledTimes(1);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onCompleted).toBeCalledTimes(0);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);
    });

    it('should ignore correctly when throw error: task1=>success, task2=>error, errorHandler.ignore, task2.onIgnore, task3=>task3.onExecute()', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => await loopController.ignore(),
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.next(),
        )
        .setOnLoopCompleted(async () => {
          callback();
        });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(async error => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onCompleted).toBeCalledTimes(1);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(tasks[1].onAbort).toBeCalledTimes(0);
      expect(tasks[1].onCompleted).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(1);

      expect(tasks[2].onExecute).toBeCalledTimes(1);
      expect(tasks[2].onAbort).toBeCalledTimes(0);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onCompleted).toBeCalledTimes(1);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);
    });

    it('should retry N times correctly when throw error', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => {
            const curTask = taskQueueLoop.getHead();
            if (curTask.retryCount < 3) {
              curTask.retryCount++;
              await loopController.retry();
            } else {
              await loopController.abort();
            }
          },
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.next(),
        )
        .setOnLoopCompleted(async () => {
          callback();
        });
      const mockExecute = jest.fn().mockResolvedValue('');
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(async () => {
            mockExecute();
            throw new Error('testError');
          })
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(async error => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onCompleted).toBeCalledTimes(1);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(mockExecute).toBeCalledTimes(4);
      expect(tasks[1].onAbort).toBeCalledTimes(1);
      expect(tasks[1].onCompleted).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(0);

      expect(tasks[2].onExecute).toBeCalledTimes(1);
      expect(tasks[2].onAbort).toBeCalledTimes(0);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onCompleted).toBeCalledTimes(1);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);
    });
  });

  describe('createCompletedHandler()', () => {
    it('should abortAll task', async () => {
      const [callback, observer] = createCallbackObserver();
      const taskQueueLoop = new TaskQueueLoop()
        .setOnTaskError(
          async (
            task: Task,
            error: Error,
            loopController: OnTaskErrorController,
          ) => await loopController.abortAll(),
        )
        .setOnTaskCompleted(
          async (task: Task, loopController: OnTaskCompletedController) =>
            await loopController.abortAll(),
        )
        .setOnLoopCompleted(async () => {
          callback();
        });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
        new Task()
          .setOnExecute(jest.fn().mockResolvedValue(''))
          .setOnAbort(jest.fn().mockResolvedValue(''))
          .setOnError(jest.fn().mockResolvedValue(''))
          .setOnCompleted(jest.fn().mockResolvedValue(''))
          .setOnIgnore(jest.fn().mockResolvedValue('')),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await observer;
      expect(tasks[0].onExecute).toBeCalledTimes(1);
      expect(tasks[0].onAbort).toBeCalledTimes(0);
      expect(tasks[0].onError).toBeCalledTimes(0);
      expect(tasks[0].onCompleted).toBeCalledTimes(1);
      expect(tasks[0].onIgnore).toBeCalledTimes(0);

      expect(tasks[1].onExecute).toBeCalledTimes(0);
      expect(tasks[1].onAbort).toBeCalledTimes(1);
      expect(tasks[1].onError).toBeCalledTimes(0);
      expect(tasks[1].onCompleted).toBeCalledTimes(0);
      expect(tasks[1].onIgnore).toBeCalledTimes(0);

      expect(tasks[2].onExecute).toBeCalledTimes(0);
      expect(tasks[2].onAbort).toBeCalledTimes(1);
      expect(tasks[2].onError).toBeCalledTimes(0);
      expect(tasks[2].onCompleted).toBeCalledTimes(0);
      expect(tasks[2].onIgnore).toBeCalledTimes(0);
    });
  });

  describe('addHead()', () => {
    it('should work correctly with IDque api', () => {
      const taskQueueLoop = new TaskQueueLoop();
      const tasks = [new Task(), new Task()];
      taskQueueLoop.addHead(tasks[0]);
      expect(taskQueueLoop.getHead()).toEqual(tasks[0]);
      taskQueueLoop.addTail(tasks[1]);
      expect(taskQueueLoop.getTail()).toEqual(tasks[1]);
      expect(taskQueueLoop.size()).toEqual(2);
      expect(taskQueueLoop.peekAll()).toEqual([tasks[0], tasks[1]]);
      taskQueueLoop.addHead(tasks[0]);
      expect(taskQueueLoop.peekHead()).toEqual(tasks[0]);
      taskQueueLoop.addTail(tasks[0]);
      expect(taskQueueLoop.peekTail()).toEqual(tasks[0]);
    });
  });

  describe('abortAll()', () => {
    it('should abort all task except running task when call taskQueue.abortAll()', async () => {
      const [callback, observer] = createCallbackObserver();
      const extraTask = createTask();
      const taskQueueLoop = createTaskQueueLoop({
        onTaskError: async (
          task: Task,
          error: Error,
          loopController: OnTaskErrorController,
        ) => await loopController.abort(),
        onTaskCompleted: async (task, loopController) => loopController.next(),
        onLoopCompleted: async () => callback(),
      });

      const [task1, task2] = [
        createTask(),
        createTask({
          onAbort: async () => {
            taskQueueLoop.addTail(extraTask);
          },
        }),
      ];
      taskQueueLoop.addTail(task1);
      taskQueueLoop.addTail(task2);
      taskQueueLoop.abortAll();
      await observer;
      expect(task1.onAbort).not.toBeCalled();
      expect(task1.onCompleted).toBeCalled();
      expect(task2.onAbort).toBeCalled();
      expect(extraTask.onExecute).toBeCalled();
      expect(extraTask.onAbort).not.toBeCalled();
    });
  });
});
