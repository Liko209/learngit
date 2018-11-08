/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { NoteViewProps } from './types';

class NoteView extends Component<NoteViewProps> {
  render() {
    const { title, summary } = this.props;
    return (
      <div>Note: {title}{summary}</div>
    );
  }
}

export { NoteView };
