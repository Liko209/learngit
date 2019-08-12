/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:13
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
} from 'jui/components/Snackbars';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { CallSwitch } from '@/modules/telephony/container/CallSwitch';
import { ViewProps } from './types';
// import { JuiButton } from 'jui/components/Buttons';
import { toTitleCase } from '@/utils/string';

@observer
class SwitchCallBannerViewComponent extends React.Component<ViewProps> {
  private _openCallSwitch = () => {
    const { t, openCallSwitch, switchCall, displayName, reset } = this.props;
    openCallSwitch({
      title: t('telephony.switchCall.title'),
      content: <CallSwitch displayName={displayName} />,
      modalProps: { 'data-test-automation-id': 'callSwitchDialog' },
      okBtnProps: { 'data-test-automation-id': 'callSwitchOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'callSwitchCancelButton' },
      size: 'small',
      okText: toTitleCase(t('telephony.switchCall.switch')),
      cancelText: toTitleCase(t('telephony.switchCall.cancel')),
      onOK: switchCall,
      onCancel: reset,
    });
  };
  private _CallSwitch = () => {
    const { t } = this.props;
    return (
      <JuiSnackbarAction
        variant="text"
        onClick={this._openCallSwitch}
        color="action"
      >
        {t('common.prompt.switchCallAction')}
      </JuiSnackbarAction>
    );
  };
  render() {
    const { t, isShow } = this.props;
    return isShow ? (
      <JuiSnackbarContent
        type={ToastType.SUCCESS}
        message={t('common.prompt.switchCall')}
        messageAlign="center"
        action={this._CallSwitch()}
        fullWidth
      />
    ) : null;
  }
}

const SwitchCallBannerView = withTranslation()(SwitchCallBannerViewComponent);

export { SwitchCallBannerView };
