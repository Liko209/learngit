/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';
import { JuiEventIcon, JuiEventRepeatIcon } from 'jui/pattern/RightShelf';
import { ViewProps } from './types';

@observer
class EventItemView extends React.Component<ViewProps> {
  render() {
    const { text, localTime, color, isRepeat } = this.props;
    return (
      <JuiListItem data-test-automation-id="rightRail-event-item">
        <JuiListItemIcon>
          <JuiEventIcon iconColor={color} />
        </JuiListItemIcon>
        <JuiListItemText
          primaryColor={color}
          primary={text}
          secondary={
            <JuiListItemSecondaryText>
              {isRepeat && <JuiEventRepeatIcon />}
              <JuiListItemSecondarySpan>{localTime}</JuiListItemSecondarySpan>
            </JuiListItemSecondaryText>
          }
        />
      </JuiListItem>
    );
  }
}

export { EventItemView };
