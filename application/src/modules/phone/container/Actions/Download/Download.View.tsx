/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import { DownloadViewProps } from './types';

type Props = DownloadViewProps & WithTranslation;

const DOWNLOAD_ID = 'downloadTag';

@observer
class DownloadViewComponent extends Component<Props> {
  _handleClick = async () => {
    const { getUri, tabName } = this.props;
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.DOWNLOAD);
    const downloadLink = await getUri();
    const aLinkDom = document.getElementById(DOWNLOAD_ID);
    if (!aLinkDom) {
      return;
    }
    aLinkDom.setAttribute('href', downloadLink);
    aLinkDom.click();
  }

  render() {
    const { t, type, entity } = this.props;
    return (
      <>
        <a id={DOWNLOAD_ID} download={true} />
        <ActionButton
          key="voicemail-download"
          icon="download-call"
          type={type}
          onClick={this._handleClick}
          screenReader={t('voicemail.downloadVoicemail')}
          tooltip={t('common.download')}
          automationId={`${entity}-download-button`}
        />
      </>
    );
  }
}

const DownloadView = withTranslation('translations')(DownloadViewComponent);

export { DownloadView };
