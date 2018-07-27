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

@observer
class PinList extends Component {
  static propTypes = {
    groupId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    reverse: PropTypes.bool
  };
  static defaultProps = {
    reverse: false
  };

  render() {
    const { groupId, title, reverse } = this.props;
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    const { pinnedPostIds: ids = [] } = groupStore.get(groupId);
    if (ids && ids.length) {
      if (reverse) {
        ids.reverse();
      }
      return (
        <section style={{ fontSize: '13px', paddingBottom: '10px' }}>
          <RightPanelTitle title={title} />
          {ids.map(id =>
            React.cloneElement(this.props.children, { id, key: id })
          )}
        </section>
      );
    }
    return null;
  }
}

export default PinList;
