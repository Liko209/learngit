/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import backgrounds from '@storybook/addon-backgrounds';
import { NestedList, NestedListHeader } from '.';
import { ListItem, ListItemIcon, Icon, ListItemText, Avatar } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { withState } from '@dump247/storybook-state';

const store = {
  open1: false,
  open2: false,
  open3: false,
};
storiesOf('NestedList', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
)
  .addWithJSX(
    'Simple',
    withState(store)(({ store }: { store: any }) => {
      // const open = boolean('open', false);
      const link1 = <a href="#">http://www.google.com/</a>;
      const link2 = <a href="#">http://www.google.com/</a>;
      const clickHandler = (index: number) => () => {
        store.set({
          ['open' + index]: !store.state['open' + index],
        });
      };
      return (
        <div style={{ maxWidth: '360px' }}>
          <div>
            <NestedListHeader iconName="star" text="Pin (4)" onClick={clickHandler(1)}>
              {store.state.open1 ? <ExpandLess /> : <ExpandMore />}
            </NestedListHeader>
            <NestedList in={store.state.open1} timeout={150}>
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
            <NestedListHeader iconName="people" text="Members (23)" onClick={clickHandler(2)} >
              <Icon>list</Icon>
            </NestedListHeader>
            <NestedList
              key="1"
              in={store.state.open2}
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
            <NestedListHeader iconName="pets" text="Links (13)" onClick={clickHandler(3)} >
              {store.state.open3 ? <ExpandLess /> : <ExpandMore />}
            </NestedListHeader>
            <NestedList in={store.state.open3} timeout={150}>
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
