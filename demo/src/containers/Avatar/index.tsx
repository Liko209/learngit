/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-27 14:17:58
 * @Last Modified by: Valor Lin (valor.lin@ringcentral.com)
 * @Last Modified time: 2018-05-11 10:55:40
 */
import React from 'react';
import { observer } from 'mobx-react';
import Avatar from '@/components/Avatar';
import storeManager, { ENTITY_NAME } from '@/store';

import defaultPersonAvatar from './imgs/default-person.png';

const AvatarContainer = (props: any) => {
  const { id, type } = props;
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  const person: object = personStore.get(id);
  let avatarUrl: string = '';

  switch (type) {
    case 'person': {
      avatarUrl = defaultPersonAvatar;
      if (person) {
        const { headshot } = person;

        if (headshot) {
          avatarUrl = headshot;
          if (typeof headshot === 'object') {
            avatarUrl = headshot.url;
            if (headshot.thumbs) {
              const regex = new RegExp(`^${headshot.stored_file_id}.+36`);

              Object.keys(headshot.thumbs).forEach(key => {
                if (regex.test(key)) {
                  avatarUrl = headshot.thumbs[key] || defaultPersonAvatar;
                }
              });
            }
          }
        }
      }
      break;
    }
    default:
      break;
  }
  return <Avatar url={avatarUrl} {...props} />;
};
export default observer(AvatarContainer);
