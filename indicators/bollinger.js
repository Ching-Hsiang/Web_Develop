// Bollinger Bands (n=20, k=2)
(function (global) {
  const { sma } = global.DataStore;

  function rollingStd(arr, n) {
    const out = new Array(arr.length).fill(null);
    for (let i = n - 1; i < arr.length; i++) {
      let s = 0, s2 = 0;
      for (let j = i - n + 1; j <= i; j++) { s += arr[j]; s2 += arr[j] * arr[j]; }
      const mean = s / n;
      const varc = (s2 / n) - mean * mean;
      out[i] = Math.sqrt(Math.max(0, varc));
    }
    return out;
  }

  function computeBollinger(close, n = 20, k = 2) {
    const mid = sma(close, n);
    const std = rollingStd(close, n);
    const upper = mid.map((m, i) => (m == null ? null : parseFloat((m + k * std[i]).toFixed(4))));
    const lower = mid.map((m, i) => (m == null ? null : parseFloat((m - k * std[i]).toFixed(4))));
    return { upper, middle: mid, lower };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.BOLL = { computeBollinger };
})(window);
