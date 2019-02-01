/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { ellipsis, palette, spacing } from '../../../foundation/utils/styles';
import { getFileName } from '../../../foundation/utils/getFileName';
import { Theme } from '../../../foundation/theme/theme';

type FileNameProps = {
  filename: string;
  statusColor?: ({ theme }: { theme: Theme }) => any;
  opacity?: number;
};

const FileNameWrapper = styled('div')<{
  statusColor?: ({ theme }: { theme: Theme }) => any;
  opacity?: number;
}>`
  display: flex;
  min-width: 0;
  align-items: center;
  font-weight: 400;
  color: ${({ statusColor }) =>
    statusColor ? statusColor : palette('grey', '700')};
  ${ellipsis()};
  opacity: ${({ opacity }) => opacity};
  font-size: 0;
  & > span {
    font-size: ${spacing(3.5)};
  }
`;

const LeftName = styled.span`
  ${ellipsis()};
`;

const FileName = (Props: FileNameProps) => {
  const { filename, statusColor, opacity } = Props;
  const [left, right] = getFileName(filename);

  return (
    <FileNameWrapper
      statusColor={statusColor}
      opacity={opacity}
      data-test-automation-id="file-name"
    >
      <LeftName>{left}</LeftName>
      <span>{right}</span>
    </FileNameWrapper>
  );
};

export { FileName, FileNameProps };
