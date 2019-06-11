/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiActionIconWrapper } from 'jui/pattern/Phone/VoicemailItem';
import { DownloadViewProps, BUTTON_TYPE } from './types';

type Props = DownloadViewProps & WithTranslation;

const DOWNLOAD_ID = 'downloadTag';

@observer
class DownloadViewComponent extends Component<Props> {
  _handleClick = async () => {
    const { getUri, hookAfterClick } = this.props;
    const downloadLink = await getUri();
    const aLinkDom = document.getElementById(DOWNLOAD_ID);
    if (!aLinkDom) {
      return;
    }
    aLinkDom.setAttribute('href', downloadLink);
    aLinkDom.click();
    hookAfterClick && hookAfterClick();
  }

  render() {
    const { t, type } = this.props;
    if (type === BUTTON_TYPE.ICON) {
      return (
        <JuiActionIconWrapper>
          <a id={DOWNLOAD_ID} download={true} />
          <JuiIconButton
            color="common.white"
            variant="round"
            autoFocus={false}
            size="small"
            key="voicemail-download"
            data-test-automation-id="voicemail-download-button"
            ariaLabel={t('voicemail.downloadVoicemail')}
            tooltipTitle={t('common.download')}
            onClick={this._handleClick}
          >
            download
          </JuiIconButton>
        </JuiActionIconWrapper>
      );
    }
    return (
      <>
        <a id={DOWNLOAD_ID} download={true} />
        <JuiMenuItem
          icon="download"
          data-test-automation-id="voicemail-download-button"
          aria-label={t('voicemail.downloadVoicemail')}
          onClick={this._handleClick}
        >
          {t('voicemail.downloadVoicemail')}
        </JuiMenuItem>
      </>
    );
  }
}

const DownloadView = withTranslation('translations')(DownloadViewComponent);

export { DownloadView };
