/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { JuiCircularProgress } from 'ui-components';
import { AbstractViewModel } from '../../../base/AbstractViewModel';
import { LoadingPlugin, loading } from '../LoadingPlugin';

function sleep(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    },         time);
  });
}

class MyViewModel extends AbstractViewModel {
  @loading
  sleep(time: number) {
    return sleep(time);
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
      jest.useFakeTimers();

      const vm = new MyViewModel();

      expect.assertions(3);
      const promise = vm.sleep(1000);
      expect(vm).not.toHaveProperty('loading', false);

      jest.advanceTimersByTime(500);
      expect(vm).toHaveProperty('loading', true);

      jest.advanceTimersByTime(500);
      await promise;
      expect(vm).toHaveProperty('loading', false);
    });
  });
});
