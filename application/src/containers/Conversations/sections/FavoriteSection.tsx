/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 13:41:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { autorun, observable } from 'mobx';
import { observer } from 'mobx-react';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import { ConversationList as List, ConversationListSection, Icon } from 'ui-components';

import { toTitleCase } from '@/utils';
import { ENTITY_NAME } from '@/store';
import ConversationListItemCell from '../ConversationListItemCell';
import FavoriteListPresenter from '../FavoriteListPresenter';

interface IProps {
  t: TranslationFunction;
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
class FavoriteSectionComponent extends React.Component<IProps, IState> {
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
    const { t } = this.props;
    return (
      <ConversationListSection
        icon={<Icon>start</Icon>}
        title={toTitleCase(t('favorite_plural'))}
        unreadCount={12}
        important={true}
        expanded={this.props.expanded}
      >
        {this.renderFavoriteGroups()}
      </ConversationListSection>
    );
  }
}
const FavoriteSection = translate('Conversations')(FavoriteSectionComponent);
export default FavoriteSection;
export { FavoriteSection };
