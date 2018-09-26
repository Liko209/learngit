/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { ConversationListSection, Icon, ConversationList } from 'ui-components';
import { toTitleCase } from '@/utils';
import { ConversationListItem } from '../ConversationListItem';
import ConversationSectionPresenter from './ConversationSectionPresenter';
import {
  arrayMove,
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { withRouter, RouteComponentProps } from 'react-router';

type IRouterParams = {
  id: string;
};

interface IProps extends RouteComponentProps<IRouterParams> {
  t: TranslationFunction;
  title: string;
  iconName: string;
  expanded?: boolean;
  sortable?: boolean;
  presenter: ConversationSectionPresenter;
}

const SortableList = SortableContainer(ConversationList);
const SortableItem = SortableElement(ConversationListItem);

@observer
class ConversationSectionComponent extends React.Component<IProps> {
  static defaultProps = {
    expanded: true,
    sortable: false,
  };

  @observable
  ids: number[] = [];

  constructor(props: IProps) {
    super(props);
    this._handleSortEnd = this._handleSortEnd.bind(this);
    const store = props.presenter.getStore();
    autorun(() => {
      this.ids = store.getIds();
    });
  }

  private _handleSortEnd({ oldIndex, newIndex }: {
    oldIndex: number;
    newIndex: number;
  }) {
    this.ids = arrayMove(this.ids, oldIndex, newIndex);
    this.props.presenter.reorderFavoriteGroups(oldIndex, newIndex);
  }

  renderList() {
    const { presenter, sortable, match } = this.props;
    const currentUserId = presenter.getCurrentUserId() || undefined;
    const currentGroupId = parseInt(match.params.id, 10);
    const entityName = presenter.entityName;
    if (sortable) {
      const distance = 1;
      return (
        <SortableList
          distance={distance}
          onSortEnd={this._handleSortEnd}
          lockAxis="y"
        >
          {this.ids.map((id: number, index: number) => (
            <SortableItem
              id={id}
              key={id}
              index={index}
              entityName={entityName}
              isFavorite={true}
              currentUserId={currentUserId}
              currentGroupId={currentGroupId}
            />
          ))}
        </SortableList>
      );
    }

    return (
      <ConversationList>
        {this.ids.map((id: number) => (
          <ConversationListItem
            id={id}
            key={id}
            entityName={entityName}
            currentUserId={currentUserId}
            currentGroupId={currentGroupId}
          />
        ))}
      </ConversationList>
    );
  }

  render() {
    const { t, title, iconName, expanded } = this.props;
    const { presenter } = this.props;

    const { important, unreadCount } = presenter.calculateUmi();

    return (
      <div>
        <ConversationListSection
          icon={<Icon>{iconName}</Icon>}
          title={toTitleCase(t(title))}
          important={important}
          expanded={expanded}
          unreadCount={unreadCount}
        >
          {this.renderList()}
        </ConversationListSection>
      </div>
    );
  }
}

const ConversationSection = translate('Conversations')(
  withRouter(ConversationSectionComponent),
);
export { ConversationSection };
export default ConversationSection;
