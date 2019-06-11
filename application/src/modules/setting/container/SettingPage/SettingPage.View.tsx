/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'jui/foundation/styled-components';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { ScrollMemory } from '@/modules/common/container/ScrollMemory';
import { JuiSettingSectionContainer } from 'jui/pattern/SettingSection';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { SettingSection } from '../SettingSection';
import { SettingPageViewProps, SettingPageProps } from './types';
import { mainLogger } from 'sdk';

// TODO move to jui
const StyledSettingPage = styled.div`
  overflow: auto;
  height: 100%;
`;

type Props = SettingPageProps & SettingPageViewProps & WithTranslation;

@observer
class SettingPageViewComponent extends Component<Props> {
  @observable private _size: Size = { width: 0, height: 0 };
  @observable private _sources: HTMLElement[] = [];

  @action
  private _handleSizeUpdate = (size: Size) => {
    if (size.width !== this._size.width || size.height !== this._size.height) {
      this._size = size;
    }
  }

  @action
  private _updateSource = (el: any) => {
    this._sources = [el];
  }

  render() {
    const { t, id, page } = this.props;

    if (!page) {
      mainLogger.warn(
        '[SettingPageViewComponent] trying to render a setting page without page info',
      );
      return null;
    }

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
          sources={this._sources}
        />
        <JuiSettingSectionContainer containerWidth={this._size.width}>
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
