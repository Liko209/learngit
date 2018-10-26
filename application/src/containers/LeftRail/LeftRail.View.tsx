/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';

import { Section } from './Section';
import { LeftRailViewProps } from './types';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { toTitleCase } from '@/utils';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
  JuiLeftRailMainSection,
} from 'jui/pattern/LeftRail/LeftRail';

const LeftRailViewComponent = (
  props: LeftRailViewProps & { t: TranslationFunction },
) => {
  return (
    <JuiLeftRail>
      <JuiLeftRailStickyTop>
        {props.filters.map((filter, index) => [
          index ? <JuiDivider key="divider" /> : null,
          <JuiConversationListFilter
            checked={filter.value}
            key={filter.label}
            label={toTitleCase(props.t(filter.label))}
            onChange={filter.onChange}
          />,
        ])}
      </JuiLeftRailStickyTop>
      <JuiDivider key="divider" />
      <JuiLeftRailMainSection>
        {props.sections.map((type, index) => [
          index ? <JuiDivider key="divider" /> : null,
          <Section key={type} type={type} />,
        ])}
      </JuiLeftRailMainSection>
    </JuiLeftRail>
  );
};

const LeftRailView = translate('Conversations')(LeftRailViewComponent);

export { LeftRailView };
