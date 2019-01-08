/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-16 17:51:20
 * Copyright © RingCentral. All rights reserved.
 */
class DBError extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
class DBCriticalError extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
class DBNeedRetryError extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
class DBUnsupportedError extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
class DBInvalidUsageError extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
const categories = {
  DatabaseClosedError: DBCriticalError,
  OpenFailedError: DBCriticalError,
  QuotaExceededError: DBCriticalError,
  VersionError: DBCriticalError,
  VersionChangeError: DBCriticalError,
  UpgradeError: DBCriticalError,
  AbortError: DBNeedRetryError,
  BulkError: DBNeedRetryError,
  ModifyError: DBNeedRetryError,
  TimeoutError: DBNeedRetryError,
  MissingAPIError: DBUnsupportedError,
  UnknownError: DBUnsupportedError,
  UnsupportedError: DBUnsupportedError,
};

const errorHandler = (err: Error) => {
  if (categories[err.name]) {
    throw new categories[err.name](err.message);
  } else {
    throw new DBInvalidUsageError(err.message);
  }
};

export {
  errorHandler,
  DBError,
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
  DBInvalidUsageError,
};
