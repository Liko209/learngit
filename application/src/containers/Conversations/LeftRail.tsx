import { LeftRailPresenter } from './LeftRailPresenter';

import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Divider } from 'ui-components';

import {
  UnreadSection,
  MentionSection,
  BookmarkSection,
  ConversationSection,
} from './sections';
import FavoriteSection from './FavoriteSection';
import TeamListPresenter from '@/containers/Conversations/sections/TeamListPresenter';
import { IConversationSectionPresenter }
from '@/containers/Conversations/sections/IConversationSection';

type IProps = {} & RouteComponentProps<any>;

class LeftRail extends Component<IProps> {
  presenter: LeftRailPresenter;
  teamPresenter:IConversationSectionPresenter;
  directMessagePresenter:IConversationSectionPresenter;

  constructor(props: IProps) {
    super(props);
    this.presenter = new LeftRailPresenter();
    this.teamPresenter = new TeamListPresenter();
  }

  render() {
    return (
      <div>
        <UnreadSection />
        <Divider />
        <MentionSection />
        <Divider />
        <BookmarkSection />
        <Divider />
        <FavoriteSection />
        <Divider />
        <ConversationSection presenter={this.teamPresenter}/>
        {/* <strong>Conversation list: </strong>
        <NavLink to="/messages/123">123 </NavLink>
        <NavLink to="/messages/456">456 </NavLink>
        <NavLink to="/messages/789">789 </NavLink> */}
      </div>
    );
  }

}

export default withRouter(LeftRail);
