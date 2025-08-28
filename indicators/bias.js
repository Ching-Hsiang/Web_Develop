// BIAS = (Close - MA) / MA * 100
(function (global) {
  const { sma } = global.DataStore;
  function computeBIAS(close, period = 10) {
    const ma = sma(close, period);
    const bias = close.map((c, i) => (ma[i] ? parseFloat(((c - ma[i]) / ma[i] * 100).toFixed(4)) : null));
    return { label: `BIAS(${period})`, data: bias };
  }
  global.Indicators = global.Indicators || {};
  global.Indicators.BIAS = { computeBIAS };
})(window);
