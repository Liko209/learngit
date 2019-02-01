/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProgressActionsViewProps } from './types';
import { JuiActions } from 'jui/pattern/ConversationCard/Actions';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiCircularProgress } from 'jui/components/Progress/CircularProgress';
import i18next from 'i18next';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import { Dialog } from '@/containers/Dialog';

type Props = ProgressActionsViewProps & WithNamespaces;

@observer
class ProgressActionsViewComponent extends Component<Props> {
  private _deletePost = () => {
    const { deletePost } = this.props;
    Dialog.confirm({
      title: i18next.t('deletePostTitle'),
      content: i18next.t('deletePostContent'),
      okText: i18next.t('delete'),
      okType: 'negative',
      cancelText: i18next.t('Cancel'),
      async onOK() {
        try {
          await deletePost();
        } catch (e) {
          console.log(e);
        }
      },
    });
  }

  private _resendPost = async () => {
    try {
      await this.props.resend();
    } catch (e) {}
  }

  private _renderLoading = () => {
    const { postStatus } = this.props;
    if (postStatus === PROGRESS_STATUS.INPROGRESS) {
      return <JuiCircularProgress size={12} />;
    }
    return null;
  }

  private _renderResend = () => {
    const { postStatus, t } = this.props;
    if (postStatus === PROGRESS_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('resendPost')}
          onClick={this._resendPost}
          size="small"
          color="semantic.negative"
        >
          refresh
        </JuiIconButton>
      );
    }
    return null;
  }

  private _renderDelete = () => {
    const { postStatus, t } = this.props;
    if (postStatus === PROGRESS_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('deletePost')}
          onClick={this._deletePost}
          size="small"
        >
          delete
        </JuiIconButton>
      );
    }
    return null;
  }

  render() {
    return (
      <JuiActions>
        {this._renderLoading()}
        {this._renderResend()}
        {this._renderDelete()}
      </JuiActions>
    );
  }
}

const ProgressActionsView = translate('translations')(
  ProgressActionsViewComponent,
);

export { ProgressActionsView };
