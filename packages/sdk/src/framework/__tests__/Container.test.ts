import { Container } from '../Container';

class AService {}
class BService {
  aService: AService;
  constructor(aService: AService) {
    this.aService = aService;
  }
}

describe('Container', () => {
  describe('register()', () => {
    it('should register using string as name', () => {
      const container = new Container();
      container.register({ name: 'AService', value: AService });
      const aService = container.get<AService>('AService');
      expect(aService).toBeInstanceOf(AService);
    });

    it('should register using Class as name', () => {
      const container = new Container();
      container.register({ name: AService, value: AService });
      const aService = container.get(AService);
      expect(aService).toBeInstanceOf(AService);
    });

    it('should register using Class', () => {
      const container = new Container();
      container.register(AService);
      const aService = container.get(AService);
      expect(aService).toBeInstanceOf(AService);
    });

    it('should register as a singleton', () => {
      const container = new Container();
      container.register({ name: AService, value: AService, singleton: true });
      const aService1 = container.get(AService);
      const aService2 = container.get(AService);
      expect(aService1).toBe(aService2);
    });

    it('should register a Function', () => {
      const container = new Container();
      function foo() {}
      container.register({ name: 'foo', type: 'function', value: foo });
      expect(container.get('foo')).toBe(foo);
    });

    it('should automatically inject dependency', () => {
      const container = new Container();
      container.register({ name: AService, value: AService });
      container.register({ name: BService, value: BService, injects: [AService] });
      const bService = container.get(BService);
      expect(bService.aService).toBeInstanceOf(AService);
    });

    it('should register all classes as singleton', () => {
      const container = new Container({ singleton: true });
      container.register({ name: AService, value: AService });
      container.register({ name: BService, value: BService });

      const aService1 = container.get(AService);
      const aService2 = container.get(AService);
      expect(aService1).toBe(aService2);

      const bService1 = container.get(BService);
      const bService2 = container.get(BService);
      expect(bService1).toBe(bService2);
    });
  });

  describe('get()', () => {
    it('should throw error when trying to get something not registered', () => {
      const container = new Container();
      expect(() => container.get(AService)).toThrow();
    });
  });

  describe('registerAll()', () => {
    it('should register all', () => {
      const container = new Container();
      container.registerAll([
        { name: AService, value: AService },
        { name: BService, value: BService, injects: [AService] }
      ]);
      expect(container.get(AService)).toBeInstanceOf(AService);
      expect(container.get(BService)).toBeInstanceOf(BService);
    });
  });
});
