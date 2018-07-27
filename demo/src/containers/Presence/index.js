/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-01 14:57:40
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-07-11 11:05:43
 */

import React from 'react';
import { observer } from 'mobx-react';

import Presence from '@/components/Presence';
import storeManager, { ENTITY_NAME } from '@/store';

export default observer(props => {
  const { id, offlineHide } = props;
  const presenceStore = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE);
  const presence = presenceStore.get(id);
  const newProps = offlineHide
    ? { offlineHide, ...presence, ...props }
    : { ...presence, ...props };
  return <Presence {...newProps} />;
});
