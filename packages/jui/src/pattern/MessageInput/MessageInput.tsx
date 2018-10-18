import React, { Fragment } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Delta, Sources } from 'quill';
import styled, { createGlobalStyle } from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  grey,
  height,
  primary,
} from '../../foundation/utils/styles';
import MarkdownShortcuts from './MarkdownShortcuts';
import keyboardEventDefaultHandler from './keyboardEventDefaultHandler';

import 'react-quill/dist/quill.snow.css';

const GlobalStyle = createGlobalStyle`
  .quill {
    width: 100%;
    align-self: flex-end;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.14);
    z-index: ${({ theme }) => `${theme.zIndex.mobileStepper}`};
  }
  .ql-snow {
    &&& {
      box-sizing: border-box;
      border: 1px solid transparent;
      border-radius: ${spacing(1)};
      margin: ${spacing(4)};
      .ql-editor {
        ${typography('body1')};
        padding: ${spacing(2)};
        min-height: ${height(9)};
        max-height: ${height(68)};;
        border-radius: ${spacing(1)};
        color: ${grey('700')};
        border: 1px solid ${grey('300')};
        caret-color: ${primary('700')};
        &::before {
          font-style: normal;
          color: ${grey('400')};
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

Quill.register({
  'modules/markdownShortcuts': MarkdownShortcuts,
  // 'modules/toolbarEmoji': toolbarEmoji,
});

const StyledError = styled('div')`
  && {
    ${typography('caption')};
    color: ${palette('semantic', 'negative')};
    margin: ${spacing(-2)} ${spacing(4)} ${spacing(2)};
  }
`;

interface IProps {
  value: string | Delta;
  onChange: Function;
  keyboardEventHandler: {};
  error: string;
}
interface IState {
  modules: {};
}

class JuiMessageInput extends React.Component<IProps, IState> {
  private _changeSource: Sources = 'api';
  private _modules: {};
  private _inputRef: React.RefObject<ReactQuill> = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.onChange = this.onChange.bind(this);

    const { keyboardEventHandler } = this.props;
    this._modules = {
      markdownShortcuts: {},
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
      <Fragment>
        <ReactQuill
          value={value}
          onChange={this.onChange}
          placeholder="Type new message"
          modules={this._modules}
          ref={this._inputRef}
        />
        <StyledError>{error}</StyledError>
        <GlobalStyle />
      </Fragment>
    );
  }
}

export { JuiMessageInput, IProps };
