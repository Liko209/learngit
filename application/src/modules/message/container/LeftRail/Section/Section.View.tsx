/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  JuiConversationList,
  JuiConversationListSection,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '../../ConversationList/ConversationListItem';
import { toTitleCase } from '@/utils/string';
import { SectionViewProps, SECTION_TYPE } from './types';
import { Umi, UMI_SECTION_TYPE } from '@/containers/Umi';
import { observer } from 'mobx-react';
import { extraScrollPadding } from '@/utils/system';

const SortableList = SortableContainer(JuiConversationList);
const SortableItem = SortableElement(ConversationListItem);

type Props = SectionViewProps & WithTranslation;

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
      type,
      dataNameForTest,
      title,
      expanded,
      handleCollapse,
      handleExpand,
    } = this.props;
    let umiType: UMI_SECTION_TYPE;
    if (type === SECTION_TYPE.FAVORITE) {
      umiType = UMI_SECTION_TYPE.FAVORITE;
    } else if (type === SECTION_TYPE.DIRECT_MESSAGE) {
      umiType = UMI_SECTION_TYPE.DIRECT_MESSAGE;
    } else {
      umiType = UMI_SECTION_TYPE.TEAM;
    }
    return (
      <div
        className="conversation-list-section"
        data-name={dataNameForTest}
        data-test-automation-id={dataNameForTest}
      >
        <JuiConversationListSection
          title={toTitleCase(t(title)).toUpperCase()}
          extraScrollPadding={extraScrollPadding}
          umi={<Umi type={umiType} />}
          expanded={expanded}
          onCollapse={handleCollapse}
          onExpand={handleExpand}
        >
          {this.renderList()}
        </JuiConversationListSection>
      </div>
    );
  }
}

const SectionView = withTranslation('translations')(SectionViewComponent);

export { SectionView };
export default SectionView;
