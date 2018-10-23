/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 13:16:58
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItem from '@material-ui/core/ListItem';
import MuiCardMedia from '@material-ui/core/CardMedia';
import MuiCardContent from '@material-ui/core/CardContent';
import MuiCard from '@material-ui/core/Card';
import MuiCardActions from '@material-ui/core/CardActions';
import { JuiTypography } from '../../../foundation/Typography';
import { JuiListItemText } from '../../../components/Lists';
import styled from '../../../foundation/styled-components';
import {
  spacing,
  width,
  height,
  shape,
  palette,
  ellipsis,
  typography,
} from '../../../foundation/utils/styles';

type FileIconProps = {
  icon?: string;
  size?: 'small';
};

const FileItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2)};
    width: ${width(80)};
    border-radius: ${shape('borderRadius', 1)};
    box-shadow: ${props => props.theme.shadows[1]};
  }
`;

const FileIcon = styled<FileIconProps, 'div'>('div')`
  width: ${({ size }) => (size === 'small' ? width(6) : width(14))};
  height: ${({ size }) => (size === 'small' ? width(6) : width(14))};
  background-color: #ccc;
  background-image: url(${(props: FileIconProps) => props.icon});
  margin: ${({ size }) => (size === 'small' ? spacing(0, 1, 0, 0) : null)};
`;

const FileInfo = styled(JuiListItemText)`
  && {
    display: flex;
    flex-direction: column;
    height: ${height(14)};
    justify-content: space-between;
    padding: ${spacing(0, 0, 0, 3)};
    .file-item-primary {
      ${ellipsis};
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

const FileActionsWrapper = styled.div`
  display: flex;
  & > * {
    margin: 0 ${spacing(2)} 0 0;
  }
  & > *:last-child {
    margin: 0;
  }
`;

const FileCard = styled(MuiCard)`
  width: ${width(80)};
`;

const FileCardMedia = styled(MuiCardMedia)`
  height: ${height(50)};
  background-color: ${palette('accent', 'ash')};
`;

const FileCardContent = styled(MuiCardContent)`
  && {
    padding: ${spacing(2)} !important;
  }
`;

const CardFileName = styled(JuiTypography)`
  && {
    ${ellipsis};
    ${typography('subheading1')};
    width: ${width(65)};
    color: ${palette('grey', '900')};
  }
`;

const CardFileInfo = styled(JuiTypography)`
  && {
    ${typography('body1')};
    color: ${palette('grey', '900')};
    display: flex;
    justify-content: space-between;
  }
`;

const CardSize = styled.div`
  display: flex;
`;

const CardFileActions = styled(MuiCardActions)`
  padding: 0 !important;
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
};
