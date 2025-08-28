// Stochastic：%K & %D
(function (global) {
  function computeStochastic(high, low, close, kPeriod = 9, dPeriod = 3) {
    const K = close.map((c, i) => {
      if (i + 1 < kPeriod) return null;
      let h = -Infinity, l = Infinity;
      for (let j = i - kPeriod + 1; j <= i; j++) { h = Math.max(h, high[j]); l = Math.min(l, low[j]); }
      return h === l ? 0 : parseFloat((( (c - l) / (h - l) ) * 100).toFixed(4));
    });

    const D = [];
    for (let i = 0; i < K.length; i++) {
      if (i + 1 < dPeriod || K[i] === null) { D.push(null); continue; }
      let cnt = 0, sum = 0;
      for (let j = i - dPeriod + 1; j <= i; j++) {
        if (K[j] !== null) { sum += K[j]; cnt++; }
      }
      D.push(cnt ? parseFloat((sum / cnt).toFixed(4)) : null);
    }
    return { k: K, d: D };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.STOCH = { computeStochastic };
})(window);
