(function (global) {
  function computeARBR(high, low, open, close, n = 26) {
    const AR = new Array(close.length).fill(null);
    const BR = new Array(close.length).fill(null);

    let sumHO = 0, sumOL = 0, sumHpc = 0, sumPcL = 0;
    for (let i = 1; i <= n; i++) {
      sumHO += Math.max(0, high[i] - open[i]);
      sumOL += Math.max(0, open[i] - low[i]);
      sumHpc += Math.max(0, high[i] - close[i - 1]);
      sumPcL += Math.max(0, close[i - 1] - low[i]);
    }
    AR[n] = sumOL === 0 ? null : parseFloat(((sumHO / sumOL) * 100).toFixed(4));
    BR[n] = sumPcL === 0 ? null : parseFloat(((sumHpc / sumPcL) * 100).toFixed(4));

    for (let i = n + 1; i < close.length; i++) {
      sumHO += Math.max(0, high[i] - open[i]) - Math.max(0, high[i - n] - open[i - n]);
      sumOL += Math.max(0, open[i] - low[i]) - Math.max(0, open[i - n] - low[i - n]);
      sumHpc += Math.max(0, high[i] - close[i - 1]) - Math.max(0, high[i - n] - close[i - n - 1]);
      sumPcL += Math.max(0, close[i - 1] - low[i]) - Math.max(0, close[i - n - 1] - low[i - n]);
      AR[i] = sumOL === 0 ? null : parseFloat(((sumHO / sumOL) * 100).toFixed(4));
      BR[i] = sumPcL === 0 ? null : parseFloat(((sumHpc / sumPcL) * 100).toFixed(4));
    }
    return { AR, BR };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.ARBR = { computeARBR };
})(window);
