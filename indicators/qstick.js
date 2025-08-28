// QStick(n) = SMA(Close-Open, n)
(function (global) {
  const { sma } = global.DataStore;

  function computeQStick(close, open, n = 10) {
    const diff = close.map((c, i) => c - open[i]);
    const qs = sma(diff, n);
    return { label: `QStick(${n})`, data: qs };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.QSTICK = { computeQStick };
})(window);
