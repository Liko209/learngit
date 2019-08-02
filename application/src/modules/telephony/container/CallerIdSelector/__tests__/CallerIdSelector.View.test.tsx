import { shallow } from 'enzyme';
import { RawCallerIdSelector } from '../CallerIdSelector.View';
import { JuiVirtualizedBoxSelect } from 'jui/components/VirtualizedSelects/VirtualizedBoxSelect';
import React from 'react';

describe('RawCallerIdSelector', () => {
  it('should have `JuiVirtualizedBoxSelect`', () => {
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

    expect(wrapper.find(JuiVirtualizedBoxSelect).length).toEqual(1);
  });
});
