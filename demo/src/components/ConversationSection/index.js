/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-07 14:12:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';

import ConversationTab from '#/containers/ConversationTab';
import ConversationCategory from '#/components/ConversationCategory';

const ConversationSection = ({ to, head, groupIds, handleOpenModal }) => (
  <div>
    <ConversationCategory
        to={to}
        text={head.text}
        type={head.type}
        handleOpenModal={handleOpenModal}
    />
    {/*{console.log(groupIds)}*/}
    {groupIds.map(id => (
      <ConversationTab id={id} key={id} groupIds={groupIds} />
    ))}
  </div>
);

ConversationSection.propTypes = {
  to: PropTypes.string,
  head: PropTypes.shape({
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired,
  groupIds: PropTypes.array.isRequired,
  handleOpenModal: PropTypes.func
};

export default ConversationSection;
