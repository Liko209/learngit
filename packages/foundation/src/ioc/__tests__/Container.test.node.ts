import Container from '../Container';

class AService {}
class BService {
  aService: AService;
  constructor(aService: AService) {
    this.aService = aService;
  }
}

const AsyncAService = () => Promise.resolve({ default: AService });
const AsyncBService = () => Promise.resolve({ default: BService });

describe('Container', () => {
  describe('registerClass()', () => {
    it('should register using string as name', () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: AService });
      const aService = container.get<AService>(AService.name);
      expect(aService).toBeInstanceOf(AService);
    });

    it('should register using Class as name', () => {
      const container = new Container();
      container.registerClass({ name: AService, value: AService });
      const aService = container.get(AService);
      expect(aService).toBeInstanceOf(AService);
    });

    it('should register as a singleton', () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: AService, singleton: true });
      const aService1 = container.get(AService.name);
      const aService2 = container.get(AService.name);
      expect(aService1).toBe(aService2);
    });

    it('should automatically inject dependency', () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: AService });
      container.registerClass({ name: BService.name, value: BService, injects: [AService.name] });
      const bService = container.get<BService>(BService.name);
      expect(bService.aService).toBeInstanceOf(AService);
    });

    it('should register all classes as singleton', () => {
      const container = new Container({ singleton: true });
      container.registerClass({ name: AService.name, value: AService });
      container.registerClass({ name: BService.name, value: BService });

      const aService1 = container.get(AService.name);
      const aService2 = container.get(AService.name);
      expect(aService1).toBe(aService2);

      const bService1 = container.get(BService.name);
      const bService2 = container.get(BService.name);
      expect(bService1).toBe(bService2);
    });
  });

  describe('registerAsyncClass()', () => {
    it('should instantiate async class ', async () => {
      const container = new Container();
      container.registerAsyncClass({ name: AService.name, value: AsyncAService });

      expect(await container.asyncGet(AService.name)).toBeInstanceOf(AService);
    });

    it('should register as a singleton', async () => {
      const container = new Container();
      container.registerAsyncClass({ name: AService.name, value: AsyncAService, singleton: true });
      const aService1 = await container.asyncGet(AService.name);
      const aService2 = await container.asyncGet(AService.name);
      expect(aService1).toBe(aService2);
    });

    it('should throw error when trying to use get() to get a async Class', () => {
      const container = new Container();
      container.registerAsyncClass({ name: AService.name, value: AsyncAService });
      expect(() => container.get(AService.name)).toThrow();
    });

    it('should automatically inject dependency', async () => {
      const container = new Container();
      container.registerAsyncClass({
        name: AService.name,
        value: AsyncAService,
      });
      container.registerAsyncClass({
        name: BService.name,
        value: AsyncBService, injects: [AService.name],
      });
      const bService = await container.asyncGet<BService>(BService.name);
      expect(bService.aService).toBeInstanceOf(AService);
    });
  });

  describe('registerConstantValue()', () => {
    it('should register a constant value', () => {
      const container = new Container();

      const myConstant = 'constant';
      container.registerConstantValue({
        name: 'my-constant',
        value: myConstant,
      });

      expect(container.get('my-constant')).toBe(myConstant);
    });
  });

  describe('registerProvider()', () => {
    it('should register a provider', async () => {
      const container = new Container();
      class Foo {
        public name: string;
        constructor(name) {
          this.name = name;
        }
      }

      container.registerProvider({
        name: 'fooProvider',
        value: () => {
          return async (name) => {
            return new Foo(name);
          };
        },
      });

      const fooProvider = container.get<Function>('fooProvider');
      const foo = await fooProvider('Foo');
      expect(foo).toBeInstanceOf(Foo);
    });
  });

  describe('isAsync()', () => {
    it('should be false when register as normal class', () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: AService });
      expect(container.isAsync(AService.name)).toBeFalsy();
    });

    it('should be true when register as async class', () => {
      const container = new Container();
      container.registerAsyncClass({ name: BService.name, value: AsyncBService });
      expect(container.isAsync(BService.name)).toBeTruthy();
    });
  });

  describe('get()', () => {
    it('should throw error when trying to get something not registered', () => {
      const container = new Container();
      expect(() => container.get(AService)).toThrow();
    });

    it('should throw error when register not correct', () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: null });
      expect(() => container.get(AService.name)).toThrow();
    });
  });

  describe('asyncGet()', () => {
    it('should be able to get sync', async () => {
      const container = new Container();
      container.registerClass({ name: AService.name, value: AService });
      expect(await container.asyncGet(AService.name)).toBeInstanceOf(AService);
    });
  });
});
