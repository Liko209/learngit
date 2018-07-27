/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-20 13:27:11
 * Copyright © RingCentral. All rights reserved.
 */
import { Markdown } from 'glipdown';

import { getGroupName } from '@/utils/groupName';

import { glipdown2html } from '../../containers/Post/utils';

const parseDom = arg => {
  const objE = document.createElement('div');

  objE.innerHTML = arg;

  return objE.childNodes;
};

const showNotification = (option, userId) => {
  const { text, creator_id: creatorId } = option;

  const str1 = Markdown(text);
  const str2 = glipdown2html(str1);
  // const html = html2react(str2);
  const bodyText = `${parseDom(str2)[0].innerHTML}${parseDom(str2)[1].data}`;
  const personName = getGroupName([creatorId], userId);

  const notification = new Notification(`${personName}`, {
    body: `${bodyText}`,
    icon: '../../../app/images/Glip.icns'
  });

  notification.onshow = () => {
    console.log('show notification');
    // close notification  after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  };
};

const NotificationHandler = (props, userId) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
  } else if (Notification.permission === 'granted') {
    // Let's check whether notification permissions have alredy been granted
    // If it's okay let's create a notification
    showNotification(props, userId);
  } else if (
    Notification.permission !== 'denied' ||
    Notification.permission === 'default'
  ) {
    // Otherwise, we need to ask the user for permission
    Notification.requestPermission(permission => {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        showNotification(props, userId);
      }
    });
  }
  return false;
};

export default NotificationHandler;
