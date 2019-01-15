/*
 * @Author: isaac.liu
 * @Date: 2019-01-10 15:48:20
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import {
  JuiRightShelfEmptyScreen,
  JuiFlexWrapper,
} from 'jui/pattern/EmptyScreen';

import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { TAB_CONFIG, TabConfig } from './config';

const emptyView = (type: RIGHT_RAIL_ITEM_TYPE) => {
  const config = TAB_CONFIG.find((looper: TabConfig) => looper.type === type);
  if (config) {
    const { text, content, image } = config.empty;
    return (
      <JuiFlexWrapper>
        <JuiRightShelfEmptyScreen
          actions={[]}
          text={t(text)}
          content={t(content)}
          image={image}
        />
      </JuiFlexWrapper>
    );
  }
  return <></>;
};

export { emptyView };
