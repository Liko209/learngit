/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:16:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemText from '@material-ui/core/ListItemText';
import MuiCardContent from '@material-ui/core/CardContent';
import MuiCardActions from '@material-ui/core/CardActions';
import {
  JuiTypography,
  JuiTypographyProps,
} from '../../../foundation/Typography';
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
import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';

const ITEM_WIDTH = 84;
const FILE_CARD_HEIGHT = 68;

type FileIconProps = {
  size?: 'small';
} & JuiIconographyProps;

const FileItem = styled(MuiListItem)`
  && {
    margin: ${spacing(0, 0, 3, 0)};
    padding: ${spacing(4)};
    width: ${width(ITEM_WIDTH)};
    border-radius: ${shape('borderRadius', 1)};
    box-shadow: ${props => props.theme.shadows[1]};
  }
`;

const FileIcon = styled<FileIconProps>(({ size, ...rest }) => (
  <JuiIconography
    iconSize={size === 'small' ? 'medium' : 'extraLarge'}
    {...rest}
  />
))`
  && {
    margin: ${({ size }) => (size === 'small' ? spacing(0, 2, 0, 0) : null)};
  }
`;

const FileInfo = styled(MuiListItemText)`
  && {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: ${spacing(0, 0, 0, 3)};
    .file-item-primary {
      ${typography('body1')};
      width: ${width(57)};
      color: ${palette('grey', '900')};
    }
    .file-item-secondary {
      display: flex;
      justify-content: space-between;
      ${typography('caption1')};
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
  height: ${height(FILE_CARD_HEIGHT)};
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

const CardFileName = styled.div`
  && {
    ${typography('body1')};
    color: ${palette('grey', '900')};
  }
`;

const CardFileInfo = styled(JuiTypography)`
  && {
    ${typography('caption1')};
    color: ${palette('grey', '500')};
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
  width: number;
  height: number;
};

const WrapperImageCard = ({ width, height, ...rest }: ImageCardProps) => (
  <JuiCard {...rest} />
);

type ImageFileInfoProps = ImageCardProps & JuiTypographyProps;

const WrapperImageFileInfo = ({ width, height, ...rest }: ImageCardProps) => (
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
    width: ${props => width(props.width / 4)};
  }
`;

const ImageCard = styled<ImageCardProps>(WrapperImageCard)`
  && {
    float: left;
    display: flex;
    margin: ${spacing(0, 2, 2, 0)};
    width: ${props => width(props.width / 4)};
    height: ${props => height(props.height / 4)};
    position: relative;
    border-radius: 0;
    align-items: center;
    justify-content: center;
    background-color: ${palette('grey', '100')};
    box-shadow: none;
  }
  &:hover ${ImageFileInfo} {
    transform: translate(0, 0);
  }
`;

const ImageMedia = styled(FileCardMedia)``;

const FileExpandItemWrapper = styled.div`
  &:not(:last-child) {
    margin: ${spacing(0, 0, 2, 0)};
  }
`;

const FileExpandItem = styled(MuiListItem)`
  && {
    height: ${height(13)};
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
