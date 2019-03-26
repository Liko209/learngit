/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { Notification } from '@/containers/Notification';
import { ContactSearch } from '@/containers/ContactSearch';
import portalManager from '@/common/PortalManager';
import { errorHelper } from 'sdk/error';
import { generalErrorHandler } from '@/utils/error';

import { ViewProps } from './types';

@observer
class AddMembers extends React.Component<ViewProps> {
  handleClose = () => portalManager.dismissLast();

  renderFlashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  handleAddTeam = async () => {
    const { addTeamMembers } = this.props;
    try {
      portalManager.dismissLast();
      await addTeamMembers();
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this.renderFlashToast('people.prompt.AddTeamMembersNetworkError');
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this.renderFlashToast('people.prompt.AddTeamMembersBackendError');
        return false;
      }
      generalErrorHandler(error);
      return false;
    }
  }

  render() {
    const { t, disabledOkBtn, handleSearchContactChange, group } = this.props;
    const { members } = group;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={t('people.team.AddTeamMembersTitle')}
        onCancel={this.handleClose}
        onOK={this.handleAddTeam}
        okText={t('people.team.addTeamMemberSubmit')}
        cancelText={t('common.dialog.cancel')}
        modalProps={{
          classes: {
            paper: 'overflow-y',
          },
        }}
      >
        <ContactSearch
          onSelectChange={handleSearchContactChange}
          label={t('people.team.Members')}
          error={false}
          helperText=""
          hasMembers={members}
          placeholder={t('people.team.SearchContactPlaceholder')}
          isExcludeMe={true}
        />
      </JuiModal>
    );
  }
}

const AddMembersView = translate('translations')(AddMembers);
const AddMembersComponent = AddMembers;

export { AddMembersView, AddMembersComponent };
