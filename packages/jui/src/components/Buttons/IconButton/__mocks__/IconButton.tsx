/*
 * @Author: isaac.liu
 * @Date: 2019-07-17 11:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../../foundation/styled-components';

const Button = styled.button``;

/* eslint-disable */
const JuiIconButton = (props: any) => {
  const { onClick, ...rest } = props;
  return <Button onClick={onClick} />;
};

export { JuiIconButton };
