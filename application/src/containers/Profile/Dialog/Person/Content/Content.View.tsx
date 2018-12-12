/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogPersonContentViewProps, FormGroupType } from './types';
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
  JuiProfileDialogContentFormEmail as FormEmail,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
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

  getAriaLabelKey = () => {
    const { isMe } = this.props;
    return isMe ? 'ariaGoToMe' : 'ariaGoToOther';
  }

  renderMessage = () => {
    const { t, person } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton
        tabIndex={0}
        aria-label={t(this.getAriaLabelKey(), { name: person.userDisplayName })}
      >
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
          file_copy
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

  renderEmail(value: string) {
    const html = `<a href="mailto:${value}">${value}</a>`;
    return <FormEmail dangerouslySetInnerHTML={{ __html: html }} />;
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
      isMe,
    } = this.props;
    return (
      <>
        <Summary emphasize={isMe}>
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
                  icon: 'work',
                  label: t('company'),
                  value: company.name,
                })}
              {person.location &&
                this.renderFormGroup({
                  icon: 'places',
                  label: t('location'),
                  value: person.location,
                })}
            </Grid>
            <Grid item={true} xs={12} sm={6}>
              {extensionNumbers.map((info: PhoneNumberInfo, index: number) => {
                return this.renderFormGroup({
                  icon: index === 0 ? 'call' : undefined,
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
                      ? 'call'
                      : undefined,
                  label: t('directNumber'),
                  value: info.phoneNumber,
                  valueEmphasize: true,
                  copy: true,
                });
              })}
              {person.email &&
                this.renderFormGroup({
                  icon: 'email',
                  label: t('email'),
                  value: this.renderEmail(person.email),
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
                  icon: 'link',
                  label: t('location'),
                  value: person.linkedIn,
                })} */}
                  {person.homepage &&
                    this.renderFormGroup({
                      icon: 'link',
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
