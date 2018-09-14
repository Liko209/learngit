import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Delta } from 'quill';
import { injectGlobal } from 'styled-components';
import MarkdownShortcuts from './MarkdownShortcuts';

// import toolbarEmoji from 'quill-emoji';

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

interface IProps {
  value: string | Delta;
  onChange: Function;
}
interface IState {}

class JuiMessageInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value: string) {
    const { onChange } = this.props;
    onChange(value);
  }

  render() {
    const modules = {
      markdownShortcuts: {},
      toolbar: false,
      // toolbarEmoji: true,
    };
    return (
      <ReactQuill
        value={this.props.value}
        onChange={this.handleChange}
        placeholder="Type new message"
        modules={modules}
      />
    );
  }
}

export { JuiMessageInput, IProps };

export default JuiMessageInput;
