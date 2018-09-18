import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Delta, Sources } from 'quill';
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
  keyboardEvent: {};
  setEditor: (editor: Quill) => void;
}
interface IState {}

class JuiMessageInput extends React.Component<IProps, IState> {
  private _reactQuillRef: React.RefObject<ReactQuill>;
  private _quill: Quill;
  constructor(props: IProps) {
    super(props);
    this.onChange = this.onChange.bind(this);

    this._reactQuillRef = React.createRef();
  }

  onChange(content: string, delta: Delta, source: Sources, editor: any) {
    if (source === 'api') {
      return;
    }
    const { onChange } = this.props;
    onChange(content, editor);
  }

  private _attachQuill = () => {
    if (this._reactQuillRef.current) {
      this._quill = this._reactQuillRef.current.getEditor();
    }
  }

  componentDidMount() {
    this._attachQuill();
    const { setEditor } = this.props;

    setEditor(this._quill);
  }

  render() {
    const { value, keyboardEvent } = this.props;
    const modules = {
      markdownShortcuts: {},
      toolbar: false,
      keyboard: {
        bindings: keyboardEvent,
      },
      // toolbarEmoji: true,
    };
    return (
      <ReactQuill
        ref={this._reactQuillRef}
        value={value}
        onChange={this.onChange}
        placeholder="Type new message"
        modules={modules}
      />
    );
  }
}

export { JuiMessageInput, IProps };

export default JuiMessageInput;
