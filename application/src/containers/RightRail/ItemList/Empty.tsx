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

import { ITEM_LIST_TYPE } from '../types';
import { TAB_CONFIG, TabConfig } from './config';

const emptyView = (type: ITEM_LIST_TYPE) => {
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
