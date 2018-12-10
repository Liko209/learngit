/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  ProfileDialogPersonContentViewProps,
  FormGroupType,
  ICON,
} from './types';
import { JuiDivider } from 'jui/components/Divider';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import {
  JuiProfileDialogContentSummary as Summary,
  JuiProfileDialogContentSummaryLeft as Left,
  JuiProfileDialogContentSummaryRight as Right,
  JuiProfileDialogContentSummaryName as Name,
  JuiProfileDialogContentSummaryButtons as Buttons,
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentSummaryStatus as Status,
  JuiProfileDialogContentSummaryTitle as Title,
  JuiProfileDialogContentForm as Form,
  JuiProfileDialogContentGrid as Grid,
  JuiProfileDialogContentFormGroup as FormGroup,
  JuiProfileDialogContentFormLeft as FormLeft,
  JuiProfileDialogContentFormRight as FormRight,
  JuiProfileDialogContentFormLabel as FormLabel,
  JuiProfileDialogContentFormValue as FormValue,
  JuiProfileDialogContentFormCopy as FormCopy,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import copy from 'copy-to-clipboard';
import { PhoneNumberInfo } from 'sdk/service/person';
import { JuiIconButton } from 'jui/components/Buttons';

@observer
class ProfileDialogPersonContentViewComponent extends Component<
  WithNamespaces & ProfileDialogPersonContentViewProps
> {
  renderPresence = () => {
    const { id } = this.props;
    return <Presence uid={id} size="xlarge" borderSize="xlarge" />;
  }

  renderMessage = () => {
    const { t } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton>
        {this.renderIcon('chat_bubble')}
        {t('message')}
      </JuiProfileDialogContentSummaryButton>
    );
  }

  renderIcon = (key: string) => {
    return <JuiIconography fontSize="small">{key}</JuiIconography>;
  }

  renderCopy = (value: string) => {
    const { t } = this.props;
    return (
      <FormCopy>
        <JuiIconButton
          size="small"
          onClick={this.onClickCopy.bind(this, value)}
          tooltipTitle={t('copy')}
        >
          {ICON.COPY}
        </JuiIconButton>
      </FormCopy>
    );
  }

  onClickCopy = (value: string) => {
    copy(value);
  }

  renderFormGroup = ({
    icon,
    label,
    value,
    valueEmphasize = false,
    copy,
  }: FormGroupType) => {
    return (
      <FormGroup>
        <FormLeft>{icon && this.renderIcon(icon)}</FormLeft>
        <FormRight>
          <FormLabel>{label}</FormLabel>
          <FormValue emphasize={valueEmphasize}>{value}</FormValue>
        </FormRight>
        {copy && this.renderCopy(value)}
      </FormGroup>
    );
  }

  isMe = () => {
    const { id } = this.props;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return id === currentUserId;
  }

  render() {
    const {
      t,
      id,
      person,
      company,
      extensionNumbers,
      directNumbers,
      dismiss,
    } = this.props;
    return (
      <>
        <Summary emphasize={this.isMe()}>
          <Left>
            <Avatar uid={id} size="xlarge" presence={this.renderPresence()} />
          </Left>
          <Right>
            <Name>{person.userDisplayName}</Name>
            <Status>{person.awayStatus}</Status>
            <Title>{person.jobTitle}</Title>
            <Buttons>
              <Message id={id} dismiss={dismiss} render={this.renderMessage} />
            </Buttons>
          </Right>
        </Summary>
        <JuiDivider />
        <Form>
          <Grid container={true}>
            <Grid item={true} xs={12} sm={6}>
              {company.name &&
                this.renderFormGroup({
                  icon: ICON.COMPANY,
                  label: t('company'),
                  value: company.name,
                })}
              {person.location &&
                this.renderFormGroup({
                  icon: ICON.LOCATION,
                  label: t('location'),
                  value: person.location,
                })}
            </Grid>
            <Grid item={true} xs={12} sm={6}>
              {extensionNumbers.map((info: PhoneNumberInfo, index: number) => {
                return this.renderFormGroup({
                  icon: index === 0 ? ICON.EXT : undefined,
                  label: t('ext'),
                  value: info.phoneNumber,
                  valueEmphasize: true,
                  copy: true,
                });
              })}
              {directNumbers.map((info: PhoneNumberInfo, index: number) => {
                return this.renderFormGroup({
                  icon:
                    index === 0 && extensionNumbers.length === 0
                      ? ICON.EXT
                      : undefined,
                  label: t('directNumber'),
                  value: info.phoneNumber,
                  valueEmphasize: true,
                  copy: true,
                });
              })}
              {person.email &&
                this.renderFormGroup({
                  icon: ICON.EMAIL,
                  label: t('email'),
                  value: person.email,
                  valueEmphasize: true,
                  copy: true,
                })}
            </Grid>
          </Grid>
        </Form>
        {person.homepage && (
          <>
            <JuiDivider />
            <Form>
              <Grid container={true}>
                <Grid item={true} xs={12}>
                  {/* {person.linkedIn &&
                this.renderFormGroup({
                  icon: ICON.LINKED_IN,
                  label: t('location'),
                  value: person.linkedIn,
                })} */}
                  {person.homepage &&
                    this.renderFormGroup({
                      icon: ICON.LINKED_IN,
                      label: t('webpage'),
                      value: person.homepage,
                      copy: true,
                    })}
                </Grid>
              </Grid>
            </Form>
          </>
        )}
      </>
    );
  }
}

const ProfileDialogPersonContentView = translate('translations')(
  ProfileDialogPersonContentViewComponent,
);

export { ProfileDialogPersonContentView };
