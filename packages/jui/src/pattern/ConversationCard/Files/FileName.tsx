/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:52:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { ellipsis, palette, spacing } from '../../../foundation/utils/styles';
import { getFileName } from '../../../foundation/utils/getFileName';
import { Theme } from '../../../foundation/theme/theme';
import { withHighlight } from '../../../hoc/withHighlight';

type FileNameProps = {
  filename: string;
  statusColor?: ({ theme }: { theme: Theme }) => any;
  opacity?: number;
};

const FileNameWrapper = styled('div')<{
  statusColor?: ({ theme }: { theme: Theme }) => any;
  opacity?: number;
}>`
  display: flex;
  min-width: 0;
  align-items: center;
  font-weight: 400;
  color: ${({ statusColor }) =>
    statusColor ? statusColor : palette('grey', '700')};
  ${ellipsis()};
  opacity: ${({ opacity }) => opacity};
  font-size: 0;
  & > span {
    font-size: ${spacing(3.5)};
  }
`;

const LeftName = styled.span`
  ${ellipsis()};
`;

// discussed with PM, here we just used 22 to cover most cases
// since we know truncate in the middle is very difficult
// https://docs.google.com/presentation/d/1GusVIK3sSE-q7E5Nad2vWirtwFOzyMH7a_loS36n7-w/edit#slide=id.p
const MAX_FILENAME_LENGTH = 22;

class FileName extends React.Component<FileNameProps> {
  // private _nameWrapper: RefObject<any> = createRef();
  // state = {
  //   shouldTruncate: false,
  // };
  // componentDidMount() {
  //   this.setState({
  //     shouldTruncate:
  //       this._nameWrapper.current &&
  //       this._nameWrapper.current.offsetWidth <
  //         this._nameWrapper.current.scrollWidth,
  //   });
  // }
  render() {
    const { filename, statusColor, opacity } = this.props;

    let left = '';
    let right = '';
    if (filename && filename.length > MAX_FILENAME_LENGTH) {
      [left, right] = getFileName(filename);
    } else {
      left = filename;
    }

    const Children = withHighlight(['left', 'right'])(
      ({ left, right }: { left: string; right: string }) => {
        return (
          <>
            <LeftName
              dangerouslySetInnerHTML={{ __html: left }}
              // ref={this._nameWrapper}
            />
            <span dangerouslySetInnerHTML={{ __html: right }} />
          </>
        );
      },
    );
    return (
      <FileNameWrapper
        statusColor={statusColor}
        opacity={opacity}
        data-test-automation-id="file-name"
      >
        <Children left={left} right={right} />
      </FileNameWrapper>
    );
  }
}

export { FileName, FileNameProps };
