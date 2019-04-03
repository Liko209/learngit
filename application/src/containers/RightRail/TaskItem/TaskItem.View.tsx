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
import { observer } from 'mobx-react';
import { JuiTaskIcon } from 'jui/pattern/RightShelf/TaskItem';
import { TaskItemProps } from './types';

@observer
class TaskItemView extends React.Component<TaskItemProps, {}> {
  constructor(props: TaskItemProps) {
    super(props);
  }

  render() {
    const { task, personName, dueTime, color } = this.props;
    const { complete, text } = task;

    return (
      <JuiListItem data-test-automation-id="rightRail-task-item">
        <JuiListItemIcon>
          <JuiTaskIcon iconColor={color} complete={complete} />
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
