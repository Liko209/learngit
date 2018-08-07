/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-14 16:23:56
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { reaction } from 'mobx';

import storeManager, { ENTITY_NAME } from '@/store';
import { GLOBAL_STORE_DATA, ACTIONS_TYPE } from '@/constants';

import { service } from 'sdk';

import Toolbar from '@/components/PostEditor/EditorToolbar';
import ErrorHandler from '@/containers/ErrorHandler';

// import PostEditorComponent from '@/components/PostEditor';
import { MentionsInput, Mention } from 'react-mentions';
import defaultStyle from './mentionStyle';
import {
  isEmpty,
  isAtMentions,
  compileAtMentionText,
  compileQuoteText,
  b64toFile
} from './handle';
// import notificationCenter from '@/utils/notificationCenter';
// import { observer } from 'mobx-react';
const { PostService, AccountService } = service;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const MentionWrapper = styled.div`
  flex: 1;
`;

@withRouter
class PostEditor extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.mentionsInput = React.createRef();
    this.state = this.resetState();

    this.onInputChange = this.onInputChange.bind(this);
    this.onEnterPress = this.onEnterPress.bind(this);
    this.handleComposition = this.handleComposition.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleScreenshot = this.handleScreenshot.bind(this);
    this.setUploadLoading = this.setUploadLoading.bind(this);
  }

  resetState() {
    return {
      text: '',
      users: [],
      isOnComposition: false,
      uploadLoading: false,
      modifyPostData: {}
    };
  }

  componentDidMount() {
    this.initReaction();
  }

  initReaction() {
    const globalStore = storeManager.getGlobalStore();
    reaction(
      () => globalStore.get(GLOBAL_STORE_DATA.MODIFY_POST),
      postInfo => {
        if (postInfo.type === ACTIONS_TYPE.EDIT) {
          this.editPostEvent(postInfo.postId);
        } else if (postInfo.type === ACTIONS_TYPE.QUOTE) {
          this.quotePostEvent(postInfo.postId);
        }
      }
    );

    reaction(
      () => globalStore.get(GLOBAL_STORE_DATA.IS_SWITCH),
      is_switch => {
        if (is_switch) {
          this.setState(this.resetState());
          globalStore.set(GLOBAL_STORE_DATA.IS_SWITCH, false);
        }
      }
    );
  }

  editPostEvent(id) {
    const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
    const { text, id: postId, group_id: groupId } = postStore.get(id);
    const { text: t, users: u } = compileAtMentionText(text);
    this.setState({
      text: t,
      modifyPostData: {
        postId,
        groupId
      },
      users: u
    });
    this.mentionsInput.current.wrappedInstance.refs.input.focus();
  }

  setCaretPosition(elem) {
    if (elem != null) {
      console.log(elem.value);
      elem.focus();
      if (elem.createTextRange) {
        let range = elem.createTextRange();
        range.move('character', elem.value.length);
        range.select();
      } else if (elem.selectionStart) {
        elem.setSelectionRange(elem.value.length, elem.value.length);
      }
    }
  }

  quotePostEvent(id) {
    const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
    const personStore = storeManager.getEntityMapStore('person');
    const { text, creator_id: creatorId } = postStore.get(id);
    const currentUser = {
      id: creatorId,
      display: personStore.get(creatorId).displayName
    };
    const { text: t, users: u } = compileQuoteText(text, currentUser);

    this.mentionsInput.current.wrappedInstance.refs.input.focus();

    this.setState({
      text: t,
      users: u
    });
  }

  // Get upload gropress
  // componentDidMount() {
  //   const { match } = this.props;
  //   const { params: { id } } = match;
  //   UploadManager.on(id, this.setUploadLoading);
  // }
  // componentWillUnmount() {
  //   const { match } = this.props;
  //   const { params: { id } } = match;
  //   UploadManager.off(id, this.setUploadLoading);
  // }

  onInputChange(evt) {
    this.setState({
      text: evt.target.value
    });
  }

  onEnterPress(evt) {
    if (evt.ctrlKey && evt.keyCode === 13) {
      this.setState({
        text: `${evt.target.value}\n`
      });
      return;
    }

    if (!evt.shiftKey && evt.keyCode === 13 && !this.state.isOnComposition) {
      evt.preventDefault();
      if (!isEmpty(this.state.text)) {
        const globalStore = storeManager.getGlobalStore();
        const postInfo = globalStore.get(GLOBAL_STORE_DATA.MODIFY_POST) || {};
        console.log(postInfo);
        postInfo.type !== ACTIONS_TYPE.EDIT
          ? this.sendPost(this.state.text)
          : this.modifyPost(this.state.text);
      }
    }
  }
  setUploadLoading() {
    this.setState({
      uploadLoading: true
    });
  }

  handleComposition(evt) {
    if (evt.type === 'compositionend') {
      // composition is end
      setTimeout(() => {
        this.setState({
          isOnComposition: false
        });
      }, 0);
    } else {
      // in composition
      setTimeout(() => {
        this.setState({
          isOnComposition: true
        });
      }, 0);
    }
  }

  async sendPost(text) {
    try {
      const { match } = this.props;

      const {
        params: { id: groupId }
      } = match;
      const service = PostService.getInstance();
      const { users } = this.state;
      this.setState({
        text: '',
        users: []
      });
      await service.sendPost({
        groupId,
        text,
        users,
        atMentions: isAtMentions(text)
      });
    } catch (err) {
      const handler = new ErrorHandler(err);
      handler.handle().show();
    }
  }

  modifyPost(text) {
    const service = PostService.getInstance();
    const { users } = this.state;
    const { postId, groupId } = this.state.modifyPostData;
    service.modifyPost({
      groupId,
      postId,
      text,
      users,
      atMentions: isAtMentions(text)
    });
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_STORE_DATA.MODIFY_POST, {
      type: '',
      postId: 0
    });
    this.setState({
      text: '',
      users: []
    });
  }

  handleFileUpload(evt) {
    this.uploadFile(evt.target.files[0]);
  }

  async handleScreenshot(event) {
    const { match } = this.props;
    const groupId = match.params.id;
    const postService = PostService.getInstance();

    const base64 = await window.fijiElectron.captureScreenshot();
    const formData = new FormData();
    const file = b64toFile(base64, `Screen Shot ${new Date().toJSON()}.png`);
    formData.append('file', file);

    this.setState({ uploadLoading: true });

    await postService.sendItemFile({
      groupId: groupId,
      file: formData
    });

    this.setState({ uploadLoading: false });
  }

  handlePasteAction(evt) {
    const { items } = evt.clipboardData || evt.originalEvent.clipboardData;
    let blob = null;

    for (let i = 0; i < items.length; i += 1) {
      if (items[i].type.indexOf('image') === 0) {
        blob = items[i].getAsFile();
      }
    }
    if (blob !== null) {
      // const reader = new FileReader();
      // reader.onload = (event) => {
      //   console.log(event.target.result);
      // };
      // reader.readAsDataURL(blob);
      evt.preventDefault();
      this.uploadFile(blob);
    }
  }

  uploadFile(file) {
    const data = new FormData();
    const service = PostService.getInstance();
    const { match } = this.props;
    const {
      params: { id }
    } = match;

    this.setState({
      uploadLoading: true
    });

    data.append('file', file);

    service
      .sendItemFile({
        groupId: Number(id),
        file: data
      })
      .then(() => {
        this.setState({
          uploadLoading: false
        });
      });
  }

  render() {
    const userId = AccountService.getInstance().getCurrentUserId();
    const personStore = storeManager.getEntityMapStore('person');
    const groupStore = storeManager.getEntityMapStore('group');
    const { match } = this.props;
    const {
      params: { id }
    } = match;
    const group = groupStore.get(Number(id)) || {};
    const { members = [] } = group;
    const groupMembers = _.difference(members, [userId]);
    const users = groupMembers.map(uid => {
      const personObj = personStore.get(uid) || {};
      return {
        id: uid,
        display: personObj.displayName
      };
    });

    return (
      <Wrapper>
        <Toolbar
          handleFileUpload={this.handleFileUpload}
          handleScreenshot={this.handleScreenshot}
          uploadLoading={this.state.uploadLoading}
        />

        <MentionWrapper
          onCompositionStart={this.handleComposition}
          onCompositionEnd={this.handleComposition}
        >
          <MentionsInput
            autoFocus={true}
            value={this.state.text}
            onChange={this.onInputChange}
            style={defaultStyle}
            onKeyDown={this.onEnterPress}
            onPaste={evt => this.handlePasteAction(evt)}
            markup="@[__display__]:__id__:"
            ref={this.mentionsInput}
          // displayTransform={(uid) => {
          //   const userObj = this.state.users.find(user => user.id === uid);
          //   return userObj.display;
          // }}
          >
            <Mention
              trigger="@"
              data={users}
              style={{ backgroundColor: '#0684bd' }}
              renderSuggestion={(suggestion, search, highlightedDisplay) => (
                <div className="user">{highlightedDisplay}</div>
              )}
              onAdd={(uid, display) =>
                this.state.users.push({
                  id: uid,
                  display
                })
              }
              appendSpaceOnAdd
            />
          </MentionsInput>
        </MentionWrapper>
      </Wrapper>
    );
  }
}

export default PostEditor;
