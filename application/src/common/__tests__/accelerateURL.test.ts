/*
 * @Author: isaac.liu
 * @Date: 2019-05-09 14:09:43
 * Copyright © RingCentral. All rights reserved.
 */

import { accelerateURL } from '../accelerateURL';

describe('accelerateURL', () => {
  it('should have empty check', () => {
    expect(accelerateURL(undefined)).toEqual(undefined);
    expect(accelerateURL('')).toEqual('');
  });
  it("should replace url match reg /s3[\\w\\d-]*.amazonaws.com/, replace it with 's3-accelerate.amazonaws.com'", () => {
    const url = accelerateURL(
      'https://glipasialabnet-glpdevxmn.s3-ap-southeast-1.amazonaws.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
    expect(url).toEqual(
      'https://glipasialabnet-glpdevxmn.s3-accelerate.amazonaws.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
  });
  it("should not replace url doesn't match reg /s3[\\w\\d-]*.amazonaws.com/, do nothing", () => {
    const url = accelerateURL(
      'https://s3.test.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
    expect(url).toEqual(
      'https://s3.test.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
  });
});
