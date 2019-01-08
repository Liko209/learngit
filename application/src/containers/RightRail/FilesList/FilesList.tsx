/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:20:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, CSSProperties } from 'react';
import {
  JuiVirtualList,
  IVirtualListDataSource,
} from 'jui/pattern/VirtualList';
import { FileItem } from './FileItem';
import { FileItemProps } from './types';

class FilesList extends Component implements IVirtualListDataSource {
  private _files: FileItemProps[];
  constructor(props: any) {
    super(props);
    this._files = Array(1000).fill({
      icon: <div />,
      name: 'This is file name',
      subtitle: '01/08/2019',
    });
  }
  countOfCell() {
    return this._files.length;
  }

  cellAtIndex(index: number, style: CSSProperties) {
    const file = this._files[index];
    return (
      <div style={style} key={index}>
        <FileItem {...file} />
      </div>
    );
  }

  fixedCellHeight() {
    return 52;
  }

  render() {
    return <JuiVirtualList dataSource={this} />;
  }
}

export { FilesList };
