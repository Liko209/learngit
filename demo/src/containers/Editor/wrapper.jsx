import React, { Component } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { service } from 'sdk';
import CKEditor from './editor';
import Preview from './preview';

const { ItemService } = service;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`;

const SecondaryBtns = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1;
  a {
    cursor: pointer;
    border: 1px solid #ccc;
    display: inline-block;
    margin: 0 5px;
  }
`;

@withRouter
class NoteWrapper extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      showEditor: false,
      content: '',
      btnText: 'Edit'
    };
  }

  async UNSAFE_componentWillMount() {
    const { match } = this.props;
    const itemService = ItemService.getInstance();

    const ret = await itemService.getNoteById(Number(match.params.id));
    // const { title, body, autosave_body } = ret;
    // this.setState({
    //   title,
    //   content: body || autosave_body
    // });

    console.log(ret);
  }

  changeMode = () => {
    const { showEditor } = this.state;
    const text = showEditor ? 'Edit' : 'Save note';

    this.setState(
      (prevState, props) => ({
        btnText: text,
        showEditor: !prevState.showEditor
      }),
      () => {
        if (showEditor) {
          this.rerenderAnno();
        }
      }
    );
  };

  editorChange = html => {
    this.setState({
      content: html
    });
  };

  goBack = () => {
    this.removeAllAnno();
    this.props.history.goBack();
  };

  createAnno(id) {
    console.log(id);
    const annoPosition = document
      .querySelector(`[anno_id="${id}"]`)
      .getBoundingClientRect();
    const { top, left } = annoPosition;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'anno-position';
    div.style.cssText = `position:fixed;top:${top}px;left:${left}px;width:20px;height:20px;border-radius:50%;background:#ff8175;`;
    return div;
  }

  rerenderAnno() {
    console.log('重新渲染');
    const textAnnos = Array.from(document.querySelectorAll('[anno_id]'));
    textAnnos.forEach((dom, index) => {
      const div = this.createAnno(Number(dom.getAttribute('anno_id')));
      document.body.appendChild(div);
    });
  }

  removeAllAnno() {
    const annosPosition = Array.from(
      document.querySelectorAll('.anno-position')
    );
    annosPosition.forEach(dom => {
      dom.parentNode.removeChild(dom);
    });
  }

  render() {
    const { showEditor, content, btnText } = this.state;

    return (
      <Wrapper className="testsssssssssss">
        <SecondaryBtns>
          <a onClick={this.changeMode}>{btnText}</a>
          <a onClick={this.goBack}>close</a>
        </SecondaryBtns>
        <CKEditor
          showEditor={showEditor}
          content={content}
          editorChange={this.editorChange}
          removeAllAnno={this.removeAllAnno}
        />
        <Preview
          content={content}
          showEditor={showEditor}
          createAnno={this.createAnno}
          editorChange={this.editorChange}
        />
      </Wrapper>
    );
  }
}

export default NoteWrapper;
