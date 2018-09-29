/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { ConversationListSection, Icon, ConversationList } from 'ui-components';
import { toTitleCase } from '@/utils';
import { SectionViewProps } from './types';

// TODO remove Stubs here
const Umi = (props: any) => <div />;
const ConversationListItem = (props: any) => <div />;

const SortableList = SortableContainer(ConversationList);
const SortableItem = SortableElement(ConversationListItem);

class SectionViewComponent extends React.Component<SectionViewProps> {
  static defaultProps = {
    expanded: true,
    sortable: false,
  };

  renderList() {
    const { sortable, onSortEnd } = this.props;

    if (sortable) {
      return (
        <SortableList distance={5} lockAxis="y" onSortEnd={onSortEnd}>
          {this.props.groupIds.map((id: number, index: number) => (
            <SortableItem id={id} key={id} index={index} />
          ))}
        </SortableList>
      );
    }

    return (
      <ConversationList>
        {this.props.groupIds.map((id: number) => (
          <ConversationListItem id={id} key={id} />
        ))}
      </ConversationList>
    );
  }

  render() {
    const { t, title, iconName, expanded } = this.props;
    return (
      <div>
        <ConversationListSection
          icon={<Icon>{iconName}</Icon>}
          title={toTitleCase(t(title))}
          umi={<Umi groupIds={groupIds} />}
          expanded={expanded}
        >
          {this.renderList()}
        </ConversationListSection>
      </div>
    );
  }
}

const SectionView = translate('Conversations')(SectionViewComponent);

export { SectionView };
export default SectionView;
