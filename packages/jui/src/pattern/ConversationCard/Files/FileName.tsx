/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, ellipsis } from '../../../foundation/utils/styles';
import { getFileName } from '../../../foundation/utils/getFileName';

type FileNameProps = {
  widthSpacing: number;
  filename: string;
};

const LeftName = styled<{ widthSpacing: number }, 'span'>('span')`
  ${ellipsis};
  max-width: ${({ widthSpacing }) => spacing(widthSpacing)};
  display: inline-block;
  vertical-align: top;
`;

const FileName = (Props: FileNameProps) => {
  const { widthSpacing, filename } = Props;
  const [left, right] = getFileName(filename);

  return (
    <>
      <LeftName widthSpacing={widthSpacing}>{left}</LeftName>
      <span>{right}</span>
    </>
  );
};

export { FileName, FileNameProps };
