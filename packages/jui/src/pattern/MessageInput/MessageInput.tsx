import React, { CSSProperties } from 'react';
import ReactQuill from 'react-quill';
import { Delta } from 'quill';
import styled, { createGlobalStyle } from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  grey,
  height,
  primary,
  ellipsis,
} from '../../foundation/utils/styles';
// import { markdownFromDelta } from './markdown';
import { handleAtMention } from './Mention/handleAtMention';
import './Modules';

import 'react-quill/dist/quill.snow.css';

const MessageInputDropZoneClasses: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const Wrapper = styled.div<{
  isEditMode?: boolean;
}>`
  position: relative;
  box-shadow: ${props => (props.isEditMode ? null : props.theme.shadows[2])};
  padding: ${props => (props.isEditMode ? 0 : spacing(0, 4, 4, 4))};
  z-index: ${({ theme }) => `${theme.zIndex.mobileStepper}`};
`;

const GlobalStyle = createGlobalStyle<{}>`
  [data-name=conversation-card] {
      &&&& .ql-container {
        max-height: ${height(64)};
      }
      &&&& .ql-editor {
        max-height: ${height(64)};
      }
  }
  .quill {
    width: 100%;
    align-self: flex-end;
  }
  .ql-container {
    max-height: ${height(28.5)};
  }
  .ql-snow {
    .mention {
      padding: ${spacing(0.5)};
      background-color: ${primary('50')};
      border-radius: ${spacing(0.5)};
      color: ${primary('700')};
    }
    &&& {
      box-sizing: border-box;
      border: 1px solid transparent;
      border-radius: ${spacing(1)};
      .ql-editor {
        ${typography('body1')};
        padding: ${spacing(2)};
        min-height: ${height(9)};
        max-height: ${height(28.5)};
        height: auto;
        border-radius: ${spacing(1)};
        color: ${grey('700')};
        border: 1px solid ${grey('300')};
        caret-color: ${primary('700')};
        &::before {
          font-style: normal;
          color: ${grey('400')};
          ${ellipsis()};
          width: 80%;
        }
        &:hover {
          background-color: ${grey('50')};
        }
        &:focus {
          background: ${palette('common', 'white')};
          border: 1px solid ${grey('400')};
        }
      }
    }
  }
`;

const StyledError = styled.div`
  && {
    ${typography('caption1')};
    color: ${palette('semantic', 'negative')};
    margin-top: ${spacing(2)};
  }
`;

const formats = ['mention'];

type Props = {
  value?: string | Delta;
  defaultValue?: string;
  onChange?: Function;
  onBlur?: Function;
  error: string;
  children: React.ReactNode;
  modules: object;
  toolbarNode?: React.ReactNode;
  attachmentsNode?: React.ReactNode;
  isEditMode?: boolean;
  didDropFile?: (file: File[]) => void;
  id?: number;
};

class JuiMessageInput extends React.PureComponent<Props> {
  private _inputRef: React.RefObject<ReactQuill> = React.createRef();

  componentDidMount() {
    setTimeout(this.focusEditor, 0);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this._inputRef.current &&
      prevProps.modules !== this.props.modules &&
      this.props.isEditMode
    ) {
      const quill = this._inputRef.current.getEditor();
      quill.enable(false);
      setTimeout(() => {
        quill.enable(true);
      },         0);
    }
    if (prevProps.id !== this.props.id) {
      this.focusEditor();
    }
  }

  focusEditor = () => {
    if (this._inputRef.current) {
      const quill = this._inputRef.current.getEditor();
      setTimeout(() => quill.setSelection(999999, 0), 300);
    }
  }

  onChange = (content: string, delta: Delta) => {
    const { ops } = delta;
    if (ops && ops[0].insert && ops[0].insert.mention) {
      this.focusEditor();
    }
    const { onChange } = this.props;
    if (onChange) {
      onChange(content);
    }
  }

  private _handlePaste = (event: any) => {
    if (event.clipboardData) {
      const files: FileList = event.clipboardData.files;
      if (files && files.length > 0) {
        // access data directly
        const result: File[] = [];
        for (let i = 0; i < files.length; ++i) {
          const file = files[i];
          result.push(file);
        }
        const { didDropFile } = this.props;
        didDropFile && files && didDropFile(result);
        event.preventDefault();
      }
    }
  }
  render() {
    const {
      value,
      toolbarNode,
      attachmentsNode,
      defaultValue,
      error,
      children,
      modules,
      isEditMode,
    } = this.props;
    const reactQuillValueProp = defaultValue
      ? {
        defaultValue: handleAtMention(defaultValue),
      }
      : {
        value,
      };
    return (
      <Wrapper isEditMode={isEditMode} onPaste={this._handlePaste}>
        {toolbarNode}
        <ReactQuill
          {...reactQuillValueProp}
          onChange={this.onChange}
          placeholder="Type new message"
          modules={modules}
          formats={formats}
          ref={this._inputRef}
        />
        {error ? <StyledError>{error}</StyledError> : null}
        {children}
        <GlobalStyle />
        {attachmentsNode}
      </Wrapper>
    );
  }
}

export { JuiMessageInput, Props, MessageInputDropZoneClasses };
