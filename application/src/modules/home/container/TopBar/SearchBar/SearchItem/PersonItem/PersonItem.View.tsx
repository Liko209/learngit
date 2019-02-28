/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';
// import { HotKeys } from 'jui/hoc/HotKeys';
import { ViewProps } from './types';

@observer
class PersonItemView extends React.Component<ViewProps, {}> {
  onClick = () => {
    const { addRecentRecord } = this.props;
    addRecentRecord();
  }

  render() {
    const {
      title,
      person,
      terms,
      cellIndex,
      onMouseEnter,
      onMouseLeave,
      sectionIndex,
      hovered,
    } = this.props;
    const { id, userDisplayName, deactivated } = person;

    if (deactivated) {
      return null;
    }

    return (
      <JuiSearchItem
        tabIndex={1}
        onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        key={id}
        onClick={this.onClick}
        Avatar={<Avatar uid={id} size="small" />}
        value={userDisplayName}
        terms={terms}
        data-test-automation-id={`search-${title}-item`}
        Actions={null}
        isPrivate={false}
        isJoined={false}
      />
    );
  }
}

export { PersonItemView };
