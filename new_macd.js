// ── MACD 計算工具 ──
(function (global) {
  /** 計算單一 EMA */
  function ema(data, period) {
    const k = 2 / (period + 1);
    let emaPrev = data[0];
    return data.map(price => {
      emaPrev = price * k + emaPrev * (1 - k);
      return parseFloat(emaPrev.toFixed(4));
    });
  }

//   /**
//    * 核心：計算 MACD／Signal／Histogram
//    * @param {number[]} prices 收盤價陣列
//    * @param {number} fast   預設 12
//    * @param {number} slow   預設 26
//    * @param {number} signal 預設 9
//    */

  function computeMACD(prices, fast = 12, slow = 26, signal = 9) {
    const emaFast = ema(prices, fast);
    const emaSlow = ema(prices, slow);

    const macdLine = emaFast.map((v, i) =>
      parseFloat((v - emaSlow[i]).toFixed(4))
    );

    const signalLine = ema(macdLine, signal);

    const histogram  = macdLine.map((v, i) =>
      parseFloat((v - signalLine[i]).toFixed(4))
    );

    return { macdLine, signalLine, histogram };
  }

  // 曝露到全域 (window.computeMACD)
  global.computeMACD = computeMACD;
})(window);
