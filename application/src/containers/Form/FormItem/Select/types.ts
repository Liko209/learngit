/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-06 11:15:31
 * Copyright © RingCentral. All rights reserved.
 */

import { SelectFormItem, DataTracking } from '../../types';

type SelectItemProps<T> = {
  itemConfig: SelectFormItem<T>;
  value: string;
  source: T[];
  dataTrackingSender: (config: DataTracking, value?: any) => void;
  disabled?: boolean;
};

type SelectItemViewProps<T> = SelectItemProps<T> & {
  saveValue(value: string): Promise<void> | void;
  extractValue: (raw: T) => string;
};

export { SelectItemProps, SelectItemViewProps };
