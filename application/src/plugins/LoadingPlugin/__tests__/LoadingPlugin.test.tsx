/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:45
 * Copyright © RingCentral. All rights reserved.
 */
import { mount } from 'enzyme';
import React from 'react';
import { unwrapMemo } from 'test-util/unwrapMemo';
import { AbstractViewModel } from '../../../base/AbstractViewModel';
import { loading, LoadingPlugin } from '../LoadingPlugin';

jest.useFakeTimers();

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
  jest.spyOn(React, 'memo').mockImplementation(r => r);
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
      const _Loading = () => <div>loading</div>;
      const plugin = new LoadingPlugin({
        CustomizedLoading: _Loading,
      });
      const View = plugin.wrapView(() => <div>Hello World</div>);

      const wrapper = mount(unwrapMemo(<View loading={true} />));

      jest.runAllTimers();

      expect(wrapper.update().find(_Loading)).toHaveLength(1);
    });

    it('should have delay before Progress is visible [JPT-169][JPT-170]', () => {
      const _Loading = () => <div>loading</div>;
      const plugin = new LoadingPlugin({
        CustomizedLoading: _Loading,
      });
      const View = plugin.wrapView(() => <div>Hello World</div>);

      const wrapper = mount(unwrapMemo(<View loading={true} />));

      // JPT-170 No progress animation when sync data <= 100 ms
      jest.advanceTimersByTime(90);
      expect(wrapper.find(_Loading)).toHaveLength(0);

      // JPT-169 Display a progress animation when sync data more than 100ms
      jest.advanceTimersByTime(20);
      expect(wrapper.update().find(_Loading)).toHaveLength(1);
    });

    it('should wrap View with CustomLoading view component', () => {
      const CustomizedLoading = () => <span>Custom Loading</span>;
      const plugin = new LoadingPlugin({ CustomizedLoading });
      const View = plugin.wrapView(() => <div>Hello World</div>);

      const wrapper = mount(unwrapMemo(<View loading={true} />));

      jest.runAllTimers();

      expect(
        wrapper
          .update()
          .find(CustomizedLoading)
          .html(),
      ).toBe('<span>Custom Loading</span>');
    });
  });

  describe('decorator/loading', () => {
    it('should control loading state', async () => {
      const vm = new MyViewModel();

      expect.assertions(2);
      const promise = vm.sleep(1);
      expect(vm).toHaveProperty('loading', true);
      jest.runAllTimers();
      await promise;
      expect(vm).toHaveProperty('loading', false);
    });
  });
});
