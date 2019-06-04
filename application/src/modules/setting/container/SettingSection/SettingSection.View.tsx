/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SettingSectionViewProps, SettingSectionProps } from './types';
import { JuiSettingSection } from 'jui/pattern/SettingSection';
import { SettingItemProxy } from '../SettingItem/SettingItemProxy';

type Props = SettingSectionProps & SettingSectionViewProps & WithTranslation;

@observer
class SettingSectionComponent extends Component<Props> {
  render() {
    if (!this.props.section) return null;

    const { t, section } = this.props;

    return (
      <JuiSettingSection
        key={section.id}
        title={t(section.title)}
        automationId={section.automationId}
      >
        {this._renderSettingItems()}
      </JuiSettingSection>
    );
  }

  private _renderSettingItems() {
    return this.props.itemIds.map(itemId => (
      <SettingItemProxy key={itemId} itemId={itemId} />
    ));
  }
}

const SettingSectionView = withTranslation('translations')(
  SettingSectionComponent,
);

export { SettingSectionView };
