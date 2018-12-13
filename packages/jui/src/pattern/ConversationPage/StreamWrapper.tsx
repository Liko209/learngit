import React, { HTMLAttributes, Component } from 'react';
import styled from '../../foundation/styled-components';
import { palette, grey } from '../../foundation/utils/styles';

type JuiStreamWrapperProps = HTMLAttributes<HTMLElement> & {
  isDragOver?: boolean;
  didDropFile?: (file: File) => void;
};

const Div = (props: JuiStreamWrapperProps) => (
  <div {...props} data-test-automation-id="jui-stream-wrapper" />
);
const JuiStreamInner = styled(Div)`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: ${({ theme, isDragOver }) =>
    isDragOver
      ? `2px dotted ${palette('secondary', '600')({ theme })}`
      : 'none'};
  background: ${({ isDragOver }) => (isDragOver ? grey('200') : 'transparent')};
  opacity: ${({ isDragOver }) => (isDragOver ? 0.24 : 1)};
`;

class JuiStreamWrapper extends Component<JuiStreamWrapperProps> {
  state = {
    isDragOver: false,
  };

  private _handleDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      const { files } = event.dataTransfer;
      const { didDropFile } = this.props;
      didDropFile && files && didDropFile(files[0]);
    }
    this.setState({ isDragOver: false });
  }
  private _handleDragOver = (event: any) => {
    event.preventDefault();
  }
  private _handleDragEnter = () => {
    this.setState({ isDragOver: true });
  }

  private _handleDragLeave = () => {
    this.setState({ isDragOver: false });
  }

  render() {
    const { isDragOver } = this.state;
    return (
      <JuiStreamInner
        {...this.props}
        isDragOver={isDragOver}
        onDrop={this._handleDrop}
        onDragEnter={this._handleDragEnter}
        onDragLeave={this._handleDragLeave}
        onDragOver={this._handleDragOver}
      />
    );
  }
}

export { JuiStreamWrapper, JuiStreamWrapperProps };
