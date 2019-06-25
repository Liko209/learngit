/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:52:30
 * Copyright © RingCentral. All rights reserved.
 */
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components/Menus';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';

import { DeleteViewProps } from './types';

type Props = DeleteViewProps & WithTranslation;

@observer
class DeleteViewComponent extends Component<Props> {
  _handleClick = () => {
    const { t } = this.props;
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteCallLogConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteCallLogOkButton' },
      cancelBtnProps: {
        'data-test-automation-id': 'deleteCallLogCancelButton',
      },
      title: t('calllog.deleteCallLog'),
      content: (
        <JuiDialogContentText>
          <Trans i18nKey="calllog.doYouWanttoDeleteThisCallLog" />
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        await this.props.clearCallLog();
      },
    });
  }

  get _tooltip() {
    const { t } = this.props;
    return t('calllog.deleteCallHistory');
  }

  get _screenReader() {
    const { t } = this.props;
    return t('calllog.deleteCallHistory');
  }

  render() {
    const { entity, listHandler } = this.props;
    console.log(listHandler, '---nello');
    return (
      <JuiMenuItem
        key={`${entity}-delete`}
        onClick={this._handleClick}
        aria-label={this._screenReader}
        data-test-automation-id={`${entity}-delete-button`}
      >
        {this._screenReader}
      </JuiMenuItem>
    );
  }
}

const DeleteAllView = withTranslation('translations')(DeleteViewComponent);

export { DeleteAllView };
