/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 13:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, number, boolean } from '@storybook/addon-knobs';
import { JuiDialogHeader } from '../DialogHeader';
import { JuiDialogHeaderTitle } from '../DialogHeaderTitle';
import { JuiDialogHeaderActions } from '../DialogHeaderActions';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import backgrounds from '@storybook/addon-backgrounds';
import { JuiIconButton } from '../../../Buttons/IconButton/IconButton';
import { JuiMenuList, JuiMenuItem } from '../../../Menus';
import { JuiPopoverMenu } from '../../../../pattern/PopoverMenu/PopoverMenu';
import { JuiAvatar } from '../../../Avatar';
import {
  JuiDialogHeaderMeta,
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
} from '../DialogHeaderMeta';
import { JuiButtonBar } from '../../../Buttons/ButtonBar';

storiesOf('Components/Dialog/DialogHeader', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .addDecorator(withInfoDecorator(JuiDialogHeader))
  .add('Title only', () => {
    const title = text('title', 'Title');
    const width = number('width', 640);
    const fullscreen = boolean('fullscreen', false);
    return (
      <div
        style={{
          width: fullscreen ? '100%' : `${width}px`,
          margin: '10px auto',
        }}
      >
        <JuiDialogHeader>
          <JuiDialogHeaderTitle>{title}</JuiDialogHeaderTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton tooltipTitle="Close">close</JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
      </div>
    );
  })
  .add('Title with action icons', () => {
    const title = text('title', 'Title');
    const width = number('width', 640);
    const fullscreen = boolean('fullscreen', false);
    return (
      <div
        style={{
          width: fullscreen ? '100%' : `${width}px`,
          margin: '10px auto',
        }}
      >
        <JuiDialogHeader>
          <JuiDialogHeaderTitle>{title}</JuiDialogHeaderTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton color="accent.gold" tooltipTitle="Favorite">
                star
              </JuiIconButton>
              <JuiIconButton tooltipTitle="Settings">settings</JuiIconButton>
              <JuiPopoverMenu
                Anchor={() => (
                  <JuiIconButton tooltipTitle="More">more_horiz</JuiIconButton>
                )}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <JuiMenuList>
                  <JuiMenuItem>Copy url</JuiMenuItem>
                  <JuiMenuItem>Copy email</JuiMenuItem>
                </JuiMenuList>
              </JuiPopoverMenu>
              <JuiIconButton tooltipTitle="Close">close</JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
      </div>
    );
  })
  .add('Title with avatar and information', () => {
    const title = text('title', 'Bulldog friendship.jpegdddddddddddddddddddd');
    const point = text('point', '(1 / 20)');
    const width = number('width', 640);
    const name = text('user name', 'Jessica Lewis');
    const time = text('time', '1/23/2019 10:02 AM');
    const fullscreen = boolean('fullscreen', false);
    return (
      <div
        style={{
          width: fullscreen ? '100%' : `${width}px`,
          margin: '10px auto',
        }}
      >
        <h4>One line: </h4>
        <JuiDialogHeader>
          <JuiDialogHeaderMeta>
            <JuiDialogHeaderMetaLeft>
              <JuiAvatar size="medium" color="lake">
                SH
              </JuiAvatar>
            </JuiDialogHeaderMetaLeft>
            <JuiDialogHeaderMetaRight title={name} subtitle={time} />
          </JuiDialogHeaderMeta>
          <JuiDialogHeaderTitle variant="responsive">
            {title} {point}
          </JuiDialogHeaderTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton color="accent.gold" tooltipTitle="Favorite">
                star
              </JuiIconButton>
              <JuiIconButton tooltipTitle="Settings">settings</JuiIconButton>
              <JuiPopoverMenu
                Anchor={() => (
                  <JuiIconButton tooltipTitle="More">more_horiz</JuiIconButton>
                )}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <JuiMenuList>
                  <JuiMenuItem>Copy url</JuiMenuItem>
                  <JuiMenuItem>Copy email</JuiMenuItem>
                </JuiMenuList>
              </JuiPopoverMenu>
              <JuiIconButton tooltipTitle="Close">close</JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
        <br />
        <br />
        <h4>Break line: </h4>
        <JuiDialogHeader>
          <JuiDialogHeaderMeta>
            <JuiDialogHeaderMetaLeft>
              <JuiAvatar size="medium" color="lake">
                SH
              </JuiAvatar>
            </JuiDialogHeaderMetaLeft>
            <JuiDialogHeaderMetaRight title={name} subtitle={time} />
          </JuiDialogHeaderMeta>
          <JuiDialogHeaderTitle variant="responsive">
            <span>{title}</span>
            <span> {point}</span>
          </JuiDialogHeaderTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton color="accent.gold" tooltipTitle="Favorite">
                star
              </JuiIconButton>
              <JuiIconButton tooltipTitle="Settings">settings</JuiIconButton>
              <JuiPopoverMenu
                Anchor={() => (
                  <JuiIconButton tooltipTitle="More">more_horiz</JuiIconButton>
                )}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <JuiMenuList>
                  <JuiMenuItem>Copy url</JuiMenuItem>
                  <JuiMenuItem>Copy email</JuiMenuItem>
                </JuiMenuList>
              </JuiPopoverMenu>
              <JuiIconButton tooltipTitle="Close">close</JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
      </div>
    );
  });
