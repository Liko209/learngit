/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';

const Wrapper = styled.div`
  font-size: 14px;
  word-wrap: break-word;
  .label {
    margin-top: 15px;
    font-weight: 700;
  }
  .duration {
    color: #aaa;
  }
`;

const Meeting = (props) => {
  // console.log('meeting: ', item);
  const { start_time: start, end_time: end } = props;
  return (
    <Wrapper>
      <div className="label">Video Chat ended</div>
      <div className="duration">Duration: {Math.round((end - start) / 1000)}</div>
    </Wrapper>
  );
};

Meeting.propTypes = {
  start_time: PropTypes.number,
  end_time: PropTypes.number,
};

Meeting.defaultProps = {
  start_time: 0,
  end_time: 0,
};

export default observer((props) => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const itemMeeting = itemStore.get(id);
  return <Meeting {...itemMeeting} />;
});
