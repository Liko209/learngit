import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Dialog, DialogHeader, DialogTitle } from '..';

import { Typography, DialogActions, Button } from '@material-ui/core';

storiesOf('Dialog', module)
  .addWithJSX('Body scroll', withInfo(`
      description or documentation about my component, supports markdown

      ~~~js
      <Button>Click Here</Button>
      ~~~

  `)(() => {
    return (
        <Dialog
          open={true}
          size={'md'}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          scroll={'body'}
        >
          <DialogHeader titleComp={<DialogTitle>Headline</DialogTitle>}>
            <Typography align="justify" variant="body1">RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)
            RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)
            RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable)RNG stands for random number generator. It's basically the chances of getting an item to drop. " Nerf" or nerfing is when an item is made weaker through an update. Assault rifles got nerfed because they were "overpowered" in PVP. ( this is debatable) copyright copyright
    </Typography>
          </DialogHeader>
          <DialogActions>
            <Button color="primary">
              Agree
            </Button>
          </DialogActions>
        </Dialog>
    );
  }));
