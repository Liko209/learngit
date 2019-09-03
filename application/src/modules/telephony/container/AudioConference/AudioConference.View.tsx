/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-21 14:17:24
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import portalManager from '@/common/PortalManager';
import { AudioConferenceViewProps, AudioConferenceProps } from './types';
import { JuiProfileDialogContentSummaryButton } from 'jui/pattern/Profile/Dialog';
import { JuiIconography } from 'jui/foundation/Iconography';

type Props = WithTranslation & AudioConferenceViewProps & AudioConferenceProps;

@observer
class AudioConferenceViewComponent extends Component<Props> {
  private _handleClick = async (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const { onClick, startAudioConference, onConferenceSuccess } = this.props;
    if (onClick) {
      onClick();
    } else if (!portalManager.profilePortalIsShow) {
      portalManager.dismissLast();
    }
    portalManager.addShouldCloseStatus();
    const isConferenceSuccess = await startAudioConference();
    isConferenceSuccess && onConferenceSuccess && onConferenceSuccess();
  };

  render() {
    const { t, size, variant, color, showIcon } = this.props;

    if (!showIcon.get()) {
      return null;
    }

    const tip = t('phone.startConference');
    if (variant === 'text') {
      return (
        <JuiProfileDialogContentSummaryButton
          aria-label={tip}
          tabIndex={0}
          onClick={this._handleClick}
        >
          <JuiIconography iconSize="medium">conference</JuiIconography>
          {tip}
        </JuiProfileDialogContentSummaryButton>
      );
    }

    return (
      <JuiIconButton
        size={size ? size : 'medium'}
        onClick={this._handleClick}
        tooltipTitle={tip}
        ariaLabel={tip}
        variant={variant}
        color={color}
        data-test-automation-id="audio-conference-btn"
      >
        conference
      </JuiIconButton>
    );
  }
}

const AudioConferenceView = withTranslation('translations')(
  AudioConferenceViewComponent,
);

export { AudioConferenceView };
