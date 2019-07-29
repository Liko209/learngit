import { opusModifier, customizedOpusFmtp, opusPTInRtpmap } from '../utils';

describe('opusPTInRtpmap(sdp)', () => {
  it('Verify it can get the correct opus payload type, if the SDP contains opus', () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:111 OPUS/48000/2',
      'a=fmtp:111 maxplaybackrate=48000;minptime=10;useinbandfec=1',
      'a=rtpmap:110 telephone-event/48000',
    ];
    const pt = opusPTInRtpmap(sdp);
    expect(pt).toEqual('111');
  });

  it('Verify it will raise exception , if the SDP does not contain opus', () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:110 telephone-event/48000',
    ];
    try {
      const pt = opusPTInRtpmap(sdp);
    } catch (e) {
      expect(e).toEqual(Error('Opus codec is not supported'));
    }
  });

  it('Verify it can get the correct opus payload type, if the SDP contains multiple opus', () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:111 OPUS/48000/2',
      'a=rtpmap:109 OPUS/16000/1',
      'a=fmtp:111 maxplaybackrate=48000;minptime=10;useinbandfec=1',
      'a=fmtp:109 maxplaybackrate=16000;minptime=10;useinbandfec=1',
      'a=rtpmap:110 telephone-event/48000',
    ];
    const pt = opusPTInRtpmap(sdp);
    expect(pt).toEqual('111');
  });
});

describe('customizedOpusFmtp()', () => {
  it('Verify it can get customized opus fmtp', () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:111 OPUS/48000/2',
      'a=fmtp:111 maxplaybackrate=48000;minptime=10;useinbandfec=1',
      'a=rtpmap:110 telephone-event/48000',
    ];
    const pt = opusPTInRtpmap(sdp);
    const fmtp = customizedOpusFmtp(pt, 32000, 16000);
    const result =
      'a=fmtp:111 minptime=10; useinbandfec=1; maxaveragebitrate=32000; sprop-maxcapturerate=16000; maxplaybackrate=16000; stereo=0; sprop-stereo=0; ptime=20';
    expect(fmtp).toEqual(result);
  });
});

describe('opusModifier()', () => {
  it('Verify it can get customized opus codec line if it contains opus', async () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:111 OPUS/48000/2',
      'a=fmtp:111 maxplaybackrate=48000;minptime=10;useinbandfec=1',
      'a=rtpmap:110 telephone-event/48000',
    ];
    const rtcSDP = {
      sdp: sdp.join('\r\n'),
      type: 'offer',
    };
    const resultFmtp =
      'a=fmtp:111 minptime=10; useinbandfec=1; maxaveragebitrate=32000; sprop-maxcapturerate=16000; maxplaybackrate=16000; stereo=0; sprop-stereo=0; ptime=20';
    await opusModifier(rtcSDP).then(finalRtcSDP => {
      expect(finalRtcSDP.sdp).toContain(resultFmtp);
    });
  });

  it('Verify it can get the original sdp if it does not contain opus codec', async () => {
    const sdp: any = [
      'v=0',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:110 telephone-event/48000',
    ];
    const rtcSDP = {
      sdp: sdp.join('\r\n'),
      type: 'offer',
    };
    const resultFmtp =
      'a=fmtp:111 minptime=10; useinbandfec=1; maxaveragebitrate=32000; sprop-maxcapturerate=16000; maxplaybackrate=16000; stereo=0; sprop-stereo=0; ptime=20';
    await opusModifier(rtcSDP).then(finalRtcSDP => {
      expect(finalRtcSDP.sdp).not.toContain(resultFmtp);
      expect(finalRtcSDP.sdp).toContain(sdp[1]);
    });
  });
});
