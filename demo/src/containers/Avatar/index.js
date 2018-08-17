/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-27 14:17:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import Avatar from '@/components/Avatar';
import storeManager, { ENTITY_NAME } from '@/store';

import defaultPersonAvatar from './imgs/default-person.png';

export default observer(props => {
  const { id, type } = props;
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  const person = personStore.get(id);
  let avatarUrl = '';

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
              const regex = new RegExp(`^${headshot.stored_file_id}.+16`);

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
});
