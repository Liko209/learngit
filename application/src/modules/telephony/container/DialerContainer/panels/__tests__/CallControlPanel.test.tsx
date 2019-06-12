import React from 'react';
import { shallow } from 'enzyme';
import { CallControlPanel } from '../CallControlPanel';
import { JuiContainer } from 'jui/pattern/Dialer';

describe('CallControlPanel', () => {
  it('Should render the panel', () => {
    const props = {};
    const wrapper = shallow(<CallControlPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });
});
