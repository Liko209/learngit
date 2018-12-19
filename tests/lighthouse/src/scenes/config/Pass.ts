/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 14:34:39
 */
class Pass {
    public passName: string = 'defaultPass';
    public recordTrace?: boolean = false;
    public useThrottling?: boolean = false;
    public pauseAfterLoadMs?: number = 0;
    public networkQuietThresholdMs?: number = 0;
    public cpuQuietThresholdMs?: number = 0;
    public gatherers: Array<any> = [];
    public blockedUrlPatterns?: Array<any> = [];
    public blankPage?: 'about:blank';
    public blankDuration?: 300;
}

export {
    Pass
}