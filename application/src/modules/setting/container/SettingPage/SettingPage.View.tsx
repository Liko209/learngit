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
import { JuiSettingSectionContainer } from 'jui/pattern/SettingSection';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { SettingSection } from '../SettingSection';
import { SettingPageViewProps, SettingPageProps } from './types';
import { observable } from 'mobx';

// TODO move to jui
const StyledSettingPage = styled.div`
  overflow: auto;
  height: 100%;
`;

type Props = SettingPageProps & SettingPageViewProps & WithTranslation;

@observer
class SettingPageViewComponent extends Component<Props> {
  @observable size: Size = { width: 0, height: 0 };
  @observable sources: HTMLElement[] = [];

  private _handleSizeUpdate = (size: Size) => {
    this.size = size;
  }

  private _updateSource = (el: any) => {
    this.sources = [el];
  }

  render() {
    if (!this.props.page) return null;
    const { t, id, page } = this.props;

    return (
      <StyledSettingPage
        ref={this._updateSource}
        data-test-automation-id={`settingPage-${page.automationId}`}
      >
        <JuiConversationPageHeader
          data-test-automation-id={`settingPageHeader-${page.automationId}`}
          data-test-automation-value={page.title}
          title={t(page.title)}
        />
        <JuiSizeDetector
          handleSizeChanged={this._handleSizeUpdate}
          sources={this.sources}
        />
        <JuiSettingSectionContainer containerWidth={this.size.width}>
          {this._renderSections()}
        </JuiSettingSectionContainer>
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
