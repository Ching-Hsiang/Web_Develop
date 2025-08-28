(function (global) {
  const { sma } = global.DataStore;

  function computeCCI(high, low, close, n = 20) {
    const tp = high.map((h, i) => (h + low[i] + close[i]) / 3);
    const ma = sma(tp, n);
    const out = new Array(close.length).fill(null);

    for (let i = n - 1; i < close.length; i++) {
      const mean = ma[i];
      if (mean == null) continue;
      let dev = 0;
      for (let j = i - n + 1; j <= i; j++) dev += Math.abs(tp[j] - mean);
      dev /= n;
      out[i] = dev === 0 ? 0 : parseFloat(((tp[i] - mean) / (0.015 * dev)).toFixed(4));
    }
    return { label: `CCI(${n})`, data: out };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.CCI = { computeCCI };
})(window);
