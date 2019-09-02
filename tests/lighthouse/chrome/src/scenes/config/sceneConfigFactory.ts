/*
 * @Author: doyle.wu
 * @Date: 2018-12-27 10:01:32
 */
import { SceneConfig } from "./sceneConfig";
import {
  ProcessGatherer, ProcessGatherer2,
  FpsGatherer, LoginGatherer
} from "../../gatherers";
import { ProcessAudit } from "../../audits";

class SceneConfigFactory {
  static getConfig(): SceneConfig {
    let config = new SceneConfig();

    SceneConfigFactory.removeGatherer(config, "script-elements");
    SceneConfigFactory.removeGatherer(config, "dobetterweb/response-compression");

    SceneConfigFactory.removeAudit(config, "byte-efficiency/unminified-javascript");
    SceneConfigFactory.removeAudit(config, "byte-efficiency/uses-text-compression");

    SceneConfigFactory.removeCategory(config, "performance", "unminified-javascript");
    SceneConfigFactory.removeCategory(config, "performance", "uses-text-compression");

    return config;
  }
  static getSimplifyConfig(options: { fpsMode: boolean }): SceneConfig {
    let config = new SceneConfig();

    config.passes = config.passes.splice(0, 1);
    let gatherers = [];

    if (options.fpsMode) {
      gatherers.push({
        instance: new FpsGatherer()
      });
    }

    gatherers.push(
      {
        instance: new ProcessGatherer()
      }
    );

    config.passes[0].gatherers = gatherers;
    config.audits = [
      {
        implementation: ProcessAudit
      }
    ];
    config.categories["performance"]["auditRefs"] = [
      { id: "process-performance-metrics", weight: 0, group: "diagnostics" }
    ];
    config.categories["pwa"]["auditRefs"] = [];
    config.categories["accessibility"]["auditRefs"] = [];
    config.categories["best-practices"]["auditRefs"] = [];
    config.categories["seo"]["auditRefs"] = [];

    return config;
  }

  static getProfileConfig(options: { fpsMode: boolean }): SceneConfig {
    let config = new SceneConfig();

    config.passes = config.passes.splice(0, 1);
    let gatherers = [];

    if (options.fpsMode) {
      gatherers.push({
        instance: new FpsGatherer()
      });
    }

    gatherers.push(
      {
        instance: new ProcessGatherer2()
      }
    );

    config.passes[0].gatherers = gatherers;
    config.audits = [];
    config.categories["performance"]["auditRefs"] = [];
    config.categories["pwa"]["auditRefs"] = [];
    config.categories["accessibility"]["auditRefs"] = [];
    config.categories["best-practices"]["auditRefs"] = [];
    config.categories["seo"]["auditRefs"] = [];

    return config;
  }

  static getOfflineConfig(): SceneConfig {
    let config = new SceneConfig();
    SceneConfigFactory.removeGatherer(config, "script-elements");
    SceneConfigFactory.removeAudit(config, "byte-efficiency/unminified-javascript");
    SceneConfigFactory.removeAudit(config, "byte-efficiency/total-byte-weight");
    SceneConfigFactory.removeCategory(config, "performance", "unminified-javascript");
    SceneConfigFactory.removeCategory(config, "performance", "total-byte-weight");

    return config;
  }

  private static removeGatherer(config: SceneConfig, gatherer: string) {
    let passes = config.passes;
    for (let pass of passes) {
      let gatherers = pass.gatherers;
      let idx = 0;
      for (let g of gatherers) {
        if (typeof g === "string" && g === gatherer) {
          break;
        }
        idx++;
      }
      if (idx < gatherers.length) {
        gatherers.splice(idx, 1);
      }
    }
  }

  private static removeAudit(config: SceneConfig, audit: string) {
    let audits = config.audits;
    let idx = 0;
    for (let a of audits) {
      if (typeof a === "string" && a === audit) {
        break;
      }
      idx++;
    }
    if (idx < audits.length) {
      audits.splice(idx, 1);
    }
  }

  private static removeCategory(config: SceneConfig, category: string, id: string) {
    let categories = config.categories;
    let item = categories[category];
    if (!item) {
      return;
    }

    let auditRefs = item.auditRefs;
    if (!auditRefs) {
      return;
    }

    let idx = 0;
    for (let audit of auditRefs) {
      if (audit["id"] && audit["id"] === id) {
        break;
      }
      idx++;
    }

    if (idx < auditRefs.length) {
      auditRefs.splice(idx, 1);
    }
  }
}

export { SceneConfigFactory };
