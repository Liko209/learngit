import { ComponentType } from 'react';
import { withLoadingMore, WithLoadingMoreProps } from 'ui-components';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { IViewModel } from '@/base/IViewModel';
import { createFunctionWrapDecorator } from './utils';

interface ILoadingMoreViewModel extends IViewModel, WithLoadingMoreProps {}

class LoadingMorePlugin extends AbstractPlugin {
  afterInstall(): void {
    this.extendViewModel({
      loadingTop: false,
      loadingBottom: false,
    });
  }

  wrapView(View: ComponentType<any>) {
    return withLoadingMore(View);
  }

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
  }
}

const loadingTop = createFunctionWrapDecorator({
  before(vm: ILoadingMoreViewModel) {
    vm.loadingTop = true;
  },
  after(vm: ILoadingMoreViewModel) {
    vm.loadingTop = false;
  },
});

const loadingBottom = createFunctionWrapDecorator({
  before(vm: ILoadingMoreViewModel) {
    vm.loadingBottom = true;
  },
  after(vm: ILoadingMoreViewModel) {
    vm.loadingBottom = false;
  },
});

export { LoadingMorePlugin, loadingTop, loadingBottom };
