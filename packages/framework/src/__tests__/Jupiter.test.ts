import { Jupiter, container } from '../Jupiter';

class MyService {
  add(a: number, b: number) {
    return a + b;
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
      jupiter.bindProvide(MyService, MY_SERVICE);
      expect(container.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);
    });

    it('should be able to use class as key', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide(MyService);
      const myService = container.get<MyService>(MyService);
      expect(myService).toBeInstanceOf(MyService);
    });
  });
});
