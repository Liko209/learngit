/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ProgressActionsViewProps } from './types';
import { JuiActions } from 'jui/pattern/ConversationCard/Actions';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import { Dialog } from '@/containers/Dialog';
import { mainLogger } from 'foundation/log';

type Props = ProgressActionsViewProps & WithTranslation;

@observer
class ProgressActionsViewComponent extends Component<Props> {
  private _deletePost = () => {
    const { deletePost, t } = this.props;
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'progressActionsConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'progressActionsOkButton' },
      cancelBtnProps: {
        'data-test-automation-id': 'progressActionsCancelButton',
      },
      title: t('message.prompt.deletePostTitle'),
      content: t('message.prompt.deletePostContent'),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      async onOK() {
        try {
          await deletePost();
        } catch (e) {
          mainLogger.error(e);
        }
      },
    });
  };

  private _editPost = async () => {
    try {
      await this.props.edit();
    } catch (e) {
      mainLogger.error(e);
    }
  };

  private _resendPost = async () => {
    try {
      await this.props.resend();
    } catch (e) {
      mainLogger.error(e);
    }
  };

  private _renderLoading = () => {
    const { postStatus } = this.props;
    if (postStatus === PROGRESS_STATUS.INPROGRESS) {
      return <RuiCircularProgress size={12} />;
    }
    return null;
  };

  private _renderResend = () => {
    const { postStatus, t } = this.props;
    if (postStatus === PROGRESS_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('message.action.resendPost')}
          onClick={this._resendPost}
          size="small"
          color="semantic.negative"
        >
          refresh
        </JuiIconButton>
      );
    }
    return null;
  };

  private _renderEdit = () => {
    const { postStatus, t, showEditAction } = this.props;
    if (postStatus === PROGRESS_STATUS.FAIL && showEditAction) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('message.action.editPost')}
          onClick={this._editPost}
          size="small"
        >
          edit
        </JuiIconButton>
      );
    }
    return null;
  };

  private _renderDelete = () => {
    const { postStatus, t } = this.props;
    if (postStatus === PROGRESS_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('message.action.deletePost')}
          onClick={this._deletePost}
          size="small"
        >
          delete
        </JuiIconButton>
      );
    }
    return null;
  };

  render() {
    return !this.props.inEditProcess ? (
      <JuiActions>
        {this._renderLoading()}
        {this._renderResend()}
        {this._renderEdit()}
        {this._renderDelete()}
      </JuiActions>
    ) : null;
  }
}

const ProgressActionsView = withTranslation('translations')(
  ProgressActionsViewComponent,
);

export { ProgressActionsView };
