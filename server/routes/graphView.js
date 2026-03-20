const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sku = req.query.product; 

  const query = `
    SELECT * FROM historical_prices WHERE sku = ?;
  `;

  db.all(query, [sku], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!rows) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(rows);
  });
});

module.exports = router;