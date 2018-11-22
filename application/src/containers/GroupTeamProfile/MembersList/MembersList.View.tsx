/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
// import { translate } from 'react-i18next';
import { JuiGroupProfileList } from 'jui/pattern/GroupTeamProfile';
import { GROUP_TYPES } from '../types';

type Props = {};
const membersList = [
  { name: 'sssss1' },
  { name: 'sssss2' },
  { name: 'sssss3' },
  { name: 'sssss4' },
  { name: 'sssss5' },
  { name: 'sssss6' },
  { name: 'sssss7' },
  { name: 'sssss8' },
  { name: 'sssss9' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
];
@observer
class MembersListView extends React.Component<Props> {
  render() {
    return (
      <>
        <JuiGroupProfileList counts={10} type={GROUP_TYPES.TEAM} membersList={membersList}/>
      </>
    );
  }
}
export { MembersListView };
