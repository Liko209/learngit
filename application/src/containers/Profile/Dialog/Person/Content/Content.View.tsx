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
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentSummaryStatus,
  JuiProfileDialogContentSummaryTitle,
  JuiProfileDialogContentForm,
  JuiProfileDialogContentGrid,
  JuiProfileDialogContentFormGroup,
  JuiProfileDialogContentFormLeft,
  JuiProfileDialogContentFormRight,
  JuiProfileDialogContentFormLabel,
  JuiProfileDialogContentFormValue,
  JuiProfileDialogContentFormCopy,
} from 'jui/pattern/Profile/Dialog';
// import { JuiGrid } from 'jui/foundation/Layout/Grid';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import copy from 'copy-to-clipboard';

const Summary = JuiProfileDialogContentSummary;
const Left = JuiProfileDialogContentSummaryLeft;
const Right = JuiProfileDialogContentSummaryRight;
const Name = JuiProfileDialogContentSummaryName;
const Status = JuiProfileDialogContentSummaryStatus;
const Title = JuiProfileDialogContentSummaryTitle;
const Buttons = JuiProfileDialogContentSummaryButtons;

const Form = JuiProfileDialogContentForm;
const Grid = JuiProfileDialogContentGrid;
const FormGroup = JuiProfileDialogContentFormGroup;
const FormLeft = JuiProfileDialogContentFormLeft;
const FormRight = JuiProfileDialogContentFormRight;
const FormLabel = JuiProfileDialogContentFormLabel;
const FormValue = JuiProfileDialogContentFormValue;
const FormCopy = JuiProfileDialogContentFormCopy;

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
        <JuiIconography fontSize="small">chat_bubble</JuiIconography>
        {t('message')}
      </JuiProfileDialogContentSummaryButton>
    );
  }

  renderIcon = (key: string) => {
    return <JuiIconography fontSize="small">{key}</JuiIconography>;
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
        {copy && (
          <FormCopy onClick={this.onClickCopy.bind(this, value)}>
            {this.renderIcon(ICON.COPY)}
          </FormCopy>
        )}
      </FormGroup>
    );
  }

  isMe = () => {
    const { id } = this.props;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return id === currentUserId;
  }

  render() {
    const { t, id, person, company, dismiss } = this.props;
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
              <FormGroup>
                <FormLeft>{this.renderIcon(ICON.EXT)}</FormLeft>
                <FormRight>
                  <FormLabel>Ext</FormLabel>
                  <FormValue emphasize={true}>6574-8544</FormValue>
                </FormRight>
              </FormGroup>
              <FormGroup>
                <FormLeft />
                <FormRight>
                  <FormLabel>Direct Number</FormLabel>
                  <FormValue emphasize={true}>953-455-5555</FormValue>
                </FormRight>
              </FormGroup>
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
        {/* <JuiDivider />
        <Form>
          <Grid container={true}>
            <Grid item={true} xs={12}>
              {person.linkedIn &&
                this.renderFormGroup({
                  icon: ICON.LINKED_IN,
                  label: t('location'),
                  value: person.linkedIn,
                })}
              {person.webpage &&
                this.renderFormGroup({
                  label: t('location'),
                  value: person.webpage,
                })}
            </Grid>
          </Grid>
        </Form> */}
      </>
    );
  }
}

const ProfileDialogPersonContentView = translate('translations')(
  ProfileDialogPersonContentViewComponent,
);

export { ProfileDialogPersonContentView };
