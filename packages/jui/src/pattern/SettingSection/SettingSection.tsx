/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 15:14:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiListSubheader,
  JuiListSubheaderProps,
} from '../../components/Lists/ListSubheader';
import {
  JuiCard,
  JuiCardContent,
  JuiCardContentProps,
} from '../../components/Cards';
import styled from '../../foundation/styled-components';
import { spacing, ellipsis } from '../../foundation/utils/styles';

type JuiSettingSectionProps = {
  title?: string;
};

const TitleHeaderWrap = styled<JuiListSubheaderProps>(JuiListSubheader)`
  && {
    background: transparent;
    padding: ${spacing(3, 2, 1, 0)} !important;
  }
`;

const TitleWrap = styled.span`
  && {
    ${ellipsis()};
  }
`;

const ContentWrap = styled<JuiCardContentProps>(JuiCardContent)`
  && {
    padding: ${spacing(4)};
    &:last-child {
      padding-bottom: ${spacing(4)};
    }
  }
`;

class JuiSettingSection extends React.PureComponent<JuiSettingSectionProps> {
  render() {
    const { children, title } = this.props;
    return (
      <div className="setting-section">
        <TitleHeaderWrap component="div">
          <TitleWrap className="setting-section-title">{title}</TitleWrap>
        </TitleHeaderWrap>
        <JuiCard>
          <ContentWrap className="setting-section-content">
            {children}
          </ContentWrap>
        </JuiCard>
      </div>
    );
  }
}

export { JuiSettingSection, JuiSettingSectionProps };
