import { DialogTitle } from '@material-ui/core';

const dependencies = [DialogTitle];

const props = {
  DialogTitle: {
        type: 'titleComp',
        describe:'Title Component' ,
    }
}

const overrides = {
    root: `{
      padding:0;
      padding-bottom: 20px;
      margin: 0;
    }`,
}

export {
    dependencies,
    props,
    overrides
}
