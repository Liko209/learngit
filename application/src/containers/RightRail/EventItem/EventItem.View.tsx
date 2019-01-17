/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
// import { t } from 'i18next';
import { observer } from 'mobx-react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';
import { JuiIconography } from 'jui/foundation/Iconography';
import { ViewProps } from './types';

@observer
class EventItemView extends React.Component<ViewProps> {
  render() {
    const { text, createdTime } = this.props;
    return (
      <JuiListItem>
        <JuiListItemIcon>
          <span>
            <JuiIconography color="primary">event</JuiIconography>
          </span>
        </JuiListItemIcon>
        <JuiListItemText
          primary={text}
          secondary={
            <JuiListItemSecondaryText>
              <JuiListItemSecondarySpan text={createdTime} />
            </JuiListItemSecondaryText>
          }
        />
      </JuiListItem>
    );
  }
}

export { EventItemView };
