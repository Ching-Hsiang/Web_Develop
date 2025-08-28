require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const poolPromise = sql.connect({
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DB,
  options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true }
});


app.get('/api/candles', async (req, res) => {
  const { start = null, end = null, limit = 500 } = req.query;
  try {
    const pool = await poolPromise;
    const r = await pool.request()
      .input('from',  sql.Date, start ? new Date(start) : null)
      .input('to',    sql.Date, end   ? new Date(end)   : null)
      .input('limit', sql.Int, Math.min(parseInt(limit || 500, 10), 5000))
      .query(`
        SELECT TOP (@limit) t,o,h,l,c,v
        FROM [${process.env.SQL_DB}].dbo.CandlesView
        WHERE (@from IS NULL OR t >= CONVERT(varchar(10), @from, 23))
          AND (@to   IS NULL OR t <= CONVERT(varchar(10), @to,   23))
        ORDER BY t ASC
        `);

    res.json({ interval: '1d', candles: r.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log('API listening on', process.env.PORT || 8080);
});
