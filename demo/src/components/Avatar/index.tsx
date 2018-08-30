/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-04 09:31:10
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from 'styled-components';

const Headshot = styled.div`
  display: inline-block;
  width: ${(props: any) => props.width};
  height: ${(props: any) => props.height};
  background-image: url('${(props: any) => props.url}');
  background-color: ${(props: any) => props.backgroundColor};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: ${(props: any) => props.borderRadius};
`;

interface Props {
  url: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  backgroundColor?: string;
}

const Avatar: React.SFC<Props> = (props: any) => (
  <Headshot {...props} url={props.url} />
);

Avatar.defaultProps = {
  width: '36px',
  height: '36px',
  borderRadius: '100%',
  backgroundColor: '#ddd',
};

export default Avatar;
