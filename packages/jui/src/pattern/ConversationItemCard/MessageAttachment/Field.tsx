/*
 * @Author: isaac.liu
 * @Date: 2019-05-02 07:55:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, ellipsis } from '../../../foundation/utils';
import { Markdown } from 'glipdown';
import { withHighlight } from '../../../hoc/withHighlight';

type FieldProps = {
  title: string;
  value: string;
  short?: boolean;
};

const FieldWrapper = styled.div`
  float: left;
`;

const TitleWrapper = withHighlight([
  'dangerouslySetInnerHTML.__html',
])(styled.div`
  ${typography('caption2')};
  ${ellipsis()};
`);

const ValueWrapper = withHighlight([
  'dangerouslySetInnerHTML.__html',
])(styled.div`
  ${typography('caption1')};
`);

const Field = (props: FieldProps) => {
  const { title, value, short } = props;
  const width = short ? '50%' : '100%';
  const marginBottom = short ? '10px' : '20px';
  return (
    <FieldWrapper style={{ width, marginBottom }}>
      <TitleWrapper dangerouslySetInnerHTML={{ __html: title }} />
      <ValueWrapper dangerouslySetInnerHTML={{ __html: Markdown(value) }} />
    </FieldWrapper>
  );
};

const FieldsWrapper = styled.div``;

export { Field, FieldProps, FieldsWrapper };
