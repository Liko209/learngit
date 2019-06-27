/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:52:30
 * Copyright © RingCentral. All rights reserved.
 */
import { withTranslation, WithTranslation } from 'react-i18next';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components/Menus';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { analyticsCollector } from '@/AnalyticsCollector';

import { DeleteViewProps } from './types';

type Props = DeleteViewProps & WithTranslation;

type State = {
  count: number;
};

@observer
class DeleteViewComponent extends Component<Props, State> {
  state = {
    count: 0,
  };

  async componentDidMount() {
    const count = await this.props.totalCount();
    this.setState({
      count,
    });
  }

  _handleClick = () => {
    const { t } = this.props;
    analyticsCollector.clearAllCallHistory();
    const dialog = Dialog.confirm({
      size: 'small',
      modalProps: {
        'data-test-automation-id': 'deleteAllCallLogConfirmDialog',
      },
      okBtnProps: { 'data-test-automation-id': 'deleteAllCallLogOkButton' },
      cancelBtnProps: {
        'data-test-automation-id': 'deleteAllCallLogCancelButton',
      },
      title: t('calllog.deleteAllCallHistory'),
      content: (
        <JuiDialogContentText>
          {t('calllog.doYouWanttoDeleteAllCallLog')}
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        dialog.startLoading();
        const result = await this.props.clearCallLog();
        dialog.stopLoading();
        return result ? true : false;
      },
    });
  }

  get _screenReader() {
    const { t } = this.props;
    return t('calllog.deleteCallHistory');
  }

  render() {
    const { count } = this.state;
    const { t } = this.props;

    return (
      <JuiMenuItem
        disabled={count === 0}
        key={'delete-all'}
        onClick={this._handleClick}
        aria-label={this._screenReader}
        data-test-automation-id={'delete-all-button'}
      >
        {t('calllog.deleteAllCallHistory')}
      </JuiMenuItem>
    );
  }
}

const DeleteAllView = withTranslation('translations')(DeleteViewComponent);

export { DeleteAllView };
