/*
 * @Author: isaac.liu
 * @Date: 2019-01-10 15:48:20
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiRightShelfEmptyScreen,
  JuiFlexWrapper,
} from 'jui/pattern/EmptyScreen';

import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { TAB_CONFIG, TabConfig } from './config';

type Props = {
  type: RIGHT_RAIL_ITEM_TYPE,
} & WithTranslation;

class EmptyViewComponent extends Component<Props> {
  render() {
    const { type, t } = this.props;
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
  }
}

const EmptyView = withTranslation('translations')(EmptyViewComponent);

export { EmptyView };
