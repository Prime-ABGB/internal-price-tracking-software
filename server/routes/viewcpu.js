const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const db = require("../db"); // Adjust the path if necessary

router.get("/api", (req, res) => {
  db.all("SELECT * FROM cpu_products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

router.get("/product-comparison", (req, res) => {
  const sku = req.query.product;

  const query = `
    SELECT p.*, l.prime_link, l.mdcomp_link, l.vedant_link, l.pcstudio_link, l.clarion_link, l.ehubs_link
    FROM cpu_products p
    LEFT JOIN cpu_product_links l ON p.product_sku = l.product_sku
    WHERE p.product_sku = ?;
  `;

  db.get(query, [sku], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const responseData = {
      product_name: row.product_name,
      product_sku: row.product_sku,
      prices: {
        prime_price: row.prime_price,
        mdcomp_price: row.mdcomp_price,
        vedant_price: row.vedant_price,
        pcstudio_price: row.pcstudio_price,
        clarion_price: row.clarion_price,
        ehubs_price: row.ehubs_price,
      },
      stock: {
        prime_stock: row.prime_stock,
        mdcomp_stock: row.mdcomp_stock,
        vedant_stock: row.vedant_stock,
        pcstudio_stock: row.pcstudio_stock,
        clarion_stock: row.clarion_stock,
        ehubs_stock: row.ehubs_stock,
      },
      links: {
        prime_link: row.prime_link,
        mdcomp_link: row.mdcomp_link,
        vedant_link: row.vedant_link,
        pcstudio_link: row.pcstudio_link,
        clarion_link: row.clarion_link,
        ehubs_link: row.ehubs_link,
      },
    };
    res.json(responseData);
  });
});

/***********************************************************************************************************/
let browser;
async function setupBrowser() {
  browser = await puppeteer.launch();
}

const fetchAmazonPrice = async (sku, productName) => {
  try {
    const query = encodeURIComponent(`${sku} ${productName}`);
    const url = `https://www.amazon.in/s?k=${query}`;

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const price = await page.evaluate(() => {
      const priceSpan = document.querySelector(
        "span.a-price span.a-offscreen"
      );
      if (!priceSpan) return null;
      const text = priceSpan.textContent || "";
      const num = parseFloat(text.replace(/[^\d.]/g, ""));
      return isNaN(num) ? null : num;
    });

    const stock = price ? "In Stock" : null;

    await page.close();

    return {
      amazon_price: price,
      amazon_stock: stock,
    };
  } catch (err) {
    console.error("Error fetching Amazon price for", sku, err);
    return {
      amazon_price: null,
      amazon_stock: null,
    };
  }
};

const fetchPrimePrice = async (url) => {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const price = await page.evaluate(() => {
      const insPriceElement = document.querySelector(
        "ins span.woocommerce-Price-amount.amount bdi"
      );
      if (insPriceElement) {
        return insPriceElement.textContent.trim().replace(/[^\d.]/g, "");
      } else {
        const nextPriceElement = document.querySelector(
          "span.woocommerce-Price-amount.amount bdi"
        );
        return nextPriceElement
          ? nextPriceElement.textContent.trim().replace(/[^\d.]/g, "")
          : null;
      }
    });

    const stock = await page.evaluate(() => {
      const stockElement = document.querySelector(
        "div.stock-availability.out-of-stock"
      );
      return stockElement ? stockElement.textContent.trim() : "In Stock";
    });
    await page.close();
    console.log(`Fetched price: ${price}, stock: ${stock}`);

    return {
      prime_price: Number(price),
      prime_stock: stock,
    };
  } catch (error) {
    console.error(`Error fetching price from ${url}:`, error);
    return null;
  }
};

const fetchMdcompPrice = async (url) => {
  if (url === "product link not found") {
    return {
      mdcomp_price: null,
      mdcomp_stock: null,
    };
  } else {
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle0' });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector('div.price-box h2.price, div.price-box h2.special-price');
        if (priceElement) {
            const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');
            return parseFloat(priceString);
        } else {
            return null;
        }
      });
    
      const stock = await page.evaluate(() => {
        const stockElement = document.querySelector('div.product-detail-list ul.product-status li:nth-child(3) span.base-color');
        if (stockElement) {
          return stockElement.textContent.trim();
        } else {
          return null; // Handle case where .stock element is not found
        }
      });
      
      await page.close();
      console.log(`MDCOMP Fetched price: ${price}, stock: ${stock}`);

      return {
        mdcomp_price: Number(price),
        mdcomp_stock: stock,
      };
    } catch (error) {
      console.error(`Error fetching price from ${url}:`, error);
      return null;
    }
  }
};

