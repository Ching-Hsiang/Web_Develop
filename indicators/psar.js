// PSAR (Parabolic SAR)
(function (global) {
  function computePSAR(high, low, step = 0.02, maxStep = 0.2) {
    const n = high.length;
    const sar = new Array(n).fill(null);
    if (n < 2) return { label: `PSAR(${step},${maxStep})`, data: sar };

    let up = true;
    let af = step;
    let ep = high[0];
    sar[0] = low[0];

    const clampUp = (i, s) => Math.min(s, low[i - 1], i > 1 ? low[i - 2] : Infinity);
    const clampDn = (i, s) => Math.max(s, high[i - 1], i > 1 ? high[i - 2] : -Infinity);

    for (let i = 1; i < n; i++) {
      let s = sar[i - 1] + af * (ep - sar[i - 1]);

      if (up) {
        s = clampUp(i, s);
        if (low[i] < s) {
          up = false;
          sar[i] = ep; 
          ep = low[i];
          af = step;
          continue;
        }
        if (high[i] > ep) { ep = high[i]; af = Math.min(af + step, maxStep); }
      } else {
        s = clampDn(i, s);
        if (high[i] > s) {
          up = true;
          sar[i] = ep;
          ep = high[i];
          af = step;
          continue;
        }
        if (low[i] < ep) { ep = low[i]; af = Math.min(af + step, maxStep); }
      }
      sar[i] = parseFloat(s.toFixed(4));
    }
    return { label: `PSAR(${step},${maxStep})`, data: sar };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.PSAR = { computePSAR };
})(window);
