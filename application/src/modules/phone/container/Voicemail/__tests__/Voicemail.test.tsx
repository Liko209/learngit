/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:55:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Voicemail } from '../Voicemail';
import { test, testable } from 'shield';
import { mountWithTheme, registerModule } from 'shield/utils';
import { config } from '../../../module.config';

registerModule(config);

jest.mock('jui/components/AutoSizer/AutoSizer');
jest.mock('jui/components/VirtualizedList/InfiniteList');

jest.mock('react-resize-detector', () => {
  const ReactResizeDetector = (props: any) => {
    const { children } = props;
    return children(1000, 1000);
  };
  return ReactResizeDetector;
});

describe('Voicemail', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  @testable
  class init {
    @test('should create a CallHistory instance when mount')
    t1() {
      const wrapper = mountWithTheme(<Voicemail />);
      expect(wrapper).toBeTruthy();
    }
  }
});
