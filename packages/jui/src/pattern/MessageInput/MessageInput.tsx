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

import 'react-quill/dist/quill.snow.css';

const Wrapper = styled.div`
  position: relative;
  box-shadow: ${props => props.theme.shadows[2]};
  padding: ${spacing(4)};
  z-index: ${({ theme }) => `${theme.zIndex.mobileStepper}`};
`;

const GlobalStyle = createGlobalStyle<{}>`
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
        max-height: ${height(68)};
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
  value: string | Delta;
  onChange: Function;
  error: string;
  children: React.ReactNode;
  modules: object;
};
type State = {
  modules: {};
};

class JuiMessageInput extends React.Component<Props, State> {
  private _changeSource: Sources = 'api';
  private _inputRef: React.RefObject<ReactQuill> = React.createRef();

  componentDidMount() {
    this.focusEditor(false);
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
      setTimeout(() => quill.setSelection(quill.getLength(), 0), 200);
    }
  }

  onChange = (content: string, delta: Delta, source: Sources, editor: any) => {
    this._changeSource = source;
    if (source === 'api') {
      return;
    }
    const { onChange } = this.props;
    if (!markdownFromDelta(editor.getContents()).trim()) {
      onChange('');
      return;
    }
    onChange(content);
  }

  render() {
    const { value, error, children, modules } = this.props;
    return (
      <Wrapper>
        <ReactQuill
          value={value}
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
