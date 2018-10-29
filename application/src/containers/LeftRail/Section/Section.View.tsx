/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  JuiConversationList,
  JuiConversationListSection,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '@/containers/ConversationList/ConversationListItem';
import { toTitleCase } from '@/utils';
import { SectionViewProps } from './types';
import { Umi } from '../../Umi';
import storeManager from '@/store';
import history from '@/utils/history';
import { GLOBAL_KEYS } from '@/store/constants';
// TODO remove Stubs here

const SortableList = SortableContainer(JuiConversationList);
const SortableItem = SortableElement(ConversationListItem);

type Props = SectionViewProps & {
  t: TranslationFunction;
};

class SectionViewComponent extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const prevGroupIds = prevProps.groupIds;
    const { groupIds } = this.props;
    const diff = [...prevGroupIds].filter(id => !new Set(groupIds).has(id));
    const currentGroupId = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    if (diff.length === 1 && diff[0] === currentGroupId) {
      history.replace('/messages');
    }
  }
  renderList() {
    const { sortable, onSortEnd } = this.props;

    if (sortable) {
      return (
        <SortableList
          className="conversation-list-section-collapse"
          distance={5}
          lockAxis="y"
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
    const { t, title, groupIds, iconName, expanded } = this.props;
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
        >
          {this.renderList()}
        </JuiConversationListSection>
      </div>
    );
  }
}

const SectionView = translate('Conversations')(SectionViewComponent);

export { SectionView };
export default SectionView;
