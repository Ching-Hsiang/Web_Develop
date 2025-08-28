// MACD：DIF = EMA12 - EMA26, DEA = EMA(DIF, 9), Hist = DIF - DEA
(function (global) {
  const { ema } = global.DataStore;

  function computeMACD(close, fast = 12, slow = 26, signal = 9) {
    const emaFast = ema(close, fast);
    const emaSlow = ema(close, slow);
    const dif = emaFast.map((v, i) => parseFloat((v - emaSlow[i]).toFixed(4)));
    const dea = ema(dif.map(v => (v === null ? 0 : v)), signal);
    const hist = dif.map((v, i) => parseFloat((v - dea[i]).toFixed(4)));
    return {
      macdLine: dif,
      signalLine: dea,
      histogram: hist
    };
  }

  global.Indicators = global.Indicators || {};
  global.Indicators.MACD = { computeMACD };
})(window);
