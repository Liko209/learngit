/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { MembersViewProps, MembersProps } from './types';
import { MemberHeader } from './MemberHeader';
import { MemberList } from './MemberList';
import { JuiProfileDialogContentMembers } from 'jui/pattern/Profile/Dialog';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { ProfileContext } from '../../types';
import {
  ITEM_HEIGHT,
  MAX_HEIGHT,
  MIN_HEIGHT,
  FULLSCREEN_WIDTH,
  DIALOG_MARGIN,
  SHADOW_HEIGHT,
  EMPTY_HEIGHT,
} from './constants';

@observer
class MembersView extends Component<MembersViewProps & MembersProps> {
  static contextType = ProfileContext;
  state = { width: 0, height: 0, searchInput: '' };
  handleSizeChanged = (size: Size) => {
    this.setState(size);
  }
  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { changeSearchInputDebounce } = this.props;
    const { value } = event.target;
    this.setState({ searchInput: value });
    changeSearchInputDebounce(value);
  }

  render() {
    const { id, sortedAllMemberIds, filteredMemberIds } = this.props;
    const { width, height, searchInput } = this.state;
    const { sizeManager, showEmpty, setShowEmpty } = this.context;
    const usedHeight: number = sizeManager.getUsedSize('membersList').height;
    let fix = usedHeight;
    let preferHeight = 0;
    if (width > FULLSCREEN_WIDTH) {
      fix += DIALOG_MARGIN * 2;
      preferHeight = Math.max(
        Math.min(
          Math.min(MAX_HEIGHT, filteredMemberIds.length * ITEM_HEIGHT),
          height - fix - SHADOW_HEIGHT,
        ),
        MIN_HEIGHT,
      );
    } else {
      preferHeight = Math.max(height - fix - SHADOW_HEIGHT, MIN_HEIGHT);
    }
    const headerSize = sizeManager.getSize('profileDialogMemberHeader');
    const totalHeight = showEmpty
      ? EMPTY_HEIGHT + headerSize.height
      : preferHeight + headerSize.height;
    return (
      <JuiProfileDialogContentMembers height={totalHeight}>
        <JuiSizeDetector handleSizeChanged={this.handleSizeChanged} />
        <MemberHeader id={id} onSearch={this.handleSearch} />
        <MemberList
          id={id}
          sortedAllMemberIds={sortedAllMemberIds}
          filteredMemberIds={filteredMemberIds}
          searchInput={searchInput}
          width={width}
          height={preferHeight}
          setShowEmpty={setShowEmpty}
        />
      </JuiProfileDialogContentMembers>
    );
  }
}

export { MembersView };
