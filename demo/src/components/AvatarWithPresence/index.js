/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-06 09:37:50
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-04-02 18:09:50
 */
import Avatar from '#/containers/Avatar';
import Presence from '#/containers/Presence';

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';
import PresenceWrapper from './PresenceWrapper';

const AvatarWithPresence = props => (
  <Wrapper width={props.width} height={props.height}>
    <PresenceWrapper>
      <Presence id={props.id} />
    </PresenceWrapper>
    <Avatar id={props.id} width={props.width} height={props.height} type="person" />
  </Wrapper>
);

AvatarWithPresence.propTypes = {
  id: PropTypes.number.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
};

AvatarWithPresence.defaultProps = {
  width: '36px',
  height: '36px',
};

export default AvatarWithPresence;
