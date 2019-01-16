/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 16:03:41
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { JuiTaskIcon } from 'jui/pattern/RightShelf/TaskItem';
import { TaskItemProps } from './types';

class TaskItemView extends React.Component<TaskItemProps, {}> {
  constructor(props: TaskItemProps) {
    super(props);
  }

  render() {
    const { task, creator } = this.props;
    const { complete, text } = task;
    return (
      <JuiListItem>
        <JuiListItemIcon>
          <div>
            <JuiTaskIcon complete={complete} />
          </div>
        </JuiListItemIcon>
        <JuiListItemText primary={text} secondary={creator} />
      </JuiListItem>
    );
  }
}

export { TaskItemView };
