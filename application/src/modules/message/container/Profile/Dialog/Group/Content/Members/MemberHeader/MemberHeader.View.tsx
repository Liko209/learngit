/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { createRef, RefObject } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MemberHeaderViewProps, MemberHeaderProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';
import {
  JuiProfileDialogContentMemberHeader,
  JuiProfileDialogContentMemberHeaderTitle,
  JuiProfileDialogContentMemberHeaderSearch,
  JuiProfileDialogContentSummaryButtonInRight as ButtonInRight,
} from 'jui/pattern/Profile/Dialog';
import { JuiOutlineTextField } from 'jui/components/Forms/OutlineTextField';
import portalManager from '@/common/PortalManager';
import { Dialog } from '@/containers/Dialog';
import { AddMembers } from '../../AddMembers';
import { ProfileContext } from '../../../types';
import RO from 'resize-observer-polyfill';

// padding of header
const PADDING_FIX = 16 + 12;
@observer
class MemberHeader extends React.Component<
  WithTranslation & MemberHeaderViewProps & MemberHeaderProps
> {
  static contextType = ProfileContext;
  private _ref: RefObject<any> = createRef();
  private _observer?: RO;
  private _handleResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    const { sizeManager } = this.context;
    sizeManager.updateSize('profileDialogMemberHeader', {
      width,
      height: height + PADDING_FIX,
    });
  }

  componentDidMount() {
    const { current } = this._ref;
    if (current) {
      this._observer = new RO(this._handleResize);
      this._observer.observe(current);
    }
  }

  componentWillUnmount() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
  addTeamMembers = () => {
    const { group } = this.props;
    portalManager.dismissLast();
    Dialog.simple(<AddMembers group={group} />, {
      size: 'medium',
    });
  }

  render() {
    const {
      group,
      t,
      hasShadow,
      isCurrentUserHasPermissionAddMember,
      onSearch,
      hasSearch,
    } = this.props;
    const { isTeam, members = [] } = group;
    const key = isTeam ? 'people.team.teamMembers' : 'people.team.groupMembers';
    return (
      <JuiProfileDialogContentMemberHeader
        className={hasShadow ? 'shadow' : ''}
        data-test-automation-id="profileDialogMemberHeader"
        ref={this._ref}
      >
        <JuiProfileDialogContentMemberHeaderTitle>
          {`${t(key)} (${members.length})`}
          {isTeam && isCurrentUserHasPermissionAddMember && (
            <ButtonInRight onClick={this.addTeamMembers}>
              <JuiIconography iconSize="medium">add_team</JuiIconography>
              {t('people.team.AddTeamMembers')}
            </ButtonInRight>
          )}
        </JuiProfileDialogContentMemberHeaderTitle>
        {hasSearch && (
          <JuiProfileDialogContentMemberHeaderSearch data-test-automation-id="profileDialogMemberSearch">
            <JuiOutlineTextField
              InputProps={{
                placeholder: t('people.team.searchMembers'),
                inputProps: {
                  maxLength: 30,
                },
              }}
              onChange={onSearch}
              iconName="search"
              iconPosition="left"
              data-test-automation-id="profileDialogMemberSearch"
            />
          </JuiProfileDialogContentMemberHeaderSearch>
        )}
      </JuiProfileDialogContentMemberHeader>
    );
  }
}
const MemberHeaderView = withTranslation('translations')(MemberHeader);

export { MemberHeaderView };
