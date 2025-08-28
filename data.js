(function (global) {
  const API_BASE = 'http://localhost:8080';

  // DataStore
  const DataStore = {
    labels: [], open: [], high: [], low: [], close: [], volume: [], ohlc: [],

    async loadCandles({ start = null, end = null, limit = 500 }) {
      const params = new URLSearchParams({ limit: String(limit) });
      if (start) params.set('start', start);
      if (end)   params.set('end', end);

      const res = await fetch(`${API_BASE}/api/candles?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const rows = json.candles || [];
      this.labels = rows.map(x => x.t);
      this.open   = rows.map(x => x.o);
      this.high   = rows.map(x => x.h);
      this.low    = rows.map(x => x.l);
      this.close  = rows.map(x => x.c);
      this.volume = rows.map(x => (x.v == null ? null : Number(x.v)));
      this.ohlc   = rows.map(x => ({ o: x.o, h: x.h, l: x.l, c: x.c }));
      return rows.length;
    },

    // 技術指標基礎：SMA / EMA 
    sma(series, n) {
      const out = [];
      let sum = 0;
      for (let i = 0; i < series.length; i++) {
        const v = series[i];
        sum += v;
        if (i >= n) sum -= series[i - n];
        out.push(i + 1 >= n ? parseFloat((sum / n).toFixed(4)) : null);
      }
      return out;
    },

    ema(series, n) {
      const k = 2 / (n + 1);
      let prev = series[0];
      const out = series.map((v, i) => {
        if (i === 0) return parseFloat(v.toFixed(4));
        prev = v * k + prev * (1 - k);
        return parseFloat(prev.toFixed(4));
      });
      return out;
    }
  };

  global.DataStore = DataStore;
})(window);
