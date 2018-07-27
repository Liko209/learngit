/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-20 22:59:49
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { service } from 'sdk';

import storeManager, { ENTITY_NAME } from '@/store';
import { ListSection, ListItem, Left, Right } from './style';

const { GroupService } = service;

const getName = (item, section) => {
  if (section === 'teams') {
    return item.set_abbreviation;
  }
  if (item.display_name) {
    return item.display_name;
  }
  if (item.first_name && item.last_name) {
    return `${item.first_name} ${item.last_name}`;
  }
  const name = item.email.split('@')[0];
  const firstUpperCase = ([first, ...rest]) =>
    (first || '').toUpperCase() + rest.join('');
  return name
    .split('.')
    .map(v => firstUpperCase(v))
    .join(' ');
};

const SearchSection = props => {
  const { section, items, resetSearch, history } = props;

  const goToConversation = async id => {
    resetSearch();
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    if (section === 'teams') {
      const team = items.filter(item => item.id === id);
      groupStore.batchSet(team);
      history.push(`/conversation/${id}`);
      return;
    }
    const groupService = GroupService.getInstance();
    const group = await groupService.getGroupByPersonId(id);
    if (group[0]) {
      groupStore.set(group[0]);
      history.push(`/conversation/${group[0].id}`);
    }
  };

  return (
    <ListSection>
      {items.slice(0, 10).map((item, index) => [
        <ListItem onClick={() => goToConversation(item.id)} key={item.id}>
          <Left>{index === 0 ? section : ''}</Left>
          <Right>{getName(item, section)}</Right>
        </ListItem>
      ])}
    </ListSection>
  );
};

SearchSection.propTypes = {
  section: PropTypes.string,
  items: PropTypes.array,
  history: PropTypes.object.isRequired,
  resetSearch: PropTypes.func.isRequired
};

SearchSection.defaultProps = {
  section: '',
  items: []
};

export default withRouter(SearchSection);
