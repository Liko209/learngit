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
import { SETTING_PERFORMANCE_KEYS } from '../../performanceKeys';
import { SettingPageViewProps, SettingPageProps } from './types';
import { PerformanceTracer } from 'foundation/performance';
import { dataAnalysis } from 'foundation/analysis';

// TODO move to jui
const StyledSettingPage = styled.div`
  overflow: auto;
  height: 100%;
`;

type Props = SettingPageProps & SettingPageViewProps & WithTranslation;

@observer
class SettingPageViewComponent extends Component<Props> {
  private _performanceTracer: PerformanceTracer = PerformanceTracer.start();
  @observable private _size: Size = { width: 0, height: 0 };
  @observable private _sources: HTMLElement[] = [];

  @action
  private _handleSizeUpdate = (size: Size) => {
    if (size.width !== this._size.width || size.height !== this._size.height) {
      this._size = size;
    }
  };

  @action
  private _updateSource = (el: any) => {
    this._sources = [el];
  };

  componentDidUpdate() {
    this._performanceTracer.end({
      key: SETTING_PERFORMANCE_KEYS.UI_SETTING_PAGE_RENDER,
    });
  }
  componentDidMount() {
    const { page } = this.props;
    const tracking = page.dataTracking;
    if (tracking) {
      dataAnalysis.page(`Jup_Web/DT_settings_${tracking.name}`);
    }
  }
  render() {
    const { t, id, page } = this.props;
    const { width } = this._size;

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
        {width ? (
          <JuiSettingSectionContainer containerWidth={width}>
            {this._renderSections()}
          </JuiSettingSectionContainer>
        ) : null}
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
