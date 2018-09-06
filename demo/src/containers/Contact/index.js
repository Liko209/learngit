/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-02 16:46:43
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import token from './token';
import widgets from './widgets';

widgets.init({ token });

const Contact = () => <widgets.Contact />;

// <widgets.ConversationThread groupId={123} />;

export default Contact;
