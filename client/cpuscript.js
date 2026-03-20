async function fetchData() {
  let respo = [];

  try {
    const response = await fetch("/cpu/api");
    const responseData = await response.json();
    respo = responseData.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return; // Exit the function if fetching data fails
  }

  const tableContent = document.getElementById("table-content");
  const tableButtons = document.querySelectorAll("th button");
  let greenCount = 0;
  let redCount = 0;

  respo = respo.map((obj) => {
    let primePrice = obj.prime_price;
    let minPrice = primePrice;

    if (obj.mdcomp_stock === "In Stock" && obj.mdcomp_price !== null && obj.mdcomp_price !== 0) {
      minPrice = Math.min(minPrice, obj.mdcomp_price);
    }
    if (obj.vedant_stock === "In Stock" && obj.vedant_price !== null && obj.vedant_price !== 0) {
      minPrice = Math.min(minPrice, obj.vedant_price);
    }
    if (obj.pcstudio_stock === "In Stock" && obj.pcstudio_price !== null && obj.pcstudio_price !== 0) {
      minPrice = Math.min(minPrice, obj.pcstudio_price);
    }
    if (obj.clarion_stock === "In Stock" && obj.clarion_price !== null && obj.clarion_price !== 0) {
      minPrice = Math.min(minPrice, obj.clarion_price);
    }
    if (obj.ehubs_stock === "In Stock" && obj.ehubs_price !== null && obj.ehubs_price !== 0) {
      minPrice = Math.min(minPrice, obj.ehubs_price);
    }

    obj.price_diff = primePrice - minPrice;
    return obj;
  });


  const createRow = (obj) => {
    const row = document.createElement("tr");
    const objKeys = Object.keys(obj);
    let tempSku = "";
    let tempName = "";

    objKeys.map((key) => {
      if (key === "product_name" || key === "product_sku" || key === "prime_price") {
        const cell = document.createElement("td");
        cell.setAttribute("data-attr", key);
        if (key === "product_sku") {
          tempSku = obj[key];
        }
        tempName = obj.product_name;
        if (key === "prime_price" && obj.price_diff > 0) {
          cell.classList.add("red");
          cell.innerHTML = `<a href="#" onclick="openPriceComparison('${tempSku}'); return false;">${obj[key]}</a>`;
          redCount += 1;
        } else if (key === "prime_price" && obj.price_diff == 0) {
          cell.classList.add("green");
          cell.innerHTML = `<a href="#" onclick="openPriceComparison('${tempSku}'); return false;">${obj[key]}</a>`;
          greenCount += 1;
        } else {
          cell.textContent = obj[key];
        }
        row.appendChild(cell);
      }
    });

    // Append differential as a separate cell
    const diffCell = document.createElement("td");
    diffCell.setAttribute("data-attr", "price_diff");
    diffCell.textContent = obj.price_diff;
    row.appendChild(diffCell);

    const ecomCell = document.createElement("td");
    ecomCell.classList.add("ecom");

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("wrapper");
    const buttonAmzn = document.createElement("button");
    const amznSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="2.167 .438 251.038 259.969" width="24"><g fill="none" fill-rule="evenodd"><path d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z" fill="#f90" fill-rule="nonzero"/><path d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095" fill="#000"/><path d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z" fill="#f90" fill-rule="nonzero"/><path d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095" fill="#000"/></g></svg>`;
    buttonAmzn.innerHTML = amznSvg;
    const buttonFk = document.createElement("button");
    const FkSvg = `<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3.833 1.333a.993.993 0 0 0-.333.061V1c0-.551.449-1 1-1h14.667c.551 0 1 .449 1 1v.333H3.833zm17.334 2.334H2.833c-.551 0-1 .449-1 1V23c0 .551.449 1 1 1h7.3l1.098-5.645h-2.24c-.051 0-5.158-.241-5.158-.241l4.639-.327-.078-.366-1.978-.285 1.882-.158-.124-.449-3.075-.467s3.341-.373 3.392-.373h3.232l.247-1.331c.289-1.616.945-2.807 1.973-3.693 1.033-.892 2.344-1.332 3.937-1.332.643 0 1.053.151 1.231.463.118.186.201.516.279.859.074.352.14.671.095.903-.057.345-.461.465-1.197.465h-.253c-1.327 0-2.134.763-2.405 2.31l-.243 1.355h1.54c.574 0 .781.402.622 1.306-.17.941-.539 1.36-1.111 1.36H14.9L13.804 24h7.362c.551 0 1-.449 1-1V4.667a1 1 0 0 0-.999-1zM20.5 2.333A.334.334 0 0 0 20.167 2H3.833a.334.334 0 0 0-.333.333V3h17v-.667z"></path></g></svg>`;
    buttonFk.innerHTML = FkSvg;

    buttonAmzn.addEventListener("click", () => {
      const name = tempName;
      const query = encodeURIComponent(name);
      window.open(`https://www.amazon.in/s?k=${query}`, '_blank');
    });
    
    buttonFk.addEventListener("click", () => {
      const name = tempName;
      const query = encodeURIComponent(name);
      window.open(`https://flipkart.com/search?q=${query}`, '_blank');
    });

    wrapperDiv.appendChild(buttonAmzn);
    wrapperDiv.appendChild(buttonFk);

    ecomCell.appendChild(wrapperDiv);
    
    row.appendChild(ecomCell);

    return row;
  };

  const getTableContent = (data) => {
    tableContent.innerHTML = ''; // Clear the table content first
    data.map((obj) => {
      const row = createRow(obj);
      tableContent.appendChild(row);
    });
  };

  const sortData = (data, param, direction = "asc") => {
    tableContent.innerHTML = ''; // Clear the table
    
    const sortedData = [...data].sort((a, b) => {
      let valueA = a[param];
      let valueB = b[param];
      // console.log('Data sample:', data[0]); // Debugging
      
      // If the value is within an <a> tag, extract the number
      if (typeof valueA === 'string' && valueA.includes('<a')) {
        valueA = parseInt(valueA.match(/>(.*?)<\/a>/)[1], 10);
      }
      if (typeof valueB === 'string' && valueB.includes('<a')) {
        valueB = parseInt(valueB.match(/>(.*?)<\/a>/)[1], 10);
      }
  
      if (direction === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  
    getTableContent(sortedData);
  };

  const resetButtons = (event) => {
    [...tableButtons].map((button) => {
      if (button !== event.target) {
        button.removeAttribute("data-dir");
      }
    });
  };

  getTableContent(respo);

  console.log(tableButtons);
  [...tableButtons].forEach((button) => {
    button.addEventListener("click", (e) => {
      const param = e.target.getAttribute("data-attr");
      const currentDirection = e.target.getAttribute("data-dir") || "asc";
      const newDirection = currentDirection === "asc" ? "desc" : "asc";
      console.log(param);
      resetButtons(e); // Reset all other buttons' data-dir
      sortData(respo, param, newDirection); // Sort by the clicked column
      e.target.setAttribute("data-dir", newDirection); // Update direction
    });
  });

  function filterTable() {
    const filterValue = document
      .getElementById("searchInput")
      .value.toUpperCase();
    const filteredData = respo.filter((product) => {
      return (
        (product.product_name.toUpperCase().includes(filterValue) ||
        product.product_sku.toUpperCase().includes(filterValue))
      );
    });
    getTableContent(filteredData);
  }

  function initializeTable() {
    getTableContent(respo);
    document
      .getElementById("searchInput")
      .addEventListener("keyup", filterTable);
  }

  // Call initializeTable when window is loaded
  initializeTable();
  greenCount = greenCount / 2;
  redCount = redCount / 2;
  document.getElementById("greenCount").textContent = greenCount;
  document.getElementById("redCount").textContent = redCount;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  document.getElementById('copyTableBtn').addEventListener('click', copyTableToClipboard);
});



function openPriceComparison(productSku) {
  fetch(`/cpu/product-comparison?product=${encodeURIComponent(productSku)}`)
    .then((response) => response.json())
    .then((product) => {
      localStorage.setItem("productComparisonData", JSON.stringify(product));
      return fetch(`/graphview?product=${encodeURIComponent(productSku)}`);
    })
    .then((response) => response.json())
    .then((chartData) => {
      localStorage.setItem("chartData", JSON.stringify(chartData));
      window.open("/product-compare.html", "_blank");
    })
    .catch((error) => {
      console.error("Error fetching product data:", error);
      // Handle error as needed
    });
}

function copyTableToClipboard() {
  const table = document.getElementById('priceTable');
  
  if (!table) {
    console.error('Table not found.');
    return;
  }

  const rows = table.querySelectorAll('tr');
  let tableText = '';

  rows.forEach(row => {
    const cells = row.querySelectorAll('th, td');
    const cellTexts = Array.from(cells).map(cell => cell.innerText);
    tableText += cellTexts.join('\t') + '\n';
  });

  // Try using the Clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(tableText).then(() => {
      alert('Table copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy table: ', err);
    });
  } else {
    // Fallback to using a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = tableText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('Table copied to clipboard');
    } catch (err) {
      console.error('Failed to copy table: ', err);
    }
    document.body.removeChild(textarea);
  }
}