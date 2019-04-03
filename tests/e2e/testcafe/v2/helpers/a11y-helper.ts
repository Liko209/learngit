import 'testcafe';
import * as zipdir from 'zip-dir';
import * as path from 'path';
import * as attestCheck from 'attest-testcafe';
import { report } from 'attest-node';
import { H } from './utils';
import { MiscUtils } from '../utils';
import { v4 as uuid } from 'uuid';
import { TMPFILE_PATH } from '../../config';

export class A11yHelper {

  constructor(private t: TestController) {
  }

  jsonPreprocess(testResult: any, testSubjectName: string, htmlName: string, attestId: string, browserName: string) {
    testResult.findings = {
      "violations": testResult.violations,
      "passes": testResult.passes,
      "incomplete": testResult.incomplete,
      "inapplicable": testResult.inapplicable
    }
    delete testResult.violations;
    delete testResult.passes;
    delete testResult.incomplete;
    delete testResult.inapplicable;

    testResult.name = htmlName;
    testResult.type = "attest-result";
    testResult.platform = {
      "userAgent": browserName
    };
    testResult.testSubject = {
      "fileName": testSubjectName
    };
    testResult.id = attestId;

    return testResult;
  }

  async attestCheck(ruleSet: string = 'wcag2') {
    return await attestCheck(this.t, ruleSet);
  }

  async json2junit(jsonDir: string, junitDir: string, browser: string = 'chrome') {
    let reporter = report('attest-run', jsonDir);
    reporter.buildJUnitXML(junitDir, browser);
    console.log('Attest JUnit XML report created at ', junitDir);
  }

  async json2html(jsonDir: string, htmlFile: string, browser?: string) {
    let reporter = report('attest-run', jsonDir);
    reporter.buildHTML(htmlFile, browser);
    console.log('Attest HTML report created at ', htmlFile);
  }

  getUserAgent() {
    return this.t['testRun'].browserConnection.userAgent;
  }

  async accessibilityCheck(htmlName: string, dirName: string = null, attestId = "attest-id", testSubjectName: string = "accessibility-check") {
    const result = await this.attestCheck();
    const browserName = this.getUserAgent();
    if (!dirName) {
      dirName = uuid();
    }
    const tmpDir = TMPFILE_PATH;
    const zipDir = tmpDir + '/' + dirName;
    const jsonDir = zipDir + '/json';
    const htmlDir = zipDir + '/html';
    const zipFile = path.join(tmpDir, `${dirName}.zip`);
    MiscUtils.createDirIfNotExists(tmpDir);
    MiscUtils.createDirIfNotExists(zipDir);
    MiscUtils.createDirIfNotExists(jsonDir);
    MiscUtils.createDirIfNotExists(htmlDir);

    H.jsonDump(path.join(jsonDir, 'a11y.json'), this.jsonPreprocess(result["results"], testSubjectName, htmlName, attestId, browserName));
    await this.json2html(jsonDir, htmlDir);

    zipdir(zipDir, { "saveTo": zipFile }, function (err, buffer) {
      if (err) console.log(err);
    });
    return zipFile;
  }
}
