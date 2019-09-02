/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-26 21:11:04
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { shallow } from 'enzyme';
import { Avatar } from '@/containers/Avatar';
import { MiniCard } from '@/modules/message/container/MiniCard';
import { JuiContactName } from 'jui/pattern/Contacts';
import { RuiTag } from 'rcui/components/Tag';
import { Dialog } from '@/containers/Dialog';

import { ContactCell } from '../ContactCell';
import { Actions } from '../../Actions';

describe('ContactCell', () => {
  @testable
  class render {
    @test('should be show avatar and name when cell mounted [JPT-2876]')
    @mockEntity({
      userDisplayName: 'userDisplayName',
    })
    t1() {
      const Wrapper = shallow(<ContactCell />).shallow();
      expect(Wrapper.find(JuiContactName).props().primary).toEqual(
        <React.Fragment>
          userDisplayName
          <RuiTag color="secondary" content="common.guest" />
        </React.Fragment>,
      );
    }
  }

  @testable
  class openMiniProfile {
    @test('should show mini profile if click avatar [JPT-2876]')
    @mockEntity({
      userDisplayName: 'userDisplayName',
    })
    t1() {
      jest.spyOn(MiniCard, 'show').mockImplementation();

      const Wrapper = shallow(<ContactCell />).shallow();

      Wrapper.find(Avatar)
        .find(Avatar)
        .simulate('click', { stopPropagation: jest.fn() });
      expect(MiniCard.show).toHaveBeenCalled();
    }
  }

  @testable
  class openProfile {
    @test('should openProfile if click contact cell [JPT-2877]')
    @mockEntity({
      userDisplayName: 'userDisplayName',
    })
    t1() {
      jest.spyOn(Dialog, 'simple').mockImplementation();

      const Wrapper = shallow(<ContactCell />).shallow();

      Wrapper.simulate('click', { stopPropagation: jest.fn() });
      expect(Dialog.simple).toHaveBeenCalled();
    }
  }

  @testable
  class phoneNumber {
    @test('should pass phoneNumber to action if has phone [JPT-2878]')
    @mockEntity({
      userDisplayName: 'userDisplayName',
      phoneNumbers: [{ phoneNumber: 123 }],
    })
    t1() {
      const props = {
        isHover: true,
      };
      const Wrapper = shallow(<ContactCell {...props} />).shallow();
      expect(Wrapper.find(Actions).props().phoneNumber).toBe(123);
    }
  }
});
