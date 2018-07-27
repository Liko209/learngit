/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-06 09:40:48
 * @Last Modified by: Nello Huang (nello.huang@ringcentral.com)
 * @Last Modified time: 2018-04-01 13:49:59
 */

import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-block;
  margin: 1px 5px 5px 0;
  position: relative;
  height: ${props => props.height};
  width: ${props => props.width};
`;

export default Wrapper;
