/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Markdown } from 'glipdown';
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
  JuiProfileDialogContentFormLink as FormLink,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import copy from 'copy-to-clipboard';
import { PhoneNumberInfo } from 'sdk/module/person/entity';
import { JuiIconButton } from 'jui/components/Buttons';
import portalManager from '@/common/PortalManager';
import { Call } from '@/modules/telephony';

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
    return isMe ? 'people.profile.ariaGoToMe' : 'people.profile.ariaGoToOther';
  }

  renderMessage = () => {
    const { t, person } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton
        tabIndex={0}
        aria-label={t(this.getAriaLabelKey(), { name: person.userDisplayName })}
      >
        {this.renderIcon('chat_bubble')}
        {t('message.message')}
      </JuiProfileDialogContentSummaryButton>
    );
  }

  renderIcon = (key: string) => {
    return <JuiIconography iconSize="small">{key}</JuiIconography>;
  }

  renderIcons = (value: string, aria?: string, showCall?: boolean) => {
    const { t, id } = this.props;
    return (
      <FormCopy>
        {showCall && <Call phone={value} size="small" id={id} />}
        <JuiIconButton
          size="small"
          onClick={this.onClickCopy.bind(this, value)}
          tooltipTitle={t('common.copy')}
          ariaLabel={t('common.ariaCopy', {
            value: aria || value,
          })}
        >
          copy
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
    copyAria,
    copyValue,
    showCall,
  }: FormGroupType) => {
    return (
      <FormGroup key={value}>
        <FormLeft>{icon && this.renderIcon(icon)}</FormLeft>
        <FormRight>
          <FormLabel>{label}</FormLabel>
          <FormValue emphasize={valueEmphasize}>{value}</FormValue>
        </FormRight>
        {copyValue && this.renderIcons(copyValue, copyAria, showCall)}
      </FormGroup>
    );
  }

  renderEmail(value: string) {
    const html = `<a href="mailto:${value}">${value}</a>`;
    return <FormLink dangerouslySetInnerHTML={{ __html: html }} />;
  }

  renderHomepage(value: string) {
    const html = Markdown(value);
    return <FormLink dangerouslySetInnerHTML={{ __html: html }} />;
  }

  messageAfterClick = () => portalManager.dismissLast();

  render() {
    const {
      t,
      id,
      person,
      company,
      extensionNumbers,
      directNumbers,
      isMe,
    } = this.props;
    return (
      <>
        <Summary
          emphasize={isMe}
          data-test-automation-id="profileDialogSummary"
        >
          <Left>
            <Avatar
              uid={id}
              size="xlarge"
              presence={this.renderPresence()}
              automationId="profileAvatar"
            />
          </Left>
          <Right>
            <Name data-test-automation-id="profileDialogSummaryName">
              {person.userDisplayName}
            </Name>
            <Status data-test-automation-id="profileDialogSummaryStatus">
              {person.awayStatus}
            </Status>
            <Title data-test-automation-id="profileDialogSummaryTitle">
              {person.jobTitle}
            </Title>
            <Buttons>
              <Message
                id={id}
                afterClick={this.messageAfterClick}
                render={this.renderMessage}
              />
            </Buttons>
          </Right>
        </Summary>
        <JuiDivider />
        <Form data-test-automation-id="profileDialogForm">
          <Grid container={true}>
            <Grid item={true} xs={12} sm={6}>
              {company.name &&
                this.renderFormGroup({
                  icon: 'work',
                  label: t('people.profile.company'),
                  value: company.name,
                })}
              {person.location &&
                this.renderFormGroup({
                  icon: 'location',
                  label: t('people.profile.location'),
                  value: person.location,
                })}
            </Grid>
            <Grid item={true} xs={12} sm={6}>
              {extensionNumbers.map((info: PhoneNumberInfo, index: number) => {
                return this.renderFormGroup({
                  icon: index === 0 ? 'call' : undefined,
                  label: t('people.profile.extensionNumber'),
                  value: info.phoneNumber,
                  valueEmphasize: true,
                  copyAria: t('people.profile.ariaExtensionNumber'),
                  copyValue: info.phoneNumber,
                  showCall: true,
                });
              })}
              {directNumbers.map((info: PhoneNumberInfo, index: number) => {
                return this.renderFormGroup({
                  icon:
                    index === 0 && extensionNumbers.length === 0
                      ? 'call'
                      : undefined,
                  label: t('people.profile.directNumber'),
                  value: info.phoneNumber,
                  valueEmphasize: true,
                  copyAria: t('people.profile.ariaDirectNumber'),
                  copyValue: info.phoneNumber,
                  showCall: true,
                });
              })}
              {person.email &&
                this.renderFormGroup({
                  icon: 'email',
                  label: t('people.profile.email'),
                  value: this.renderEmail(person.email),
                  valueEmphasize: true,
                  copyAria: t('people.profile.ariaEmail'),
                  copyValue: person.email,
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
                  label: t('people.profile.linkedIn'),
                  value: person.linkedIn,
                })} */}
                  {person.homepage &&
                    this.renderFormGroup({
                      icon: 'link',
                      label: t('people.profile.webpage'),
                      value: this.renderHomepage(person.homepage),
                      copyAria: t('people.profile.ariaWebpage'),
                      copyValue: person.homepage,
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
