/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-30 09:37:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';

const ArrowDropDownSvg = () => {
  return (
    <svg
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
};

const ArrowDropDownIcon = styled(ArrowDropDownSvg)`
  position: absolute;
  top: calc(50% - 0.5em);
  right: 0;
  width: 1em;
  height: 1em;
  font-size: 1.5rem;
  fill: currentColor;
`;

export { ArrowDropDownIcon };
