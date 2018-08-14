/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-22 18:54:38
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';

// import ErrorTypes from 'sdk/utils/error/erroTypes';
import Wrapper from './Wrapper';
// import Modal from './Modal';

const Entry = props => {
  const { error, hide } = props;

  let msg = error.code
    ? `${error.message} (unknown).`
    : 'No server error message return, should check network status or server crash';
  // if (error.code === ErrorTypes.INVALID_GRANT) {
  //   msg = 'Invalid Phone number or password.';
  // }

  return (
    <Wrapper>
      <h2>{msg}</h2>
      <button onClick={hide}>Close</button>
    </Wrapper>
  );
};

Entry.propTypes = {
  hide: PropTypes.func.isRequired,
  error: PropTypes.object.isRequired
};

export default Entry;
