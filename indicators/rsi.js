// RSI(14) 
(function (global) {
  function computeRSI(close, period = 14) {
    const out = new Array(close.length).fill(null);
    if (close.length === 0 || period <= 1) return { label: `RSI(${period})`, data: out };

    let gain = 0, loss = 0;
    for (let i = 1; i <= period; i++) {
      const ch = close[i] - close[i - 1];
      if (ch >= 0) gain += ch; else loss -= ch;
    }
    let avgG = gain / period, avgL = loss / period;
    out[period] = avgL === 0 ? 100 : parseFloat((100 - 100 / (1 + avgG / avgL)).toFixed(4));

    const k = 1 / period;
    for (let i = period + 1; i < close.length; i++) {
      const ch = close[i] - close[i - 1];
      const g = ch > 0 ? ch : 0;
      const l = ch < 0 ? -ch : 0;
      avgG = (avgG * (period - 1) + g) / period;
      avgL = (avgL * (period - 1) + l) / period;
      const rs = avgL === 0 ? Infinity : avgG / avgL;
      out[i] = parseFloat((100 - 100 / (1 + rs)).toFixed(4));
    }
    return { label: `RSI(${period})`, data: out };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.RSI = { computeRSI };
})(window);
