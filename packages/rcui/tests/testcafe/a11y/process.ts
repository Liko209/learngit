import { Selector } from 'testcafe';
import * as attestCheck from 'attest-testcafe';
import * as path from "path";
import { MiscUtils } from '../utils/utils';
import { report } from 'attest-node';
import { MenuItem } from "../page-models/MenuItem";
import { MenuDiv } from "../page-models/MenuDiv";
import { MenuRoot } from "../page-models/MenuRoot";
import { FILE_PATH } from "../config";


export default class Process {

  constructor(readonly t: TestController) {
  }

  async showAndCheck(current: MenuItem | MenuDiv, menuRoot: MenuRoot) {

    if (current instanceof MenuItem) {

      const title = await current.getAttribute("title");
      console.log(title);

      if (current.isChildOfMenuRoot()) {

        if (!await current.childElementHasShown()) {
          await current.clickSelf();
        }
        await this.showAndCheck(await menuRoot.nextDiv(), menuRoot);
      } else {

        await current.clickSelf();
        if (await current.isLeafItem()) {
          await this.process(title);
        }
      }
    } else if (current instanceof MenuDiv) {

      const count = await current.childCount();
      console.log("div's children count>>", count)

      while (await current.hasNextItem()) {
        await this.showAndCheck(await current.nextItem(), menuRoot);
      }

      while (await current.hasNextDiv()) {
        await this.showAndCheck(await current.nextDiv(), menuRoot);
      }
    }
  }

  async process(title: string) {
    const jsonDir = path.join(FILE_PATH, "json");
    MiscUtils.createDirIfNotExists(jsonDir);
    await this.t.switchToIframe(Selector('#storybook-preview-iframe'));
    await this.accessibilityCheck("accessibility-check", Selector('#story-root'), jsonDir, title, title);
    await this.t.switchToMainWindow();
  }

  async accessibilityCheck(htmlName: string, context: any, jsonDir: string, fileName: string, attestId = "attest-id", testSubjectName: string = "accessibility-check") {
    const fullFileName = path.join(jsonDir, fileName + ".json");
    const result = await attestCheck(this.t, undefined, context);
    const browserName = this.getUserAgent();

    MiscUtils.jsonDump(fullFileName, this.jsonPreprocess(result["results"], testSubjectName, htmlName, attestId, browserName));
  }

  getUserAgent() {
    return this.t['testRun'].browserConnection.userAgent;
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

  async json2html(jsonDir: string, htmlFile: string, browser?: string) {
    const reporter = report('attest-run', jsonDir);
    reporter.buildHTML(htmlFile, browser);
    console.log('Attest HTML report created at ', htmlFile);
  }
}
