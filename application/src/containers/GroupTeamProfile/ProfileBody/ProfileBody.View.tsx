/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import {
  JuiGroupProfileBody,
  StyledMessageBtn,
} from 'jui/pattern/GroupTeamProfile';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Avatar } from '@/containers/Avatar';
import { ProfileHeaderViewProps } from './types';
import { goToConversation } from '../../../common/goToConversation';
import { JuiIconography } from 'jui/foundation/Iconography';
import { accessHandler } from '../AccessHandler';
import { TypeDictionary } from 'sdk/utils';
import { Presence } from '@/containers/Presence';

@observer
class ProfileBody extends React.Component<ProfileHeaderViewProps> {
  constructor(props: ProfileHeaderViewProps) {
    super(props);
  }
  OnMessageClick = async () => {
    const { id, dismiss } = this.props;
    dismiss();
    await goToConversation(id);
  }
  private _presence = (id: number) => {
    return <Presence uid={id} borderSize="medium" />;
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
      t,
    } = this.props;
    const { goToMessageInfo } = accessHandler(type, name);
    let avatar;
    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      avatar = <GroupAvatar cid={id} size="xlarge" />;
    } else if (type === TypeDictionary.TYPE_ID_PERSON) {
      avatar = <Avatar uid={id} presence={this._presence(id)} size="xlarge" />;
    }
    return (
      <JuiGroupProfileBody
        avatar={avatar}
        awayStatus={awayStatus}
        jobTitle={jobTitle}
        className={isCurrentUser ? 'current' : ''}
        displayName={name}
        description={description}
      >
        {isShowMessageButton ? (
          <>
            <StyledMessageBtn
              onClick={this.OnMessageClick}
              tabIndex={0}
              aria-label={t(goToMessageInfo)}
            >
              <JuiIconography>chat_bubble</JuiIconography>
              Message
            </StyledMessageBtn>
          </>
        ) : null}
      </JuiGroupProfileBody>
    );
  }
}
const ProfileBodyView = translate('translations')(ProfileBody);
export { ProfileBodyView };
