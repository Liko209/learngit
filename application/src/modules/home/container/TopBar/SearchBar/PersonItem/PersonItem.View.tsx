/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { JuiSearchTitle, JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';
import { ViewProps, PersonModel } from './types';

@observer
class PersonItemView extends React.Component<ViewProps, {}> {
  render() {
    const {
      hasMore,
      title,
      persons,
      terms,
      onClick,
      onMouseEnter,
      onMouseLeave,
      sectionIndex,
      selectIndex,
    } = this.props;
    const hasPersons = persons.length > 0;
    return (
      <>
        {hasPersons && (
          <JuiSearchTitle
            isShowMore={hasMore}
            showMore={t('showMore')}
            title={t(title)}
            data-test-automation-id={`search-${title}`}
          />
        )}
        {persons.map((item: PersonModel, cellIndex: number) => {
          const { id, userDisplayName } = item;
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
        })}
      </>
    );
  }
}

export { PersonItemView };
