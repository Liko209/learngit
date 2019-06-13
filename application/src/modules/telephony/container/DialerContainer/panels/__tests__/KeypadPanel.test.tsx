import React from 'react';
import { shallow } from 'enzyme';
import { KeypadPanel } from '../KeypadPanel';
import { JuiContainer } from 'jui/pattern/Dialer';

describe('KeypadPanel', () => {
  it('Given `dtmfThroughKeypad` and `dtmfThroughKeyboard`, should render the keypad', () => {
    const props = {
      dialerFocused: [true, false][Math.ceil(2 * Math.random())],
      dtmfThroughKeyboard: jest.fn(),
      dtmfThroughKeypad: jest.fn(),
    };
    const wrapper = shallow(<KeypadPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });

  it('Given `dtmfThroughKeypad` and `dtmfThroughKeyboard` being empty, should render the keypad', () => {
    const props = {
      dialerFocused: [true, false][Math.ceil(2 * Math.random())],
    };
    const wrapper = shallow(<KeypadPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });
});
