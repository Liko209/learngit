/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { MemberListHeaderViewProps, GROUP_LIST_TITLE } from './types';
import styled from 'jui/foundation/styled-components';
import {
  spacing,
  grey,
  typography,
} from 'jui/foundation/utils/styles';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
const StyledTitle = styled.p`
  ${typography('subheading')};
  color: ${grey('900')};
  margin-left: ${spacing(6)};
`;
@observer
class MemberListHeader extends React.Component<MemberListHeaderViewProps> {
  render() {
    const { counts, idType, t } = this.props;
    return (
      <StyledTitle>
        {idType === TypeDictionary.TYPE_ID_TEAM
          ? `${t(GROUP_LIST_TITLE.TEAM_MEMBERS)} (${counts})`
          : `${t(GROUP_LIST_TITLE.GROUP_MEMBERS)} (${counts})`}
      </StyledTitle>
    );
  }
}
const MemberListHeaderView = translate('translations')(MemberListHeader);
export { MemberListHeaderView };
