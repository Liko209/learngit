/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { JuiSearchTitle, JuiSearchItem } from 'jui/pattern/SearchBar';
import { GroupAvatar } from '@/containers/Avatar';
import { JuiButton } from 'jui/components/Buttons';
import { ViewProps, GroupModel } from './types';

type Props = {
  hasMore: boolean;
  title: string;
  terms: string[];
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
};

@observer
class GroupItemView extends React.Component<ViewProps & Props, {}> {
  render() {
    const {
      hasMore,
      title,
      terms,
      groups,
      onClick,
      sectionIndex,
      selectIndex,
      onMouseEnter,
      onMouseLeave,
    } = this.props;

    return (
      <>
        {groups.length > 0 && (
          <JuiSearchTitle
            isShowMore={hasMore}
            showMore={t('showMore')}
            title={t(title)}
            data-test-automation-id={`search-${title}`}
          />
        )}
        {groups.map((group: GroupModel, cellIndex: number) => {
          const { id, displayName, isMember, isTeam, privacy } = group;
          const canJoinTeam = isTeam && privacy === 'protected' && !isMember;
          const hovered =
            sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];

          return (
            <JuiSearchItem
              onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
              onMouseLeave={onMouseLeave}
              hovered={hovered}
              key={id}
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
        })}
      </>
    );
  }
}

export { GroupItemView };
