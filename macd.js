// macd.js - calculates MACD using dummy data and renders chart using Chart.js
(function () {
  // Dummy closing prices (60 data points)
  const prices = [
    100,101,102,103,104,103,102,101,102,103,104,105,106,107,108,109,110,111,112,111,
    110,109,108,107,106,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,
    120,121,122,123,124,125,126,125,124,123,122,121,120,119,118,117,116,115,114,113
  ];

  // Exponential Moving Average helper
  function ema(data, period) {
    const k = 2 / (period + 1);
    const emaArray = [];
    let emaPrev = data[0]; // start with first price as seed

    data.forEach(price => {
      emaPrev = price * k + emaPrev * (1 - k);
      emaArray.push(parseFloat(emaPrev.toFixed(4)));
    });

    return emaArray;
  }

  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);

  // MACD Line = EMA12 - EMA26
  const macdLine = ema12.map((v, i) => parseFloat((v - ema26[i]).toFixed(4)));

  // Signal Line = 9‑period EMA of MACD Line
  const signalLine = ema(macdLine, 9);

  // Histogram = MACD Line - Signal Line
  const histogram = macdLine.map((v, i) => parseFloat((v - signalLine[i]).toFixed(4)));

  // Labels for chart (Day 1, Day 2, ...)
  const labels = prices.map((_, i) => `Day ${i + 1}`);

  // Create chart after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('macdChart').getContext('2d');

    new Chart(ctx, {
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'MACD Line',
            data: macdLine,
            borderWidth: 2,
            borderColor: '#007bff',
            fill: false,
            tension: 0.2
          },
          {
            type: 'line',
            label: 'Signal Line',
            data: signalLine,
            borderWidth: 2,
            borderColor: '#ff073a',
            borderDash: [5, 5],
            fill: false,
            tension: 0.2
          },
          {
            type: 'bar',
            label: 'Histogram',
            data: histogram,
            backgroundColor: histogram.map(v => v >= 0 ? 'rgba(0, 180, 0, 0.4)' : 'rgba(200, 0, 0, 0.4)'),
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
})();
