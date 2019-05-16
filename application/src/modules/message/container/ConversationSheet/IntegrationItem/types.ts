/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:55:24
 * Copyright © RingCentral. All rights reserved.
 */
import { IntegrationItem } from 'sdk/module/item/entity';

type IntegrationItemProps = {
  ids: number[];
};

type IntegrationItemViewProps = {
  items: IntegrationItem[];
};

export { IntegrationItemProps, IntegrationItemViewProps };
