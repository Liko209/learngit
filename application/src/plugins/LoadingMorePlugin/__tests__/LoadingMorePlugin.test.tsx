/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import {
  LoadingMorePlugin,
  onScrollToTop,
  onScrollToBottom,
  loadingTop,
  loadingBottom,
} from '../LoadingMorePlugin';

const fetchPrevSpy = jest.fn().mockName('fetchPrevSpy');
const fetchNextSpy = jest.fn().mockName('fetchNextSpy');

class MyViewModel extends AbstractViewModel {
  hasMoreUp = true;
  hasMoreDown = true;

  @onScrollToTop((vm: MyViewModel) => vm.hasMoreUp)
  @loadingTop
  fetchPrev() {
    fetchPrevSpy();
    return this.sleep(1);
  }

  @onScrollToBottom((vm: MyViewModel) => vm.hasMoreDown)
  @loadingBottom
  fetchNext() {
    fetchNextSpy();
    return this.sleep(1);
  }

  sleep(time: number) {
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      },         time);
    });
  }
}

describe('LoadingMorePlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('install()', () => {
    it('should add loadingTop/LoadingBottom property to vm', () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      plugin.install(vm);
      expect(vm).toHaveProperty('loadingTop', false);
      expect(vm).toHaveProperty('loadingBottom', false);
    });
  });

  describe('wrapView()', () => {
    it('should wrap View with loadingTop & loadingBottom', () => {
      const plugin = new LoadingMorePlugin();
      const View = plugin.wrapView(() => <div>Hello World</div>);
      const wrapper = mount(<View />);
      expect(wrapper.text()).toBe('Hello World');
    });
  });

  describe('decorator/onScrollToTop+loadingTop', () => {
    it('should call the function when scroll bar at top', async () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);
      const promise = wrapper.prop('onScrollToTop')();
      expect(fetchPrevSpy).toHaveBeenCalled();
      expect(vm).toHaveProperty('loadingTop', true);
      await promise;
      expect(vm).toHaveProperty('loadingTop', false);
    });

    it('should not call the function when hasMoreUp=false', async () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      vm.hasMoreUp = false;
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);
      wrapper.prop('onScrollToTop')();
      expect(fetchPrevSpy).not.toHaveBeenCalled();
      expect(vm).toHaveProperty('loadingTop', false);
    });
  });

  describe('decorator/onScrollToBottom+loadingBottom', () => {
    it('should call the function when scroll bar at bottom', async () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);
      const promise = wrapper.prop('onScrollToBottom')();

      expect(fetchNextSpy).toHaveBeenCalled();
      expect(vm).toHaveProperty('loadingBottom', true);
      await promise;
      expect(vm).toHaveProperty('loadingBottom', false);
    });

    it('should not call the function when hasMoreDown=false', async () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      vm.hasMoreDown = false;
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);
      wrapper.prop('onScrollToBottom')();

      expect(fetchNextSpy).not.toHaveBeenCalled();
      expect(vm).toHaveProperty('loadingBottom', false);
    });
  });
});
