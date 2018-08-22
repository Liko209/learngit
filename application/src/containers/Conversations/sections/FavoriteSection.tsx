/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 13:41:46
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '@/store';
import { autorun, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import { ConversationList as List, ConversationListSection, Icon } from 'ui-components';

import ConversationListItemCell from '../ConversationListItemCell';
import FavoriteListPresenter from '../FavoriteListPresenter';
interface IProps {
  expanded?: boolean;
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
  static defaultProps = {
    expanded: true,
  };

  favoritePresenter: FavoriteListPresenter;
  @observable
  ids: number[] = [];
  constructor(props: IProps) {
    super(props);
    this.favoritePresenter = new FavoriteListPresenter();
    this._handleSortEnd = this._handleSortEnd.bind(this);
    const store = this.favoritePresenter.getStore();
    autorun(() => {
      this.ids = store.getIds();
    });
  }

  async componentDidMount() {
    await this.favoritePresenter.fetchData();
  }

  renderFavoriteGroups() {
    const distance = 1;
    const currentUserId = this.favoritePresenter.getCurrentUserId() || undefined;
    return (
      <SortableList distance={distance} onSortEnd={this._handleSortEnd} lockAxis="y">
        {this.ids.map((id, index) => (
          <SortableItem
            id={id}
            key={id}
            index={index}
            entityName={ENTITY_NAME.GROUP}
            isFavorite={true}
            currentUserId={currentUserId}
          />
        ))}
      </SortableList>
    );
  }

  private _handleSortEnd({ oldIndex, newIndex }: { oldIndex: number; newIndex: number; }) {
    this.ids = arrayMove(this.ids, oldIndex, newIndex);
    this.favoritePresenter.reorderFavoriteGroups(oldIndex, newIndex);
  }

  render() {
    return (
      <ConversationListSection
        icon={<Icon>start</Icon>}
        title={'Favorites'}
        unreadCount={12}
        important={true}
        expanded={this.props.expanded}
      >
        {this.renderFavoriteGroups()}
      </ConversationListSection>
    );
  }
}

export default FavoriteSection;
