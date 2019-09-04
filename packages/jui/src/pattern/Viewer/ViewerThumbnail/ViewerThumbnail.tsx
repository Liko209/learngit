/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent, KeyboardEvent } from 'react';
import styled from '../../../foundation/styled-components';
import {
  primary,
  palette,
  spacing,
  typography,
} from '../../../foundation/utils/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const defaultThumbnailProportion = {
  '3/4': 3 / 4,
  '4/3': 4 / 3,
  '9/16': 9 / 16,
  '16/9': 16 / 9,
};

const viewerThumbnailMaxWidth = 236;

const EnterKeyCode = 13;

type ThumbnailInfoType = {
  thumbnailNumber: number;
};

type Props = {
  thumbnailNumber?: number;
  thumbnailProportion?: string;
  selected?: boolean;
  showThumbnailNumber?: boolean;
  onSelected?: (
    e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
    info: ThumbnailInfoType,
  ) => void;
  onKeyDown?: (
    e: KeyboardEvent<HTMLDivElement>,
    info: ThumbnailInfoType,
  ) => void;
};

type States = {
  info: ThumbnailInfoType;
};

const ViewerThumbnailContentWrap = styled.div`
  && {
    padding: ${spacing(2)};
    width: 100%;
    border-radius: ${({ theme }) => theme.radius.xl};
    div {
      border-radius: ${({ theme }) => theme.radius.xl};
    }
    min-height: ${viewerThumbnailMaxWidth /
      defaultThumbnailProportion['16/9']}px;
    box-sizing: border-box;
  }
`;

const ThumbnailNumberWarp = styled.div`
  && {
    text-align: center;
    margin-top: ${spacing(1)};
    ${typography('caption1')};
    color: ${palette('text', 'primary')};
  }
`;

const ViewerThumbnailWrap = styled.div`
  && {
    height: auto;
    width: 100%;
    max-width: ${viewerThumbnailMaxWidth}px;
    cursor: pointer;
    margin-bottom: ${spacing(2)};
    outline: none;

    &&:hover {
      && ${ViewerThumbnailContentWrap} {
        background-color: ${({ theme }) =>
          fade(palette('primary', 'main')({ theme }), theme.opacity['1'])};
      }
    }

    &&:active {
      && ${ViewerThumbnailContentWrap} {
        background-color: ${({ theme }) =>
          fade(palette('primary', 'main')({ theme }), theme.opacity['2'])};
      }
    }

    &&.selected {
      && ${ViewerThumbnailContentWrap} {
        box-shadow: 0 0 0 1px ${primary('700')};
      }
    }

    &&:last-child {
      margin-bottom: 0;
    }
  }
`;

const ThumbnailWarp = styled.div`
  && {
    overflow: hidden;
    border-radius: ${({ theme }) => theme.radius.lg};
    font-size: 0;
    min-height: ${viewerThumbnailMaxWidth /
      defaultThumbnailProportion['16/9']}px;

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f6fb;
  }
`;

class JuiViewerThumbnail extends React.PureComponent<Props, States> {
  state = {
    info: {
      thumbnailNumber: 0,
    },
  };

  componentDidMount() {
    const { thumbnailNumber } = this.props;
    if (thumbnailNumber !== undefined) {
      const info = { thumbnailNumber };
      this.setState({
        info,
      });
    }
  }

  getContent = () => {
    const { children } = this.props;
    return <ThumbnailWarp>{children}</ThumbnailWarp>;
  };

  handleSelected = (e: MouseEvent<HTMLDivElement>) => {
    const { onSelected } = this.props;
    onSelected && onSelected(e, this.state.info);
  };

  handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { onKeyDown, onSelected } = this.props;
    onKeyDown && onKeyDown(e, this.state.info);
    if (e.keyCode === EnterKeyCode && onSelected) {
      onSelected(e, this.state.info);
    }
  };

  render() {
    const {
      thumbnailNumber,
      selected,
      showThumbnailNumber = true,
    } = this.props;
    const content = this.getContent();

    if (!content) {
      return null;
    }

    let thumbnailNum: number = 0;
    thumbnailNum = thumbnailNumber !== undefined ? thumbnailNumber + 1 : 1;

    return (
      <ViewerThumbnailWrap
        className={`ViewerThumbnail${selected ? ' selected' : ''}`}
        onKeyDown={this.handleKeyDown}
        onClick={this.handleSelected}
        tabIndex={0}
        data-thumbnail-index={thumbnailNumber}
      >
        <ViewerThumbnailContentWrap>{content}</ViewerThumbnailContentWrap>
        {showThumbnailNumber && (
          <ThumbnailNumberWarp
            data-test-automation-id={'viewerThumbnailNumber'}
          >
            {thumbnailNum}
          </ThumbnailNumberWarp>
        )}
      </ViewerThumbnailWrap>
    );
  }
}

export { JuiViewerThumbnail, ThumbnailInfoType };
