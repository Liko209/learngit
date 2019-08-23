/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-22 13:36:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mountWithTheme, asyncMountWithTheme } from 'shield/utils';
import { shallow } from 'enzyme';
import { SectionView } from '..';

const ContactTabs = {
  rootPath: '/contacts',
  sections: [
    {
      title: 'contacts',
      tabs: [
        {
          title: 'contacts.tab.allContacts',
          path: '/all-contacts',
          automationID: 'contacts-tab-all-contacts',
          component: () => <div>1</div>,
        },
        {
          title: 'contacts.tab.company',
          path: '/company',
          automationID: 'contacts-tab-company',
          component: () => <div>2</div>,
        },
      ],
    },
    {
      title: 'contacts1',
      tabs: [
        {
          title: 'contacts.tab.allContacts111',
          path: '/all-contacts111',
          automationID: 'contacts-tab-all-contacts',
          component: () => <div>11111</div>,
        },
        {
          title: 'contacts.tab.company111',
          path: '/company111',
          automationID: 'contacts-tab-company',
          component: () => <div>2222</div>,
        },
      ],
    },
  ],
};

describe('Section', () => {
  @testable
  class expanded {
    @test('should default expanded if selectedPath === current url [JPT-2787]')
    t1() {
      const props = {
        title: 'title',
        tabs: ContactTabs.sections[0].tabs,
        selectedPath: '/all-contacts',
      };
      const wrapper = shallow(<SectionView {...props} />);
      expect(wrapper.state().expanded).toBeTruthy();
    }
  }
});
