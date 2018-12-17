/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiGroupProfileBody,
  JuiGroupProfileMessageBtn,
} from 'jui/pattern/GroupTeamProfile';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Avatar } from '@/containers/Avatar';
import { ProfileHeaderViewProps } from './types';
import { goToConversation } from '@/common/goToConversation';
import { JuiIconography } from 'jui/foundation/Iconography';
import { accessHandler } from '../AccessHandler';
import { Presence } from '@/containers/Presence';

type Props = WithNamespaces & ProfileHeaderViewProps;
@observer
class ProfileBody extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  OnMessageClick = async () => {
    const { id, dismiss } = this.props;
    dismiss();
    await goToConversation(id);
  }
  private _presence = (id: number) => {
    return <Presence uid={id} borderSize="xlarge" size="xlarge" />;
  }
  render() {
    const {
      name,
      description,
      isShowMessageButton,
      id,
      type,
      awayStatus,
      jobTitle,
      isCurrentUser,
      isGroupOrTeam,
      isPerson,
      isGroup,
      t,
    } = this.props;
    const { goToMessageInfo } = accessHandler(type, name);
    let avatar;
    if (isGroupOrTeam) {
      avatar = <GroupAvatar cid={id} size="xlarge" />;
    } else if (isPerson) {
      avatar = <Avatar uid={id} presence={this._presence(id)} size="xlarge" />;
    }
    return (
      <JuiGroupProfileBody
        avatar={avatar}
        awayStatus={awayStatus}
        jobTitle={jobTitle}
        className={isCurrentUser ? 'current' : ''}
        displayName={name}
        isGroup={isGroup}
        description={description}
      >
        {isShowMessageButton ? (
          <JuiGroupProfileMessageBtn
            onClick={this.OnMessageClick}
            tabIndex={0}
            aria-label={t(goToMessageInfo)}
          >
            <JuiIconography>chat_bubble</JuiIconography>
            {t('message')}
          </JuiGroupProfileMessageBtn>
        ) : null}
      </JuiGroupProfileBody>
    );
  }
}
const ProfileBodyView = translate('translations')(ProfileBody);
export { ProfileBodyView };
