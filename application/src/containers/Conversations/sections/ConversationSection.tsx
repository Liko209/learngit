/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import {
  ConversationListSection,
  Icon,
  ConversationList,
} from 'ui-components';
import ConversationListItemCell from '../ConversationListItemCell';
import ConversationListPresenter from './ConversationListPresenter';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';

interface IProps {
  title: string;
  iconName: string;
  expanded?: boolean;
  sortable?: boolean;
  presenter: ConversationListPresenter;
}
const SortableList = SortableContainer(ConversationList);
const SortableItem = SortableElement(ConversationListItemCell);
@observer
class ConversationSection extends React.Component<IProps> {
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

  componentDidMount() {
    this.props.presenter.fetchData();
  }

  private _handleSortEnd({ oldIndex, newIndex }: { oldIndex: number; newIndex: number; }) {
    this.ids = arrayMove(this.ids, oldIndex, newIndex);
    this.props.presenter.reorderFavoriteGroups(oldIndex, newIndex);
  }

  renderList() {
    const { presenter, sortable } = this.props;
    const currentUserId = presenter.getCurrentUserId() || undefined;
    const store = presenter.getStore();
    const ids = store.getIds();
    const entityName = presenter.entityName;
    if (sortable) {
      const distance = 1;
      return (
        <SortableList distance={distance} onSortEnd={this._handleSortEnd} lockAxis="y">
          {this.ids.map((id: number, index: number) => (
            <SortableItem
              id={id}
              key={id}
              index={index}
              entityName={entityName}
              isFavorite={true}
              currentUserId={currentUserId}
            />
          ))}
        </SortableList>
      );
    }

    return (
      <ConversationList>
        {ids.map((id: number) => (
          <ConversationListItemCell
            id={id}
            key={id}
            entityName={entityName}
            currentUserId={currentUserId}
          />
        ))}
      </ConversationList>
    );
  }

  render() {
    const { title, iconName, expanded } = this.props;
    return (
      <div>
        <ConversationListSection
          icon={<Icon>{iconName}</Icon>}
          title={title}
          important={true}
          expanded={expanded}
        >
          {this.renderList()}
        </ConversationListSection>
      </div >
    );
  }
}

export { ConversationSection };
export default ConversationSection;
