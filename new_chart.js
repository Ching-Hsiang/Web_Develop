(function () {
  // ── 假資料：60 筆收盤價 ──
  const prices = [
    100,101,102,103,104,103,102,101,102,103,104,105,106,107,108,109,110,111,112,111,
    110,109,108,107,106,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,
    120,121,122,123,124,125,126,125,124,123,122,121,120,119,118,117,116,115,114,113
  ];

  // ── 計算 MACD ──
  const { macdLine, signalLine, histogram } = computeMACD(prices);

  const labels = prices.map((_, i) => `Day ${i + 1}`);

  // ── 畫圖 ──
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
            backgroundColor: histogram.map(
                v => v >= 0
                ? 'rgba(0, 180, 0, 0.4)'
                : 'rgba(200, 0, 0, 0.4)'
            ),
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
          x: { ticks: { autoSkip: true, maxTicksLimit: 20 } },
          y: { beginAtZero: true }
        }
      }
    });
  });
})();
