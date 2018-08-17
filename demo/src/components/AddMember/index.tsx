/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-08 17:06:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

interface Props {
  handleOpenModal: Function;
  width: string;
  height: string;
}

const Wrapper = styled<Props, any>('i')`
  display: inline-block;
  width: ${(props: Props) => props.width};
  height: ${(props: Props) => props.height};
  line-height: ${(props: Props) => props.height};
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  border-radius: 50%;
  color: #0684bd;
  border: 1px solid rgba(6, 132, 189, 0.3);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.05);
  vertical-align: top;
  &:hover {
    color: #fff;
    background: #305161;
  }
`;

const AddMember: React.SFC<Props> = ({
  width,
  height,
  handleOpenModal,
}: Props) => (
  <Wrapper onClick={handleOpenModal} width={width} height={height}>
    +
  </Wrapper>
);
export default AddMember;
