/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-26 10:50:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { JuiAutoSizer } from '../AutoSizer';

const attachTo = document.createElement('div');
document.body.appendChild(attachTo);

describe('AutoSizer', () => {
  it('should compute the width and height of parent', () => {
    const wrapper = mount(
      <div style={{ width: 233, height: 666 }}>
        <JuiAutoSizer>
          {({ width, height }) => (
            <div className="child">
              {width}x{height}
            </div>
          )}
        </JuiAutoSizer>
      </div>,
      { attachTo },
    );
    expect(wrapper.find('.child').text()).toBe('233x666');
    wrapper.unmount();
  });

  it('should respect minHeight', () => {
    const wrapper = mount(
      <div style={{ width: 233, minHeight: 666 }}>
        <JuiAutoSizer>
          {({ width, height }) => (
            <div className="child">
              {width}x{height}
            </div>
          )}
        </JuiAutoSizer>
      </div>,
      { attachTo },
    );
    expect(wrapper.find('.child').text()).toBe('233x666');
    wrapper.unmount();
  });

  it('should respect maxHeight', () => {
    const wrapper = mount(
      <div style={{ width: 233, maxHeight: 100 }}>
        <JuiAutoSizer>
          {({ width, height }) => (
            <div className="child" style={{ height: 9999 }}>
              {width}x{height}
            </div>
          )}
        </JuiAutoSizer>
      </div>,
      { attachTo },
    );
    expect(wrapper.find('.child').text()).toBe('233x100');
    wrapper.unmount();
  });
});
