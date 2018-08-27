import { DialogContent } from '@material-ui/core';

const dependencies = [DialogContent];

const props = {
  DialogTitle: {
        type: 'fullWidth',
        describe:'Whether the dialog width is 100%' ,
    }
}

const overrides = {
    root: `{
      ${(props) => fullWidthStyle(props)}
    }`,
}

export {
    dependencies,
    props,
    overrides
}
