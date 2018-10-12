import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiDialog } from '../Dialog';
import { JuiModal } from '../Modal';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiButton } from '../../Buttons/Button';

storiesOf('Components/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(JuiDialog))
  .addWithJSX('Dynamic Modal', () => {
    class Conversation extends React.Component {
      toggleAlert = () => {
        console.log(this);
        JuiModal.alert(
          {
            okText: 'I know it!',
            children: 'hi',
            header: 'this is an alert',
            size: 'small',
            open: false,
            onOK: () => {
              console.log('closed');
            },
          },
          this,
        );
      }
      render() {
        return (
          <div>
            <JuiButton
              color="primary"
              variant="text"
              onClick={this.toggleAlert}
              children={'alert'}
            />
          </div>
        );
      }
    }

    return <Conversation />;
  });
