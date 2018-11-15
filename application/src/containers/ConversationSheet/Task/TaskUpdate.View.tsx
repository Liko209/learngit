/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-13 16:53:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { JuiConversationItemCard as TaskUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import { JuiTaskAvatarName } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiEventCollapse,
  JuiEventCollapseContent,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
import { AvatarName } from './AvatarName';
import { TaskUpdateViewProps } from './types';

class TaskUpdateView extends React.Component<TaskUpdateViewProps> {
  private _getTaskAvatarNames = (assignedIds: number[]) =>
    assignedIds.map((assignedId: number) => (
      <AvatarName key={assignedId} id={assignedId} />
    ))

  private _getTitleText(text: string) {
    const { task, activityData } = this.props;
    const { value, key } = activityData;
    const { assignedToIds } = task;

    switch (key) {
      case 'complete_people_ids':
        return `${value ? value.length : 0}/${assignedToIds &&
          assignedToIds.length} ${text}`;
      case 'complete_percentage':
        return `${value || 0}% ${text}`;
      default:
        return text;
    }
  }

  render() {
    const { task, activityData } = this.props;
    const { color, text, complete } = task;
    const { value, key, old_value } = activityData;

    return (
      <TaskUpdateViewCard
        title={this._getTitleText(text)}
        titleColor={color}
        Icon={<JuiTaskCheckbox checked={complete || false} />}
        Footer={
          key === 'assigned_to_ids' ? (
            <JuiEventCollapse
              showText={t('showEventHistory')}
              hideText={t('hideEventHistory')}
            >
              {
                <JuiEventCollapseContent>
                  <JuiTaskAvatarName>
                    {this._getTaskAvatarNames(value)}
                  </JuiTaskAvatarName>
                </JuiEventCollapseContent>
              }
            </JuiEventCollapse>
          ) : null
        }
      >
        {key === 'assigned_to_ids' && old_value > 0 ? (
          <JuiTaskAvatarName>
            {this._getTaskAvatarNames(old_value)}
          </JuiTaskAvatarName>
        ) : null}
      </TaskUpdateViewCard>
    );
  }
}

export { TaskUpdateView };
