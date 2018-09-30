/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { JuiIconography } from 'jui/foundation';
import { JuiListSection, JuiList } from 'jui/components';
import { toTitleCase } from '@/utils';
import { SectionViewProps } from './types';

// TODO remove Stubs here
const Umi = (props: any) => <div {...props} />;
const ListItem = (props: any) => <div {...props} />;
const JuiListSectionHeader = (props: any) => <div {...props} />;
const JuiListSectionContent = (props: any) => <div {...props} />;
const JuiListSectionHeaderIcon = (props: any) => <div {...props} />;
const JuiListSectionHeaderText = (props: any) => <div {...props} />;
const JuiListSectionHeaderUmi = (props: any) => <div {...props} />;

const SortableList = SortableContainer(JuiList);
const SortableItem = SortableElement(ListItem);

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
      <JuiList>
        {this.props.groupIds.map((id: number) => (
          <ListItem id={id} key={id} />
        ))}
      </JuiList>
    );
  }

  render() {
    const { t, title, groupIds, iconName, expanded } = this.props;
    return (
      <div>
        <JuiListSection expanded={expanded}>
          <JuiListSectionHeader>
            <JuiListSectionHeaderIcon>
              <JuiIconography>{iconName}</JuiIconography>
            </JuiListSectionHeaderIcon>
            <JuiListSectionHeaderText>
              {toTitleCase(t(title))}
            </JuiListSectionHeaderText>
            <JuiListSectionHeaderUmi>
              <Umi groupIds={groupIds} />
            </JuiListSectionHeaderUmi>
          </JuiListSectionHeader>
          <JuiListSectionContent>{this.renderList()}</JuiListSectionContent>
        </JuiListSection>
      </div>
    );
  }
}

const SectionView = translate('Conversations')(SectionViewComponent);

export { SectionView };
export default SectionView;
