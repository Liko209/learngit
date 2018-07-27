/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:31:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { GlipTypeDictionary } from 'sdk';
import ItemList from './ItemList';
import PinList from './PinList';
import File from './File';
import Link from './Link';
import Task from './Task';
import Note from './Note';
import Event from './Event';
import Pin from './Pin';

const eventComparator = event => {
  if (event.end) {
    return Number(event.start) + Number(event.end);
  } else {
    return event.start * 2;
  }
};

@withRouter
@observer
class RightRailItems extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  };

  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    return [
      <PinList groupId={Number(id)} key="Pinned" title="PINNED">
        <Pin />
      </PinList>,
      <ItemList
          groupId={Number(id)}
          key="Events"
          title="EVENTS"
          typeId={GlipTypeDictionary.TYPE_ID_EVENT}
          sortKey="start"
          reverse
          comparator={eventComparator}
      >
        <Event />
      </ItemList>,
      <ItemList
          groupId={Number(id)}
          key="Tasks"
          title="TASKS"
          typeId={GlipTypeDictionary.TYPE_ID_TASK}
          reverse
      >
        <Task />
      </ItemList>,
      <ItemList
          groupId={Number(id)}
          key="Links"
          title="LINKS"
          typeId={GlipTypeDictionary.TYPE_ID_LINK}
      >
        <Link />
      </ItemList>,
      <ItemList
          groupId={Number(id)}
          key="Notes"
          title="NOTES"
          typeId={GlipTypeDictionary.TYPE_ID_PAGE}
      >
        <Note />
      </ItemList>,
      <ItemList
          groupId={Number(id)}
          key="Files"
          title="FILES"
          typeId={GlipTypeDictionary.TYPE_ID_FILE}
      >
        <File />
      </ItemList>
    ];
  }
}

export default RightRailItems;
