/*
 * @Author: cooper.ruan
 * @Date: 2019-07-29 10:53:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { MeetingViewProps, MeetingProps } from './types';

type Props = WithTranslation & MeetingViewProps & MeetingProps;

@observer
class MeetingViewComponent extends Component<Props> {
  private _handleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const { startMeeting } = this.props;
    startMeeting();
  };

  render() {
    const { t, size, variant, showIcon } = this.props;

    if (!showIcon.get()) {
      return null;
    }

    return (
      <JuiIconButton
        size={size ? size : 'medium'}
        onClick={this._handleClick}
        tooltipTitle={t('meeting.Meetings')}
        variant={variant || 'round'}
        data-test-automation-id="rcv-meeting-btn"
      >
        videocam
      </JuiIconButton>
    );
  }
}

const MeetingView = withTranslation('translations')(MeetingViewComponent);

export { MeetingView };
