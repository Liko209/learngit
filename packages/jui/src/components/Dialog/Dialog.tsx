import React from 'react';
import MuiDialog, {
  DialogProps as MuiDialogProps,
} from '@material-ui/core/Dialog';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import styled, { css } from 'styled-components';

type StyledDialogProps = MuiDialogProps & {
  size?: 'small' | 'fullWidth' | 'medium' | 'large' | 'fullScreen';
  fixedAtTop?: boolean;
};

type JuiDialogProps = StyledDialogProps & {
  onClose?: (event: KeyboardEvent | React.MouseEvent) => void;
};

const FilteredMuiDialog = ({ fixedAtTop, ...rest }: StyledDialogProps) => (
  <MuiDialog {...rest} />
);

const fixedAtTopStyle = css`
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
`;

const StyledDialog = styled(FilteredMuiDialog)`
  & .paper {
    width: 100%;
    ${({ fixedAtTop }: any) => fixedAtTop && fixedAtTopStyle}
  }
  & .paper.overflow-y {
    overflow-y: visible;
  }
`;

const WrapDialog = (props: JuiDialogProps) => {
  const {
    disableEscapeKeyDown,
    onClose,
    size = 'medium',
    classes,
    ...rest
  } = props;

  const initClasses = {
    ...classes,
    paper: `paper ${(classes && classes.paper) || ''}`,
    root: `root`,
  };

  switch (size) {
    case 'small':
      rest.maxWidth = 'xs';
      break;
    case 'medium':
      rest.maxWidth = 'sm';
      break;
    case 'large':
      rest.maxWidth = 'md';
      break;
    case 'fullScreen':
      rest.maxWidth = false;
      rest.fullScreen = true;
      break;
    default:
      rest.maxWidth = 'xs';
      break;
  }

  return <StyledDialog {...rest} classes={initClasses} onClose={onClose} />;
};

const JuiDialog = withMobileDialog<JuiDialogProps>({ breakpoint: 'xs' })(
  WrapDialog,
);
export { JuiDialog, JuiDialogProps };
