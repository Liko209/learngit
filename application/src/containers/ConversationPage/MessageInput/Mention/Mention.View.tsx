/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
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
  MentionViewProps & WithTranslation
> {
  private _Avatar(id: number) {
    return <Avatar uid={id} size="small" />;
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
      isEditMode,
    } = this.props;
    if (open && members.length) {
      return (
        <JuiMentionPanel isEditMode={isEditMode}>
          <JuiMentionPanelSection>
            {groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ? null : (
              <JuiMentionPanelSectionHeader
                title={t(
                  searchTerm && searchTerm.trim()
                    ? 'message.suggestedPeople'
                    : 'message.teamMembers',
                )}
              />
            )}
            {members.map(
              (
                { displayName, id }: { displayName: string; id: number },
                index: number,
              ) => (
                <JuiMentionPanelSectionItem
                  Avatar={this._Avatar(id)}
                  displayName={displayName}
                  key={id}
                  selected={currentIndex === index}
                  selectHandler={selectHandler(index)}
                />
              ),
            )}
          </JuiMentionPanelSection>
        </JuiMentionPanel>
      );
    }
    return null;
  }
}

const MentionView = withTranslation('translations')(MentionViewComponent);

export { MentionView };
