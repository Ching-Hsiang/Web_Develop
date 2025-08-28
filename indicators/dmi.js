// DMI
(function (global) {
  function computeDMI(high, low, close, period = 14) {
    const len = close.length;
    const TR  = new Array(len).fill(null);
    const pDM = new Array(len).fill(null); // +DM
    const mDM = new Array(len).fill(null); // -DM

    for (let i = 1; i < len; i++) {
      const upMove   = high[i] - high[i - 1];
      const downMove = low[i - 1] - low[i];
      pDM[i] = (upMove > 0 && upMove > downMove) ? upMove : 0;
      mDM[i] = (downMove > 0 && downMove > upMove) ? downMove : 0;

      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i]  - close[i - 1]);
      TR[i] = Math.max(tr1, tr2, tr3);
    }
 
    const smTR = sma(TR.map(v => v ?? 0), period);
    const smP  = sma(pDM.map(v => v ?? 0), period);
    const smM  = sma(mDM.map(v => v ?? 0), period);
    const pDI = smTR.map((t, i) => (t ? parseFloat((100 * (smP[i] / t)).toFixed(4)) : null));
    const mDI = smTR.map((t, i) => (t ? parseFloat((100 * (smM[i] / t)).toFixed(4)) : null));
    const DX  = pDI.map((p, i) => (p !== null && mDI[i] !== null)
      ? parseFloat((100 * (Math.abs(p - mDI[i]) / (p + mDI[i]))).toFixed(4))
      : null);
    const ADX = sma(DX.map(v => v ?? 0), period);
    return { pDI, mDI, ADX };

    function sma(series, n) {
      const out = [];
      for (let i = 0; i < series.length; i++) {
        if (i + 1 < n) { out.push(null); continue; }
        let sum = 0;
        for (let j = i - n + 1; j <= i; j++) sum += series[j];
        out.push(parseFloat((sum / n).toFixed(4)));
      }
      return out;
    }
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.DMI = { computeDMI };
})(window);
