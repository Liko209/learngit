import React from 'react';
import { mount } from 'enzyme';
import { JuiCircularProgress } from 'ui-components';
import { AbstractViewModel } from '../../../base/AbstractViewModel';
import { LoadingPlugin, loading } from '../LoadingPlugin';

class MyViewModel extends AbstractViewModel {
  @loading
  async sleep(time: number) {
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      },         time);
    });
  }
}

describe('LoadingPlugin', () => {
  describe('install()', () => {
    it('should add loading property to vm', () => {
      const plugin = new LoadingPlugin();
      const vm = new MyViewModel();
      plugin.install(vm);
      expect(vm).toHaveProperty('loading', false);
    });
  });

  describe('wrapView()', () => {
    it('should wrap View with loading', () => {
      const plugin = new LoadingPlugin();
      const View = plugin.wrapView(() => <div>Hello World</div>);

      const wrapper = mount(<View loading={true} />);

      expect(wrapper.find(JuiCircularProgress).exists()).toBeTruthy();
    });
  });

  describe('decorator/loading', () => {
    it('should control loading state', async () => {
      const vm = new MyViewModel();

      expect.assertions(2);
      const promise = vm.sleep(1);

      expect(vm).toHaveProperty('loading', true);
      await promise;
      expect(vm).toHaveProperty('loading', false);
    });
  });
});
