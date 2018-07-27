/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-01 14:16:04
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-03-20 17:20:04
 */

import styled from 'styled-components';

const Presence = styled.div`
  width: 8px;
  min-width: 8px;
  height: 8px;
  z-index: 5;
  border: none;
  border-radius: 50%;
  background-color: ${props => props.backgroundColor};
  opacity: ${props => (props.invisible ? 0 : 1)};
`;

export default Presence;
