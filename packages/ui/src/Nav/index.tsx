import React from 'react';
import { List, Drawer } from './style';
import LeftItem from './item';
import ListsArr from './icon';

export type TNavProps = {
  isOpen?: boolean;
};
export default (props: TNavProps) => {
  const { isOpen } = props;
  return (
    <Drawer variant="permanent" open={isOpen} classes={{ paper: 'left-paper' }}>
      {ListsArr.map((arr, index) => {
        return (
          <List
            component="nav"
            disablePadding={true}
            key={index}
          >
            {
              arr.map(item =>
                <LeftItem
                  key={item.url}
                  {...item}
                  open={isOpen}
                />,
              )
            }
          </List>
        );
      })}
    </Drawer>
  );
};
