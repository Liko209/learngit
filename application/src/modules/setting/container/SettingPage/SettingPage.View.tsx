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

// TODO move to jui
const StyledSettingPage = styled.div`
  overflow: auto;
  height: 100%;
`;

type Props = SettingPageProps & SettingPageViewProps & WithTranslation;

@observer
class SettingPageViewComponent extends Component<Props> {
  state: Size = {
    width: 0,
    height: 0,
  };
  source: HTMLElement[];
  private _wrapRef: React.RefObject<any> = React.createRef();
  private _handleSizeUpdate = (size: Size) => {
    this.setState({
      ...size,
    });
  }

  render() {
    if (!this.props.page) return null;
    const { width } = this.state;
    if (this._wrapRef.current && !this.source) {
      this.source = [this._wrapRef.current];
    }

    const { t, id, page } = this.props;
    return (
      <StyledSettingPage
        ref={this._wrapRef}
        data-test-automation-id="SettingContainer"
      >
        <JuiConversationPageHeader
          data-test-automation-id="SettingPageHeader"
          title={t(page.title)}
        />
        <JuiSizeDetector
          handleSizeChanged={this._handleSizeUpdate}
          sources={this.source}
        />
        <JuiSettingSectionContainer containerWidth={width}>
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
