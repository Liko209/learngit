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
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';
import { JuiTaskIcon } from 'jui/pattern/RightShelf/TaskItem';
import { TaskItemProps } from './types';

class TaskItemView extends React.Component<TaskItemProps, {}> {
  constructor(props: TaskItemProps) {
    super(props);
  }

  render() {
    const { task, personName, dueTime } = this.props;
    const { complete, text, color } = task;

    return (
      <JuiListItem>
        <JuiListItemIcon>
          <div>
            <JuiTaskIcon iconColor={color} complete={complete} />
          </div>
        </JuiListItemIcon>
        <JuiListItemText
          primaryColor={color}
          primary={text}
          secondary={
            personName || dueTime ? (
              <JuiListItemSecondaryText>
                <JuiListItemSecondarySpan text={personName} isEllipsis={true} />
                {personName && dueTime && <>&nbsp;·&nbsp;</>}
                <JuiListItemSecondarySpan text={dueTime} />
              </JuiListItemSecondaryText>
            ) : null
          }
        />
      </JuiListItem>
    );
  }
}

export { TaskItemView };
