/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiTextWithLink } from 'jui/components/TextWithLink';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { ContactSearch } from '@/containers/ContactSearch';
import { Notification } from '@/containers/Notification';
import { CreateTeam } from '@/containers/CreateTeam';
import portalManager from '@/common/PortalManager';
import { ViewProps } from './types';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type State = {
  message: string;
};

const StyledSnackbarsContent = styled<any>(JuiSnackbarContent)`
  && {
    margin: 0 0 ${spacing(4)} 0;
  }
`;

const StyledTextWithLink = styled.div`
  && {
    margin-top: ${spacing(4)};
  }
`;

@observer
class NewMessage extends React.Component<ViewProps, State> {
  constructor(props: ViewProps) {
    super(props);
    this.state = {
      message: '',
    };
  }

  sendNewMessage = async () => {
    const { message } = this.state;
    const { newMessage } = this.props;
    newMessage(message);
    this.onClose();
  }

  onClose = () => portalManager.dismiss();

  openCreateTeam = () => {
    this.onClose();
    CreateTeam.show();
  }

  handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: e.target.value });
  }

  renderFailError() {
    const message = 'SorryWeWereNotAbleToSendTheMessage';
    Notification.flashToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  render() {
    const {
      emailError,
      emailErrorMsg,
      disabledOkBtn,
      handleSearchContactChange,
      serverError,
      errorEmail,
      errorUnknown,
    } = this.props;
    if (errorUnknown) {
      this.renderFailError();
    }
    return (
      <JuiModal
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={t('New Message')}
        onCancel={this.onClose}
        onOK={this.sendNewMessage}
        okText={t('Send')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              {t('New Message Error')}
            </StyledSnackbarsContent>
          )
        }
        cancelText={t('Cancel')}
      >
        <ContactSearch
          onSelectChange={handleSearchContactChange}
          label={t('Members')}
          placeholder={t('Search Contact Placeholder')}
          error={emailError}
          helperText={emailError && t(emailErrorMsg)}
          errorEmail={errorEmail}
        />
        <JuiTextarea
          id={t('Type new message')}
          label={t('Type new message')}
          fullWidth={true}
          inputProps={{
            maxLength: 10000,
          }}
          onChange={this.handleMessageChange}
          data-test-automation-id="newMessageTextarea"
        />
        <StyledTextWithLink>
          <JuiTextWithLink
            text={t('newMessageTip')}
            linkText={t('newMessageTipLink')}
            onClick={this.openCreateTeam}
          />
        </StyledTextWithLink>
      </JuiModal>
    );
  }
}

const NewMessageView = withRouter(NewMessage);
const NewMessageComponent = NewMessage;

export { NewMessageView, NewMessageComponent };
