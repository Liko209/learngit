/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 15:14:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode } from 'react';
import MuiListSubheader, {
  ListSubheaderProps as MuiListSubheaderProps,
} from '@material-ui/core/ListSubheader';
import {
  JuiCard,
  JuiCardContent,
  JuiCardContentProps,
} from '../../components/Cards';
import styled from '../../foundation/styled-components';
import {
  spacing,
  ellipsis,
  grey,
  typography,
} from '../../foundation/utils/styles';

type JuiSettingSectionProps = {
  automationId?: string;
  title?: ReactNode;
};

const TitleHeaderWrap = styled<MuiListSubheaderProps>(MuiListSubheader)`
  && {
    display: flex;
    color: ${grey('700')};
    ${typography('body1')}
    padding: ${spacing(0, 0, 1, 0)};
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

const SettingSectionWrap = styled.div`
  && {
    margin-bottom: ${spacing(4)};
  }
`;

const SettingCardWrap = styled(JuiCard)`
  && {
    overflow: visible;
  }
`;

class JuiSettingSection extends React.PureComponent<JuiSettingSectionProps> {
  render() {
    const { children, title, automationId } = this.props;
    return (
      <SettingSectionWrap
        className="setting-section"
        data-test-automation-id={`settingSection-${automationId}`}
        data-test-automation-class={'settingSection'}
      >
        <TitleHeaderWrap component="div" disableSticky>
          <TitleWrap
            className="setting-section-title"
            data-test-automation-id={`settingSectionTitle-${automationId}`}
          >
            {title}
          </TitleWrap>
        </TitleHeaderWrap>
        <SettingCardWrap>
          <ContentWrap className="setting-section-content">
            {children}
          </ContentWrap>
        </SettingCardWrap>
      </SettingSectionWrap>
    );
  }
}

export { JuiSettingSection, JuiSettingSectionProps };
