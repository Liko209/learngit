/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { ThemeProvider, JuiCircularProgress } from 'ui-components';
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
  @onScrollToTop
  @loadingTop
  fetchPrev() {
    fetchPrevSpy();
    return this.sleep(10);
  }

  @onScrollToBottom
  @loadingBottom
  fetchNext() {
    fetchNextSpy();
    return this.sleep(10);
  }

  async sleep(time: number) {
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
    // TODO need to make theme provider work
    it.skip('should wrap View with loadingTop & loadingBottom', () => {
      const plugin = new LoadingMorePlugin();
      const View = plugin.wrapView(() => <div>Hello World</div>);

      const wrapper = mount(
        <ThemeProvider themeName="dark">
          <View loadingTop={true} />
        </ThemeProvider>,
      );

      expect(wrapper.find(JuiCircularProgress).exists()).toBeTruthy();
    });
  });

  describe('decorator/onScrollToTop', () => {
    it('should call the function when scroll bar at top', () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);

      wrapper.prop('onScrollToTop')();
      expect(fetchPrevSpy).toHaveBeenCalled();
    });
  });

  describe('decorator/onScrollToBottom', () => {
    it('should call the function when scroll bar at bottom', () => {
      const plugin = new LoadingMorePlugin();
      const vm = new MyViewModel();
      const View = plugin.wrapView(() => <div>Hello World</div>);
      plugin.install(vm);
      const wrapper = mount(<View {...vm} />);

      wrapper.prop('onScrollToBottom')();
      expect(fetchNextSpy).toHaveBeenCalled();
    });
  });
});
