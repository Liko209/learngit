/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
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
import { ViewProps } from './types';

type State = {
  message: string;
};

type NewMessageProps = WithNamespaces & ViewProps;

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
class NewMessage extends React.Component<NewMessageProps, State> {
  constructor(props: NewMessageProps) {
    super(props);
    this.state = {
      message: '',
    };
  }

  sendNewMessage = async () => {
    const { message } = this.state;
    const { newMessage } = this.props;
    newMessage(message);
  }

  onClose = () => {
    const { updateNewMessageDialogState, inputReset } = this.props;
    updateNewMessageDialogState();
    inputReset();
  }

  handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: e.target.value });
  }

  renderFailError() {
    const message = 'SorryWeWereNotAbleToSendTheMessage';
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  render() {
    const {
      t,
      isOpen,
      emailError,
      emailErrorMsg,
      disabledOkBtn,
      handleSearchContactChange,
      updateCreateTeamDialogState,
      isOffline,
      serverError,
      errorEmail,
      errorUnknown,
    } = this.props;
    if (errorUnknown) {
      this.renderFailError();
    }
    return (
      <JuiModal
        open={isOpen}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: isOffline || disabledOkBtn }}
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
            onClick={updateCreateTeamDialogState}
          />
        </StyledTextWithLink>
      </JuiModal>
    );
  }
}

const NewMessageView = translate('team')(withRouter(NewMessage));
const NewMessageComponent = NewMessage;

export { NewMessageView, NewMessageComponent };
