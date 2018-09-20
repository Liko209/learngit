import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Dialog from '../../../atoms/Dialog';
import JuiModal, { TDynamicModal } from '../Modal';
import { withInfoDecorator } from '../../../utils/decorators';

import { JuiButton } from '../../../atoms';

storiesOf('Molecules/Dialog 🔜', module)
  .addDecorator(withInfoDecorator(Dialog))
  .addWithJSX('Dynamic Modal', () => {
    class Conversation extends React.Component {
      toggleAlert = () => {
        const alert = JuiModal.alert(
          {
            okText: 'I know it!',
            children: 'hi',
            header: 'this is an alert',
            size: 'small',
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
