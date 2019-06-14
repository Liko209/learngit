import { shallow } from 'enzyme';
import { RawCallerIdSelector } from '../CallerIdSelector.View';
import { JuiBoxSelect } from 'jui/components/Selects/BoxSelect';
import React from 'react';

describe('RawCallerIdSelector', () => {
  it('should have `JuiBoxSelect`', () => {
    const props = {
      value: '+18002076138',
      menu: [
        {
          value: '+18002076138',
          usageType: 'MainCompanyNumber',
          phoneNumber: '+18002076138',
          label: 'Main Company Number',
        },
        {
          value: 'Blocked',
          usageType: 'Blocked',
          phoneNumber: 'Blocked',
          label: 'Blocked',
        },
      ],
      label: 'Call from:',
      disabled: false,
      heightSize: 'default',
    };
    const wrapper = shallow(<RawCallerIdSelector {...props} />);

    expect(wrapper.find(JuiBoxSelect).length).toEqual(1);
  });
});
