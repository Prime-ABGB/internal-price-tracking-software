const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const db = require("../db"); // Adjust the path if necessary

router.get("/api/ssd", (req, res) => {
  db.all("SELECT * FROM ssd_products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

router.get("/product-comparison", (req, res) => {
  const sku = req.query.product; 

  db.all("SELECT * FROM ssd_products WHERE product_sku = ?", [sku], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const responseData = {
      product_name: rows[0].product_name,
      product_sku: rows[0].product_sku,
      prices: {
        prime_price: rows[0].prime_price,
        mdcomp_price: rows[0].mdcomp_price,
        vedant_price: rows[0].vedant_price,
        pcstudio_price: rows[0].pcstudio_price,
        clarion_price: rows[0].clarion_price,
        ehubs_price: rows[0].ehubs_price
      },
      stock: {
        prime_stock: rows[0].prime_stock,
        mdcomp_stock: rows[0].mdcomp_stock,
        vedant_stock: rows[0].vedant_stock,
        pcstudio_stock: rows[0].pcstudio_stock,
        clarion_stock: rows[0].clarion_stock,
        ehubs_stock: rows[0].ehubs_stock
      }
    };
    res.json(responseData);
  });
});


/***********************************************************************************************************/
let browser;
async function setupBrowser() {
  browser = await puppeteer.launch();
}

const fetchPrimePrice = async (url) => {
  try{
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const price = await page.evaluate(() => {
      const priceElement = document.querySelector(
        "ins span.woocommerce-Price-amount.amount bdi"
      );
      return priceElement
        ? priceElement.textContent.trim().replace(/[^\d.]/g, "")
        : null;
    });

    const stock = await page.evaluate(() => {
      const stockElement = document.querySelector(
        "div.stock-availability.out-of-stock"
      );
      return stockElement
        ? stockElement.textContent.trim()
        : "In Stock";
    });
    await page.close();
    console.log(`Fetched price: ${price}, stock: ${stock}`);

    return {
      prime_price: price,
      prime_stock: stock
    };
  } catch (error) {
    console.error(`Error fetching price from ${url}:`, error);
    return null;
  }
};

const fetchMdcompPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      mdcomp_price: null,
      mdcomp_stock: null
    };
  } else {
    try{
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector('span.price-new span');
        if (priceElement) {
            const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');
            return parseFloat(priceString);
        } else {
            return null;
        }
      });
    
      const stock = await page.evaluate(() => {
        const stockElement = document.querySelector('div.stock');
        if (stockElement) {
          return stockElement.textContent.trim().replace('Availability:', '').trim();
        } else {
          return null; // Handle case where .stock element is not found
        }
      });
      await page.close();
      console.log(`MDCOMP Fetched price: ${price}, stock: ${stock}`);

      return {
        mdcomp_price: price,
        mdcomp_stock: stock
      };
    } catch(error) {
      console.error(`Error fetching price from ${url}:`, error);
      return null;
    }
  }
};

const fetchVedantPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      vedant_price: null,
      vedant_stock: null
    };
  } else {
    try{
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector('div.product-price-new');
    
        if (priceElement) {
            const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');
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

      const stock = await page.evaluate(() => {
        const outOfStockElement = document.querySelector('span.product-label.product-label-30.product-label-diagonal');
        if (outOfStockElement) {
          return outOfStockElement.textContent.trim();
        } else {
          return "In Stock";
        }
      });
      await page.close();
      console.log(`VEDANT Fetched price: ${price}, stock: ${stock}`);

      return {
        vedant_price: price,
        vedant_stock: stock
      };

    } catch(error) {
      console.error(`Error fetching price from ${url}:`, error);
      return null;
    }
  }
};

const fetchPcstudioPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      pcstudio_price: null,
      pcstudio_stock: null
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const price = await page.evaluate(() => {
      const priceElement = document.querySelector(
          'div.elementor-widget-wrap.elementor-element-populated p.price ins bdi'
      );
      if (priceElement) {
          const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');  
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
        pcstudio_price: price,
        pcstudio_stock: stock
    };
  }
};

const fetchClarionPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      clarion_price: null,
      clarion_stock: null
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const price = await page.evaluate(() => {
      const priceElement = document.querySelector("div.content_product_detail ins span.woocommerce-Price-amount.amount bdi");
      if (priceElement) {
          const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');
          const priceFloat = parseFloat(priceString);
          return priceFloat;
      } else {
          return null;
      }
    });

    const stock = await page.evaluate(() => {
      const stockElement = document.querySelector(
        "p.stock.out-of-stock"
      );
      return stockElement
        ? stockElement.textContent.trim()
        : "In Stock";
    });
    await page.close();
    console.log(`CLARION Fetched price: ${price}, stock: ${stock}`);
    
    return {
      clarion_price: price,
      clarion_stock: stock
    };
  }
};

const fetchEhubsPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      ehubs_price: null,
      ehubs_stock: null
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

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
      const stockElement = document.querySelector(
        "div.out_stock h5"
      );
      return stockElement
        ? stockElement.textContent.trim()
        : "In Stock";
    });;
    await page.close();
    console.log(`EHUBS Fetched price: ${price}, stock: ${stock}`);
    
    return {
      ehubs_price: price,
      ehubs_stock: stock
    };
  }
};
/***********************************************************************************************************/

router.get("/webscraper/ssd", async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM ssd_product_links", (err, rows) => {
          if (err) {
              reject(err);
          } else {
              resolve(rows);
          }
      });
    });

    await setupBrowser();
    for (const row of rows) {
      const {
        product_sku,
        prime_link,
        mdcomp_link,
        vedant_link,
        pcstudio_link,
        clarion_link,
        ehubs_link,
      } = row;

      console.log(`Processing: ${product_sku}`);
      
      try {
        console.log(`fetching data from: ${prime_link}`);
        const prime_data = await fetchPrimePrice(prime_link);
        const { prime_price, prime_stock } = prime_data;
        console.log(`prime price & stock: ${typeof prime_price} & ${prime_stock}`);
        
        
        console.log(`fetching data from: ${mdcomp_link}`);
        const mdcomp_data = await fetchMdcompPrice(mdcomp_link);
        const { mdcomp_price, mdcomp_stock } = mdcomp_data;
        console.log(`mdcomp price & stock: ${typeof mdcomp_price} & ${mdcomp_stock}`);
        
        
        console.log(`fetching data from: ${vedant_link}`);
        const vedant_data = await fetchVedantPrice(vedant_link);
        const { vedant_price, vedant_stock } = vedant_data;
        console.log(`vedant price & stock: ${typeof vedant_price} & ${vedant_stock}`);
        
        
        console.log(`fetching data from: ${pcstudio_link}`);
        const pcstudio_data = await fetchPcstudioPrice(pcstudio_link);
        const { pcstudio_price, pcstudio_stock } = pcstudio_data;
        console.log(`pcstudio price & stock: ${typeof pcstudio_price} & ${pcstudio_stock}`);
        
        console.log(`fetching data from: ${clarion_link}`);
        const clarion_data = await fetchClarionPrice(clarion_link);
        const { clarion_price, clarion_stock } = clarion_data;
        console.log(`clarion price & stock: ${typeof clarion_price} & ${clarion_stock}`);
        
        console.log(`fetching data from: ${ehubs_link}`);
        const ehubs_data = await fetchEhubsPrice(ehubs_link);
        const { ehubs_price, ehubs_stock } = ehubs_data;
        console.log(`ehubs price & stock: ${typeof ehubs_price} & ${ehubs_stock}`);

        const sql = `
          UPDATE ssd_products
          SET prime_price = ?,
              mdcomp_price = ?,
              vedant_price = ?,
              pcstudio_price = ?,
              clarion_price = ?,
              ehubs_price = ?,
              prime_stock = ?,
              mdcomp_stock = ?,
              vedant_stock = ?,
              pcstudio_stock = ?,
              clarion_stock = ?,
              ehubs_stock = ?
          WHERE product_sku = ?;
        `;
        const params = [prime_price, mdcomp_price, vedant_price, pcstudio_price, clarion_price, ehubs_price, prime_stock, mdcomp_stock, vedant_stock, pcstudio_stock, clarion_stock, ehubs_stock, product_sku];

        await new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
              if (err) {
                  reject(err);
              } else {
                  console.log(`Rows inserted: ${this.changes}`);
                  resolve();
              }
          });
        });
      } catch (error) {
        console.error(`Error processing ${product_sku}:`, error);
      }
    }
    res.json({ message: "Prices fetched and inserted successfully." });
} catch(error) {
    res.status(500).json({ error: error.message });
}
});

module.exports = router;
