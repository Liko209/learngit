/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { ESettingValueType } from 'sdk/module/setting/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';

type SettingItemProps = {
  id: number;
  onChange: <T>(item: T) => void;
  valueType: ESettingValueType;
  source?: any[];
  value?: any;
  state: ESettingItemState;
};

type BuildSettingItemProps = {
  label: string;
  description: string;
  automationKey: string;
  Right: React.ComponentType<any>;
};

const buildSettingItem = ({
  label,
  description,
  automationKey,
  Right,
}: BuildSettingItemProps) => {
  return class SettingItem extends Component<SettingItemProps> {
    render() {
      return (
        <JuiSettingSectionItem
          id={automationKey}
          label={label}
          description={description}
        >
          <Right {...this.props} />
        </JuiSettingSectionItem>
      );
    }
  };
};

export { buildSettingItem, SettingItemProps };
