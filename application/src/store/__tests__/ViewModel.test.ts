import { StoreViewModel } from '../ViewModel';
import { computed, spy, isObservable } from 'mobx';

type MyProps = {
  foo: string;
  arr: number[];
};

class MyViewModel extends StoreViewModel<MyProps> {
  @computed
  get computedFoo(): string {
    return `computed ${this.props.foo}`;
  }
}

describe('StoreViewModel', () => {
  describe('props', () => {
    it('props should be observable', () => {
      const vm = new MyViewModel();
      expect(isObservable(vm.props)).toBeTruthy();
    });
  });

  describe('getDerivedProps()', () => {
    it('should update props', (done: Function) => {
      const vm = new MyViewModel();
      expect.assertions(2);
      spy((event: any) => {
        if (event.type === 'add') {
          expect(event).toHaveProperty('key', 'foo');
          expect(event).toHaveProperty('newValue', 'bar');
          done();
        }
      });
      vm.getDerivedProps({ foo: 'bar' });
    });
  });
});
