/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-24 23:49:29
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useCallback } from 'react';
import { GroupAvatar } from './GroupAvatar';
import { Avatar } from './Avatar';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { ProfileMiniCard } from '@/modules/message/container/MiniCard/Profile';
import { ProfileMiniCardPerson } from '@/modules/message/container/Profile/MiniCard/Person';
import { ProfileMiniCardGroup } from '@/modules/message/container/Profile/MiniCard/Group';

export type UniversalAvatarProps = { id: number };

export function UniversalAvatar({ id }: UniversalAvatarProps) {
  const onClickAvatar = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const anchor = event.currentTarget as HTMLElement;
      const profileMiniCard = new ProfileMiniCard();
      const idType = GlipTypeUtil.extractTypeId(id);
      if (idType === TypeDictionary.TYPE_ID_PERSON) {
        profileMiniCard.show({
          anchor,
          cardContent: <ProfileMiniCardPerson id={id} />,
        });
      } else {
        profileMiniCard.show({
          anchor,
          cardContent: <ProfileMiniCardGroup id={id} />,
        });
      }
    },
    [id],
  );

  const idType = GlipTypeUtil.extractTypeId(id);
  let avatar;
  if (idType === TypeDictionary.TYPE_ID_PERSON) {
    avatar = <Avatar onClick={onClickAvatar} uid={id} />;
  } else {
    avatar = <GroupAvatar onClick={onClickAvatar} cid={id} />;
  }

  return avatar;
}
