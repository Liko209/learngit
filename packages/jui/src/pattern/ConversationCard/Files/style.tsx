/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:16:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem from '@material-ui/core/ListItem';
import MuiCardContent from '@material-ui/core/CardContent';
import MuiCardActions from '@material-ui/core/CardActions';
import {
  JuiTypography,
  JuiTypographyProps,
} from '../../../foundation/Typography';
import { JuiListItemText } from '../../../components/Lists';
import { JuiCardMedia, JuiCard } from '../../../components/Cards';
import styled from '../../../foundation/styled-components';
import {
  spacing,
  width,
  height,
  shape,
  palette,
  typography,
} from '../../../foundation/utils/styles';
import pdf from './pdf_conversation_xxh.png';
import ppt from './ppt_conversation_xxh.png';
import ps from './ps_conversation_xxh.png';
import sheet from './sheet_conversation_xxh.png';
import defaultIcon from './default.svg';

const ICON_MAP = {
  pdf,
  ppt,
  ps,
  sheet,
};

const ITEM_WIDTH = 84;

type FileIconProps = {
  size?: 'small';
  iconType?: string | null;
};

const FileItem = styled(MuiListItem)`
  && {
    margin: ${spacing(0, 0, 3, 0)};
    padding: ${spacing(2)};
    width: ${width(ITEM_WIDTH)};
    border-radius: ${shape('borderRadius', 1)};
    box-shadow: ${props => props.theme.shadows[1]};
  }
`;

const FileIcon = styled<FileIconProps, 'div'>('div')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(14))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(14))};
  background-image: url(${({ iconType }) =>
    iconType ? ICON_MAP[iconType] : defaultIcon});
  background-size: cover;
  margin: ${({ size }) => (size === 'small' ? spacing(0, 2, 0, 0) : null)};
`;

const FileInfo = styled(JuiListItemText)`
  && {
    display: flex;
    flex-direction: column;
    height: ${height(14)};
    justify-content: space-between;
    padding: ${spacing(0, 0, 0, 3)};
    .file-item-primary {
      width: ${width(57)};
      color: ${palette('grey', '900')};
    }
    .file-item-secondary {
      display: flex;
      justify-content: space-between;
      color: ${palette('accent', 'ash')};
    }
  }
`;

const FileActionsWrapper = styled.span`
  display: flex;
  & > * {
    margin: 0 ${spacing(2)} 0 0;
  }
  & > *:last-child {
    margin: 0;
  }
`;

const FileCard = styled(JuiCard)`
  display: inline-block;
  width: ${width(ITEM_WIDTH)};
  margin: ${spacing(0, 3, 3, 0)};
`;

const FileCardMedia = styled(JuiCardMedia)`
  height: ${height(50)};
  background-color: ${palette('accent', 'ash')};
`;

const FileCardContent = styled(MuiCardContent)`
  && {
    padding: ${spacing(4)} !important;
  }
`;

const CardFileName = styled(JuiTypography)`
  && {
    ${typography('subheading1')};
    color: ${palette('grey', '900')};
    margin: ${spacing(0, 0, 2, 0)};
  }
`;

const CardFileInfo = styled(JuiTypography)`
  && {
    ${typography('body1')};
    display: flex;
    justify-content: space-between;
  }
`;

const CardSize = styled.div`
  display: flex;
  align-items: center;
  color: ${palette('accent', 'ash')};
`;

const CardFileActions = styled(MuiCardActions)`
  padding: 0 !important;
`;

type ImageCardProps = {
  ratio: number;
};

const WrapperImageCard = ({ ratio, ...rest }: ImageCardProps) => (
  <JuiCard {...rest} />
);

type ImageFileInfoProps = {
  ratio: number;
} & JuiTypographyProps;

const WrapperImageFileInfo = ({ ratio, ...rest }: ImageCardProps) => (
  <CardFileInfo {...rest} />
);

const ImageFileInfo = styled<ImageFileInfoProps>(WrapperImageFileInfo)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${height(9)};
  padding: ${spacing(2)};
  box-sizing: border-box;
  background: ${palette('grey', '300')};
  transition: all 0.35s ease;
  transform: translate(0, ${height(9)});
  & > b {
    font-weight: 400;
    color: ${palette('grey', '700')};
    width: ${({ ratio }) => (ratio >= 1 ? width(56) : width(82))};
  }
`;

const ImageCard = styled<ImageCardProps>(WrapperImageCard)`
  && {
    display: inline-block;
    margin: ${spacing(0, 3, 3, 0)};
    width: ${({ ratio }) => (ratio >= 1 ? width(64) : width(90))};
    height: ${({ ratio }) => (ratio >= 1 ? height(64) : height(64))};
    position: relative;
    border-radius: 0;
    box-shadow: none;
  }
  &:hover ${ImageFileInfo} {
    transform: translate(0, 0);
  }
`;

const ImageMedia = styled(FileCardMedia)`
  && {
    height: ${height(64)};
  }
`;

const FileExpandItemWrapper = styled.div``;

const FileExpandItem = styled(MuiListItem)`
  && {
    margin: ${spacing(0, 0, 3, 0)};
    padding: ${spacing(4)};
    width: ${width(ITEM_WIDTH)};
    border-radius: ${shape('borderRadius', 1)};
    box-shadow: ${props => props.theme.shadows[1]};
  }
`;

export {
  FileItem,
  FileIcon,
  FileInfo,
  FileActionsWrapper,
  FileCardMedia,
  FileCardContent,
  FileCard,
  CardFileName,
  CardFileActions,
  CardSize,
  CardFileInfo,
  ImageCard,
  ImageFileInfo,
  ImageMedia,
  FileExpandItem,
  FileExpandItemWrapper,
};
