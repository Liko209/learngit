/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-24 10:41:04
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  grey,
  typography,
  width,
} from '../../../foundation/utils';
import { palette } from 'rcui/foundation/shared/theme';
import React, { PureComponent } from 'react';
import { withLoading } from '../../../hoc/withLoading';

const RightShellMemberListHeader = styled.div`
  padding: ${spacing(0, 4)};
  height: ${height(8)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${grey('300')};
  border-bottom: 1px solid ${grey('300')};
  font-size: 0;
`;

const RightShellMemberListTitle = styled.span`
  ${typography('caption1')};
  color: ${palette('common', 'black')};
  padding-right: ${spacing(3)};
  position: relative;
`;

const RightShellMemberListSubTitle = styled.div`
  ${typography('caption1')};
  color: ${palette('grey', 500)};
  padding-bottom: ${spacing(2)};
  margin-left: ${spacing(1)};
  margin-top: ${spacing(2)};
  margin-bottom: ${spacing(3)};
  border-bottom: 1px solid ${grey('300')};
`;

type BodyProps = { loading: boolean; [attr: string]: any };
const RightShellMemberListBody = styled(({ loading, ...rest }: BodyProps) => (
  <div {...rest} />
))`
  height: ${({ loading, theme }) => (loading ? height(56)({ theme }) : 'auto')};
  padding: ${spacing(4, 3, 2)};
  position: relative;
`;

const RightShellMemberListAvatarWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  > * {
    margin-left: ${spacing(1)};
    margin-bottom: ${spacing(2)};
  }
`;

const RightShellMemberListMoreCount = styled.div`
  width: ${width(8)};
  height: ${height(8)};
  ${typography('caption1')};
  color: ${palette('grey', 500)};
  line-height: ${height(8)};
  text-align: center;
`;

const JuiRightShellMemberListBody = ({
  loading,
  children,
  ...rest
}: BodyProps) => {
  const Loading = withLoading(() => <div />);
  return (
    <RightShellMemberListBody loading={loading} {...rest}>
      {loading ? <Loading loading /> : children}
    </RightShellMemberListBody>
  );
};

class JuiRightShellMemberListMoreCount extends PureComponent<{
  count: number;
}> {
  private _ref = React.createRef<any>();
  private MAX_WIDTH = 32;

  componentDidMount() {
    this.fitText();
  }

  componentDidUpdate() {
    this.fitText();
  }

  fitText() {
    if (!this._ref.current) {
      return;
    }
    if (this._ref.current.scrollWidth > this.MAX_WIDTH) {
      this._ref.current.firstChild.style.transform = `scale(${this.MAX_WIDTH /
        this._ref.current.scrollWidth})`;
    }
  }

  render() {
    const { count, ...rest } = this.props;
    return (
      <RightShellMemberListMoreCount {...rest} ref={this._ref}>
        <div>+{count}</div>
      </RightShellMemberListMoreCount>
    );
  }
}

export {
  RightShellMemberListHeader as JuiRightShellMemberListHeader,
  RightShellMemberListTitle as JuiRightShellMemberListTitle,
  RightShellMemberListSubTitle as JuiRightShellMemberListSubTitle,
  JuiRightShellMemberListBody,
  RightShellMemberListAvatarWrapper as JuiRightShellMemberListAvatarWrapper,
  JuiRightShellMemberListMoreCount,
};
