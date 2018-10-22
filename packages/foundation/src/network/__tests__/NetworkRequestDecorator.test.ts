import NetworkRequestDecorator from '../NetworkRequestDecorator';
import { getFakeDecoration, getFakeExecutor } from './utils';

const decorator = new NetworkRequestDecorator(getFakeDecoration()).setExecutor(
  getFakeExecutor()
);
describe('NetworkRequestDecorator', () => {
  describe('cancel', () => {
    it('should cancel executor', () => {
      const spy = jest.spyOn(decorator.executor, 'cancel');
      decorator.cancel();
      expect(spy).toBeCalled();
    });
  });

  describe('isPause', () => {
    it('should return executor isPause', () => {
      const spy = jest.spyOn(decorator.executor, 'isPause');
      decorator.isPause();
      expect(spy).toBeCalled();
    });
  });

  describe('getRequest', () => {
    it('should return executor request', () => {
      expect(decorator.getRequest()).toEqual(decorator.executor.getRequest());
    });
  });

  describe('execute', () => {
    it('should decorate then execute', () => {
      const spy = jest.spyOn(decorator.decoration, 'decorate');
      const spy2 = jest.spyOn(decorator.executor, 'execute');
      decorator.execute();
      expect(spy).toBeCalled();
      expect(spy2).toBeCalled();
    });
  });
});
