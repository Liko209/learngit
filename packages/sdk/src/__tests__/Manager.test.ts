/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:39
 * Copyright © RingCentral. All rights reserved.
 */
import Manager from '../Manager';

class Base {}
class Test extends Base {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}

describe('Manager', () => {
  const manager = new Manager<Base>();
  beforeEach(() => {
    manager.destroy();
  });

  describe('get()', () => {
    it('should create a instance of Sub', () => {
      expect(manager.get(Test)).toBeInstanceOf(Test);
      expect(manager.size).toBe(1);
    });

    it('should always return same instance', () => {
      expect(manager.get(Test)).toBe(manager.get(Test));
      expect(manager.size).toBe(1);
    });

    it('should create a instance with given arguments', () => {
      const instance = manager.get(Test, 'xxx');
      expect(instance.name).toBe('xxx');
    });
  });
});
