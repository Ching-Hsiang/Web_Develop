// MOM = Close_t - Close_{t-n}
(function (global) {
  function computeMomentum(close, period = 10) {
    const out = close.map((c, i) => (i >= period ? parseFloat((c - close[i - period]).toFixed(4)) : null));
    return { label: `MOM(${period})`, data: out };
  }
  global.Indicators = global.Indicators || {};
  global.Indicators.MOM = { computeMomentum };
})(window);
