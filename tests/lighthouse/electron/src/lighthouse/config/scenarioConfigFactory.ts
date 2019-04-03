/*
 * @Author: doyle.wu
 * @Date: 2018-12-27 10:01:32
 */
import { LightHouseConfig } from "./lightHouseConfig";
import { ProcessAudit } from '../audit';
import { ProcessGatherer, MemoryGatherer } from '../gatherer';

class ScenarioConfigFactory {
  static getSimplifyConfig(): LightHouseConfig {
    let config = new LightHouseConfig();

    config.passes = config.passes.splice(0, 1);
    config.passes[0].gatherers = [
      {
        instance: new ProcessGatherer()
      },
      {
        instance: new MemoryGatherer()
      }
    ];
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

  static getOfflineConfig(): LightHouseConfig {
    let config = new LightHouseConfig();
    this.removeGatherer(config, "scripts");
    this.removeAudit(config, "byte-efficiency/unminified-javascript");
    this.removeAudit(config, "byte-efficiency/total-byte-weight");
    this.removeCategory(config, "performance", "unminified-javascript");
    this.removeCategory(config, "performance", "total-byte-weight");

    return config;
  }

  private static removeGatherer(config: LightHouseConfig, gatherer: string) {
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

  private static removeAudit(config: LightHouseConfig, audit: string) {
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

  private static removeCategory(config: LightHouseConfig, category: string, id: string) {
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

export { ScenarioConfigFactory };
