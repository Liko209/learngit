/*
 * @Author: doyle.wu
 * @Date: 2018-12-13 20:13:56
 */
const Audit = require('lighthouse/lighthouse-core/audits/audit');
import { PerformanceMetric } from '../gatherers/processGatherer';

const B = 1024;
const KB = 1024 * B;
const MB = 1024 * KB;
const G = 1024 * MB;

class ProcessAudit extends Audit {
    static get meta() {
        return {
            id: 'process-performance-metrics',
            title: 'Process performance metrics',
            failureTitle: 'get process performance metrics failure.',
            description: 'Show process memory & cpu',
            requiredArtifacts: ['ProcessGatherer'],
        };
    }

    static format(byte: number): string {
        if (byte < B) {
            return `${byte.toFixed(2)} B`;
        } else if (byte < KB) {
            return `${(byte / B).toFixed(2)} KB`;
        } else if (byte < MB) {
            return `${(byte / KB).toFixed(2)} MB`;
        } else if (byte < G) {
            return `${(byte / MB).toFixed(2)} G`;
        }
    }

    static audit(artifacts) {
        let items: Array<PerformanceMetric> = artifacts.ProcessGatherer.metrics;
        let backups = new Array();
        if (items) {
            for (let item of items) {
                backups.push({
                    cpu: item.cpu.toFixed(2) + '%',
                    jsMemoryAllocated: this.format(item.jsMemoryAllocated),
                    jsMemoryUsed: this.format(item.jsMemoryUsed),
                    privateMemory: this.format(item.privateMemory),
                    type: item.type,
                    url: item.url
                });
            }
        }
        return {
            rawValue: items.length > 0,
            score: 1,
            details: {
                type: "table",
                headings: [
                    {
                        "key": "url",
                        "itemType": "url",
                        "text": "URL"
                    },
                    {
                        "key": "privateMemory",
                        "itemType": "text",
                        "text": "privateMemory"
                    },
                    {
                        "key": "jsMemoryAllocated",
                        "itemType": "text",
                        "text": "jsMemoryAllocated"
                    },
                    {
                        "key": "jsMemoryUsed",
                        "itemType": "text",
                        "text": "jsMemoryUsed"
                    },
                    {
                        "key": "cpu",
                        "itemType": "text",
                        "text": "CPU"
                    }
                ],
                items: backups
            }
        }
    }
}

export {
    ProcessAudit
}
