// MTM Oscillator：MTM(n) = C - C[n]; MTMMA = SMA(MTM, m)
(function (global) {
  const { sma } = global.DataStore;

  function computeMTMOsc(close, n = 12, m = 6) {
    const mtm = new Array(close.length).fill(null);
    for (let i = n; i < close.length; i++) {
      mtm[i] = parseFloat((close[i] - close[i - n]).toFixed(4));
    }
    const mtmma = sma(mtm.map(v => (v ?? 0)), m).map((v, i) => (mtm[i] == null ? null : v));
    return { mtm, mtmma };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.MTMOSC = { computeMTMOsc };
})(window);
