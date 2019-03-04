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

@observer
class MembersView extends Component<MembersViewProps> {
  handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { doFuzzySearchPersons } = this.props;
    await doFuzzySearchPersons(event.target.value);
  }

  render() {
    const { id, filteredMemberIds } = this.props;
    return (
      <>
        <MemberHeader id={id} onSearch={this.handleSearch} />
        <MemberList id={id} filteredMemberIds={filteredMemberIds} />
      </>
    );
  }
}

export { MembersView };
