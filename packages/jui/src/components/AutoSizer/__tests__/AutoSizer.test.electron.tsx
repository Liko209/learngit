/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-26 10:50:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { JuiAutoSizer } from '../AutoSizer';

const attachTo = document.createElement('div');
attachTo.className = 'attachTo';
document.body.appendChild(attachTo);
const style = document.createElement('style');

style.innerHTML = `
  html, body {
    position: relative;
    height: 1000px;
  }

  .attachTo {
    position: absolute;
    height: 100%;
  }
`;

document.body.appendChild(style);

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
            <div className="child" style={{ height: 99999 }}>
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

  it('should respect percentage maxHeight', () => {
    const wrapper = mount(
      <div style={{ width: 233, maxHeight: '50%' }}>
        <JuiAutoSizer>
          {({ width, height }) => (
            <div className="child" style={{ height: 99999 }}>
              {width}x{height}
            </div>
          )}
        </JuiAutoSizer>
      </div>,
      { attachTo },
    );
    expect(wrapper.find('.child').text()).toBe(
      `233x${document.body.offsetHeight * 0.5}`,
    );
    wrapper.unmount();
  });
});
