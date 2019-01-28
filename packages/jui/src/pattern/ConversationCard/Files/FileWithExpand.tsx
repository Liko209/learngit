/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 19:45:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Collapse from '@material-ui/core/Collapse';
import * as Jui from './style';
import { FileName } from './FileName';
import styled from '../../../foundation/styled-components';
import { spacing, getFileIcon } from '../../../foundation/utils';
import { Theme } from '../../../foundation/theme/theme';

type JuiFileWithExpandProps = {
  fileName: string;
  fileNameColor?: ({ theme }: { theme: Theme }) => any;
  fileNameOpacity?: number;
  Actions: JSX.Element;
  expand?: boolean;
  children?: React.ReactNode;
};

const NameWithActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
`;

const ActionWrapper = styled.div`
  display: flex;
  margin: ${spacing(0, 0, 0, 2)};
`;

const JuiFileWithExpand: React.SFC<JuiFileWithExpandProps> = (
  props: JuiFileWithExpandProps,
) => {
  const {
    fileName,
    Actions,
    children,
    expand,
    fileNameColor,
    fileNameOpacity,
  } = props;
  const type = fileName && fileName.split('.').pop();
  const iconType = getFileIcon(type || '');
  return (
    <Jui.FileExpandItemWrapper>
      {!expand && (
        <Jui.FileExpandItem>
          <Jui.FileIcon size="small">{iconType}</Jui.FileIcon>
          <NameWithActions>
            <FileName
              statusColor={fileNameColor}
              filename={fileName}
              opacity={fileNameOpacity}
            />
            <ActionWrapper>{Actions}</ActionWrapper>
          </NameWithActions>
        </Jui.FileExpandItem>
      )}
      {children && <Collapse in={expand}>{children}</Collapse>}
    </Jui.FileExpandItemWrapper>
  );
};

export { JuiFileWithExpand, JuiFileWithExpandProps };
