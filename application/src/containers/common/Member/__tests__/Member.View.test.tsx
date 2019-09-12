import React from 'react';
import { MemberView } from '../Member.View';
import { OpenProfile } from '@/common/OpenProfile';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';
import { mountWithTheme } from 'shield/utils';
import { TelephonyStore } from '@/modules/telephony/store/TelephonyStore';
import { jupiter } from 'framework/Jupiter';

const vPropsFactory = (showMembersCount: boolean, membersCount: number) => ({
  showMembersCount,
  membersCount,
  groupId: 1,
});

describe('MemberView', () => {
  jupiter.registerClass(TelephonyStore);
  it('should reveal the correct member when received count [JPT-1366]', () => {
    const wrapper = mountWithTheme(
      <MemberView {...vPropsFactory(true, 100)} />,
    );

    expect(wrapper.html().includes('<span>100</span>')).toEqual(true);
  });

  it('should profile be open when member icon clicked [JPT-1368]', () => {
    const spyOpenProfile = jest.spyOn(OpenProfile, 'show');

    GlipTypeUtil.extractTypeId = jest
      .fn()
      .mockReturnValue(TypeDictionary.TYPE_ID_TEAM);

    const wrapper = mountWithTheme(
      <MemberView {...vPropsFactory(true, 100)} />,
    );

    wrapper.find('button').simulate('click');

    expect(spyOpenProfile).toHaveBeenCalled();
  });
});
