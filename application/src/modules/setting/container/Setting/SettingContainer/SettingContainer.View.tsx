/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { SettingContainerViewProps } from './types';
import { observer } from 'mobx-react';
import styled from 'jui/foundation/styled-components';
import {
  JuiSettingSection,
  JuiSettingSectionContainer,
} from 'jui/pattern/SettingSection';
import { SettingStore } from '@/modules/setting/store';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { container } from 'framework';
import SettingModel from '@/store/models/UserSetting';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { SETTING_ITEM } from '../../constants';

const StyledSettingContainer = styled.div`
  overflow: auto;
  height: 100%;
`;
@observer
class SettingContainerViewComponent extends Component<
  SettingContainerViewProps & WithTranslation,
  Size
> {
  state: Size = {
    width: 0,
    height: 0,
  };
  private _wrapRef: React.RefObject<any> = React.createRef();
  private _settingStore: SettingStore = container.get(SettingStore);

  private _scrollEl: HTMLElement;

  source: HTMLElement[];

  componentDidMount() {
    this.scrollToPosition();
  }

  componentWillUnmount() {
    this.setScrollHeight();
  }

  private _handleSizeUpdate = (size: Size) => {
    this.setState({
      ...size,
    });
  }

  scrollToPosition = () => {
    const { type, getCurrentTypeScrollHeight } = this.props;
    const scrollHeight = getCurrentTypeScrollHeight(type);
    const scrollEl = this._wrapRef.current;
    if (scrollEl) {
      this._scrollEl = scrollEl;
      this._scrollEl.scrollTop = scrollHeight;
    }
  }

  setScrollHeight = () => {
    if (this._scrollEl) {
      const { type, setCurrentTypeScrollHeight } = this.props;
      setCurrentTypeScrollHeight(type, this._scrollEl.scrollTop);
    }
  }

  renderItem = () => {
    const { settingItemData, t, handleItemChange } = this.props;
    const { sortSection, sortItem } = settingItemData;
    return (
      <>
        {sortSection.map(sectionId => {
          const { title } = SETTING_ITEM[sectionId];
          if (!sortItem[sectionId]) return;
          return (
            <JuiSettingSection
              key={title}
              title={t(title)}
              data-test-automation-id="SettingSectionContainer"
            >
              {sortItem[sectionId].map(
                ({
                  id,
                  value,
                  state,
                  valueSetter = () => {},
                  source,
                }: SettingModel) => {
                  if (
                    this._settingStore.SettingItems &&
                    this._settingStore.SettingItems[id]
                  ) {
                    const SettingItemComponent = this._settingStore
                      .SettingItems[id];
                    return (
                      <SettingItemComponent
                        key={id}
                        id={id}
                        value={value}
                        source={source}
                        state={state}
                        onChange={handleItemChange(valueSetter)}
                      />
                    );
                  }
                  return null;
                },
              )}
            </JuiSettingSection>
          );
        })}
      </>
    );
  }

  render() {
    const { leftRailItemId, t } = this.props;
    const { width } = this.state;
    if (this._wrapRef.current && !this.source) {
      this.source = [this._wrapRef.current];
    }
    return (
      <StyledSettingContainer
        data-test-automation-id="SettingContainer"
        ref={this._wrapRef}
      >
        <JuiConversationPageHeader
          data-test-automation-id="SettingPageHeader"
          title={t(SETTING_ITEM[leftRailItemId].title)}
        />

        <JuiSizeDetector
          handleSizeChanged={this._handleSizeUpdate}
          sources={this.source}
        />
        <JuiSettingSectionContainer containerWidth={width}>
          {this.renderItem()}
        </JuiSettingSectionContainer>
      </StyledSettingContainer>
    );
  }
}

const SettingContainerView = withTranslation('translations')(
  SettingContainerViewComponent,
);

export { SettingContainerView };
