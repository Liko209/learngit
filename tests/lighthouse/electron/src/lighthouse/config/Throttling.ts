/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 14:20:08
 */


const DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75;
const DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = 0.9;

class Throttling {
    private rttMs: number;
    private throughputKbps: number;
    private requestLatencyMs: number;
    private downloadThroughputKbps: number;
    private uploadThroughputKbps: number;
    private cpuSlowdownMultiplier: number;

    constructor($rttMs: number, $downloadThroughputKbps: number, $uploadThroughputKbps: number, $cpuSlowdownMultiplier: number) {
        this.rttMs = $rttMs;
        this.throughputKbps = $downloadThroughputKbps;
        this.requestLatencyMs = $rttMs * DEVTOOLS_RTT_ADJUSTMENT_FACTOR;
        this.downloadThroughputKbps = $downloadThroughputKbps * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR;
        this.uploadThroughputKbps = $uploadThroughputKbps * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR;
        this.cpuSlowdownMultiplier = $cpuSlowdownMultiplier;
    }

    /**
     * Getter $rttMs
     * @return {number}
     */
    public get $rttMs(): number {
        return this.rttMs;
    }


    /**
     * Getter $throughputKbps
     * @return {number}
     */
    public get $throughputKbps(): number {
        return this.throughputKbps;
    }


    /**
     * Getter $requestLatencyMs
     * @return {number}
     */
    public get $requestLatencyMs(): number {
        return this.requestLatencyMs;
    }


    /**
     * Getter $downloadThroughputKbps
     * @return {number}
     */
    public get $downloadThroughputKbps(): number {
        return this.downloadThroughputKbps;
    }


    /**
     * Getter $uploadThroughputKbps
     * @return {number}
     */
    public get $uploadThroughputKbps(): number {
        return this.uploadThroughputKbps;
    }


    /**
     * Getter $cpuSlowdownMultiplier
     * @return {number}
     */
    public get $cpuSlowdownMultiplier(): number {
        return this.cpuSlowdownMultiplier;
    }
}

//$rttMs, $throughputKbps, $requestLatencyMs,
//$downloadThroughputKbps, $uploadThroughputKbps, $cpuSlowdownMultiplier
// see https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md
const MOBILE_3G = new Throttling(150, 1.6 * 1024, 750, 1);

const WIFI = new Throttling(0.53, 34133, 17066, 1);

export {
    Throttling,
    MOBILE_3G,
    WIFI
}
