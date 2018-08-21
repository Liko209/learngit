/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  ConversationListItem,
} from 'ui-components';
import storeManager from '../../store';
import MultiEntityMapStore from '../../store/base/MultiEntityMapStore';
import SingleEntityMapStore from '../../store/base/SingleEntityMapStore';
import GroupModel from '@/store/models/Group';
import { observer } from 'mobx-react';
interface IProps {
  id: number;
  key: number;
  entityName: string;
}

interface IState {
}

@observer
export default class ConversationListItemCell extends React.Component<IProps, IState>{
  groupStore: MultiEntityMapStore | SingleEntityMapStore;
  constructor(props: IProps) {
    super(props);
    this.groupStore = storeManager.getEntityMapStore(props.entityName);
  }

  getPropsForRender() {
    const id = this.props.id;
    const group: GroupModel = this.groupStore.get(id);
    const status = '';
    const unreadCount = 0;
    return { unreadCount, status, title:group.setAbbreviation, showCount:!group.isTeam, key: id  };
  }

  render() {
    const props = this.getPropsForRender();
    return (
      <ConversationListItem
        {...props}
      />
    );
  }
}
