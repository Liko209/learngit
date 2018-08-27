import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Divider, styled } from 'ui-components';

import { LeftRailPresenter } from './LeftRailPresenter';
import {
  UnreadSection,
  MentionSection,
  BookmarkSection,
  ConversationSection,
} from './sections';
import FavoriteSection from './sections/FavoriteSection';
import TeamListPresenter from '@/containers/Conversations/sections/TeamListPresenter';
import DirectMessageListPresenter from './sections/DirectMessageListPresenter';
import { IConversationSectionPresenter }
  from '@/containers/Conversations/sections/IConversationSection';

type IProps = {} & RouteComponentProps<any>;

const Container = styled.div`
  height: 100%;
  overflow: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

class LeftRail extends Component<IProps> {
  presenter: LeftRailPresenter;
  teamPresenter: IConversationSectionPresenter;
  directMessagePresenter: IConversationSectionPresenter;

  constructor(props: IProps) {
    super(props);
    this.presenter = new LeftRailPresenter();
    this.teamPresenter = new TeamListPresenter();
    this.directMessagePresenter = new DirectMessageListPresenter();
  }

  render() {
    return (
      <Container>
        <UnreadSection />
        <Divider />
        <MentionSection />
        <Divider />
        <BookmarkSection />
        <Divider />
        <FavoriteSection />
        <Divider />
        <ConversationSection presenter={this.directMessagePresenter} />
        <Divider />
        <ConversationSection presenter={this.teamPresenter} />
        {/* <strong>Conversation list: </strong>
        <NavLink to="/messages/123">123 </NavLink>
        <NavLink to="/messages/456">456 </NavLink>
        <NavLink to="/messages/789">789 </NavLink> */}
      </Container>
    );
  }

}

export default withRouter(LeftRail);
