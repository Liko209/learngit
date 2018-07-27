/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import Wrapper from './Wrapper';

const Weather = (props) => {
  const { title, body } = props;
  return (
    <Wrapper>
      <div>{title}</div>
      <div style={{ marginTop: '15px' }}>{body}</div>
    </Wrapper>
  );
};

Weather.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
};

Weather.defaultProps = {
  title: '',
  body: '',
};

export default observer((props) => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const itemWeather = itemStore.get(id);
  return <Weather {...itemWeather} />;
});
