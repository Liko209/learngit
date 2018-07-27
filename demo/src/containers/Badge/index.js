/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-07 14:11:55
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-04-12 15:04:42
 */
import React from 'react';
import { observer } from 'mobx-react';
import Badge from '@/components/Badge';
import storeManager, { ENTITY_NAME } from '@/store';

export default observer((props) => {
  const { id } = props;
  const groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  const stateBadge = groupStateStore.get(id);
  const newProps = {
    unread_count: stateBadge.unread_count || '',
    unread_mentions_count: stateBadge.unread_mentions_count || '',
  };
  return <Badge {...newProps} />;
});
