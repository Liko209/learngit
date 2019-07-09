/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-26 10:50:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { JuiSizeMeasurer } from '../SizeMeasurer';

const attachTo = document.createElement('div');
document.body.appendChild(attachTo);

describe('SizeMeasurer', () => {
  it("should compute ref's width and height", () => {
    const wrapper = mount(
      <JuiSizeMeasurer>
        {({ width, height, ref }) => (
          <div
            ref={ref as any}
            className='target'
            style={{ width: 2333, height: 6666 }}
          >
            {width}x{height}
          </div>
        )}
      </JuiSizeMeasurer>,
      { attachTo },
    );
    expect(wrapper.find('.target').text()).toBe('2333x6666');
    wrapper.unmount();
  });
});
