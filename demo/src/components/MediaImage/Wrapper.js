/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-12 17:20:07
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';

const sizes = {
  4: '480px',
  8: '480px',
};

const Wrapper = styled.div`
  width: ${props => (sizes[props.images.length] ? sizes[props.images.length] : '360px')};
`;

export default Wrapper;