const fetchVedantPrice = async (url) => {
  if (url === "product link not found") {
    return {
      vedant_price: null,
      vedant_stock: null,
    };
  } else {
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector("div.product-price-new");
        if (priceElement) {
          const priceString = priceElement.textContent
            .trim()
            .replace(/[^\d.]/g, "");
          const priceFloat = parseFloat(priceString);
          if (!isNaN(priceFloat)) {
            return priceFloat;
          } else {
            return null;
          }
        } else {
          const priceElement = document.querySelector("div.product-price");
          const priceString = priceElement.textContent
            .trim()
            .replace(/[^\d.]/g, "");
          const priceFloat = parseFloat(priceString);
          if (!isNaN(priceFloat)) {
            return priceFloat;
          } else {
            return null;
          }
        }
      });

      const stock = await page.evaluate(() => {
        const outOfStockElement = document.querySelector(
          "span.product-label.product-label-30.product-label-diagonal"
        );
        if (outOfStockElement) {
          return outOfStockElement.textContent.trim();
        } else {
          return "In Stock";
        }
      });
      await page.close();
      console.log(`VEDANT Fetched price: ${price}, stock: ${stock}`);

      return {
        vedant_price: Number(price),
        vedant_stock: stock,
      };
    } catch (error) {
      return {
        vedant_price: null,
        vedant_stock: null,
      };
    }
  }
};

const fetchPcstudioPrice = async (url) => {
  if (url === "product link not found") {
    return {
      pcstudio_price: null,
      pcstudio_stock: null,
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const price = await page.evaluate(() => {
      const priceElement =
        document.querySelector(
          "div.elementor-widget-wrap.elementor-element-populated p.price ins bdi"
        ) ||
        document.querySelector(
          "div.elementor-widget-wrap.elementor-element-populated p.price span bdi"
        );
      if (priceElement) {
        const priceString = priceElement.textContent
          .trim()
          .replace(/[^\d.]/g, "");
        const priceFloat = parseFloat(priceString);
        if (!isNaN(priceFloat)) {
          return priceFloat;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });

    const stock = "In Stock";
    await page.close();
    console.log(`PCSTDUIO Fetched price: ${price}, stock: ${stock}`);

    return {
      pcstudio_price: Number(price),
      pcstudio_stock: stock,
    };
  }
};

const fetchClarionPrice = async (url) => {
  if (url === "product link not found") {
    return {
      clarion_price: null,
      clarion_stock: null,
    };
  } else {
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle0' });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector(
          "div.content_product_detail ins span.woocommerce-Price-amount.amount bdi"
        );
        if (priceElement) {
          const priceString = priceElement.textContent
            .trim()
            .replace(/[^\d.]/g, "");
          const priceFloat = parseFloat(priceString);
          return priceFloat;
        } else {
          return null;
        }
      });

      const stock = await page.evaluate(() => {
        const stockElement = document.querySelector("p.stock.out-of-stock");
        return stockElement ? stockElement.textContent.trim() : "In Stock";
      });
      await page.close();

      return {
        clarion_price: Number(price),
        clarion_stock: stock,
      };
    } catch (error) {
      return {
        clarion_price: null,
        clarion_stock: null,
      };
    }
    console.log(`CLARION Fetched price: ${price}, stock: ${stock}`);
  }
};

