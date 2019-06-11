import React from 'react';
import { shallow } from 'enzyme';
import { DialerPanel } from '../DialerPanel';
import { JuiContainer } from 'jui/pattern/Dialer';

const widgetProps = {
  callerIdProps: {
    value: '(800) 207-6138',
    menu: [
      {
        value: '(800) 207-6138',
        usageType: 'Main Company Number',
        phoneNumber: '(800) 207-6138',
        label: 'Main Company Number',
        isTwoLine: true,
      },
      {
        value: 'Blocked',
        usageType: 'Blocked',
        phoneNumber: 'Blocked',
        label: 'Blocked',
        isTwoLine: false,
      },
      {
        value: '(205) 994-0003',
        usageType: 'Company Fax Number',
        phoneNumber: '(205) 994-0003',
        label: 'Company Fax Number',
        isTwoLine: true,
      },
    ],
    label: 'Call from:',
    disabled: false,
    heightSize: 'default',
  },
  tooltipProps: {
    title: 'You can change this default Caller ID in settings.',
    open: false,
    tooltipForceHide: false,
  },
};

describe('DialerPanel', () => {
  it('Given `playAudio` and `clickToInput`, should render the keypad', () => {
    const props = Object.assign(
      {},
      {
        dialerFocused: [true, false][Math.ceil(2 * Math.random())],
        clickToInput: jest.fn(),
        playAudio: jest.fn(),
      },
      widgetProps,
    );
    const wrapper = shallow(<DialerPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });

  it('Given `playAudio` and `clickToInput` being empty, should render the keypad', () => {
    const props = Object.assign(
      {},
      {
        dialerFocused: [true, false][Math.ceil(2 * Math.random())],
      },
      widgetProps,
    );
    const wrapper = shallow(<DialerPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });
});
