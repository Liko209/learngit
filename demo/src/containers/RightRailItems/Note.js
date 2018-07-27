/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:31:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import { withRouter } from 'react-router-dom';
import { LinkItem } from './Link';

const NoteItem = LinkItem.extend`
  display: flex;
  justify-content: space-between;
  .creator {
    white-space: nowrap;
    color: #aaa;
    padding-left: 5px;
  }
`;

@withRouter
@observer
class Note extends Component {
  goToDetail = () => {
    const { id, history } = this.props;
    history.push(`/note/${id}`);
  };

  render() {
    const { title, creator_id } = this.props;
    const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
    const { displayName = '' } = personStore.get(creator_id) || {};

    return (
      <NoteItem onClick={this.goToDetail}>
        <div className="title">[Note] {title}</div>
        <div className="creator">{displayName}</div>
      </NoteItem>
    );
  }
}

export default Note;
