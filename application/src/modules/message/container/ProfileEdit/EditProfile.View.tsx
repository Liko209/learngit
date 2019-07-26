/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { Avatar } from '@/containers/Avatar';
import {
  JuiEditProfileContent,
  JuiEditProfileSection,
  JuiEditProfileSectionContent,
} from 'jui/pattern/EditProfile';
import portalManager from '@/common/PortalManager';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import {
  EditProfileViewModelProps,
  EditItemSourceType,
  EditProfileProps,
} from './types';
import { editItemSource } from './constant';

@observer
class EditProfileViewComponent extends Component<
  EditProfileViewModelProps & EditProfileProps & WithTranslation
> {
  state = {
    currentFocusItem: '',
  };

  handleClose = () => portalManager.dismissLast();

  _renderSection = () => {
    return editItemSource.map(section => {
      return (
        <JuiEditProfileSection>
          {this._renderItem(section)}
        </JuiEditProfileSection>
      );
    });
  };

  _handleChange = (key: EditItemSourceType['key']) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { updateInfo } = this.props;
    const value = event.target.value;
    updateInfo(key, value);
  };

  _updateFocusState = (key?: EditItemSourceType['key']) => () => {
    this.setState({
      currentFocusItem: key || '',
    });
  };

  _handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    // Prevents input loss of focus when button is clicked
    event.preventDefault();
  };

  _renderDeleteButton = (key: EditItemSourceType['key']) => {
    const { t, updateInfo } = this.props;
    return (
      <JuiIconButton
        onClick={() => updateInfo(key, '')}
        onMouseDown={this._handleMouseDown}
        tooltipTitle={t('common.remove')}
        variant={'plain'}
        ariaLabel={t('common.remove')}
      >
        remove
      </JuiIconButton>
    );
  };

  _renderItem = (section: EditItemSourceType[]) => {
    const { t } = this.props;
    return section.map(({ key, automationId, isLastItem, maxLength }) => {
      const errorKey = `${key}Error`;
      const isInError = this.props[errorKey];
      const { currentFocusItem } = this.state;
      return (
        <>
          <JuiTextField
            key={key}
            label={t(`people.profile.edit.${key}`)}
            InputProps={{
              endAdornment:
                currentFocusItem === key ? this._renderDeleteButton(key) : null,
              inputProps: {
                maxLength,
              },
            }}
            data-test-automation-id={automationId}
            value={this.props[key]}
            fullWidth
            error={isInError}
            helperText={isInError && t(`people.profile.edit.${errorKey}`)}
            onChange={this._handleChange(key)}
            onFocus={this._updateFocusState(key)}
            onBlur={this._updateFocusState()}
          />
          {isLastItem && <div />}
        </>
      );
    });
  };
  render() {
    const { t, id, handleProfileEdit, webpageError } = this.props;
    console.log('looper', id);
    return (
      <JuiModal
        open
        size={'medium'}
        title={t('message.prompt.editProfileTitle')}
        onCancel={this.handleClose}
        onOK={handleProfileEdit}
        okBtnProps={{
          disabled: webpageError,
        }}
        okText={t('common.dialog.save')}
        cancelText={t('common.dialog.cancel')}
        modalProps={{
          'data-test-automation-id': 'EditProfile',
        }}
      >
        <JuiEditProfileContent>
          <Avatar
            uid={id}
            mask
            size="xlarge"
            automationId="profileEditAvatar"
          />
          <JuiEditProfileSectionContent>
            {this._renderSection()}
          </JuiEditProfileSectionContent>
        </JuiEditProfileContent>
      </JuiModal>
    );
  }
}

const EditProfileView = withTranslation('translations')(
  EditProfileViewComponent,
);

export { EditProfileView };
