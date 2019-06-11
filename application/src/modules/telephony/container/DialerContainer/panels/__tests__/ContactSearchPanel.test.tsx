import React from 'react';
import { shallow } from 'enzyme';
import { ContactSearchPanel } from '../ContactSearchPanel';
import { JuiContainer } from 'jui/pattern/Dialer';

describe('ContactSearchPanel', () => {
  it('Should render the panel', () => {
    const props = {
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
    const wrapper = shallow(<ContactSearchPanel {...props} />);
    expect(wrapper.find(JuiContainer).length).toEqual(1);
  });
});
