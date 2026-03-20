import os
import pandas as pd
from datetime import datetime, timedelta
import sqlite3

#ORDERS
filepath = '.\\Misc\\ossdorders-010325.csv'
if os.path.isfile(filepath):
  pd.set_option('display.max_rows', 200)
  df = pd.read_csv(filepath)
  agg_data = df.groupby('SKU')['Quantity'].sum().reset_index()
  agg_dict = {row['SKU']: int(row['Quantity']) for _, row in agg_data.iterrows()}
else:
  agg_dict = {}

fastmovers = {
'CT500P3PSSD8' : '/crucial-p3-plus-500gb-pcie-m-2-nvme-gen-4-ssd-ct500p3pssd8/',
'CT240BX500SSD1' : '/crucial-240gb-bx500-sata-iii-2-5-internal-ssd-ct240bx500ssd1/',
'WD20EZBX' : '/wd-blue-2tb-7200-rpm-256mb-3-5″-internal-hard-drive-wd20ezbx/',
'CT500BX500SSD1' : '/crucial-bx500-500gb-2-5-inch-sata-3d-nand-internal-ssd-ct500bx500ssd1/',
'CT1000P3PSSD8' : '/crucial-p3-plus-1tb-pcie-4-0-3d-nand-nvme-m-2-ssd-ct1000p3pssd8/',
'SXS1000/2000G' : '/kingston-2tb-xs1000-usb-a-3-2-gen-2-external-ssd-sxs1000-2000g/',
'SXS1000/1000G' : '/kingston-1tb-xs1000-usb-a-3-2-gen-2-external-ssd-sxs1000-1000g/',
'AGAMMIXS70B-2T-CS' : '/adata-xpg-gammix-s70-blade-2tb-m-2-nvme-internal-ssd-agammixs70b-2t-cs/',
'WDS100T2X0E' : '/wd-black-sn850x-1tb-m-2-nvme-gen4-internal-ssd-wds100t2x0e/',
'WDS500G3B0E' : '/western-digital-blue-sn580-500gb-nvme-ssd-wds500g3b0e/',
'CT500P3SSD8' : '/crucial-500gb-p3-nvme-pcie-3-0-m-2-internal-ssd-ct500p3ssd8/',
'EVM25/256GB' : '/evm-256gb-2-5-sata-ssd-evm25-256gb/',
'WDS480G3G0A' : '/wd-green-480gb-sata-iii-2-5″-internal-ssd-wds480g3g0a/',
'WDS100T3X0E' : '/wd-black-sn770-1tb-m-2-2280-nvme-ssd-wds100t3x0e/',
'EVM25/512GB' : '/evm-512gb-2-5-sata-ssd-evm25-512gb/',
'WDS200T3X0E' : '/wd-black-sn770-2tb-m-2-2280-nvme-ssd-wds200t3x0e/',
'AGAMMIXS70B-1T-CS' : '/adata-xpg-gammix-s70-blade-1tb-m-2-nvme-gen4-pcie-4-0-internal-ssd-agammixs70b-1t-cs/',
'EVMNV42/512GB' : '/evm-512gb-2242-nvme-ssd-evmnv42-512gb/',
'MZ-V9P2T0BW' : '/samsung-990-pro-2tb-pci-express-4-0-x4-gen-4-nvme-ssd-mz-v9p2t0bw/',
}

#GOOGLE ANALYTICS
csvdata = {}
with open('.\\Misc\\ossd-010325.csv', encoding='utf8') as csvfile:
  rows = []
  for row in csvfile:
    rows.append(row.rstrip('\n').split(','))

  for row in rows:
    keys = row[0]
    values = row[1]
    csvdata[keys] = values

productdata = {keyfas: int(csvdata.get(valfas, 0)) for keyfas, valfas in fastmovers.items()}

finaldata = {key: (value, agg_dict.get(key, 0)) for key, value in productdata.items()}
print(finaldata)

conn = sqlite3.connect('server/newscraper.db')
cursor = conn.cursor()

removingDay = datetime.today() - timedelta(days=1)
yesterday = '2025-03-01'# str(removingDay.date())

# date = '2024-12-12'

# print(yesterday)

company = 'Ossd'

for sku, viewers in finaldata.items():
  pageViews = viewers[0]
  orders = viewers[1]
  cursor.execute('''
  INSERT OR REPLACE INTO fastmoving_historical_analytics (sku, date, viewers, orders, company) VALUES (?, ?, ?, ?, ?)
  ''', (sku, yesterday, pageViews, orders, company))

conn.commit()
conn.close()