/*
 * @Author: Spike.Yang
 * @Date: 2019-09-05 08:42:47
 * Copyright © RingCentral. All rights reserved.
 */

export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const isWin = navigator.platform.toUpperCase().indexOf('WIN') >= 0;

export const paddingRang = isMac ? 1 : isWin ? -1 : 0;
