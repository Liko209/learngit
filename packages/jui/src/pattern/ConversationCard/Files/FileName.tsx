/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { ellipsis } from '../../../foundation/utils/styles';
import { getFileName } from '../../../foundation/utils/getFileName';

type FileNameProps = {
  filename: string;
};

const FileNameWrapper = styled.div``;

const LeftName = styled.span`
  ${ellipsis};
  max-width: 70%;
  display: inline-block;
  vertical-align: top;
`;

const FileName = (Props: FileNameProps) => {
  const { filename } = Props;
  const [left, right] = getFileName(filename);

  return (
    <FileNameWrapper>
      <LeftName>{left}</LeftName>
      <span>{right}</span>
    </FileNameWrapper>
  );
};

export { FileName, FileNameProps };
