/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const JuiEditProfileContent = styled.div`
  margin-top: ${spacing(6)};
  display: flex;
`;

const JuiEditProfileSectionContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: ${spacing(2)} 0 ${spacing(-4)};
`;

const JuiEditProfileSection = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: ${spacing(4)};
  > :first-child {
    margin-right: ${spacing(6)};
  }
  > div {
    flex: 1;
  }
`;

export {
  JuiEditProfileContent,
  JuiEditProfileSection,
  JuiEditProfileSectionContent,
};
