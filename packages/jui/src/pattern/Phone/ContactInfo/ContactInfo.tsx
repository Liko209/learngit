/**
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-08-01 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import styled, { css } from '../../../foundation/styled-components';
import { primary, spacing, width, height } from '../../../foundation/utils';

type JuiContactInfoProps = {
  isUnread: boolean;
};

const getUnreadStyle = (isUnread: boolean) => {
  if (!isUnread) return;

  return css`
    && {
      .list-item-primary {
        color: ${primary('main')};

        &:before {
          content: '';
          display: inline-block;
          width: ${width(2)};
          height: ${height(2)};
          border-radius: 50%;
          background: ${primary('main')};
          margin: ${spacing(0, 1, 0, 0)};
        }
      }
    }
  `;
};

const JuiContactInfo = styled.div<JuiContactInfoProps>`
  display: flex;
  align-items: center;

  ${({ isUnread }: JuiContactInfoProps) => getUnreadStyle(isUnread)}
`;

export { JuiContactInfo };
