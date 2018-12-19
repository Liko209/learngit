/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 22:11:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, {
  ComponentType,
  PureComponent,
  Fragment,
  createRef,
  ChangeEvent,
  MouseEvent,
} from 'react';
import styled from '../../foundation/styled-components';

const Input = styled.input`
  display: none;
`;

type UploadFileProps = {
  accept?: string;
  multiple?: boolean;
  onClick?: (evt: MouseEvent) => void;
  onFileChanged?: (files: FileList) => void;
};

function withUploadFile(Component: ComponentType<any>) {
  return class UploadFile extends PureComponent<UploadFileProps> {
    static defaultProps = {
      accept: '*',
      multiple: true,
    };

    private _fileInputRef: any = createRef();

    private _showFileDialog = (evt: MouseEvent) => {
      evt.stopPropagation();
      this.showFileDialog();
    }

    private _fileChanged = (evt: ChangeEvent<HTMLInputElement>) => {
      evt.stopPropagation();
      const inputRef = this._fileInputRef.current;
      const { onFileChanged } = this.props;
      if (inputRef && onFileChanged) {
        onFileChanged(inputRef.files);
        inputRef.value = null;
      }
    }

    private _handleOnClickEvent = (evt: MouseEvent) => {
      const { onClick } = this.props;
      this._showFileDialog(evt);
      if (onClick) {
        onClick(evt);
      }
    }

    public showFileDialog = () => {
      const inputRef: HTMLInputElement = this._fileInputRef.current;
      if (inputRef) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        inputRef.dispatchEvent(event);
      }
    }

    render() {
      const { onClick, accept, multiple, onFileChanged, ...rest } = this.props;
      return (
        <Fragment>
          <Component {...rest} onClick={this._handleOnClickEvent} />
          <Input
            accept={accept}
            multiple={multiple}
            ref={this._fileInputRef}
            onChange={this._fileChanged}
            type="file"
            data-test-automation-id="upload-file-input"
          />
        </Fragment>
      );
    }
  };
}

export { withUploadFile };
