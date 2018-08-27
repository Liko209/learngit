import { DialogActions } from '@material-ui/core';

const dependencies = [DialogActions];

const props = {
  DialogTitle: {
        type: 'fullWidth',
        describe:'Whether the dialog width is 100%' ,
    }
}

const overrides = {
    root: `{
      padding:8px 24px;
      margin:0px;
    }`,
    disableActionSpacing:false
}

export {
    dependencies,
    props,
    overrides
}
