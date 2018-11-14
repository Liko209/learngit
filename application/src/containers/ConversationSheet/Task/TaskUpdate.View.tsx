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

  render() {
    const { task, post } = this.props;
    const { color, text, complete } = task;
    const { value, key, old_value } = post.activityData;

    switch (key) {
      case 'assigned_to_ids':
        return (
          <TaskUpdateViewCard
            title={text}
            titleColor={color}
            icon={<JuiTaskCheckbox checked={complete || false} />}
            footer={
              <JuiEventCollapse
                showText={t('showEventHistory')}
                hideText={t('hideEventHistory')}
              >
                {
                  <JuiEventCollapseContent>
                    <JuiTaskAvatarName
                      avatarNames={this._getTaskAvatarNames(old_value)}
                    />
                  </JuiEventCollapseContent>
                }
              </JuiEventCollapse>
            }
          >
            <JuiTaskAvatarName avatarNames={this._getTaskAvatarNames(value)} />
          </TaskUpdateViewCard>
        );

      case 'complete_percentage':
        return (
          <TaskUpdateViewCard
            title={`${value}% ${text}`}
            titleColor={color}
            icon={<JuiTaskCheckbox checked={complete || false} />}
          />
        );

      default:
        return (
          <TaskUpdateViewCard
            title={text}
            titleColor={color}
            icon={<JuiTaskCheckbox checked={complete || false} />}
          />
        );
    }
  }
}

export { TaskUpdateView };
