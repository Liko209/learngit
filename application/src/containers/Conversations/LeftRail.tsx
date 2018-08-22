import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Divider } from 'ui-components';

import { LeftRailPresenter } from './LeftRailPresenter';
import {
  UnreadSection,
  MentionSection,
  BookmarkSection,
  DirectMessageSection,
  TeamSection,
} from './sections';
import FavoriteSection from './FavoriteSection';

type IProps = {} & RouteComponentProps<any>;

class LeftRail extends Component<IProps> {
  presenter: LeftRailPresenter;

  constructor(props: IProps) {
    super(props);
    this.presenter = new LeftRailPresenter();
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
        <DirectMessageSection />
        <Divider />
        <TeamSection />
        {/* <strong>Conversation list: </strong>
        <NavLink to="/messages/123">123 </NavLink>
        <NavLink to="/messages/456">456 </NavLink>
        <NavLink to="/messages/789">789 </NavLink> */}
      </div>
    );
  }

}

export default withRouter(LeftRail);
