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

import { POST_STATUS } from 'sdk/service';
import { JuiModal } from '@/containers/Dialog';

type Props = ProgressActionsViewProps & WithNamespaces;
type States = {
  postStatus?: POST_STATUS;
};

@observer
class ProgressActionsViewComponent extends Component<Props, States> {
  state: States = {
    postStatus: POST_STATUS.SUCCESS,
  };
  private _timer: NodeJS.Timer;

  private _deletePost = () => {
    const { deletePost, t } = this.props;
    JuiModal.confirm({
      title: t('deletePostTitle'),
      content: t('deletePostContent'),
      okText: t('deletePostOk'),
      cancelText: t('deletePostCancel'),
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
    const { postStatus } = this.state;
    if (postStatus === POST_STATUS.INPROGRESS) {
      return <JuiCircularProgress size={12} />;
    }
    return null;
  }

  private _renderResend = () => {
    const { postStatus } = this.state;
    const { t } = this.props;
    if (postStatus === POST_STATUS.FAIL) {
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
    const { postStatus } = this.state;
    const { t } = this.props;
    if (postStatus === POST_STATUS.FAIL) {
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

  private _setPostStatus = () => {
    const { status } = this.props.post;
    clearTimeout(this._timer);
    if (status === POST_STATUS.INPROGRESS) {
      this._timer = setTimeout(() => {
        this.setState({ postStatus: status });
      },                       500);
    } else {
      this.setState({ postStatus: status });
    }
  }

  componentDidUpdate() {
    if (this.props.post.status !== this.state.postStatus) {
      this._setPostStatus();
    }
  }

  componentDidMount() {
    this._setPostStatus();
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
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

const ProgressActionsView = translate('Conversations')(
  ProgressActionsViewComponent,
);

export { ProgressActionsView };
