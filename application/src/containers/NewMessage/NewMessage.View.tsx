/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:58
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef } from 'react';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiBottomText } from 'jui/pattern/ConvertToTeam';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { ContactAndGroupSearch, ContactSearch } from '@/containers/Downshift';
import { Notification } from '@/containers/Notification';
import { CreateTeam } from '@/containers/CreateTeam';
import { DialogContext, withEscTracking } from '@/containers/Dialog';
import { ViewProps } from './types';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { JuiCheckboxLabel } from 'jui/components/Checkbox';
import JuiLink from 'jui/components/Link';

type State = {
  message: string;
};
const Modal = withEscTracking(JuiModal);
const StyledSnackbarsContent = styled<any>(JuiSnackbarContent)`
  && {
    margin: 0 0 ${spacing(4)} 0;
  }
`;

type Props = ViewProps & WithTranslation;

@observer
class NewMessageComponent extends React.Component<Props, State> {
  static contextType = DialogContext;
  messageRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  componentDidMount() {
    // because of modal is dynamic append body
    // so must be delay focus
    this.focusTimer = setTimeout(() => {
      const node = this.messageRef.current;
      if (node) {
        node.focus();
      }
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }

  sendNewMessage = async () => {
    const { message } = this.state;
    const { newMessage } = this.props;
    newMessage(message);
    this.onClose();
  };

  onClose = () => this.context();

  openCreateTeam = () => {
    this.onClose();
    CreateTeam.show();
  };

  handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: e.target.value });
  };

  renderFailError() {
    const message = 'message.prompt.SorryWeWereNotAbleToSendTheMessage';
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
      t,
      emailError,
      emailErrorMsg,
      disabledOkBtn,
      handleSearchContactChange,
      serverError,
      errorEmail,
      errorUnknown,
      canMentionTeam,
    } = this.props;
    if (errorUnknown) {
      this.renderFailError();
    }
    return (
      <Modal
        modalProps={{
          classes: {
            paper: 'overflow-y',
          },
          scroll: 'body',
        }}
        open
        size={'medium'}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={t('message.prompt.NewMessage')}
        onCancel={this.onClose}
        onOK={this.sendNewMessage}
        okText={t('common.dialog.send')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              {t('message.prompt.NewMessageError')}
            </StyledSnackbarsContent>
          )
        }
        cancelText={t('common.dialog.cancel')}
      >
        {// temporary: ContactAndGroupSearch contain group and person
        canMentionTeam ? (
          <ContactAndGroupSearch
            onSelectChange={handleSearchContactChange}
            label={t('people.team.Members')}
            placeholder={t('people.team.SearchContactPlaceholder')}
            error={emailError}
            helperText={emailError ? t(emailErrorMsg) : ''}
            errorEmail={errorEmail}
            messageRef={this.messageRef}
            multiple
            autoSwitchEmail
          />
        ) : (
          <ContactSearch
            onSelectChange={handleSearchContactChange}
            label={t('people.team.Members')}
            placeholder={t('people.team.SearchContactPlaceholder')}
            error={emailError}
            helperText={emailError ? t(emailErrorMsg) : ''}
            errorEmail={errorEmail}
            messageRef={this.messageRef}
            multiple
            autoSwitchEmail
          />
        )}
        <JuiTextarea
          id={t('message.action.typeNewMessage')}
          label={t('message.action.typeNewMessage')}
          fullWidth
          inputProps={{
            maxLength: 10000,
          }}
          onChange={this.handleMessageChange}
          data-test-automation-id="newMessageTextarea"
        />
        {canMentionTeam && (
          <JuiCheckboxLabel
            checked={this.props.isDirectMessage}
            label={t('message.prompt.newMessageDirectlyTip')}
            handleChange={this.props.handleCheckboxChange}
          />
        )}
        <JuiBottomText>
          <Trans
            i18nKey="message.prompt.newMessageTip"
            components={[
              <JuiLink handleOnClick={this.openCreateTeam}>
                create a Team
              </JuiLink>,
            ]}
          />
        </JuiBottomText>
      </Modal>
    );
  }
}

const NewMessageView = withTranslation('translations')(NewMessageComponent);

// const NewMessageComponent = NewMessageView;

export { NewMessageView, NewMessageComponent };
