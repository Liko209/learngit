import React from 'react';
import { shallow } from 'enzyme';
import { ContactSearchItemView } from '../ContactSearchItem.View';
import { JuiMenuItem } from 'jui/components/Menus';
import { v4 } from 'uuid';
import { JuiListItemText } from 'jui/components/Lists';
import { JuiIconButton } from 'jui/components/Buttons';

describe('ContactSearchItemView', () => {
  describe('Check the UI of matched record [JPT-2191]', () => {
    it(`The matched record shows following information:
    1. Avatar

    2. Contact's name (If name isn't available, show email address)

    3. Extension or DID number (if both the extension and direct number match, shows extension). e.g. "Ext. 123" or E164 format number`, () => {
      const name = v4();
      const phoneNumber = v4();
      const props = {
        uid: 1,
        name,
        phoneNumber,
        isExt: false,
        showDialIcon: false,
        selected: false,
        onClick: jest.fn(),
      };
      const wrapper = shallow(<ContactSearchItemView {...props} />);
      const itemWrapper = wrapper.find(JuiMenuItem);
      expect(itemWrapper.length).toBe(1);
      expect(itemWrapper.props().avatar).toBeTruthy();
      const listItemWrapper = itemWrapper.find(JuiListItemText);
      expect(listItemWrapper.length).toBe(1);
      expect(listItemWrapper.props().primary).toBe(name);
      expect(listItemWrapper.props().secondary).toBe(phoneNumber);
    });
  });

  describe('Can display an extra entry above the result list when the search keyword is a valid phone number [JPT-2217]', () => {
    it(`The matched record shows following information:
    1. Default avatar

    2. "Dial:"

    3. The number what you enter into the input field

    4. Default highlight`, () => {
      const name = v4();
      const phoneNumber = v4();
      const props = {
        uid: 1,
        name,
        phoneNumber,
        isExt: false,
        showDialIcon: true,
        selected: true,
        onClick: jest.fn(),
      };

      const wrapper = shallow(<ContactSearchItemView {...props} />);
      const itemWrapper = wrapper.find(JuiMenuItem);
      expect(itemWrapper.length).toBe(1);
      expect(itemWrapper.props().avatar).toBeTruthy();
      const listItemWrapper = itemWrapper.find(JuiListItemText);
      expect(listItemWrapper.length).toBe(1);
      expect(listItemWrapper.props().primary).toBe('');
      expect(listItemWrapper.props().secondary).toBe(phoneNumber);
      const buttonWrapper = wrapper.find(JuiIconButton);
      expect(buttonWrapper.length).toBe(1);
    });
  });
});
