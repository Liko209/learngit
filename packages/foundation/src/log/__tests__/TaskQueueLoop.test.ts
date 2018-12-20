import { TaskQueueLoop } from '../TaskQueueLoop';
import { TaskCompletedHandler, TaskErrorHandler } from '../types';
import { Task } from '../task';
describe('TaskQueueLoop', () => {

  describe('sleep()', () => {
    it('should sleep until timeout', async () => {
      const taskQueueLoop = new TaskQueueLoop();
      // taskQueueLoop.addTail();
      taskQueueLoop.sleep(100);
      expect(taskQueueLoop.isAvailable()).toBeFalsy();
      await new Promise((resolve) => {
        setTimeout(resolve, 101);
      });
      expect(taskQueueLoop.isAvailable()).toBeTruthy();
    });

    it('should not superposition sleep time', async () => {
      const taskQueueLoop = new TaskQueueLoop();
      // taskQueueLoop.addTail();
      taskQueueLoop.sleep(100);
      taskQueueLoop.sleep(100);
      expect(taskQueueLoop.isAvailable()).toBeFalsy();
      await new Promise((resolve) => {
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
      const spyLoopCompleted = jest.fn();
      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.abort(),
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
        onLoopCompleted: spyLoopCompleted,
      });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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

  describe('createErrorHandler()', () => {
    it('should abort correctly when throw error: task1=>success, task2=>error, errorHandler.abort, task2.onAbort, task3=>task3.onExecute()', async () => {
      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.abort(),
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
        onLoopCompleted: async () => { },
      });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn())
          .setOnError(async (error) => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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
      // const taskQueueLoop = new TaskQueueLoop();
      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.abortAll(),
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
        onLoopCompleted: async () => { },
      });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn())
          .setOnError(async (error) => {
            expect(error.message).toEqual('testError');
            // await errorHandler.abortAll();
          })
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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
      // const taskQueueLoop = new TaskQueueLoop();

      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.ignore(),
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
        onLoopCompleted: async () => { },
      });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(async () => {
            throw new Error('testError');
          })
          .setOnAbort(jest.fn())
          .setOnError(async (error) => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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
      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => {
          const curTask = taskQueueLoop.getHead();
          if (curTask.retryCount < 3) {
            curTask.retryCount++;
            await handler.retry();
          } else {
            await handler.abort();
          }
        },
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.next(),
        onLoopCompleted: async () => { },
      });
      const mockExecute = jest.fn();
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(async () => {
            mockExecute();
            throw new Error('testError');
          })
          .setOnAbort(jest.fn())
          .setOnError(async (error) => {
            expect(error.message).toEqual('testError');
          })
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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
      const taskQueueLoop = new TaskQueueLoop({
        onTaskError: async (error: Error, handler: TaskErrorHandler) => await handler.abortAll(),
        onTaskCompleted: async (handler: TaskCompletedHandler) => await handler.abortAll(),
        onLoopCompleted: async () => { },
      });
      const tasks = [
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
        new Task()
          .setOnExecute(jest.fn())
          .setOnAbort(jest.fn())
          .setOnError(jest.fn())
          .setOnCompleted(jest.fn())
          .setOnIgnore(jest.fn()),
      ];
      tasks.forEach(task => taskQueueLoop.addTail(task));
      await taskQueueLoop.loop();
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
      const tasks = [
        new Task(),
        new Task(),
      ];
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
});
