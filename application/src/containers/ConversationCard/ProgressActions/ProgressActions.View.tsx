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
  timer: NodeJS.Timer;
  state: States = {
    postStatus: POST_STATUS.SUCCESS,
  };

  delete = () => {
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

  resend = async () => {
    try {
      await this.props.resend();
    } catch (e) {}
  }

  renderLoading = () => {
    const { postStatus } = this.state;
    if (postStatus === POST_STATUS.INPROGRESS) {
      return <JuiCircularProgress size={12} />;
    }
    return null;
  }

  renderResend = () => {
    const { postStatus } = this.state;
    const { t } = this.props;
    if (postStatus === POST_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('resendPost')}
          onClick={this.resend}
          size="small"
          color="semantic.negative"
        >
          refresh
        </JuiIconButton>
      );
    }
    return null;
  }

  renderDelete = () => {
    const { postStatus } = this.state;
    const { t } = this.props;
    if (postStatus === POST_STATUS.FAIL) {
      return (
        <JuiIconButton
          variant="plain"
          tooltipTitle={t('deletePost')}
          onClick={this.delete}
          size="small"
        >
          delete
        </JuiIconButton>
      );
    }
    return null;
  }

  setPostStatus = () => {
    const { status } = this.props.post;
    clearTimeout(this.timer);
    if (status === POST_STATUS.INPROGRESS) {
      this.timer = setTimeout(() => {
        this.setState({ postStatus: status });
      },                      500);
    } else {
      this.setState({ postStatus: status });
    }
  }

  componentDidUpdate() {
    if (this.props.post.status !== this.state.postStatus) {
      this.setPostStatus();
    }
  }

  componentDidMount() {
    this.setPostStatus();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    return (
      <JuiActions>
        {this.renderLoading()}
        {this.renderResend()}
        {this.renderDelete()}
      </JuiActions>
    );
  }
}

const ProgressActionsView = translate('Conversations')(
  ProgressActionsViewComponent,
);

export { ProgressActionsView };