const fetchEhubsPrice = async (url) => {
  if (url === "product link not found") {
    return {
      ehubs_price: null,
      ehubs_stock: null,
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const price = await page.evaluate(() => {
      const priceElement = document.querySelector("span#js-product-price");
      return priceElement
        ? parseFloat(
            priceElement.textContent
              .trim()
              .match(/(?<=\D|^)\d{1,3}(?:,\d{1,5})*\.\d+/g)[0]
              .replace(/,/g, "")
          )
        : null;
    });

    const stock = await page.evaluate(() => {
      const stockElement = document.querySelector("div.out_stock h5");
      return stockElement ? stockElement.textContent.trim() : "In Stock";
    });
    await page.close();
    console.log(`EHUBS Fetched price: ${price}, stock: ${stock}`);

    return {
      ehubs_price: Number(price),
      ehubs_stock: stock,
    };
  }
};
/***********************************************************************************************************/

async function scrapeOneCpuRow(row) {
  const {
    product_sku,
    product_name,
    prime_link,
    mdcomp_link,
    vedant_link,
    pcstudio_link,
    clarion_link,
    ehubs_link,
  } = row;

  console.log(`Processing: ${product_sku}`);

  console.log(`fetching data from: ${prime_link}`);
  const prime_data = await fetchPrimePrice(prime_link);
  const { prime_price, prime_stock } = prime_data;

  console.log(`fetching data from: ${mdcomp_link}`);
  const mdcomp_data = await fetchMdcompPrice(mdcomp_link);
  const { mdcomp_price, mdcomp_stock } = mdcomp_data;

  console.log(`fetching data from: ${vedant_link}`);
  const vedant_data = await fetchVedantPrice(vedant_link);
  const { vedant_price, vedant_stock } = vedant_data;

  console.log(`fetching data from: ${pcstudio_link}`);
  const pcstudio_data = await fetchPcstudioPrice(pcstudio_link);
  const { pcstudio_price, pcstudio_stock } = pcstudio_data;

  console.log(`fetching data from: ${clarion_link}`);
  const clarion_data = await fetchClarionPrice(clarion_link);
  const { clarion_price, clarion_stock } = clarion_data;

  console.log(`fetching data from: ${ehubs_link}`);
  const ehubs_data = await fetchEhubsPrice(ehubs_link);
  const { ehubs_price, ehubs_stock } = ehubs_data;

  console.log(`fetching data from Amazon for: ${product_sku}`);
  const { amazon_price, amazon_stock } = await fetchAmazonPrice(
    product_sku,
    product_name || ""
  );

  const sql = `
    UPDATE cpu_products
    SET prime_price = ?,
        mdcomp_price = ?,
        vedant_price = ?,
        pcstudio_price = ?,
        clarion_price = ?,
        ehubs_price = ?,
        amazon_price = ?,
        prime_stock = ?,
        mdcomp_stock = ?,
        vedant_stock = ?,
        pcstudio_stock = ?,
        clarion_stock = ?,
        ehubs_stock = ?,
        amazon_stock = ?
    WHERE product_sku = ?;
  `;
  const params = [
    prime_price,
    mdcomp_price,
    vedant_price,
    pcstudio_price,
    clarion_price,
    ehubs_price,
    amazon_price,
    prime_stock,
    mdcomp_stock,
    vedant_stock,
    pcstudio_stock,
    clarion_stock,
    ehubs_stock,
    amazon_stock,
    product_sku,
  ];

  await new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });

  const sqlInsert = `
    INSERT INTO historical_prices (
        sku, date, prime_price, prime_stock, mdcomp_price, mdcomp_stock,
        vedant_price, vedant_stock, pcstudio_price, pcstudio_stock,
        clarion_price, clarion_stock, ehubs_price, ehubs_stock,
        amazon_price, amazon_stock, category
    )
    VALUES (?, DATE('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku, date) 
    DO UPDATE SET
        prime_price = excluded.prime_price,
        prime_stock = excluded.prime_stock,
        mdcomp_price = excluded.mdcomp_price,
        mdcomp_stock = excluded.mdcomp_stock,
        vedant_price = excluded.vedant_price,
        vedant_stock = excluded.vedant_stock,
        pcstudio_price = excluded.pcstudio_price,
        pcstudio_stock = excluded.pcstudio_stock,
        clarion_price = excluded.clarion_price,
        clarion_stock = excluded.clarion_stock,
        ehubs_price = excluded.ehubs_price,
        ehubs_stock = excluded.ehubs_stock,
        amazon_price = excluded.amazon_price,
        amazon_stock = excluded.amazon_stock,
        category = excluded.category;
  `;
  const insertParams = [
    product_sku,
    prime_price,
    prime_stock,
    mdcomp_price,
    mdcomp_stock,
    vedant_price,
    vedant_stock,
    pcstudio_price,
    pcstudio_stock,
    clarion_price,
    clarion_stock,
    ehubs_price,
    ehubs_stock,
    amazon_price,
    amazon_stock,
    "cpu",
  ];

  await new Promise((resolve, reject) => {
    db.run(sqlInsert, insertParams, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.get("/webscraper", async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(
        "SELECT l.*, p.product_name FROM cpu_product_links l JOIN cpu_products p ON l.product_sku = p.product_sku",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    let filtered = rows;
    if (req.query.sku) {
      filtered = rows.filter((r) => r.product_sku === req.query.sku);
    }

    await setupBrowser();
    for (const row of filtered) {
      try {
        await scrapeOneCpuRow(row);
      } catch (error) {
        console.error(`Error processing ${row.product_sku}:`, error);
      }
    }
    res.json({ message: "Prices fetched and inserted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const {
      productName,
      sku,
      primePrice,
      primeLink,
      mdcompLink,
      vedantLink,
      pcstudioLink,
      clarionLink,
      ehubsLink,
    } = req.body || {};
    if (!productName || !sku || primePrice == null || !primeLink) {
      return res.status(400).json({
        error:
          "productName, sku, primePrice, and primeLink are required.",
      });
    }

    const product_sku = String(sku).trim();
    const product_name = String(productName).trim();
    const prime_price = Number(primePrice);
    const prime_link = String(primeLink).trim();
    const notFound = "product link not found";
    const mdcomp_link = mdcompLink ? String(mdcompLink).trim() : notFound;
    const vedant_link = vedantLink ? String(vedantLink).trim() : notFound;
    const pcstudio_link = pcstudioLink ? String(pcstudioLink).trim() : notFound;
    const clarion_link = clarionLink ? String(clarionLink).trim() : notFound;
    const ehubs_link = ehubsLink ? String(ehubsLink).trim() : notFound;

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO cpu_products (product_name, product_sku, prime_price) VALUES (?, ?, ?)`,
        [product_name, product_sku, prime_price],
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO cpu_product_links (product_sku, prime_link, mdcomp_link, vedant_link, pcstudio_link, clarion_link, ehubs_link) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product_sku,
          prime_link,
          mdcomp_link,
          vedant_link,
          pcstudio_link,
          clarion_link,
          ehubs_link,
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });

    const row = {
      product_sku,
      product_name,
      prime_link,
      mdcomp_link,
      vedant_link,
      pcstudio_link,
      clarion_link,
      ehubs_link,
    };

    await setupBrowser();
    try {
      await scrapeOneCpuRow(row);
    } catch (scrapeErr) {
      console.error("Scrape error for new product:", scrapeErr);
      return res.status(500).json({
        error: "Product added but scraping failed: " + scrapeErr.message,
      });
    }

    res.json({ message: "Product added and prices scraped successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
