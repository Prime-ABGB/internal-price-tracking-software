const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const db = require("../db");

router.get("/:section/api", (req, res) => {
  const section = req.params.section;
  db.all(`SELECT * FROM fastmoving_${section}_products`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

router.get("/:section/product-comparison", (req, res) => {
  const section = req.params.section;
  const sku = req.query.product; 

  if(section !== 'ssd') {
    const query = `
      SELECT p.*, l.prime_link, l.mdcomp_link, l.vedant_link, l.pcstudio_link, l.clarion_link, l.ehubs_link
      FROM fastmoving_${section}_products p
      LEFT JOIN fastmoving_${section}_product_links l ON p.product_sku = l.product_sku
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
          ehubs_price: row.ehubs_price
        },
        stock: {
          prime_stock: row.prime_stock,
          mdcomp_stock: row.mdcomp_stock,
          vedant_stock: row.vedant_stock,
          pcstudio_stock: row.pcstudio_stock,
          clarion_stock: row.clarion_stock,
          ehubs_stock: row.ehubs_stock
        },
        links: {
          prime_link: row.prime_link,
          mdcomp_link: row.mdcomp_link,
          vedant_link: row.vedant_link,
          pcstudio_link: row.pcstudio_link,
          clarion_link: row.clarion_link,
          ehubs_link: row.ehubs_link
        }
      };
      res.json(responseData);
    });
  } else {
    const query = `
      SELECT p.*, l.prime_link, l.ossd_link, l.mdcomp_link, l.vedant_link, l.pcstudio_link, l.clarion_link, l.ehubs_link
      FROM fastmoving_${section}_products p
      LEFT JOIN fastmoving_${section}_product_links l ON p.product_sku = l.product_sku
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
          ossd_price: row.ossd_price,
          mdcomp_price: row.mdcomp_price,
          vedant_price: row.vedant_price,
          pcstudio_price: row.pcstudio_price,
          clarion_price: row.clarion_price,
          ehubs_price: row.ehubs_price
        },
        stock: {
          prime_stock: row.prime_stock,
          ossd_stock: row.ossd_stock,
          mdcomp_stock: row.mdcomp_stock,
          vedant_stock: row.vedant_stock,
          pcstudio_stock: row.pcstudio_stock,
          clarion_stock: row.clarion_stock,
          ehubs_stock: row.ehubs_stock
        },
        links: {
          prime_link: row.prime_link,
          ossd_link: row.ossd_link,
          mdcomp_link: row.mdcomp_link,
          vedant_link: row.vedant_link,
          pcstudio_link: row.pcstudio_link,
          clarion_link: row.clarion_link,
          ehubs_link: row.ehubs_link
        }
      };
      res.json(responseData);
    });
  }
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
      const insPriceElement = document.querySelector('ins span.woocommerce-Price-amount.amount bdi');
      if (insPriceElement) {
        return insPriceElement.textContent.trim().replace(/[^\d.]/g, '');
      } else {
        const nextPriceElement = document.querySelector('span.woocommerce-Price-amount.amount bdi');
        return nextPriceElement
          ? nextPriceElement.textContent.trim().replace(/[^\d.]/g, '')
          : null;
      }
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
      prime_price: Number(price),
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
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Debugging if some website has blocked robot/scraping
      // const pageContetnt = await page.content();
      // console.log(pageContetnt.substring(0, 500));
      const price = await page.evaluate(() => {
        const priceElement = document.querySelector('div.product-price-info-group div.price-box h2.price, div.product-price-info-group div.price-box h2.special-price');
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
          const priceElement = document.querySelector('div.product-price');
          const priceString = priceElement.textContent.trim().replace(/[^\d.]/g, '');
            const priceFloat = parseFloat(priceString);
            if (!isNaN(priceFloat)) {
                return priceFloat;
            } else {
                return null;
            }
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
        vedant_price: Number(price),
        vedant_stock: stock
      };

    } catch(error) {
      return {
        vedant_price: null,
        vedant_stock: null
      };
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
      ) || document.querySelector(
          'div.elementor-widget-wrap.elementor-element-populated p.price span bdi'
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
        pcstudio_price: Number(price),
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
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle0' });

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector("div.content_product_detail p.price ins span.woocommerce-Price-amount.amount bdi");
        console.log("checking price element : ", priceElement);
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
        clarion_price: Number(price),
        clarion_stock: stock
      };
    } catch (error) {
      return {
        clarion_price: null,
        clarion_stock: null,
      };
    }
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
      ehubs_price: Number(price),
      ehubs_stock: stock
    };
  }
};

const fetchOSSDPrice = async (url) => {
  if (url === 'product link not found') {
    return {
      ossd_price: null,
      ossd_stock: null
    };
  } else {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const price = await page.evaluate(() => {
      const insPriceElement = document.querySelector('ins span.woocommerce-Price-amount.amount bdi');
      if (insPriceElement) {
        return insPriceElement.textContent.trim().replace(/[^\d.]/g, '');
      } else {
        const nextPriceElement = document.querySelector('span.woocommerce-Price-amount.amount bdi');
        return nextPriceElement
          ? nextPriceElement.textContent.trim().replace(/[^\d.]/g, '')
          : null;
      }
    });
    

    const stock = await page.evaluate(() => {
      const stockElement = document.querySelector(
        "div.summary.entry-summary p.stock.out-of-stock"
      );
      return stockElement
        ? stockElement.textContent.trim()
        : "In Stock";
    });
    await page.close();
    console.log(`Fetched price: ${price}, stock: ${stock}`);

    return {
      ossd_price: Number(price),
      ossd_stock: stock
    };
  }
};

