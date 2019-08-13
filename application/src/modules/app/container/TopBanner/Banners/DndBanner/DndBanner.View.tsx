/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-23 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */

import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { JuiSnackbarContent, JuiSnackbarAction } from 'jui/components/Snackbars';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { DndBannerViewProps } from './types';

type Props = DndBannerViewProps & WithTranslation;

@observer
class DndBannerViewComponent extends Component<Props> {
  render() {
    const { t, isShow, handleClose, handleUnblock } = this.props;
    return isShow && (
      <JuiSnackbarContent
        data-test-automation-id="dnd-top-banner"
        type={ToastType.ERROR}
        message={t('presence.prompt.topBannerInfoWhenDnd')}
        messageAlign="center"
        fullWidth
        action={[
          <JuiSnackbarAction
            key="unblock"
            onClick={handleUnblock}
            data-test-automation-id="dnd-top-banner-unblock"
          >
            {t('common.button.turnOff')}
          </JuiSnackbarAction>,
          <JuiSnackbarAction
            key="close"
            variant="icon"
            onClick={handleClose}
            data-test-automation-id="dnd-top-banner-close"
          >
            close
          </JuiSnackbarAction>,
        ]}
      />
    );
  }
}

const DndBannerView = withTranslation('translations')(DndBannerViewComponent);

export { DndBannerView };
