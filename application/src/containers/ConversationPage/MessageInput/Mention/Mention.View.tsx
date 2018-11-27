/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { MentionViewProps } from './types';
import { JuiMentionPanel } from 'jui/pattern/MessageInput/Mention/MentionPanel';
import { JuiMentionPanelSection } from 'jui/pattern/MessageInput/Mention/MentionPanelSection';
import { JuiMentionPanelSectionItem } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionItem';
import { JuiMentionPanelSectionHeader } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionHeader';
import { Avatar } from '@/containers/Avatar';
import { CONVERSATION_TYPES } from '@/constants';

@observer
class MentionViewComponent extends Component<
  MentionViewProps & WithNamespaces
> {
  private _Avatar(id: number) {
    return <Avatar uid={id} size="small" />;
  }

  private _AvatarCache: {
    [id: number]: () => JSX.Element;
  } = {};

  private _getAvatar(id: number) {
    let Avatar = this._AvatarCache[id];
    if (!Avatar) {
      Avatar = () => this._Avatar(id);
      this._AvatarCache[id] = Avatar;
    }
    return Avatar;
  }

  render() {
    const {
      open,
      members,
      currentIndex,
      t,
      searchTerm,
      groupType,
      selectHandler,
    } = this.props;
    return (
      <>
        {open && members.length ? (
          <JuiMentionPanel>
            <JuiMentionPanelSection
              hasPadding={groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE}
            >
              {groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ? null : (
                <JuiMentionPanelSectionHeader
                  title={t(searchTerm ? 'suggested people' : 'team members')}
                />
              )}
              {members.map(
                (
                  { displayName, id }: { displayName: string; id: number },
                  index: number,
                ) => (
                  <JuiMentionPanelSectionItem
                    Avatar={this._getAvatar(id)}
                    displayName={displayName}
                    key={id}
                    selected={currentIndex === index}
                    selectHandler={selectHandler(index)}
                  />
                ),
              )}
            </JuiMentionPanelSection>
          </JuiMentionPanel>
        ) : null}
      </>
    );
  }
}

const MentionView = translate('Conversations')(MentionViewComponent);

export { MentionView };
