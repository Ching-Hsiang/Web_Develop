// Stochastic RSI
(function (global) {
  const { RSI } = global.Indicators;
  const { sma } = global.DataStore;

  function computeStochRSI(close, rsiPeriod = 14, kPeriod = 14, dPeriod = 3) {
    const { data: rsi } = RSI.computeRSI(close, rsiPeriod);
    const n = rsi.length, K = new Array(n).fill(null);

    for (let i = kPeriod; i < n; i++) {
      let min = Infinity, max = -Infinity;
      for (let j = i - kPeriod + 1; j <= i; j++) {
        const v = rsi[j];
        if (v == null) { min = max = null; break; }
        if (v < min) min = v;
        if (v > max) max = v;
      }
      if (min == null || max === min) { K[i] = null; continue; }
      K[i] = parseFloat((( (rsi[i] - min) / (max - min) ) * 100).toFixed(4));
    }
    const D = sma(K.map(v => (v ?? 0)), dPeriod).map((v, i) => (K[i] == null ? null : v));
    return { k: K, d: D };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.STOCHRSI = { computeStochRSI };
})(window);
