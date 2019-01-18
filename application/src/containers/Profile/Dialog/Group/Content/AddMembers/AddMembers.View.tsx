/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { Notification } from '@/containers/Notification';
import { ContactSearch } from '@/containers/ContactSearch';
import portalManager from '@/common/PortalManager';
import { errorHelper } from 'sdk/error';

import { ViewProps } from './types';

@observer
class AddMembers extends React.Component<ViewProps> {
  onClose = () => portalManager.dismiss();

  renderFlashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  handerAddTeam = async () => {
    const { addTeamMembers } = this.props;
    try {
      portalManager.dismiss();
      await addTeamMembers();
      return true;
    } catch (error) {
      if (errorHelper.isNotNetworkError(error)) {
        this.renderFlashToast('AddTeamMembersNetworkError');
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this.renderFlashToast('AddTeamMembersBackendError');
        return false;
      }
      throw error;
    }
  }

  render() {
    const {
      disabledOkBtn,
      handleSearchContactChange,
      isOffline,
      group,
    } = this.props;
    const { members } = group;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        okBtnProps={{ disabled: isOffline || disabledOkBtn }}
        title={t('AddTeamMembers')}
        onCancel={this.onClose}
        onOK={this.handerAddTeam}
        okText={t('Add')}
        cancelText={t('Cancel')}
      >
        <ContactSearch
          onSelectChange={handleSearchContactChange}
          label={t('Members')}
          error={false}
          helperText=""
          hasMembers={members}
          placeholder={t('Search Contact Placeholder')}
          isExcludeMe={true}
        />
      </JuiModal>
    );
  }
}

const AddMembersView = translate('translations')(AddMembers);
const AddMembersComponent = AddMembers;

export { AddMembersView, AddMembersComponent };
