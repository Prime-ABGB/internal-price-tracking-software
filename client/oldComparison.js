document.addEventListener('DOMContentLoaded', function() {
  const productData = JSON.parse(localStorage.getItem('productComparisonData'));
  if (!productData) {
    console.error('Product data not found.');
    return;
  }
// to add stock in db.
  const productDetailsContainer = document.getElementById('productDetails');
  productDetailsContainer.innerHTML = `
    <h2>${productData.product_name}</h2>
    <p>SKU: ${productData.product_sku}</p>
    <h2>Prices</h3>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Product SKU</th>
          <th>Company</th>
          <th>Price</th>
          <th>Stock</th>
        </tr>
      </thead>
      <tbody>
        ${getSortedPrices(productData)}
      </tbody>
    </table>
  `;
});

function getSortedPrices(product) {
  const companyColumns = [
    'prime_price',
    'mdcomp_price',
    'vedant_price',
    'pcstudio_price',
    'clarion_price',
    'ehubs_price'
  ];

  // Filter out prices and stocks that are null or undefined
  const validData = companyColumns
    .filter(company => product.prices[company] !== null && product.prices[company] !== undefined)
    .map(company => ({
      company: company.replace('_price', ''),
      price: product.prices[company],
      stock: product.stock[`${company.replace('_price', '')}_stock`] // Assuming stock follows companyname_stock convention
    }))
    .sort((a, b) => a.price - b.price);

  // Find the index of 'prime_price' in sorted valid data
  const primeIndex = validData.findIndex(dataObj => dataObj.company === 'prime');

  // Construct HTML rows for valid prices and stocks with conditional styling
  const rows = validData.map((dataObj, index) => {
    let priceCellClass = '';
    if (dataObj.company === 'prime') {
      priceCellClass = index === 0 ? 'green' : 'red';
    }
    return `
      <tr>
        <td>${product.product_name}</td>
        <td>${product.product_sku}</td>
        <td>${dataObj.company}</td>
        <td class="${priceCellClass}">${dataObj.price}</td>
        <td>${dataObj.stock !== null ? dataObj.stock : '-'}</td>
      </tr>
    `;
  }).join('');

  return rows;
}



