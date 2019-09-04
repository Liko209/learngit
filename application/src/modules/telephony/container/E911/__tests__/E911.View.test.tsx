/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-02 13:46:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { ReactWrapper, shallow } from 'enzyme';
import { JuiDialogTitle } from 'jui/components/Dialog';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { StyledTip, E911Description, E911Disclaimers } from 'jui/pattern/E911';
import { Notification, notificationKey } from '@/containers/Notification';
import { JuiButton } from 'jui/components/Buttons/Button';

import { E911View } from '../E911.View';

jest.mock('@/containers/Notification');

const defaultFields = {
  customerName: 'John Doe',
  street: {
    label: 'Street address',
    ghostText: '120 1st St SW',
  },
  street2: {
    label: 'Additional address',
    ghostText: 'Suite 500 or Building A, Floor 3',
    optional: true,
  },
  city: {
    label: 'City',
    ghostText: 'Alabaster',
  },
  state: {
    label: 'State/Province',
    ghostText: 'State/Province',
    optional: true,
  },
  zip: {
    label: 'Zip code',
    ghostText: '35007',
  },
};

describe('E911View', () => {
  @testable
  class JPT2678 {
    @test('should check ghost text if show text field [JPT-2678]')
    t1() {
      const props = {
        value: {
          street2: 'street2',
          countryName: 'countryName',
          customerName: 'customerName',
          stateName: 'stateName',
        },
        countryList: [],
        stateList: [],
        fields: defaultFields,
        handleFieldChange() {},
        shouldShowSelectState: false,
      };
      const wrapper: ReactWrapper = mountWithTheme(<E911View {...props} />);
      const textFields = wrapper.find(JuiTextField);
      // textFields.map(node => console.log(node.props()));
      expect(textFields.get(0).props.placeholder).toBe('common.egJohn Doe');
      // textFields.get(1) is country select should be skip
      expect(textFields.get(2).props.placeholder).toBe(
        'common.eg120 1st St SW',
      );
      expect(textFields.get(3).props.placeholder).toBe(
        'common.egSuite 500 or Building A, Floor 3',
      );
      expect(textFields.get(4).props.placeholder).toBe('common.egAlabaster');
      expect(textFields.get(5).props.placeholder).toBe(
        'common.egState/Province',
      );
      expect(textFields.get(6).props.placeholder).toBe('common.eg35007');
    }
  }

  @testable
  class JPT2681 {
    @test('should check maxlength = 100 if show text field [JPT-2681]')
    t1() {
      const props = {
        value: {
          street2: 'street2',
          countryName: 'countryName',
          customerName: 'customerName',
          stateName: 'stateName',
        },
        countryList: [],
        stateList: [],
        fields: defaultFields,
        handleFieldChange() {},
        shouldShowSelectState: false,
      };
      const wrapper: ReactWrapper = mountWithTheme(<E911View {...props} />);
      const textFields = wrapper.find(JuiTextField);
      expect(textFields.get(0).props.inputProps.maxLength).toBe(100);
      expect(textFields.get(2).props.inputProps.maxLength).toBe(100);
      expect(textFields.get(3).props.inputProps.maxLength).toBe(100);
      expect(textFields.get(4).props.inputProps.maxLength).toBe(100);
      expect(textFields.get(5).props.inputProps.maxLength).toBe(100);
      expect(textFields.get(6).props.inputProps.maxLength).toBe(100);
    }
  }

  @testable
  class JPT2674 {
    @test(
      'should check emergency address dialog i18n when show dialog [JPT-2674]',
    )
    t1() {
      const props = {
        value: {
          street2: 'street2',
          countryName: 'countryName',
          customerName: 'customerName',
          stateName: 'stateName',
        },
        setCheckBox() {},
        checkboxList: [
          {
            i18text: 'i18text',
            checked: false,
          },
        ],
        countryList: [],
        stateList: [],
        fields: defaultFields,
        handleFieldChange() {},
        shouldShowSelectState: false,
      };
      const wrapper: ReactWrapper = mountWithTheme(<E911View {...props} />);
      expect(wrapper.find(JuiDialogTitle).text()).toBe('telephony.e911.title');
      expect(wrapper.find(E911Description).text()).toBe(
        'telephony.e911.dialogDescription',
      );
      expect(wrapper.find(StyledTip).text()).toBe(
        'telephony.e911.outOfCountryDisclaimers',
      );
      expect(wrapper.find(E911Disclaimers).text()).toBe(
        'telephony.e911.outOfCountryTitle',
      );
    }
  }

  @testable
  class JPT2915 {
    @test('should dismiss when confirm address in the setting [JPT-2915]')
    async t1() {
      Notification.removeNotification = jest.fn();
      const props = {
        value: {
          street2: 'street2',
          countryName: 'countryName',
          customerName: 'customerName',
          stateName: 'stateName',
        },
        setCheckBox() {},
        checkboxList: [
          {
            i18text: 'i18text',
            checked: false,
          },
        ],
        countryList: [],
        stateList: [],
        fields: defaultFields,
        handleFieldChange() {},
        shouldShowSelectState: false,
        onSubmit() {
          return true;
        },
        closeE911() {},
      };
      const wrapper = shallow(<E911View {...props} />);
      const confirmBtn = wrapper.find(JuiButton).at(1);
      await confirmBtn.simulate('click');
      expect(Notification.removeNotification).toHaveBeenCalledWith(
        notificationKey.E911_TOAST,
      );
    }
  }
});
