/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { ellipsis, palette, spacing } from '../../../foundation/utils/styles';
import { Theme } from '../../../foundation/theme/theme';

type FileNameProps = {
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

const JuiFileNameLeft = styled.span`
  ${ellipsis()};
`;

class FileName extends React.Component<FileNameProps> {
  // truncation has been moved to FileNameParser in the postParser module
  render() {
    const { statusColor, opacity, ...rest } = this.props;
    return (
      <FileNameWrapper
        statusColor={statusColor}
        opacity={opacity}
        data-test-automation-id="file-name"
        {...rest}
      />
    );
  }
}

export { FileName, FileNameProps, JuiFileNameLeft };
