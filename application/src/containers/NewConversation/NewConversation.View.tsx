/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-19 13:35:11
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import { observer } from 'mobx-react';
import { withEscTracking } from '@/containers/Dialog';
import { JuiModal } from 'jui/components/Dialog';
import { ContactSearch } from '@/containers/Downshift';
import { Props, ViewProps } from './types';
import { JuiTopText } from 'jui/pattern/ConvertToTeam';
import { ConvertToTeam } from '@/containers/ConvertToTeam';
import JuiLink from 'jui/components/Link';
import { Loading } from 'jui/hoc/withLoading';
import { newConversation, newConversationAction } from './dataTrackings';

type NewConversationProps = Props & ViewProps & WithTranslation;
const Modal = withEscTracking(JuiModal);
@observer
class NewConversationComponent extends React.Component<NewConversationProps> {
  constructor(props: NewConversationProps) {
    super(props);
    newConversation();
  }

  private _openConvertToTeam = () => {
    newConversationAction('convertToTeam');
    const { group, handleClose } = this.props;
    handleClose();
    ConvertToTeam.show({ id: group.id });
  };

  handleCancel = () => {
    newConversationAction('cancel');
    const { handleClose } = this.props;
    handleClose();
  };

  render() {
    const {
      t,
      disabledOkBtn,
      handleSearchContactChange,
      createNewConversation,
      group,
      loading,
    } = this.props;
    const { members } = group;
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
        title={t('people.prompt.newConversationTitle')}
        onCancel={this.handleCancel}
        onOK={createNewConversation}
        okText={t('common.dialog.create')}
        cancelText={t('common.dialog.cancel')}
        disableEscapeKeyDown={loading}
      >
        <Loading loading={loading} alwaysComponentShow delay={0}>
          <JuiTopText data-test-automation-id="newConversationDescription">
            {t('people.prompt.newConversationBaseTip')}
            {members.length > 2 ? (
              <>
                &nbsp;
                <Trans
                  defaults={t('people.prompt.newConversationGroupTip')}
                  components={[
                    <JuiLink handleOnClick={this._openConvertToTeam}>
                      convert to a team
                    </JuiLink>,
                  ]}
                />
              </>
            ) : null}
          </JuiTopText>
          <ContactSearch
            onSelectChange={handleSearchContactChange}
            label={t('people.team.Members')}
            prefillMembers={members}
            error={false}
            helperText=""
            placeholder={t('people.team.SearchContactPlaceholder')}
            isExcludeMe
            multiple
            autoSwitchEmail
            autoFocus
          />
        </Loading>
      </Modal>
    );
  }
}

const NewConversationView = withTranslation('translations')(
  NewConversationComponent,
);

export { NewConversationView };
