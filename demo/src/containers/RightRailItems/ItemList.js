/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:31:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import RightPanelTitle from '@/components/Conversation/RightTitle';
import RightRailItemsPresenter from './RightRailItemsPresenter';
@observer
class ItemList extends Component {
  static propTypes = {
    groupId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    typeId: PropTypes.number.isRequired,
    sortKey: PropTypes.string,
    reverse: PropTypes.bool
  };
  static defaultProps = {
    reverse: false,
    sortKey: 'created_at'
  };
  constructor(props) {
    super(props);
    this.presenter = new RightRailItemsPresenter();
  }

  componentDidMount() {
    const { groupId, typeId, sortKey, reverse } = this.props;
    const itemListPresenter = this.presenter.getItemList(
      groupId,
      typeId,
      sortKey,
      reverse
    );
    if (!itemListPresenter.getSize()) {
      itemListPresenter.loadItems();
    }
  }

  componentDidUpdate(prevProps) {
    const { groupId, typeId, sortKey, reverse } = this.props;
    const thisGroupId = groupId;
    const prevGroupId = prevProps.groupId;
    if (prevGroupId !== thisGroupId) {
      if (thisGroupId) {
        const itemListPresenter = this.presenter.getItemList(
          thisGroupId,
          typeId,
          sortKey,
          reverse
        );
        if (!itemListPresenter.getSize()) {
          itemListPresenter.loadItems();
        }
      }
    }
  }

  componentWillUnmount() {
    this.presenter.dispose();
  }

  render() {
    const { groupId, title, typeId, sortKey, reverse, comparator } = this.props;
    const store = this.presenter.getStore(groupId, typeId, sortKey, reverse);
    const ids = store.getIds();
    const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
    const items = ids.map(id => itemStore.get(id));
    if (comparator) {
      items.sort((a, b) => comparator(a) - comparator(b));
    }
    if (ids && ids.length) {
      return (
        <section style={{ fontSize: '13px', paddingBottom: '10px' }}>
          <RightPanelTitle title={title} />
          {items.map(item =>
            React.cloneElement(this.props.children, {
              ...item,
              key: item.id
            })
          )}
        </section>
      );
    }
    return null;
  }
}

export default ItemList;