function getTimeSlot() {
  const now = new Date();
  const hours = now.getHours();
  const date = now.toISOString().split('T')[0]; // Format YYYY-MM-DD

  let timeSlot;
  if (hours >= 8 && hours < 12) {
      timeSlot = 'Morning';
  } else if (hours >= 12 && hours < 17) {
      timeSlot = 'Afternoon';
  } else if (hours >= 17 && hours < 20) {
      timeSlot = 'Evening';
  } else {
      return null; // Not in the allowed time ranges
  }

  return { timeSlot, date };
}
/***********************************************************************************************************/

router.get("/:section/webscraper", async (req, res) => {
  const section = req.params.section;
  const { timeSlot, date } = getTimeSlot();
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM fastmoving_${section}_product_links`, (err, rows) => {
          if (err) {
              reject(err);
          } else {
              resolve(rows);
          }
      });
    });

    await setupBrowser();
    if(section !== 'ssd') {
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
            UPDATE fastmoving_${section}_products
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

          const sqlInsert = `
            INSERT INTO fastmoving_historical_prices (
                sku, category, date, time_slot, prime_price, prime_stock, mdcomp_price, mdcomp_stock,
                vedant_price, vedant_stock, pcstudio_price, pcstudio_stock,
                clarion_price, clarion_stock, ehubs_price, ehubs_stock
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sku, date, time_slot) 
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
                category = excluded.category;
          `;

          const insertParams = [
            product_sku,
            `${section}`,
            `${date}`,
            `${timeSlot}`,
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
            ehubs_stock                     
          ];

          await new Promise((resolve, reject) => {
            db.run(sqlInsert, insertParams, function(err) {
              if (err) {
                reject(err);
              } else {
                console.log(`Historical data inserted for SKU: ${product_sku}`);
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(`Error processing ${product_sku}:`, error);
        }
      }
    } else {
      console.log('it is in the else condition')
      for (const row of rows) {
        const {
          product_sku,
          prime_link,
          ossd_link,
          mdcomp_link,
          vedant_link,
          pcstudio_link,
          clarion_link,
          ehubs_link
        } = row;

        console.log(`Processing: ${product_sku}`);
        
        try {
          console.log(`fetching data from: ${prime_link}`);
          const prime_data = await fetchPrimePrice(prime_link);
          const { prime_price, prime_stock } = prime_data;
          console.log(`prime price & stock: ${typeof prime_price} & ${prime_stock}`);

          console.log(`fetching data from: ${ossd_link}`);
          const ossd_data = await fetchOSSDPrice(ossd_link);
          const { ossd_price, ossd_stock } = ossd_data;
          console.log(`ossd price & stock: ${typeof ossd_price} & ${ossd_stock}`);
          
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
            UPDATE fastmoving_${section}_products
            SET prime_price = ?,
                ossd_price = ?,
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
                ehubs_stock = ?, 
                ossd_stock = ?
            WHERE product_sku = ?;
          `;
          const params = [prime_price, ossd_price, mdcomp_price, vedant_price, pcstudio_price, clarion_price, ehubs_price, prime_stock, ossd_stock, mdcomp_stock, vedant_stock, pcstudio_stock, clarion_stock, ehubs_stock, product_sku];

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

          const sqlInsert = `
            INSERT INTO fastmoving_historical_prices (
                sku, category, date, time_slot, prime_price, prime_stock, ossd_price, ossd_stock, mdcomp_price, mdcomp_stock,
                vedant_price, vedant_stock, pcstudio_price, pcstudio_stock,
                clarion_price, clarion_stock, ehubs_price, ehubs_stock
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sku, date, time_slot) 
            DO UPDATE SET
                prime_price = excluded.prime_price,
                prime_stock = excluded.prime_stock,
                ossd_price = excluded.ossd_price,
                ossd_stock = excluded.ossd_stock,
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
                category = excluded.category;
          `;

          const insertParams = [
            product_sku,
            `${section}`,
            `${date}`,
            `${timeSlot}`,
            prime_price,
            prime_stock,
            ossd_price,
            ossd_stock,
            mdcomp_price,
            mdcomp_stock,
            vedant_price,
            vedant_stock,
            pcstudio_price,
            pcstudio_stock,
            clarion_price,
            clarion_stock,
            ehubs_price,
            ehubs_stock        
          ];

          await new Promise((resolve, reject) => {
            db.run(sqlInsert, insertParams, function(err) {
              if (err) {
                reject(err);
              } else {
                console.log(`Historical data inserted for SKU: ${product_sku}`);
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(`Error processing ${product_sku}:`, error);
        }
      }
    }
    res.json({ message: "Prices fetched and inserted successfully." });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;