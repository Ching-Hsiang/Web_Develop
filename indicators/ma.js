(function (global) {
  const { sma, ema } = global.DataStore;

  function computeMA(close, opts = { type: "SMA", periods: [5, 10, 20] }) {
    const lines = [];
    for (const p of opts.periods) {
      const data = opts.type === "EMA" ? ema(close, p) : sma(close, p);
      lines.push({ label: `${opts.type}${p}`, data });
    }
    return lines;
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.MA = { computeMA };
})(window);
