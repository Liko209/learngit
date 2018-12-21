/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:14:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { grey, typography } from '../../../foundation/utils/styles';

const SearchItemValueWrapper = styled.div`
  color: ${grey('900')};
  ${typography('body1')};
  overflow: hidden;
  text-overflow: ellipsis;
  span {
    font-weight: bold;
    ${typography('body2')};
  }
`;

type JuiSearchItemValueProps = {
  terms: string[];
  value: string;
};

function highlight(value: string, terms: string[]) {
  let v = value;
  const reg = terms.join('|');
  v = v.replace(
    new RegExp(reg, 'gi'),
    (term: string) => `<span>${term}</span>`,
  );
  return {
    __html: v,
  };
}

const JuiSearchItemValue = (props: JuiSearchItemValueProps) => {
  const { value, terms, ...rest } = props;
  const highlightValue = highlight(value, terms);
  return (
    <SearchItemValueWrapper
      {...rest}
      dangerouslySetInnerHTML={highlightValue}
    />
  );
};

export { JuiSearchItemValue, JuiSearchItemValueProps };
