/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-05 16:48:53
 */
import React from 'react';
import PropsTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';

import Description from '@/components/Conversation/Description';
import RightPanelTitle from '@/components/Conversation/RightTitle';
import storeManager, { ENTITY_NAME } from '@/store';

const TeamDescription = ({ group }) =>
  (group.description ? (
    <div>
      <RightPanelTitle title="TEAM DESCRIPTION" />
      <Description content={group.description} />
    </div>
  ) : null);

TeamDescription.propTypes = {
  group: PropsTypes.object
};

TeamDescription.defaultProps = {
  group: {}
};

export default withRouter(
  observer(props => {
    const { match } = props;
    const {
      params: { id }
    } = match;
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    const group = groupStore.get(Number(id));
    return <TeamDescription group={group} />;
  })
);
