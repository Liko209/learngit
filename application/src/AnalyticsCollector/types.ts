/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-24 17:51:46
 * Copyright © RingCentral. All rights reserved.
 */

type ConversationType = 'team' | '1:1' | 'group';
type NewConversationSource = 'Profile' | 'Right Rail';
type SendTrigger = 'button' | 'enter' | 'drag' | '';

export { ConversationType, NewConversationSource, SendTrigger };
