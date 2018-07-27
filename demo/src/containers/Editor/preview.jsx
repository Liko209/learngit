import React, { Component } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  display: ${props => (props.showEditor ? 'none' : 'flex')};
`;

const ToolBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  height: 42px;
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #ccc;
`;

const PreviewContent = styled.div`
  width: 85%;
  height: 90%;
  margin: 60px auto 0;
  border: 0;
  padding: 58px;
  box-shadow: rgba(0, 0, 0, 0.15) 0 0 10px;
  overflow: scroll;
`;

class Preview extends Component {
  setAnno = () => {
    console.log('create anno');
    const { editorChange, createAnno, content } = this.props;
    if (!content) return;

    const id = Number(new Date());
    const selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const startNode = range.startContainer;
      const startOffset = range.startOffset;
      const boundaryRange = range.cloneRange();
      const startTextNode = document.createElement('span');
      startTextNode.style.cssText = 'display:inline-block';
      // endTextNode = document.createElement('span');
      if (
        boundaryRange.startContainer !== boundaryRange.endContainer ||
        boundaryRange.startOffset !== boundaryRange.endOffset
      ) {
        return;
      }
      startTextNode.setAttribute('anno_id', id);
      // endTextNode.setAttribute('anno_id', id);
      // endTextNode.setAttribute('mark_type', 'end');
      startTextNode.setAttribute('mark_type', 'start');
      boundaryRange.collapse(false);
      // boundaryRange.insertNode(endTextNode);
      boundaryRange.setStart(startNode, startOffset);
      boundaryRange.collapse(true);
      boundaryRange.insertNode(startTextNode);
      range.setStartAfter(startTextNode);
      // range.setEndBefore(endTextNode);
      selection.removeAllRanges();
      selection.addRange(range);
      document.body.appendChild(createAnno(id));
      // this.editor.setData(document.getElementById('test').innerHTML)
      editorChange(document.getElementById('previewContent').innerHTML);
    }
  };

  render() {
    const { content, showEditor } = this.props;

    return (
      <Wrapper showEditor={showEditor}>
        <ToolBar>toolbar</ToolBar>
        <PreviewContent
            id="previewContent"
            onClick={this.setAnno}
            dangerouslySetInnerHTML={{ __html: content }}
        />
      </Wrapper>
    );
  }
}

export default Preview;
