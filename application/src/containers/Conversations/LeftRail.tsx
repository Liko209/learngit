import React from 'react';
import { withRouter } from 'react-router-dom';
import { Divider } from 'ui-components';
import {
  UnreadSection,
  MentionSection,
  BookmarkSection,
  DirectMessageSection,
  TeamSection,
} from './sections';

import FavoriteSection from './FavoriteSection';

// interface IProps extends RouteComponentProps<any> { }

const List = () => {
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
};

export default withRouter(List);
