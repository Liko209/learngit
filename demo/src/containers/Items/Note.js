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
import Title from './Title';

const Note = (props) => {
  const { title, summary } = props;
  return (
    <Wrapper>
      <Title>[Note] {title}</Title>
      <div style={{ marginTop: '15px' }}>{summary}</div>
    </Wrapper>
  );
};

Note.propTypes = {
  title: PropTypes.string,
  summary: PropTypes.string,
};

Note.defaultProps = {
  title: '',
  summary: '',
};

export default observer((props) => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const itemNote = itemStore.get(id);
  return <Note {...itemNote} />;
});
