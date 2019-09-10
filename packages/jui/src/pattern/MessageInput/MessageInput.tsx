import React, { CSSProperties, ClipboardEvent } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Delta, Sources, RangeStatic } from 'quill';
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
import './Modules';

import 'react-quill/dist/quill.snow.css';

Quill.debug(false);

const MessageInputDropZoneClasses: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};
type WrapperProps = {
  isEditMode?: boolean;
};
const Wrapper = styled.div<WrapperProps>`
  box-shadow: ${props => (props.isEditMode ? null : props.theme.shadows[2])};
  padding: ${props => (props.isEditMode ? 0 : spacing(0, 4, 4, 4))};
  min-height: ${props => !props.isEditMode && height(22)};
  z-index: ${({ theme }) => `${theme.zIndex.appBar}`};
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
      transition: all 0.1s ease-in;
      border: 1px solid ${grey('300')};
      border-radius: ${spacing(1)};
      outline: none;
      &:hover {
        background-color: ${grey('50')};
      }
      &:focus-within {
        background: ${palette('common', 'white')};
        border: 1px solid ${grey('400')};
      }
      .ql-editor {
        ${typography('body1')};
        padding: ${spacing(2)};
        min-height: ${height(9)};
        max-height: ${height(28.5)};
        color: ${grey('900')};
        caret-color: ${primary('700')};
        &::before {
          font-style: normal;
          color: ${grey('400')};
          ${ellipsis()};
          width: 80%;
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

const formats = ['mention', 'span'];

type eventHandler = (range: RangeStatic, source: Sources) => void;

type Props = {
  value?: string | Delta;
  defaultValue?: string;
  onChange?: (newValue: string) => void;
  onFocus?: eventHandler;
  onBlur?: eventHandler;
  error: string;
  children: React.ReactNode;
  modules: object;
  toolbarNode?: React.ReactNode;
  footerNode?: React.ReactNode;
  attachmentsNode?: React.ReactNode;
  isEditMode?: boolean;
  didDropFile?: (file: File[]) => void;
  autofocus?: boolean;
  placeholder: string;
  hasFocused?: boolean;
};

// user try to paste image after snapshot
function isPasteImageFromMemory(files: FileList, types: string[]) {
  return (
    files && files.length === 1 && types.length === 1 && types[0] === 'Files'
  );
}

// user copy image in native filesystem, then try to paste into message input
// even user copied more than 1 image, only the last one will be pasted into web
function isPasteImageFromFileSystem(files: FileList, types: string[]) {
  return (
    files &&
    files.length === 1 &&
    types.length === 2 &&
    // types[0] === 'text/plain' &&
    types[1] === 'Files'
  );
}

function isPasteImageEvent(event: ClipboardEvent) {
  if (event.clipboardData) {
    const { files, types } = event.clipboardData;
    // will get error in compiled time if use keyword `readonly`, so make copy of `types`
    const t: string[] = types ? [...types] : [];
    return (
      isPasteImageFromFileSystem(files, t) || isPasteImageFromMemory(files, t)
    );
  }
  return false;
}

class JuiMessageInput extends React.PureComponent<Props> {
  static defaultProps = {
    autofocus: true,
  };

  private _inputRef: React.RefObject<ReactQuill> = React.createRef();

  private _timerId: NodeJS.Timeout;

  componentDidUpdate(prevProps: Props) {
    if (
      this._inputRef.current &&
      prevProps.modules !== this.props.modules &&
      this.props.isEditMode
    ) {
      this._enable(false);
      setTimeout(() => this._enable(true), 0);
    }
    if (this.props.hasFocused && !prevProps.hasFocused) {
      this._autoFocus();
    }
  }

  private _getEditor = () => {
    let editor;

    if (this._inputRef.current) {
      editor = this._inputRef.current.getEditor();
    } else {
      editor = {
        enable: () => {},
      };
    }

    return editor;
  };

  private _enable = (enabled: boolean) => {
    this._getEditor().enable(enabled);
  };

  private _autoFocus = () => {
    if (this.props.autofocus) {
      this.focusEditor();
    }
  };

  getContents = () => {
    const current = this._inputRef.current;
    return current && current.getEditor().getContents();
  };

  focusEditor = () => {
    clearTimeout(this._timerId);
    this._timerId = setTimeout(() => {
      if (this._inputRef.current) {
        const quill = this._inputRef.current.getEditor();
        quill.setSelection(999999, 0);
      }
    }, 300);
  };

  onChange = (content: string, delta: Delta) => {
    const { ops } = delta;
    if (ops && ops[1] && ops[0].insert && ops[0].insert.mention) {
      this.focusEditor();
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange(content);
    }
  };

  private _handlePaste = (event: ClipboardEvent) => {
    if (isPasteImageEvent(event)) {
      const { files } = event.clipboardData;
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
  };
  render() {
    const {
      value,
      toolbarNode,
      footerNode,
      attachmentsNode,
      defaultValue,
      error,
      children,
      modules,
      isEditMode,
      placeholder,
      onBlur,
      onFocus,
    } = this.props;
    const reactQuillValueProp = defaultValue
      ? {
          defaultValue,
        }
      : {
          value,
        };

    // initialReadOnly should be true when autofocus is false to avoid auto focus and trigger
    // browser's scroll behavior.
    // The Case:
    // When using MessageInput in VirtualizedList, the MessageInput may be destroyed/re-created
    // as user are scrolling, but re-create a MessageInput and focus it would force scrolled to
    // the MessageInput, this is not what we want. So we mark the input as readOnly to avoid
    // auto scroll.
    const initialReadOnly = !this.props.autofocus;

    return (
      <Wrapper isEditMode={isEditMode} onPaste={this._handlePaste}>
        {toolbarNode}
        <ReactQuill
          {...reactQuillValueProp}
          onChange={this.onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          readOnly={initialReadOnly}
          ref={this._inputRef}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {error ? <StyledError>{error}</StyledError> : footerNode}
        {children}
        {attachmentsNode}
      </Wrapper>
    );
  }
}

export { JuiMessageInput, Props, MessageInputDropZoneClasses, GlobalStyle };
