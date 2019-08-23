/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-07 14:13:42
 * Copyright © RingCentral. All rights reserved.
 */
import ReactDOM from 'react-dom';
import React, { PureComponent, RefObject, createRef } from 'react';
import styled from '../../foundation/styled-components';

import { AttachmentItem, ITEM_STATUS } from './AttachmentItem';
import { height, spacing } from '../../foundation/utils/styles';

type ItemInfo = {
  id: number;
  name: string;
};

type FileName = {
  id: number;
  fileNameChildren: React.ReactChild | null | (React.ReactChild | null)[];
};

type AttachmentListProps = {
  files?: ItemInfo[];
  fileNames?: FileName[];
  removeAttachment: (file: ItemInfo) => void;
  iconResolver?: (file: ItemInfo) => string;
};

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: ${height(37)};
  overflow-y: auto;
  margin: ${spacing(5, 0, 2)};
  padding: ${spacing(0.25, 0, 0, 0.25)};
`;

const DEFAULT_FILE_ICON = 'default_file';
/* eslint-disable */
class AttachmentList extends PureComponent<AttachmentListProps> {
  private _lastItemRef: RefObject<any> = createRef();
  componentDidUpdate() {
    const { current } = this._lastItemRef;
    if (current) {
      const el = ReactDOM.findDOMNode(current);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView();
      }
    }
  }
  render() {
    const {
      files = [],
      removeAttachment,
      iconResolver,
      fileNames = [],
    } = this.props;
    const count = files.length;
    return (
      <Wrapper data-test-automation-id="attachment-list">
        {files.map((looper: ItemInfo, idx: number) => {
          let content;
          const fileName = fileNames[idx]
            ? fileNames[idx].fileNameChildren
            : '';
          if (idx === count - 1) {
            content = (
              <AttachmentItem
                fileIcon={
                  iconResolver ? iconResolver(looper) : DEFAULT_FILE_ICON
                }
                ref={this._lastItemRef}
                status={ITEM_STATUS.NORMAL}
                name={fileName}
                onClickDeleteButton={() => removeAttachment(looper)}
                key={idx}
              />
            );
          } else {
            content = (
              <AttachmentItem
                fileIcon={
                  iconResolver ? iconResolver(looper) : DEFAULT_FILE_ICON
                }
                status={ITEM_STATUS.NORMAL}
                name={fileName}
                onClickDeleteButton={() => removeAttachment(looper)}
                key={idx}
              />
            );
          }
          return content;
        })}
      </Wrapper>
    );
  }
}

export { AttachmentList, ItemInfo };
