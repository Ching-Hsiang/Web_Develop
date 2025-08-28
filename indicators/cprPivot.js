(function (global) {
  function computeCPR(high, low, close) {
    const n = high.length;
    const P=new Array(n).fill(null), BC=new Array(n).fill(null), TC=new Array(n).fill(null);
    const R1=new Array(n).fill(null), R2=new Array(n).fill(null), R3=new Array(n).fill(null);
    const S1=new Array(n).fill(null), S2=new Array(n).fill(null), S3=new Array(n).fill(null);

    for (let i = 1; i < n; i++) {
      const H = high[i-1], L = low[i-1], C = close[i-1];
      const p = (H + L + C) / 3;
      const bc = (H + L) / 2;
      const tc = 2 * p - bc;
      const d = H - L;
      P[i]  = parseFloat(p.toFixed(4));
      BC[i] = parseFloat(bc.toFixed(4));
      TC[i] = parseFloat(tc.toFixed(4));
      R1[i] = parseFloat((2 * p - L).toFixed(4));
      S1[i] = parseFloat((2 * p - H).toFixed(4));
      R2[i] = parseFloat((p + d).toFixed(4));
      S2[i] = parseFloat((p - d).toFixed(4));
      R3[i] = parseFloat((H + 2 * (p - L)).toFixed(4));
      S3[i] = parseFloat((L - 2 * (H - p)).toFixed(4));
    }
    return { P, BC, TC, R1, R2, R3, S1, S2, S3 };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.CPR = { computeCPR };
})(window);
