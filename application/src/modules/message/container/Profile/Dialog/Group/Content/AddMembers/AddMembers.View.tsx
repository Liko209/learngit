/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { withEscTracking } from '@/containers/Dialog';
import { JuiModal } from 'jui/components/Dialog';
import { ContactSearch } from '@/containers/Downshift/ContactSearch';
import portalManager from '@/common/PortalManager';
import { catchError } from '@/common/catchError';

import { ViewProps } from './types';

const Modal = withEscTracking(JuiModal);
@observer
class AddMembers extends React.Component<ViewProps> {
  handleClose = () => portalManager.dismissLast();

  @catchError.flash({
    network: 'people.prompt.AddTeamMembersNetworkError',
    server: 'people.prompt.AddTeamMembersBackendError',
  })
  handleAddTeam = async () => {
    const { addTeamMembers } = this.props;
    portalManager.dismissLast();
    await addTeamMembers();
    return true;
  };

  render() {
    const { t, disabledOkBtn, handleSearchContactChange, group } = this.props;
    const { members } = group;
    return (
      <Modal
        open
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
          scroll: 'body',
        }}
      >
        <ContactSearch
          onSelectChange={handleSearchContactChange}
          label={t('people.team.Members')}
          error={false}
          helperText=""
          hasMembers={members}
          placeholder={t('people.team.SearchContactPlaceholder')}
          isExcludeMe
          multiple
          autoSwitchEmail
          autoFocus
        />
      </Modal>
    );
  }
}

const AddMembersView = withTranslation('translations')(AddMembers);
const AddMembersComponent = AddMembers;

export { AddMembersView, AddMembersComponent };
