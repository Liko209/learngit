/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-01 14:08:10
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-05-07 15:40:57
 */

import React from 'react';
import PropTypes from 'prop-types';
import StyledPresence from './StyledPresence';

const setPresenceColor = presence => {
  switch (presence) {
    case 'away': {
      return '#cec208';
    }
    case 'offline': {
      return '#444';
    }
    case 'online': {
      return '#42a538';
    }
    case 'inactive': {
      return '#42a538';
    }
    default: {
      return '#444';
    }
  }
};


const Presence = props => (
  <StyledPresence
      invisible={props.offlineHide && props.presence === 'offline'}
      style={props.style}
      backgroundColor={setPresenceColor(
        props.awayStatus.length ? 'away' : props.presence
      )}
  />
);

Presence.propTypes = {
  presence: PropTypes.oneOf(['inactive', 'offline', 'away', 'online']),
  style: PropTypes.object,
  offlineHide: PropTypes.bool,
  awayStatus: PropTypes.any
};

Presence.defaultProps = {
  presence: 'offline',
  style: {},
  offlineHide: false,
  awayStatus: []
};

export default Presence;
