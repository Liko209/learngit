import { Dialog } from '@material-ui/core';

const dependencies = [Dialog];

const props = {
  size: {
        type: 'string',
        describe:`The dialog's width` ,
    }
}

const overrides = {
  root:`{
    padding:0;
  }`,
  sm:`{
    max-width:400px;
  }`,
  md:`{
    max-width:640px;
  }`,
  lg:`{
    max-width:800px;
  }`,
  paperScrollPaper:`{
    max-height: ${() => window.innerHeight % 8 * 8}px
  }`
}

export {
    dependencies,
    props,
    overrides
}
