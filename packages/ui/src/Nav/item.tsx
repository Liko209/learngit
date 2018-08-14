import React from 'react';
import { withRouter } from 'react-router-dom';
import { ListItem, ListItemText, ListLink, Badge, RightBadge } from './style';

export type TItemProps = {
  open: boolean,
  url: string,
  type: string,
  icon: string,
  title: string,
  num: number,
  location: {
    pathname: string,
  },
};

const Item = (props: TItemProps) => {
  const { open, url, type, icon : Icon, title, num } = props;
  // In order to make sure if active state it will be active's color
  // or hover's color
  const bgColor = props.location.pathname.indexOf(url) > -1 ? '#EBF6FA' : '#F5F5F5'; // Ice and 100
  const badge = {
    badge: num ? 'umi' : 'red-dot',
  }
  return (
    <ListItem
      tabIndex="-1"
      button={true}
      disableRipple={true}
      focusVisibleClassName={'left-item-focus'}
      disableGutters={true}
      color={bgColor}
      open={open}
    >
      <ListLink className={'left-link'} color={bgColor}  to={`/material/${url}`}>
        <Badge
          num={num}
          classes={badge}
          open={open}
          type={type}
          badgeContent={num ? num : ''}
          color="primary"
        >
          <Icon className={'left-icon'}/>
        </Badge>
        <ListItemText open={open}>{title}</ListItemText>
        <RightBadge
          num={num}
          classes={badge}
          open={!open}
          type={type}
          badgeContent={num ? num : ''}
          color="primary"
        >
          <i />
        </RightBadge>
      </ListLink>
    </ListItem>
  );
}
export default withRouter(Item);
