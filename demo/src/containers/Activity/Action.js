/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-01 09:54:25
 * @Last Modified by: Lily.li (lily.li@ringcentral.com)
 * @Last Modified time: 2018-05-23 10:07:12
 */
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import styled from 'styled-components';

import { TYPE } from '@/constants';

const Wrapper = styled.span`
  margin-left: 4px;
`;

const Action = props => {
  const {
    activity,
    items = [],
    item_data: itemData = {},
    is_new: isNew,
    parent_id: parentId,
    replied
  } = props;
  const result = [];

  let html = null;
  // todo performance optimization
  const links = items.filter(item => TYPE[item.type_id] === 'link');
  const files = items.filter(item => TYPE[item.type_id] === 'file');
  const tasks = items.filter(item => TYPE[item.type_id] === 'task');
  const events = items.filter(item => TYPE[item.type_id] === 'event');
  const notes = items.filter(item => TYPE[item.type_id] === 'note');
  const meetings = items.filter(item => TYPE[item.type_id] === 'meeting');
  const conferences = items.filter(item => TYPE[item.type_id] === 'conference');
  let len = 0;

  len = links.length;
  if (len === 1) {
    html = 'shared a link';
  } else if (len > 1) {
    html = `shared ${len} links`;
  }
  len = files.length;
  if (len === 1) {
    const version = itemData.version_map && itemData.version_map[files[0].id];
    if (version > 1) {
      html = `uploaded version ${version}`;
    } else {
      html = 'shared a file';
    }
  } else if (len > 1) {
    html = `shared ${len} files`;
  }
  len = tasks.length;
  if (len > 0) {
    if (isNew) {
      html = 'created a task';
    } else {
      html = 'shared items';
    }
  }
  len = events.length;
  if (len > 0) {
    // Because there is no attach, there is no need to judge isNew
    html = 'created an event';
  }
  len = notes.length;
  if (len > 0) {
    // Because there is no attach, there is no need to judge isNew
    html = 'share a note';
  }
  len = meetings.length;
  if (len > 0) {
    // Because there is no attach, there is no need to judge isNew
    html = 'started a video chat';
  }
  len = conferences.length;
  if (len > 0) {
    // Because there is no attach, there is no need to judge isNew
    html = 'started an audio conference';
  }
  if (parentId) {
    html = `replied to <a class="at_mention_compose">${replied ||
      parentId}</a>`;
  }
  // eslint-disable-next-line
  result.push(
    <span dangerouslySetInnerHTML={{ __html: activity }} key="useless1" />
  );
  // eslint-disable-next-line
  result.push(
    <span dangerouslySetInnerHTML={{ __html: html }} key="useless2" />
  );
  return <Wrapper>{result}</Wrapper>;
};

Action.propTypes = {
  activity: PropTypes.string,
  // items: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.number,
  //     type_id: PropTypes.number,
  //   })
  // ),
  items: PropTypes.any,
  item_data: PropTypes.any,
  is_new: PropTypes.bool,
  parent_id: PropTypes.number,
  replied: PropTypes.string
};

Action.defaultProps = {
  activity: '',
  items: [],
  item_data: {},
  is_new: true,
  parent_id: 0,
  replied: ''
};

export default observer(props => {
  const { id } = props;
  const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
  const post = postStore.get(id);
  if (post.parent_id) {
    const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
    const item = itemStore.get(post.parent_id);
    post.replied = item.text || item.title;
  }
  return <Action {...post} />;
});
