/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */

type Props = { id: number; disabled?: boolean };

type ViewProps = { deletePost: () => Promise<any>; disabled?: boolean };

export { Props, ViewProps };
