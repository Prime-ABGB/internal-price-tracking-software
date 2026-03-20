const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const sku = req.query.product;
  
  const query = `
    SELECT * FROM fastmoving_historical_analytics
    WHERE sku = ? 
    ORDER BY date ASC, id ASC
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
    console.log(rows);
    res.json(rows);
  });
});

module.exports = router;
