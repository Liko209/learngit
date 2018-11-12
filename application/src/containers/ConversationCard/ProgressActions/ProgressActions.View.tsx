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

@observer
class ProgressActionsViewComponent extends Component<Props> {
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

  render() {
    const { t, post } = this.props;
    const { status = POST_STATUS.SUCCESS } = post;
    return (
      <JuiActions>
        {status === POST_STATUS.INPROGRESS && <JuiCircularProgress size={12} />}
        {status === POST_STATUS.FAIL && (
          <JuiIconButton
            variant="plain"
            tooltipTitle={t('resendPost')}
            onClick={this.resend}
            size="small"
            color="semantic.negative"
          >
            refresh
          </JuiIconButton>
        )}
        {status === POST_STATUS.FAIL && (
          <JuiIconButton
            variant="plain"
            tooltipTitle={t('deletePost')}
            onClick={this.delete}
            size="small"
          >
            delete
          </JuiIconButton>
        )}
      </JuiActions>
    );
  }
}

const ProgressActionsView = translate('Conversations')(
  ProgressActionsViewComponent,
);

export { ProgressActionsView };
