/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { JuiIconography } from 'jui/foundation/Iconography';
import {
  JuiConversationList,
  JuiConversationListSection,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '@/containers/ConversationList/ConversationListItem';
import { toTitleCase } from '@/utils';
import { SectionViewProps } from './types';
import { Umi } from '../../Umi';

// TODO remove Stubs here

const SortableList = SortableContainer(JuiConversationList);
const SortableItem = SortableElement(ConversationListItem);

class SectionViewComponent extends React.Component<
  SectionViewProps & {
    t: TranslationFunction;
  }
> {
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
            <SortableItem groupId={id} key={id} index={index} />
          ))}
        </SortableList>
      );
    }

    return (
      <JuiConversationList>
        {this.props.groupIds.map((id: number) => (
          <ConversationListItem groupId={id} key={id} />
        ))}
      </JuiConversationList>
    );
  }

  render() {
    const { t, title, groupIds, iconName, expanded } = this.props;
    return (
      <div>
        <JuiConversationListSection
          title={toTitleCase(t(title))}
          icon={<JuiIconography>{iconName}</JuiIconography>}
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
