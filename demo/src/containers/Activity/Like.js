/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-01 09:54:25
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-04-24 14:25:29
 */
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';

const Like = (props) => {
  const { likes = [] } = props;
  const len = likes.length;
  if (len === 0) {
    return null;
  } else if (len === 1) {
    return <span>· 1 like</span>;
  }
  return <span>· {len} likes</span>;
};

Like.propTypes = {
  likes: PropTypes.any,
};

Like.defaultProps = {
  likes: [],
};

export default observer((props) => {
  const { id } = props;
  const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
  const post = postStore.get(id);
  return <Like {...post} />;
});
