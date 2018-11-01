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
import keyboardEventDefaultHandler from './keyboardEventDefaultHandler';

import 'react-quill/dist/quill.snow.css';

const Wrapper = styled.div`
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 2px 2px 0 rgba(0, 0, 0, 0.14);
  padding: ${spacing(4)};
  z-index: ${({ theme }) => `${theme.zIndex.mobileStepper}`};
`;

const GlobalStyle = createGlobalStyle<{}>`
  .quill {
    width: 100%;
    align-self: flex-end;
  }
  .ql-snow {
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
    margin-top: 8px;
  }
`;

type Props = {
  value: string | Delta;
  onChange: Function;
  keyboardEventHandler: {};
  error: string;
};
type State = {
  modules: {};
};

// Quill.register({
//   'modules/markdownShortcuts': MarkdownShortcuts,
//   'modules/toolbarEmoji': toolbarEmoji,
// });

class JuiMessageInput extends React.Component<Props, State> {
  private _changeSource: Sources = 'api';
  private _modules: {};
  private _inputRef: React.RefObject<ReactQuill> = React.createRef();
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);

    const { keyboardEventHandler } = this.props;
    this._modules = {
      toolbar: false,
      keyboard: {
        bindings: { ...keyboardEventHandler, ...keyboardEventDefaultHandler },
      },
    };
  }

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

    const reactQull = this._inputRef.current;
    if (reactQull) {
      const quill = reactQull.getEditor();
      requestAnimationFrame(() => quill.setSelection(quill.getLength(), 0));
    }
  }

  onChange(content: string, delta: Delta, source: Sources, editor: any) {
    this._changeSource = source;
    if (source === 'api') {
      return;
    }
    const { onChange } = this.props;
    if (!editor.getText().trim()) {
      onChange('');
      return;
    }
    onChange(content);
  }

  render() {
    const { value, error } = this.props;
    return (
      <Wrapper>
        <ReactQuill
          value={value}
          onChange={this.onChange}
          placeholder="Type new message"
          modules={this._modules}
          ref={this._inputRef}
        />
        {error ? <StyledError>{error}</StyledError> : null}
        <GlobalStyle />
      </Wrapper>
    );
  }
}

export { JuiMessageInput, Props };
