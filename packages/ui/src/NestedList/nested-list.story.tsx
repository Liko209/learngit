/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';
import backgrounds from '@storybook/addon-backgrounds';
import { NestedList, NestedListHeader } from '.';
import { boolean } from '@storybook/addon-knobs/react';
// import IconButton from '../IconButton/index';
// import Icon from '@material-ui/core/Icon';
// import Button from '../Button';
// import IconButton from '../IconButton';
import { ListItem, ListItemIcon, Icon, ListItemText, Avatar } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
// import IconButton from '../IconButton';

storiesOf('NestedList', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
)
  .addWithJSX(
    'Simple',
    withInfo(``)(() => {
      const open = boolean('open', false);
      const link1 = <a href="#">http://www.google.com/</a>;
      const link2 = <a href="#">http://www.google.com/</a>;
      return (
        <div style={{ maxWidth: '360px' }}>
          <div>
            <NestedListHeader iconName="star" text="Pin (4)">
              {open ? <ExpandLess /> : <ExpandMore />}
            </NestedListHeader>
            <NestedList in={open} timeout={150}>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icon>folder</Icon>
                </ListItemIcon>
                <ListItemText inset={true} primary="Item 1" />
              </ListItem>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icon>folder</Icon>
                </ListItemIcon>
                <ListItemText inset={true} primary="Item 2" />
              </ListItem>
            </NestedList>
          </div>
          <div>
            <NestedListHeader iconName="people" text="Members (23)">
              <Icon>list</Icon>
            </NestedListHeader>
            <NestedList
              key="1"
              in={open}
              timeout={150}
              style={{ display: 'flex', padding: '16px', justifyContent: 'space-around' }}
            >
              <Avatar>H</Avatar>
              <Avatar>N</Avatar>
              <Avatar>OP</Avatar>
              <Avatar>CH</Avatar>
              <Avatar>UD</Avatar>
              <Avatar>AD</Avatar>
            </NestedList>
          </div>
          <div>
            <NestedListHeader iconName="pets" text="Links (13)">
              {open ? <ExpandLess /> : <ExpandMore />}
            </NestedListHeader>
            <NestedList in={open} timeout={150}>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icon>email</Icon>
                </ListItemIcon>
                <ListItemText inset={true} primary="Item 1" secondary={link1} />
              </ListItem>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icon>email</Icon>
                </ListItemIcon>
                <ListItemText inset={true} primary="Item 2" secondary={link2} />
              </ListItem>
            </NestedList>
          </div>
        </div>
      );
    }),
);
