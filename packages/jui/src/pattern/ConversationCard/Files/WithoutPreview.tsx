/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:57:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { getFileName } from '../../../foundation/utils/getFileName';
import * as Jui from './style';

type JuiFileWithoutPreviewProps = {
  fileName: string;
  size: string;
  actions: JSX.Element;
  iconType: string | null;
};

const FileSecondary = (secondary: string, children: JSX.Element) => {
  return (
    <>
      <span>{secondary}</span>
      <Jui.FileActionsWrapper>{children}</Jui.FileActionsWrapper>
    </>
  );
};

const JuiFileWithoutPreview: React.SFC<JuiFileWithoutPreviewProps> = (
  props: JuiFileWithoutPreviewProps,
) => {
  const { size, fileName, actions, iconType } = props;
  const [left, right] = getFileName(fileName);

  return (
    <Jui.FileItem disableGutters={true}>
      <Jui.FileIcon iconType={iconType} />
      <Jui.FileInfo
        secondaryTypographyProps={{
          component: 'div',
        }}
        classes={{
          primary: 'file-item-primary',
          secondary: 'file-item-secondary',
        }}
        primary={
          <>
            <span className="left-name">{left}</span>
            <span className="right-name">{right}</span>
          </>
        }
        secondary={FileSecondary(size, actions)}
      />
    </Jui.FileItem>
  );
};

export { JuiFileWithoutPreview, JuiFileWithoutPreviewProps };
