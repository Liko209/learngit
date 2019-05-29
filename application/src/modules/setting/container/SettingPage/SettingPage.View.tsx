/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'jui/foundation/styled-components';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { ScrollMemory } from '@/modules/common/container/ScrollMemory';
import { SettingSection } from '../SettingSection';
import { SettingPageViewProps, SettingPageProps } from './types';

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

    const { t, id, page } = this.props;
    return (
      <StyledSettingPage data-test-automation-id="SettingContainer">
        <JuiConversationPageHeader
          data-test-automation-id="SettingPageHeader"
          title={t(page.title)}
        />
        <StyledSettingPageContent>
          {this._renderSections()}
        </StyledSettingPageContent>
        <ScrollMemory id={`SETTING_PAGE_${id}`} />
      </StyledSettingPage>
    );
  }

  private _renderSections() {
    return this.props.sectionIds.map(sectionId => (
      <SettingSection key={sectionId} sectionId={sectionId} />
    ));
  }
}

const SettingPageView = withTranslation('translations')(
  SettingPageViewComponent,
);

export { SettingPageView };
