/*
 * @Author: isaac.liu
 * @Date: 2019-05-02 07:55:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, ellipsis } from '../../../foundation/utils';

interface IFieldProps {
  title: React.ReactChild | null | (React.ReactChild | null)[];
  value: React.ReactChild | null | (React.ReactChild | null)[];
  short?: boolean;
};

const FieldWrapper = styled.div`
  float: left;
`;

const TitleWrapper = styled.div`
  ${typography('body2')};
  ${ellipsis()};
`;

const ValueWrapper = styled.div`
  ${typography('body1')};
`;

const Field = (props: IFieldProps) => {
  const { title, value, short } = props;
  const width = short ? '50%' : '100%';
  const marginBottom = short ? '10px' : '20px';
  return (
    <FieldWrapper style={{ width, marginBottom }}>
      <TitleWrapper>{title}</TitleWrapper>
      <ValueWrapper>{value}</ValueWrapper>
    </FieldWrapper>
  );
};

const FieldsWrapper = styled.div``;

export { Field, IFieldProps, FieldsWrapper };
