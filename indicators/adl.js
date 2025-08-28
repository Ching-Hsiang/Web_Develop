(function (global) {
  function computeADL(high, low, close, volume) {
    const out = new Array(close.length).fill(null);
    let acc = 0;
    for (let i = 0; i < close.length; i++) {
      const denom = high[i] - low[i];
      const clv = denom === 0 ? 0 : ((2 * close[i] - high[i] - low[i]) / denom);
      acc += clv * (volume[i] ?? 0);
      out[i] = Math.round(acc);
    }
    return { label: 'ADL', data: out };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.ADL = { computeADL };
})(window);
