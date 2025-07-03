// macd.js
// Utility functions for calculating the Moving Average Convergence/Divergence (MACD) indicator.
// Author: OpenAI ChatGPT – o3 model (2025‑07‑03)
// -----------------------------------------------------------------------------
// This module exports two functions:
//   1. computeMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9)
//      – Bulk‑computes MACD, signal, and histogram arrays for an array of closing
//        prices ordered from **oldest ➜ newest**.
//   2. nextMACD(state, price)
//      – Streams the next MACD point given the previous EMA state, useful when
//        you receive real‑time ticks one by one.
// -----------------------------------------------------------------------------

/**
 * Calculate a full Exponential Moving Average (EMA) series.
 * `prices` must be ordered oldest ➜ newest.
 * Elements before the first valid EMA are `null` to keep indexing aligned.
 *
 * @param {number[]} prices
 * @param {number} period  Window length – e.g. 12, 26, 9
 * @returns {number[]}     EMA series aligned 1‑to‑1 with `prices`
 */
export function ema(prices, period) {
  const k = 2 / (period + 1);
  const emaArr = new Array(prices.length).fill(null);
  let emaPrev = null;

  // Seed EMA with SMA of the first `period` prices
  if (prices.length >= period) {
    const sma = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
    emaPrev = sma;
    emaArr[period - 1] = sma;
  }

  for (let i = period; i < prices.length; i++) {
    emaPrev = (prices[i] - emaPrev) * k + emaPrev;
    emaArr[i] = emaPrev;
  }

  return emaArr;
}

/**
 * Bulk‑compute MACD for an array of close prices.
 *
 * @param {number[]} prices          Closing prices (oldest ➜ newest)
 * @param {number} [fastPeriod=12]   Fast EMA length
 * @param {number} [slowPeriod=26]   Slow EMA length (must be > fastPeriod)
 * @param {number} [signalPeriod=9]  Signal EMA length
 * @returns {{
 *   macd: number[],     // MACD line (fastEMA − slowEMA)
 *   signal: number[],   // Signal line (EMA of MACD)
 *   histogram: number[] // Histogram (MACD − Signal)
 * }}
 */
export function computeMACD(
  prices,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
) {
  if (slowPeriod <= fastPeriod) {
    throw new Error('`slowPeriod` must be greater than `fastPeriod`.');
  }
  if (prices.length < slowPeriod + signalPeriod) {
    console.warn(
      '[computeMACD] Price series is short – early MACD values will be null.'
    );
  }

  const fastEma = ema(prices, fastPeriod);
  const slowEma = ema(prices, slowPeriod);

  // MACD line = fast EMA − slow EMA (align nulls)
  const macdLine = prices.map((_, i) => {
    if (fastEma[i] == null || slowEma[i] == null) return null;
    return fastEma[i] - slowEma[i];
  });

  const signalLine = ema(
    macdLine.map((v) => (v == null ? 0 : v)),
    signalPeriod,
  ).map((v, i) => (macdLine[i] == null ? null : v));

  const histogram = macdLine.map((v, i) => {
    if (v == null || signalLine[i] == null) return null;
    return v - signalLine[i];
  });

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
}

/**
 * Incrementally update MACD for streaming price feeds.
 * Supply previous EMA values to avoid recomputing entire history.
 *
 * @param {{
 *   fastEma: number|null,
 *   slowEma: number|null,
 *   signalEma: number|null,
 *   fastPeriod?: number,
 *   slowPeriod?: number,
 *   signalPeriod?: number,
 * }} state     Previous EMA state (store between ticks)
 * @param {number} price             Latest closing price
 * @returns {{
 *   macdPoint: number|null,
 *   signalPoint: number|null,
 *   histogramPoint: number|null,
 *   nextState: typeof state,
 * }}
 */
export function nextMACD(state, price) {
  const fastPeriod = state.fastPeriod ?? 12;
  const slowPeriod = state.slowPeriod ?? 26;
  const signalPeriod = state.signalPeriod ?? 9;

  if (slowPeriod <= fastPeriod) {
    throw new Error('`slowPeriod` must be greater than `fastPeriod`.');
  }

  const kFast = 2 / (fastPeriod + 1);
  const kSlow = 2 / (slowPeriod + 1);
  const kSignal = 2 / (signalPeriod + 1);

  let fastEma = state.fastEma;
  let slowEma = state.slowEma;
  let signalEma = state.signalEma;

  // Initialize EMAs when they are null (first `period` ticks)
  fastEma = fastEma == null ? price : (price - fastEma) * kFast + fastEma;
  slowEma = slowEma == null ? price : (price - slowEma) * kSlow + slowEma;

  const macdPoint = fastEma - slowEma;

  // Seed signal EMA with first MACD value
  signalEma = signalEma == null ? macdPoint : (macdPoint - signalEma) * kSignal + signalEma;

  const histogramPoint = macdPoint - signalEma;

  const nextState = {
    fastEma,
    slowEma,
    signalEma,
    fastPeriod,
    slowPeriod,
    signalPeriod,
  };

  return {
    macdPoint,
    signalPoint: signalEma,
    histogramPoint,
    nextState,
  };
}

// -----------------------------------------------------------------------------
// CommonJS fallback for Node environments
// -----------------------------------------------------------------------------
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    computeMACD,
    ema,
    nextMACD,
  };
}
