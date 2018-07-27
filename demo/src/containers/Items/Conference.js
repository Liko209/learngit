/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';

const Wrapper = styled.div`
  font-size: 14px;
  word-wrap: break-word;
  .label {
    margin-top: 15px;
    font-weight: 700;
  }
`;

const Conference = (props) => {
  const { rc_data: data } = props;
  if (!data) {
    return null;
  }
  const { phoneNumber, hostCode, participantCode } = data;
  return (
    <Wrapper>
      <div className="label">Dial-in Number(s):</div>
      <div>{phoneNumber}</div>
      <div className="label">Host Access:</div>
      <div>{hostCode}</div>
      <div className="label">Participant Access:</div>
      <div>{participantCode}</div>
    </Wrapper>
  );
};

Conference.propTypes = {
  rc_data: PropTypes.any,
};

Conference.defaultProps = {
  rc_data: {},
};

export default observer((props) => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const item = itemStore.get(id);
  return <Conference {...item} />;
});
