import { itForSdk } from './SdkItFramework.test';

function add(x: number, y: number) {
  return x + y;
}

itForSdk('SimpleIt example', {
  beforeEach: () => {
    console.log('hook before each');
  },
  afterEach: () => {
    console.log('hook after each');
  },
})(ctx => {
  console.log('inject context:', ctx);
  describe('testAdd()', () => {
    it('should add xxx1', () => {
      console.log('----should add xxx1---');
      expect(add(1, 2)).toEqual(3);
    });
    it('should add xxx2', () => {
      console.log('----should add xxx2---');
      expect(add(1, 2)).toEqual(3);
    });
  });
  describe('testAdd2()', () => {
    it('should add xxx3', () => {
      console.log('----should add xxx3---');
      expect(add(1, 2)).toEqual(3);
    });
  });
});
