/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiTaskSection,
  JuiTaskNotes,
  JuiTaskAvatarName,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { TaskAvatarName } from './TaskAvatarName';

import { ViewProps } from './types';

@observer
class TaskView extends React.Component<ViewProps> {
  private get _taskAvatarNames() {
    const { task } = this.props;
    const { assigned_to_ids } = task;

    if (assigned_to_ids && assigned_to_ids.length >= 2) {
      return [
        <TaskAvatarName key={assigned_to_ids[0]} id={assigned_to_ids[0]} />,
        <TaskAvatarName key={assigned_to_ids[1]} id={assigned_to_ids[1]} />,
      ];
    }

    return assigned_to_ids && <TaskAvatarName id={assigned_to_ids[0]} />;
  }
  render() {
    const { task } = this.props;
    const { section, color, text, notes, complete, assigned_to_ids } = task;
    console.log('task---------', task);
    return (
      <JuiConversationItemCard
        complete={complete}
        title={text}
        titleColor={color}
        icon={<JuiTaskCheckbox checked={complete} />}
      >
        <JuiTaskAvatarName
          avatarNames={this._taskAvatarNames}
          count={assigned_to_ids && assigned_to_ids.length}
        />
        <JuiTaskSection section={section} />
        <JuiTaskNotes notes={notes} />
      </JuiConversationItemCard>
    );
  }
}

export { TaskView };
