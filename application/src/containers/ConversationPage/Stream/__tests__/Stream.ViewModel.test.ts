import { StreamViewModel } from '../Stream.ViewModel';

function setup(obj: any) {
  const vm = new StreamViewModel();
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onReceiveProps()', () => {
    it('should dispose transformHandler when groupId change', () => {
      const _transformHandler = {
        dispose: jest.fn().mockName('vm._transformHandler.dispose'),
      };
      const vm = setup({ _transformHandler });

      vm.onReceiveProps({ groupId: 1 });

      expect(_transformHandler.dispose).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispose()', () => {
    it('should dispose transformHandler', () => {
      const _transformHandler = {
        dispose: jest.fn().mockName('vm._transformHandler.dispose'),
      };
      const vm = setup({ _transformHandler });

      vm.dispose();

      expect(_transformHandler.dispose).toHaveBeenCalled();
    });
  });
});
