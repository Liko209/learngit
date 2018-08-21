/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 13:41:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  ConversationList as List,
  ConversationListSection,
  Icon,
} from 'ui-components';
import FavoriteListPresenter from './FavoriteListPresenter';
import ConversationListItemCell from './ConversationListItemCell';
import { ENTITY_NAME } from '@/store';
interface IProps {

}

interface IState {
  groups: Group[];
}

interface Group {
  id: number;
  display_name: string;
  is_team: boolean;
  members: number[];
}

@observer
class FavoriteSection extends React.Component<IProps, IState> {
  favoritePresenter: FavoriteListPresenter;
  constructor(props: IProps) {
    super(props);
    this.favoritePresenter = new FavoriteListPresenter();
  }

  componentDidMount() {
    this.favoritePresenter.fetchData();
  }

  renderFavoriteGroups() {
    const store = this.favoritePresenter.getStore();
    const ids = store.getIds();
    return (
      <List value={0}>
        {ids.map(id => (
          <ConversationListItemCell id={id} key={id} entityName={ENTITY_NAME.GROUP} />
        ))}
      </List>
    );
  }

  render() {
    return (
      <div>
        <ConversationListSection
          icon={<Icon>S</Icon>}
          title={'Favorites'}
          unreadCount={12}
          important={true}
          showCount={true}
          expanded={true}
        />
        {this.renderFavoriteGroups()}
      </div >
    );
  }
}

export default FavoriteSection;
