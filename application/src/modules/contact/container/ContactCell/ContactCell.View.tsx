/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-23 10:20:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Avatar } from '@/containers/Avatar';
import { JuiContactCell, JuiContactNameWrapper, JuiContactName } from 'jui/pattern/Contacts';
import { JuiListItemAvatar } from 'jui/components/Lists';
import { Profile, PROFILE_TYPE } from '@/modules/message/container/Profile';
import { MiniCard } from '@/modules/message/container/MiniCard';
import { ProfileDialogPerson } from '@/modules/message/container/Profile/Dialog/Person';
import { RuiTag } from 'rcui/components/Tag';
import { Dialog } from '@/containers/Dialog';
import { analyticsCollector } from '@/AnalyticsCollector';

import { Actions } from '../Actions';
import { ContactCellViewProps } from './types';
import { ContactType } from '../types';

type Props = WithTranslation & ContactCellViewProps;

@observer
class ContactCellViewComponent extends Component<Props> {
  openMiniProfile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { id } = this.props;
    event.stopPropagation();
    MiniCard.show(<Profile id={id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: event.target as HTMLElement,
    });
  };

  openProfile = () => {
    const { id, type } = this.props;
    analyticsCollector.profileDialog('person', type);
    Dialog.simple(<ProfileDialogPerson id={id} />, {
      size: 'medium',
      scroll: 'body',
    });
  };

  private get _avatar() {
    const { displayName, id } = this.props;

    return (
      <Avatar
        onClick={this.openMiniProfile}
        displayName={displayName}
        uid={id}
      />
    );
  }

  render() {
    const {
      displayName,
      isGuest,
      t,
      type,
      phoneNumber,
      isHover,
      onMouseOver,
      onMouseLeave,
      id,
      automationID,
    } = this.props;
    const primary = (
      <>
        <JuiContactName>{displayName}</JuiContactName>
        {isGuest ? (
          <RuiTag color="secondary" content={t('common.guest')} />
        ) : null}
      </>
    );

    return (
      <JuiContactCell
        button={false}
        onClick={this.openProfile}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        data-test-automation-id={automationID}
      >
        <JuiListItemAvatar>{this._avatar}</JuiListItemAvatar>
        <JuiContactNameWrapper primary={primary} />
        {isHover && (
          <Actions
            id={id}
            contactType={isGuest ? ContactType.guest : ContactType.company}
            phoneNumber={phoneNumber}
            entity={type}
          />
        )}
      </JuiContactCell>
    );
  }
}

const ContactCellView = withTranslation('translations')(
  ContactCellViewComponent,
);

export { ContactCellView };
