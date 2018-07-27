import React, { Component } from 'react';
import styled from 'styled-components';
import './editor.css';

const Wrapper = styled.div`
  width: 100%;
  display: ${props => (props.showEditor ? 'block' : 'none')};
`;

class CKEditor extends Component {
  editor = null;
  componentDidMount() {
    const { editorChange, content } = this.props;

    import('./ckeditor').then(ckeditor => {
      this.editor = CKEDITOR.replace('editor', {
        language: 'en',
        uiColor: '#ffffff',
        customConfig: '/ckeditor/editor-config.js'
      });
      CKEDITOR.domReady(() => {
        this.editor.document.$.body.innerHTML = content;
      });

      this.editor.on('change', evt => {
        const html = evt.editor.document.$.body.innerHTML;
        editorChange(html);
      });
    });
  }

  componentDidUpdate() {
    const { showEditor, content, removeAllAnno } = this.props;
    if (showEditor) {
      removeAllAnno();
      return;
    }
    if (this.editor) {
      CKEDITOR.domReady(() => {
        this.editor.document.$.body.innerHTML = content;
      });
    }
  }

  componentWillUnmount() {
    this.editor = null;
  }

  render() {
    const { showEditor } = this.props;

    return (
      <Wrapper showEditor={showEditor}>
        <textarea name="editor" />
      </Wrapper>
    );
  }
}

export default CKEditor;
