/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-01 09:54:25
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-04-24 14:24:08
 */
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';

const Author = (props) => {
  const { displayName } = props.person;
  if (!displayName) {
    return <span>{props.id}</span>;
  }
  return <span>{displayName}</span>;
};

Author.propTypes = {
  id: PropTypes.number.isRequired,
  person: PropTypes.object.isRequired,
};

export default observer((props) => {
  const { id } = props;
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  const person = personStore.get(id);
  return <Author person={person} {...props} />;
});
