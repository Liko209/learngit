import { Jupiter, container } from '../Jupiter';

class MyService {
  add(a: number, b: number) {
    return a + b;
  }
  dispose() {
    return 'dispose';
  }
}

describe('Jupiter', () => {
  afterEach(() => {
    container.unbindAll();
  });

  describe('bindProvide()', () => {
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

  describe('unRegisterModule()', () => {
    it('should be able unRegister module', async () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(container.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);

      const afterUnregisterFun = jest.fn();
      await jupiter.unRegisterModule(MY_SERVICE, afterUnregisterFun);
      expect(afterUnregisterFun).toBeCalled();
      expect(container.isBound(MY_SERVICE)).toBeFalsy();
    });
  });
});
