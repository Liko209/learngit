/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
// import { t } from 'i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';
import { ViewProps } from './types';

@observer
class PersonItemView extends React.Component<ViewProps, {}> {
  render() {
    const {
      title,
      person,
      terms,
      onClick,
      cellIndex,
      onMouseEnter,
      onMouseLeave,
      sectionIndex,
      selectIndex,
    } = this.props;
    const { id, userDisplayName } = person;
    console.log(person, '-----person nello');
    const hovered =
      sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        key={id}
        onClick={onClick(id)}
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
