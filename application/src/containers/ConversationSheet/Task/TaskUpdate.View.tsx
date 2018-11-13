/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-13 16:53:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiConversationItemCard as TaskUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import { TaskUpdateViewProps } from './types';

class TaskUpdateView extends React.Component<TaskUpdateViewProps> {
  render() {
    const { task, post } = this.props;
    const { color, text, complete } = task;
    const { value } = post.activityData;

    return (
      <TaskUpdateViewCard
        title={`${value}% ${text}`}
        titleColor={color}
        icon={<JuiTaskCheckbox checked={complete || false} />}
      />
    );
  }
}

export { TaskUpdateView };
