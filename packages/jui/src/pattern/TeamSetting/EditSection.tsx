/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 10:46:40
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const JuiTeamSettingEditSection = styled.div`
  display: flex;
  padding: ${spacing(0, 6, 4)};
`;

const JuiTeamSettingEditSectionLeft = styled.div`
  padding-right: ${spacing(4)};
`;
const JuiTeamSettingEditSectionRight = styled.div`
  flex: 1;
  transform: translateZ(0);
`;

export {
  JuiTeamSettingEditSection,
  JuiTeamSettingEditSectionLeft,
  JuiTeamSettingEditSectionRight,
};
