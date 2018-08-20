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
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
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
const SortableList = SortableContainer(List);
const SortableItem = SortableElement(ConversationListItemCell);
@observer
class FavoriteSection extends React.Component<IProps, IState> {
  favoritePresenter: FavoriteListPresenter;
  constructor(props: IProps) {
    super(props);
    this.favoritePresenter = new FavoriteListPresenter();
    this._handleSortEnd = this._handleSortEnd.bind(this);
  }

  componentDidMount() {
    this.favoritePresenter.fetchData();
  }

  renderFavoriteGroups() {
    const store = this.favoritePresenter.getStore();
    const ids = store.getIds();
    const distance = 1;
    return (
      <SortableList distance={distance} onSortEnd={this._handleSortEnd} lockAxis="y">
        {ids.map((id, index) => (
          <SortableItem id={id} key={id} index={index} entityName={ENTITY_NAME.GROUP} />
        ))}
      </SortableList>
    );
  }

  private _handleSortEnd({ oldIndex, newIndex }: { oldIndex: number; newIndex: number; }) {
    this.favoritePresenter.reorderFavoriteGroups(oldIndex, newIndex);
  }

  render() {
    return (
      <div>
        <ConversationListSection
          icon={<Icon>start</Icon>}
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
