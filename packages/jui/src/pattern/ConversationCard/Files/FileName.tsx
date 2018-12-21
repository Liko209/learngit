/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { ellipsis, palette } from '../../../foundation/utils/styles';
import { getFileName } from '../../../foundation/utils/getFileName';

type FileNameProps = {
  filename: string;
  color?: string;
};

const FileNameWrapper = styled('div')<{ color?: string }>`
  display: flex;
  min-width: 0;
  align-items: center;
  font-weight: 400;
  color: ${({ color }) => (color ? color : palette('grey', '700'))};
  ${ellipsis};
`;

const LeftName = styled.span`
  ${ellipsis};
`;

const FileName = (Props: FileNameProps) => {
  const { filename, color } = Props;
  const [left, right] = getFileName(filename);

  return (
    <FileNameWrapper color={color} data-test-automation-id="file-name">
      <LeftName>{left}</LeftName>
      <span>{right}</span>
    </FileNameWrapper>
  );
};

export { FileName, FileNameProps };
