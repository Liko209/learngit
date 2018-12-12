import React from 'react';
import ReactQuill from 'react-quill';
import { Delta, Sources } from 'quill';
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
import { markdownFromDelta } from './markdown';
import { handleAtMention } from './Mention/handleAtMention';

import 'react-quill/dist/quill.snow.css';

const Wrapper = styled.div<{
  isEditMode?: boolean;
}>`
  position: relative;
  box-shadow: ${props => (props.isEditMode ? null : props.theme.shadows[2])};
  padding: ${props => (props.isEditMode ? 0 : spacing(4))};
  z-index: ${({ theme }) => `${theme.zIndex.mobileStepper}`};
`;

const GlobalStyle = createGlobalStyle<{}>`
  [data-name=conversation-card] {
      &&&& .ql-editor {
      max-height: ${height(64)};
    }
  }
  .quill {
    width: 100%;
    align-self: flex-end;
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
        max-height: ${height(36.5)};
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
    ${typography('caption')};
    color: ${palette('semantic', 'negative')};
    margin-top: ${spacing(2)};
  }
`;

type Props = {
  value?: string | Delta;
  defaultValue?: string;
  onChange?: Function;
  error: string;
  children: React.ReactNode;
  modules: object;
  isEditMode?: boolean;
};

class JuiMessageInput extends React.Component<Props> {
  private _changeSource: Sources = 'api';
  private _inputRef: React.RefObject<ReactQuill> = React.createRef();

  componentDidMount() {
    const { isEditMode } = this.props;
    if (!isEditMode) {
      this.focusEditor(false);
    }
  }

  componentDidUpdate() {
    this.focusEditor(true);
  }

  focusEditor(checkSource: boolean) {
    if (checkSource && this._changeSource !== 'api') {
      return;
    }

    if (this._inputRef.current) {
      const quill = this._inputRef.current.getEditor();
      const length = quill.getLength();
      if (length > 1) {
        setTimeout(() => quill.setSelection(length - 1, 0), 300);
      }
    }
  }

  onChange = (content: string, delta: Delta, source: Sources, editor: any) => {
    this._changeSource = source;
    const { onChange } = this.props;
    if (!onChange) {
      return;
    }
    if (!markdownFromDelta(editor.getContents()).trim()) {
      onChange('');
      return;
    }
    onChange(content);
  }

  render() {
    const {
      value,
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
      <Wrapper isEditMode={isEditMode}>
        <ReactQuill
          {...reactQuillValueProp}
          onChange={this.onChange}
          placeholder="Type new message"
          modules={modules}
          ref={this._inputRef}
        />
        {error ? <StyledError>{error}</StyledError> : null}
        {children}
        <GlobalStyle />
      </Wrapper>
    );
  }
}

export { JuiMessageInput, Props };
