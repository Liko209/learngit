import React, { Fragment } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Delta, Sources } from 'quill';
import styled, { injectGlobal } from '../styled-components';
import { spacing, typography, palette } from '../utils/styles';
import MarkdownShortcuts from './MarkdownShortcuts';
import keyboardEventDefaultHandler from './keyboardEventDefaultHandler';

import 'react-quill/dist/quill.snow.css';

injectGlobal`
  .quill {
    width: 100%;
    align-self: flex-end;
  }
  .ql-snow {
    box-sizing: border-box;
    border: 1px solid #dbdbdb !important;
    border-radius: 4px;
    margin: 16px !important;
    background: #f5f5f5;
    .ql-editor {
      padding: 8px;
      font-size: 14px;
      color: #212121;
      min-height: 36px;
      max-height: 272px;
      &::before {
        font-style: normal !important;
        color: #9e9e9e !important;
      }
      &:focus {
        background: #fff;
        border-radius: 4px;
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
  private _modules: {};
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

  onChange(content: string, delta: Delta, source: Sources) {
    if (source === 'api') {
      return;
    }
    const { onChange } = this.props;
    if (content === '<p><br></p>') {
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
        />
        <StyledError>{error}</StyledError>
      </Fragment>
    );
  }
}

export { JuiMessageInput, IProps };

export default JuiMessageInput;
