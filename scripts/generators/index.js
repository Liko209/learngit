/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-30 16:42:00
 * Copyright © RingCentral. All rights reserved.
 */

const JUIGenerator = require("./JUI/index.js");
const MVVMGenerator = require("./MVVM/index.js");
const getGitUser = require("./utils/getGitUser");
const getCurrentDate = require("./utils/getCurrentDate");

const gitUser = getGitUser();

module.exports = plop => {
  plop.setGenerator("MVVM", MVVMGenerator);
  plop.setGenerator("JUI", JUIGenerator);

  plop.setHelper("userName", () => gitUser.name);

  plop.setHelper("userEmail", () => gitUser.email);

  plop.setHelper("currentDate", () => getCurrentDate());
};
