import { Jupiter, container } from '../Jupiter';

describe('Jupiter', () => {
  afterEach(() => {
    container.unbindAll();
  });

  describe('bindProvide()', () => {
    class MyService {
      add(a: number, b: number) {
        return a + b;
      }
    }

    it('should be able to use string as key', () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(container.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);
    });

    it('should be able to use class as key', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide(MyService);
      const myService = container.get<MyService>(MyService);
      expect(myService).toBeInstanceOf(MyService);
    });
  });

  describe('bootstrapModule()', () => {
    const bootstrapFun = jest.fn();
    class MyService {
      bootstrap() {
        bootstrapFun();
      }
    }
    it('should be able bootstrap module', async () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(jupiter.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);

      const afterBootstrap = jest.fn();
      await jupiter.bootstrapModule(MY_SERVICE, afterBootstrap);
      expect(bootstrapFun).toBeCalled();
      expect(afterBootstrap).toBeCalled();
      expect(container.isBound(MY_SERVICE)).toBeTruthy();
    });
  });

  describe('unRegisterModule()', () => {
    const disposeFun = jest.fn();
    class MyService {
      dispose() {
        disposeFun();
      }
    }
    it('should be able unRegister module', async () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(jupiter.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);

      const afterUnregisterFun = jest.fn();
      await jupiter.unRegisterModule(MY_SERVICE, afterUnregisterFun);
      expect(disposeFun).toBeCalled();
      expect(afterUnregisterFun).toBeCalled();
      expect(container.isBound(MY_SERVICE)).toBeFalsy();
    });
  });
});
