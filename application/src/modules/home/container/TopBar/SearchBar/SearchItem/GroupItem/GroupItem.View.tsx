/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { GroupAvatar } from '@/containers/Avatar';
import { JuiButton } from 'jui/components/Buttons';
import { ViewProps } from './types';

@observer
class GroupItemView extends React.Component<ViewProps, {}> {
  render() {
    const {
      title,
      terms,
      group,
      onClick,
      sectionIndex,
      selectIndex,
      cellIndex,
      onMouseEnter,
      onMouseLeave,
    } = this.props;
    const { id, displayName, isMember, isTeam, privacy } = group;
    const canJoinTeam = isTeam && privacy === 'protected' && !isMember;
    const hovered =
      sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        onClick={canJoinTeam ? onClick(group) : undefined}
        Avatar={<GroupAvatar cid={id} size="small" />}
        value={displayName}
        terms={terms}
        data-test-automation-id={`search-${title}-item`}
        Actions={
          <JuiButton
            data-test-automation-id="joinButton"
            variant="round"
            size="small"
          >
            {t('join')}
          </JuiButton>
        }
        isPrivate={isTeam && privacy === 'private'}
        isJoined={isTeam && privacy === 'protected' && isMember}
      />
    );
  }
}

export { GroupItemView };
