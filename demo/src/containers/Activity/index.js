/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 15:12:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { service } from 'sdk';

import storeManager, { ENTITY_NAME } from '#/store';

import Wrapper from './Wrapper';
import Author from './Author';
import Action from './Action';
import Like from './Like';

const { PostService } = service;

const ResentWrapper = styled.div`
  cursor: pointer;
  margin-left: 10px;
  display: inline-block;
  &:hover {
    color: #0684bd;
  }
`;

const Name = styled.span`
  font-size: 12px;
`;

const POST_SENT_STATUS = ['Success', 'Fail', 'In Progress'];
@observer
class Activity extends Component {
  constructor() {
    super();
    this.resent = this.resent.bind(this);
  }

  resent() {
    const { postId } = this.props;
    PostService.getInstance().reSendPost(postId);
  }

  render() {
    const { personId, postId } = this.props;
    const postSentStatusStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST_SENT_STATUS
    );
    let postSentStatus;
    if (postId < 0) {
      postSentStatus = postSentStatusStore.get(postId);
    }
    return (
      <Wrapper>
        <Author id={personId} />
        {postSentStatus ? (
          <Name> [{POST_SENT_STATUS[postSentStatus.status]}]</Name>
        ) : null}
        {postSentStatus && postSentStatus.status === 1 ? (
          <ResentWrapper onMouseDown={this.resent}>
            <Name>Resend</Name>
          </ResentWrapper>
        ) : null}
        <Action id={postId} />
        <Like id={postId} />
      </Wrapper>
    );
  }
}

Activity.propTypes = {
  personId: PropTypes.number.isRequired,
  postId: PropTypes.number.isRequired
};

export default Activity;
