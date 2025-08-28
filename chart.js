(function (global) {
  const { DataStore } = window;
  const {
    MA, BIAS, MOM, MACD, STOCH, WILLR, DMI,
    BOLL, RSI, STOCHRSI, PSAR, MTMOSC, CPR, QSTICK, CCI, ARBR, ADL
  } = window.Indicators;

  // K 線繪圖
  const CandlesPlugin = {
    id: 'candles',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      const x = scales.x, y = scales.y;
      if (!x || !y) return;
      ctx.save(); ctx.beginPath();
      ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.clip();

      const ohlc = DataStore.ohlc;
      const step = (x.getPixelForValue(1) - x.getPixelForValue(0)) || ((chartArea.right - chartArea.left) / Math.max(ohlc.length, 1));
      const w = Math.max(2, Math.min(16, step * 0.6));

      for (let i = 0; i < ohlc.length; i++) {
        const v = ohlc[i]; if (!v) continue;
        const cx = x.getPixelForValue(i);
        const yO = y.getPixelForValue(v.o), yH = y.getPixelForValue(v.h), yL = y.getPixelForValue(v.l), yC = y.getPixelForValue(v.c);
        const up = v.c >= v.o; const top = up ? yC : yO; const bot = up ? yO : yC; const h = Math.max(1, bot - top);
        ctx.strokeStyle = up ? '#1a8f5d' : '#e03d2f';
        ctx.beginPath(); ctx.moveTo(cx, yH); ctx.lineTo(cx, yL); ctx.stroke();
        ctx.fillStyle = up ? 'rgba(26,143,93,0.85)' : 'rgba(224,61,47,0.85)';
        ctx.fillRect(cx - w/2, top, w, h); ctx.strokeRect(cx - w/2, top, w, h);
      }
      ctx.restore();
    }
  };
  Chart.register(CandlesPlugin);

  let chart;

  document.addEventListener('DOMContentLoaded', async () => {
  
    await DataStore.loadCandles({ symbol: '2330', interval: '1d', limit: 200 });

    const ctx = document.getElementById('mainChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: DataStore.labels,
        datasets: [{
          label: 'Close(hover)',
          data: DataStore.close,
          yAxisID: 'y',
          borderWidth: 0, pointRadius: 0, borderColor: 'rgba(0,0,0,0)', backgroundColor: 'rgba(0,0,0,0)'
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (c) => {
                const i = c.dataIndex, v = DataStore.ohlc[i];
                if (!v) return '';
                return `O:${v.o} H:${v.h} L:${v.l} C:${v.c}`;
              }
            }
          }
        },
        scales: {
          y: { position: 'left' },
          y1:{ position: 'right', grid: { drawOnChartArea: false } },
          x: { ticks: { maxTicksLimit: 30 } }
        }
      },
      plugins: ['candles']
    });

    document.querySelectorAll('.ind-toggle').forEach(el =>
      el.addEventListener('change', () => refreshIndicators(getSelected()))
    );
    refreshIndicators(getSelected());
  });

  function getSelected() {
    const set = new Set();
    document.querySelectorAll('.ind-toggle:checked').forEach(el => set.add(el.value));
    return set;
  }

  const COLORS = {
    MA: ['#ff9800', '#4caf50', '#2196f3'],
    MACD: { macd:'#2962ff', signal:'#d50000', up:'rgba(38,166,154,.35)', down:'rgba(229,57,53,.35)' },
    KD: ['#f57c00','#7b1fa2'],
    WILLR: ['#455a64'],
    BIAS: ['#c2185b'],
    MOM: ['#2e7d32'],
    DMI: ['#2e7d32','#c62828','#6d4c41'],
    BOLL: { U:'#ab47bc', M:'#26a69a', L:'#ab47bc' },
    RSI: ['#009688'],
    STOCHRSI: ['#1976d2','#9c27b0'],
    PSAR: ['#000000'],
    MTM: ['#795548','#607d8b'],
    CPR: { P:'#616161', TC:'#42a5f5', BC:'#ff7043', R:'#b0bec5', S:'#b0bec5' },
    QSTICK: ['#3f51b5'],
    CCI: ['#00695c'],
    ARBR: ['#4caf50','#f44336'],
    ADL: ['#5d4037']
  };

  function applyY1Range(selected) {
    const y1 = chart.options.scales.y1;
    delete y1.min; delete y1.max; delete y1.suggestedMin; delete y1.suggestedMax;
    const set = (a,b)=>{ y1.min=a; y1.max=b; };

    if (selected.has('STOCH') || selected.has('RSI') || selected.has('STOCHRSI')) set(0,100);
    else if (selected.has('WILLR')) set(-100,0);
    else if (selected.has('CCI')) set(-200,200);
    else if (selected.has('DMI')) { y1.min=0; y1.suggestedMax=60; }
  }

  function refreshIndicators(selected) {
    chart.data.datasets = chart.data.datasets.slice(0, 1);

    const addLine = (label, data, yAxis = 'y1', width = 2, dash = [], color = '#1976d2') => {
      chart.data.datasets.push({
        type: 'line',
        label, data, yAxisID: yAxis,
        borderWidth: width, borderDash: dash,
        borderColor: color, backgroundColor: 'transparent',
        pointRadius: 0, tension: 0.15, spanGaps: true
      });
    };

    const { close, high, low } = DataStore;

    // MA
    if (selected.has('MA')) {
      const lines = MA.computeMA(DataStore.close, { type: 'SMA', periods: [5, 10, 20] });
      const MA_COLORS = ['#ff9800', '#4caf50', '#2196f3'];
      lines.forEach((ln, i) => addLine(ln.label, ln.data, 'y', i ? 1.6 : 2, i ? [6,3] : [], MA_COLORS[i]));
    }

    // MACD
    if (selected.has('MACD')) {
      const { macdLine, signalLine, histogram } = MACD.computeMACD(DataStore.close, 12, 26, 9);
      addLine('MACD', macdLine, 'y1', 1.8, [], COLORS.MACD.macd);
      addLine('Signal', signalLine, 'y1', 1.6, [6, 3], COLORS.MACD.signal);
      chart.data.datasets.push({
        type: 'bar',
        label: 'MACD Hist',
        data: histogram,
        yAxisID: 'y1',
        borderWidth: 0,
        barPercentage: 0.8,
        backgroundColor: histogram.map(v => v >= 0 ? COLORS.MACD.up : COLORS.MACD.down)
      });
    }

    // KD
    if (selected.has('STOCH')) {
      const { k, d } = STOCH.computeStochastic(DataStore.high, DataStore.low, DataStore.close, 9, 3);
      addLine('%K(9)', k, 'y1', 1.6, [], COLORS.KD[0]);
      addLine('%D(3)', d, 'y1', 1.6, [6, 3], COLORS.KD[1]);
    }

    // Williams%R
    if (selected.has('WILLR')) {
      const { label, data } = WILLR.computeWilliamsR(DataStore.high, low, close, 14);
      addLine(label, data, 'y1', 1.6, [2, 2], COLORS.WILLR[0]);
    }

    // BIAS
    if (selected.has('BIAS')) {
      const { label, data } = BIAS.computeBIAS(DataStore.close, 10);
      addLine(label, data, 'y1', 1.6, [4, 4], COLORS.BIAS[0]);
    }

    // Momentum
    if (selected.has('MOM')) {
      const { label, data } = MOM.computeMomentum(DataStore.close, 10);
      addLine(label, data, 'y1', 1.6, [8, 4], COLORS.MOM[0]);
    }

    // DMI/ADX
    if (selected.has('DMI')) {
      const { pDI, mDI, ADX } = DMI.computeDMI(DataStore.high, DataStore.low, DataStore.close, 14);
      addLine('+DI(14)', pDI, 'y1', 1.4, [], COLORS.DMI[0]);
      addLine('-DI(14)', mDI, 'y1', 1.4, [], COLORS.DMI[1]);
      addLine('ADX(14)',  ADX,  'y1', 1.6, [6, 3], COLORS.DMI[2]);
    }

    // BOLL
    if (selected.has('BOLL')) {
      const { upper, middle, lower } = BOLL.computeBollinger(DataStore.close, 20, 2);
      addLine('BB Upper', upper, 'y', 1.2, [], COLORS.BOLL.U);
      addLine('BB Middle', middle, 'y', 1, [6,3], COLORS.BOLL.M);
      addLine('BB Lower', lower, 'y', 1.2, [], COLORS.BOLL.L);
    }

    // RSI
    if (selected.has('RSI')) {
      const { label, data } = RSI.computeRSI(DataStore.close, 14);
      addLine(label, data, 'y1', 1.8, [], COLORS.RSI[0]);
    }

    // StochRSI
    if (selected.has('STOCHRSI')) {
      const { k, d } = STOCHRSI.computeStochRSI(DataStore.close, 14, 14, 3);
      addLine('%K-RSI(14)', k, 'y1', 1.6, [], COLORS.STOCHRSI[0]);
      addLine('%D(3)', d, 'y1', 1.4, [6,3], COLORS.STOCHRSI[1]);
    }

    // PSAR
    if (selected.has('PSAR')) {
      const { data } = PSAR.computePSAR(DataStore.high, DataStore.low, 0.02, 0.2);
      chart.data.datasets.push({
        type: 'line', label: 'PSAR', data, yAxisID: 'y',
        showLine: false, borderWidth: 0, pointRadius: 2,
        pointBackgroundColor: COLORS.PSAR[0], spanGaps: true
      });
    }

    // MTM Osc
    if (selected.has('MTMOSC')) {
      const { mtm, mtmma } = MTMOSC.computeMTMOsc(DataStore.close, 12, 6);
      addLine('MTM(12)', mtm, 'y1', 1.6, [], COLORS.MTM[0]);
      addLine('MTMMA(6)', mtmma, 'y1', 1.4, [6,3], COLORS.MTM[1]);
    }

    // CPR + Pivot
    if (selected.has('CPR')) {
      const r = CPR.computeCPR(DataStore.high, DataStore.low, DataStore.close);
      addLine('P',  r.P,  'y', 1, [4,2], COLORS.CPR.P);
      addLine('TC', r.TC, 'y', 1.2, [],   COLORS.CPR.TC);
      addLine('BC', r.BC, 'y', 1.2, [],   COLORS.CPR.BC);
      ['R1','R2','R3'].forEach(k => addLine(k, r[k], 'y', .8, [6,3], COLORS.CPR.R));
      ['S1','S2','S3'].forEach(k => addLine(k, r[k], 'y', .8, [6,3], COLORS.CPR.S));
    }

    // QStick
    if (selected.has('QSTICK')) {
      const { label, data } = QSTICK.computeQStick(DataStore.close, DataStore.open, 10);
      addLine(label, data, 'y1', 1.6, [], COLORS.QSTICK[0]);
    }

    // CCI
    if (selected.has('CCI')) {
      const { label, data } = CCI.computeCCI(DataStore.high, DataStore.low, DataStore.close, 20);
      addLine(label, data, 'y1', 1.6, [], COLORS.CCI[0]);
    }

    // AR / BR
    if (selected.has('ARBR')) {
      const { AR, BR } = ARBR.computeARBR(DataStore.high, DataStore.low, DataStore.open, DataStore.close, 26);
      addLine('AR(26)', AR, 'y1', 1.6, [], COLORS.ARBR[0]);
      addLine('BR(26)', BR, 'y1', 1.6, [], COLORS.ARBR[1]);
    }

    // ADL
    if (selected.has('ADL')) {
      const { label, data } = ADL.computeADL(DataStore.high, DataStore.low, DataStore.close, DataStore.volume);
      addLine(label, data, 'y1', 1.4, [], COLORS.ADL[0]);
    }

    // 依指標調整 y1 範圍
    applyY1Range(selected);

    chart.update();
  }
})(window);
