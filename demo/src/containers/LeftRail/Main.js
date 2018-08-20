/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-13 16:12:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { service } from 'sdk';

import ConversationSection from '#/components/ConversationSection';
import CreateTeamModal from './CreateTeamModal';

import MainPresenter from './MainPresenter';

const { GROUP_QUERY_TYPE } = service;

const Wrapper = styled.div`
  font-family: proxima-nova3 !important;
  color: #fff;
  overflow-y: auto;
  margin-right: -10px;
  padding-right: 10px;

  & ::-webkit-scrollbar,
  & ::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover ::-webkit-scrollbar,
  &:hover ::-webkit-scrollbar-thumb {
    visibility: visible;
  }
`;

@withRouter
@observer
class Main extends Component {
  constructor(props) {
    super(props);
    this.mainPresenter = new MainPresenter();
    this.state = {
      showModal: false
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount() {
    this.mainPresenter.init();
  }

  componentWillUnmount() {
    this.mainPresenter.dispose();
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    const { TEAM, GROUP, FAVORITE } = GROUP_QUERY_TYPE;
    const teamStore = this.mainPresenter.getStore(TEAM);
    const groupStore = this.mainPresenter.getStore(GROUP);
    const favoriteStore = this.mainPresenter.getStore(FAVORITE);
    const teamIds = teamStore.getIds();
    const groupIds = groupStore.getIds();
    const favoriteIds = favoriteStore.getIds();

    const favoritesHead = {
      text: 'favorites',
      type: 'favorites'
    };
    const peopleHead = {
      text: 'people',
      type: 'people'
    };
    const teamsHead = {
      text: 'teams',
      type: 'teams'
    };
    const { showModal } = this.state;
    return (
      <Wrapper>
        {!!favoriteIds.length && (
          <ConversationSection head={favoritesHead} groupIds={favoriteIds} />
        )}
        {/*people*/}
        {!!groupIds.length && (
          <ConversationSection
            to="/contact/list"
            head={peopleHead}
            groupIds={groupIds}
          />
        )}
        {!!teamIds.length && (
          <ConversationSection
            head={teamsHead}
            groupIds={teamIds}
            handleOpenModal={this.handleOpenModal}
          />
        )}
        {showModal && (
          <CreateTeamModal
            showModal={showModal}
            handleCloseModal={this.handleCloseModal}
          />
        )}
      </Wrapper>
    );
  }
}

export default Main;
