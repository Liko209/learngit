/*
 * @Author: ken.li
 * @Date: 2019-04-29 17:12:36
 * Copyright © RingCentral. All rights reserved.
 */
import { Component } from 'react';
import { observer } from 'mobx-react';
import { EmojiViewProps } from './types';

@observer
class EmojiView extends Component<EmojiViewProps> {}

export { EmojiView };
