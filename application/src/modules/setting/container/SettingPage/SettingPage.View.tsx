/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SettingPageViewProps, SettingPageProps } from './types';
import styled from 'jui/foundation/styled-components';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { JuiSettingSection } from 'jui/pattern/SettingSection';
import { SettingSection, SettingItem } from '@/interface/setting';
import { ScrollMemory } from '@/modules/common/container/ScrollMemory';
import { SettingItemProxy } from './SettingItemProxy';

// TODO move to jui
const StyledSettingPage = styled.div`
  overflow: auto;
  height: 100%;
`;

// TODO move to jui
const StyledSettingPageContent = styled.div`
  padding: 16px;
`;

type Props = SettingPageProps & SettingPageViewProps & WithTranslation;

@observer
class SettingPageViewComponent extends Component<Props> {
  render() {
    if (!this.props.page) return null;

    const { t, id, page, sections } = this.props;
    return (
      <StyledSettingPage data-test-automation-id="SettingContainer">
        <JuiConversationPageHeader
          data-test-automation-id="SettingPageHeader"
          title={t(page.title)}
        />
        <StyledSettingPageContent>
          {this._renderSections(sections)}
        </StyledSettingPageContent>
        <ScrollMemory key={`SETTING_PAGE_${id}`} />
      </StyledSettingPage>
    );
  }

  private _renderSections(sections: SettingSection[]) {
    const { t } = this.props;
    return sections.map(section => {
      return (
        <JuiSettingSection
          key={section.id}
          title={t(section.title)}
          data-test-automation-id="SettingSectionContainer"
        >
          {this._renderSettingItems(section.items)}
        </JuiSettingSection>
      );
    });
  }

  private _renderSettingItems(items: SettingItem[]) {
    return items.map(item => (
      <SettingItemProxy key={item.id} id={item.id} type={item.type} />
    ));
  }
}

const SettingPageView = withTranslation('translations')(
  SettingPageViewComponent,
);

export { SettingPageView };
