/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { MembersViewProps } from './types';
import { MemberHeader } from './MemberHeader';
import { MemberList } from './MemberList';
import { JuiProfileDialogContentMembers } from 'jui/pattern/Profile/Dialog';

@observer
class MembersView extends Component<MembersViewProps> {
  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { changeSearchInputDebounce } = this.props;
    changeSearchInputDebounce(event.target.value);
  }

  render() {
    const { id, sortedAllMemberIds, filteredMemberIds } = this.props;
    return (
      <JuiProfileDialogContentMembers>
        <MemberHeader id={id} onSearch={this.handleSearch} />
        <MemberList
          id={id}
          sortedAllMemberIds={sortedAllMemberIds}
          filteredMemberIds={filteredMemberIds}
        />
      </JuiProfileDialogContentMembers>
    );
  }
}

export { MembersView };
