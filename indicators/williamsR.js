// Williams %R = (HighestHigh - Close) / (HighestHigh - LowestLow) * 100 * (-1)
(function (global) {
  function computeWilliamsR(high, low, close, period = 14) {
    const out = close.map((c, i) => {
      if (i + 1 < period) return null;
      let h = -Infinity, l = Infinity;
      for (let j = i - period + 1; j <= i; j++) { h = Math.max(h, high[j]); l = Math.min(l, low[j]); }
      return h === l ? 0 : parseFloat(( (h - c) / (h - l) * -100 ).toFixed(4));
    });
    return { label: `Williams%R(${period})`, data: out };
  }
  global.Indicators = global.Indicators || {};
  global.Indicators.WILLR = { computeWilliamsR };
})(window);
