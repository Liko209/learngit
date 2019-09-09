/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { withEscTracking } from '@/containers/Dialog';
import { JuiModal } from 'jui/components/Dialog';
import { Avatar } from '@/containers/Avatar';
import {
  JuiEditProfileContent,
  JuiEditProfileSection,
  JuiEditProfileSectionContent,
  JuiEditProfileAvatarContent,
} from 'jui/pattern/EditProfile';
import portalManager from '@/common/PortalManager';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { withUploadFile } from 'jui/hoc/withUploadFile';
import { showNotImageTypeToast } from './utils';
import { PhotoEdit } from './PhotoEdit';
import {
  EditProfileViewModelProps,
  EditItemSourceType,
  EditProfileProps,
} from './types';
import { editItemSource } from './constant';

const Modal = withEscTracking(JuiModal);
@withUploadFile
class UploadArea extends Component<any> {
  render() {
    return <div />;
  }
}

@observer
class EditProfileViewComponent extends Component<
  EditProfileViewModelProps & EditProfileProps & WithTranslation
> {
  private _uploadRef: RefObject<any> = createRef();
  state = {
    currentFocusItem: '',
  };

  handleClose = () => portalManager.dismissLast();

  _renderSection = () => {
    return editItemSource.map(section => {
      return (
        <JuiEditProfileSection key={section[0].key}>
          {this._renderItem(section)}
        </JuiEditProfileSection>
      );
    });
  };

  private _showUploadFileDialog = () => {
    // for Edge bug: FIJI-2818
    setTimeout(() => {
      const ref = this._uploadRef.current;
      if (ref) {
        ref.showFileDialog();
      }
    }, 0);
  };

  handleFileChanged = async (files: FileList) => {
    if (!files) return;
    const file = files[0];
    if (!(await showNotImageTypeToast(file.type))) {
      return;
    }
    const { currentPersonInfo, onPhotoEdited } = this.props;
    PhotoEdit.show({
      onPhotoEdited,
      file,
      person: currentPersonInfo,
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

  _handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  handleMaskClick = () => this._showUploadFileDialog();

  _renderItem = (section: EditItemSourceType[]) => {
    const { t, isLoading } = this.props;
    return section.map(({ key, automationId, isLastItem, maxLength }) => {
      const errorKey = `${key}Error`;
      const isInError = this.props[errorKey];
      const { currentFocusItem } = this.state;
      return (
        <React.Fragment key={key}>
          <JuiTextField
            key={key}
            label={t(`people.profile.edit.${key}`)}
            InputProps={{
              endAdornment:
                currentFocusItem === key && this.props[key]
                  ? this._renderDeleteButton(key)
                  : null,
              inputProps: {
                maxLength,
              },
            }}
            disabled={isLoading}
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
        </React.Fragment>
      );
    });
  };
  render() {
    const {
      t,
      id,
      handleProfileEdit,
      homepageError,
      isLoading,
      localInfo,
    } = this.props;
    return (
      <Modal
        open
        size={'medium'}
        title={t('message.prompt.editProfileTitle')}
        onCancel={this.handleClose}
        onOK={handleProfileEdit}
        okBtnProps={{
          disabled: homepageError,
        }}
        loading={isLoading}
        okText={t('common.dialog.save')}
        cancelText={t('common.dialog.cancel')}
        modalProps={{
          'data-test-automation-id': 'EditProfile',
          scroll: 'body',
        }}
      >
        <UploadArea
          onFileChanged={this.handleFileChanged}
          multiple={false}
          ref={this._uploadRef}
          accept="image/*"
        />
        <JuiEditProfileContent>
          <JuiEditProfileAvatarContent
            imgStyle={{
              width: localInfo && localInfo.width,
              height: localInfo && localInfo.height,
              top: localInfo && localInfo.top,
              left: localInfo && localInfo.left,
              disabled: isLoading,
            }}
          >
            <Avatar
              uid={id}
              icon={localInfo && localInfo.url}
              mask
              size="xlarge"
              onClick={this.handleMaskClick}
              automationId="profileEditAvatar"
            />
          </JuiEditProfileAvatarContent>
          <JuiEditProfileSectionContent>
            {this._renderSection()}
          </JuiEditProfileSectionContent>
        </JuiEditProfileContent>
      </Modal>
    );
  }
}

const EditProfileView = withTranslation('translations')(
  EditProfileViewComponent,
);

export { EditProfileView };
