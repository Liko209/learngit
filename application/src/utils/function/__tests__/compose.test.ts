import { compose } from '../';

describe('Utils:function', () => {
  describe('compose', () => {
    it('composes from right to left', () => {
      const double = (x: number) => x * 2;
      const square = (x: number) => x * x;
      expect(compose(square)(5)).toBe(25);
      expect(
        compose(
          square,
          double,
        )(5),
      ).toBe(100);
      expect(
        compose(
          double,
          square,
          double,
        )(5),
      ).toBe(200);
    });

    it('composes functions from right to left', () => {
      const a = (next: Function) => (x: string) => next(`${x}a`);
      const b = (next: Function) => (x: string) => next(`${x}b`);
      const c = (next: Function) => (x: string) => next(`${x}c`);
      const final = (x: string) => x;

      expect(
        compose(
          a,
          b,
          c,
        )(final)(''),
      ).toBe('abc');
      expect(
        compose(
          b,
          c,
          a,
        )(final)(''),
      ).toBe('bca');
      expect(
        compose(
          c,
          a,
          b,
        )(final)(''),
      ).toBe('cab');
    });

    it('throws at runtime if argument is not a function', () => {
      const square = (x: number) => x * x;
      const add = (x: number, y: number) => x + y;

      expect(() =>
        compose(
          square,
          add,
          false,
        )(1, 2),
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          undefined,
        )(1, 2),
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          true,
        )(1, 2),
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          NaN,
        )(1, 2),
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          '42',
        )(1, 2),
      ).toThrow();
    });

    it('can be seeded with multiple arguments', () => {
      const square = (x: number) => x * x;
      const add = (x: number, y: number) => x + y;
      expect(
        compose(
          square,
          add,
        )(1, 2),
      ).toBe(9);
    });

    it('returns the first given argument if given no functions', () => {
      expect(compose()(1, 2)).toBe(1);
      expect(compose()(3)).toBe(3);
      expect(compose()()).toBe(undefined);
    });

    it('returns the first function if given only one', () => {
      const fn = () => {};

      expect(compose(fn)).toBe(fn);
    });
  });
});
