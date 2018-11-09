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

type JuiFileWithExpandProps = {
  fileName: string;
  actions: JSX.Element;
  expand?: boolean;
  children?: React.ReactNode;
};

const NameWithActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
`;

const FileNameBox = styled.div`
  flex: 1;
`;

const JuiFileWithExpand: React.SFC<JuiFileWithExpandProps> = (
  props: JuiFileWithExpandProps,
) => {
  const { fileName, actions, children, expand } = props;

  return (
    <Jui.FileExpandItemWrapper>
      <Jui.FileExpandItem>
        <Jui.FileIcon size="small" />
        <NameWithActions>
          <FileNameBox><FileName filename={fileName} /></FileNameBox>
          <div>{actions}</div>
        </NameWithActions>
      </Jui.FileExpandItem>
      {children && <Collapse in={expand}>{children}</Collapse>}
    </Jui.FileExpandItemWrapper>
  );
};

export { JuiFileWithExpand, JuiFileWithExpandProps };
