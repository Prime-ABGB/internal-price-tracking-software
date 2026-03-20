document.addEventListener('DOMContentLoaded', function() {
  const productData = JSON.parse(localStorage.getItem('productComparisonData'));
  if (!productData) {
    console.error('Product data not found.');
    return;
  }

  const chartData = JSON.parse(localStorage.getItem('chartData'));
  if (!chartData) {
    console.error('Product data not found.');
    return;
  }
  const analyticsData = JSON.parse(localStorage.getItem('analyticsData'));
  console.log(analyticsData);
  if (!analyticsData) {
    console.error('Product data not found.');
    return;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthData = chartData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
  });
  updateChart(currentMonthData);

  const productDetailsContainer = document.getElementById('productDetails');
  productDetailsContainer.innerHTML = `
    <p>SKU: ${productData.product_sku}</p>
    <table id="productTable">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Product SKU</th>
          <th>Company</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        ${getSortedPrices(productData)}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.month-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateGraphBasedOnSelection);
  });

  function updateGraphBasedOnSelection() {
    const selectedMonths = Array.from(document.querySelectorAll('.month-checkbox:checked')).map(checkbox => checkbox.value);
    const filteredData = chartData.filter(item => {
      const itemDate = new Date(item.date);
      const itemMonthYear = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return selectedMonths.includes(itemMonthYear);
    });
    console.log(filteredData);
    updateChart(filteredData);
  }

  const plugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
      const {ctx} = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = options.color || '#ffffff';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };

  primedate = []
  primeviewers = []
  primeorders = []
  ossddate = []
  ossdviewers = []
  ossdorders = []
  
  analyticsData.forEach(element => {
    if(element.company === "Prime") {
      primedate.push(element.date);
      primeviewers.push(element.viewers);
      primeorders.push(element.orders);
    } else {
      ossddate.push(element.date);
      ossdviewers.push(element.viewers);
      ossdorders.push(element.orders);
    }
  });

  const primeanalytics = document.getElementById("PrimeAnalyticsChart");
  new Chart(primeanalytics, {
    type: 'line',
    data : {
      labels: primedate,
      datasets : [
        {
          label: 'Visitors',
          data : primeviewers,
          borderWidth: 3,
          spanGaps: false,
          tension: 0.1,
          borderColor: '#088c4a',
          order: 1
        },
        {
          label: 'Orders',
          data : primeorders,
          borderWidth: 3,
          spanGaps: false,
          tension: 0.1,
          borderColor: '#226f99',
          order: 0
        }
      ],
    },
    options: {
      elements: {
        point: {
          radius: 1,
          hoverRadius: 3,
        }
      },
      interaction: {
        mode: 'index',
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: '#d5d5d5',
        },
        title: {
          display: true,
          text: 'PRIMEABGB - Vistors and Orders / Day'
        }
      },
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          }
        }
      },
      transitions: {
        show: {
          animations: {
            x: {
              from: 0
            },
            y: {
              from: 0
            }
          }
        },
        hide: {
          animations: {
            x: {
              to: 0
            },
            y: {
              to: 0
            }
          }
        }
      }
    },
    plugins: [plugin],
  });

  const ossdanalytics = document.getElementById("OssdAnalyticsChart");
  new Chart(ossdanalytics, {
    type: 'line',
    data : {
      labels: ossddate,
      datasets : [
        {
          label: 'Visitors',
          data : ossdviewers,
          borderWidth: 3,
          spanGaps: false,
          tension: 0.1,
          borderColor: '#088c4a',
          order: 1
        },
        {
          label: 'Orders',
          data : ossdorders,
          borderWidth: 3,
          spanGaps: false,
          tension: 0.1,
          borderColor: '#226f99',
          order: 0
        }
      ],
    },
    options: {
      elements: {
        point: {
          radius: 1,
          hoverRadius: 3,
        }
      },
      interaction: {
        mode: 'index',
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: '#d5d5d5',
        },
        title: {
          display: true,
          text: 'ONLYSSD - Vistors and Orders / Day'
        }
      },
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          }
        }
      },
      transitions: {
        show: {
          animations: {
            x: {
              from: 0
            },
            y: {
              from: 0
            }
          }
        },
        hide: {
          animations: {
            x: {
              to: 0
            },
            y: {
              to: 0
            }
          }
        }
      }
    },
    plugins: [plugin],
  });

  document.getElementById('copyTableBtn').addEventListener('click', copyTableToClipboard);
});

let myChart = null;

function updateChart(data) {
  if(myChart) {
    myChart.destroy();
  }

  const plugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
      const {ctx} = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = options.color || '#ffffff';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };

  const ctx = document.getElementById("PriceChart");

  dates = [];
  timeSlot = [];
  primePrice = [];
  ossdPrice = [];
  vedPrice = [];
  mdPrice = [];
  pcsPrice = [];
  clrPrice = [];
  ehubPrice = [];
  data.forEach(element => {
    dates.push(element.date);
    timeSlot.push(element.time_slot);
    primePrice.push(element.prime_price);
    ossdPrice.push(element.ossd_price);
    vedPrice.push(element.vedant_price);
    mdPrice.push(element.mdcomp_price);
    pcsPrice.push(element.pcstudio_price);
    clrPrice.push(element.clarion_price);
    ehubPrice.push(element.ehubs_price);
  });
  const labels = dates.map((date, index) => {
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year.slice(-2)}`;
    const timeSlotMap = {
        'Morning': 'M',
        'Afternoon': 'A',
        'Evening': 'E'
    };
    const shortTimeSlot = timeSlotMap[timeSlot[index]];  
    return `${formattedDate} ${shortTimeSlot}`;
  });
  
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Prime',
        data: primePrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#003aff',
      }, {
        label: 'OnlySSD',
        data: ossdPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#437ba8',
      }, {
        label: 'MD',
        data: mdPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#d06820',
      }, {
        label: 'Vedant',
        data: vedPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#ab50f3',
      }, {
        label: 'PC Studio',
        data: pcsPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#e9fc4a',
      }, {
        label: 'Clarion',
        data: clrPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#33ab57',
      }, {
        label: 'EliteHubs',
        data: ehubPrice,
        borderWidth: 3,
        spanGaps: false,
        tension: 0.1,
        borderColor: '#3d3d3d',
      }]
    },
    options: {
      elements: {
        point: {
          radius: 1,
          hoverRadius: 3,
        }
      },
      interaction: {
        mode: 'index',
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: '#d5d5d5',
        },
        title: {
          display: true,
          text: 'Historical Price Data'
        }
      },
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            drawOnChartArea: false,
          }
        }
      },
      transitions: {
        show: {
          animations: {
            x: {
              from: 0
            },
            y: {
              from: 0
            }
          }
        },
        hide: {
          animations: {
            x: {
              to: 0
            },
            y: {
              to: 0
            }
          }
        }
      }
    },
    plugins: [plugin],
  });
}

function getSortedPrices(product) {
  const companyColumns = [
    'prime_price',
    'ossd_price',
    'mdcomp_price',
    'vedant_price',
    'pcstudio_price',
    'clarion_price',
    'ehubs_price'
  ];

  const validData = companyColumns
    .filter(company => product.prices[company] !== null && product.prices[company] !== undefined)
    .map(company => ({
      company: company.replace('_price', ''),
      price: product.prices[company],
      stock: product.stock[`${company.replace('_price', '')}_stock`],
      link: product.links[`${company.replace('_price', '')}_link`] 
    }))
    .sort((a, b) => a.price - b.price);

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
        <td>${dataObj.link ? `<a href="${dataObj.link}" target="_blank">Product Link</a>` : '-'}</td>
      </tr>
    `;
  }).join('');

  return rows;
}

function copyTableToClipboard() {
  const table = document.getElementById('productTable');
  
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

  navigator.clipboard.writeText(tableText).then(() => {
    alert('Table copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy table: ', err);
  });
}
