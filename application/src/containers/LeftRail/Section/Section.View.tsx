/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  JuiConversationList,
  JuiConversationListSection,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '@/containers/ConversationList/ConversationListItem';
import { toTitleCase } from '@/utils/string';
import { SectionViewProps } from './types';
import { Umi } from '../../Umi';
import { JuiDivider } from 'jui/components/Divider';
import { observer } from 'mobx-react';
// TODO remove Stubs here

const SortableList = SortableContainer(JuiConversationList);
const SortableItem = SortableElement(ConversationListItem);

type Props = SectionViewProps & WithNamespaces;

@observer
class SectionViewComponent extends React.Component<Props> {
  renderList() {
    const { sortable, onSortEnd } = this.props;

    if (sortable) {
      return (
        <SortableList
          className="conversation-list-section-collapse"
          distance={5}
          lockAxis="y"
          helperClass="dragging"
          onSortEnd={onSortEnd}
        >
          {this.props.groupIds.map((id: number, index: number) => (
            <SortableItem key={id} groupId={id} index={index} />
          ))}
        </SortableList>
      );
    }

    return (
      <JuiConversationList className="conversation-list-section-collapse">
        {this.props.groupIds.map((id: number) => (
          <ConversationListItem key={id} groupId={id} />
        ))}
      </JuiConversationList>
    );
  }

  render() {
    const {
      t,
      title,
      groupIds,
      iconName,
      expanded,
      isLast,
      handleCollapse,
      handleExpand,
    } = this.props;
    return (
      <div
        className="conversation-list-section"
        data-name={toTitleCase(t(title))}
      >
        <JuiConversationListSection
          title={toTitleCase(t(title))}
          icon={iconName}
          umi={<Umi ids={groupIds} />}
          expanded={expanded}
          onCollapse={handleCollapse}
          onExpand={handleExpand}
        >
          {this.renderList()}
        </JuiConversationListSection>
        {isLast && !expanded ? <JuiDivider key="divider" /> : null}
      </div>
    );
  }
}

const SectionView = translate('translations')(SectionViewComponent);

export { SectionView };
export default SectionView;
