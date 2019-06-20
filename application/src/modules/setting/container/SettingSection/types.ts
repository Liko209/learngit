/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:48:36
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingSection, SettingItem } from '@/interface/setting';
import { StoreSection } from '../../store/SettingStoreScope';

type SettingSectionProps = {
  sectionId: SettingSection['id'];
};

type SettingSectionViewProps = {
  section?: StoreSection;
  itemIds: SettingItem['id'][];
};

export { SettingSectionProps, SettingSectionViewProps };
