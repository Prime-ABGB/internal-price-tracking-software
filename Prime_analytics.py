import os
import pandas as pd
from datetime import datetime, timedelta
import sqlite3

#ORDERS
filepath = '.\\Misc\\primeorders-010325.csv'
if os.path.isfile(filepath):
  pd.set_option('display.max_rows', 200)
  df = pd.read_csv(filepath)
  agg_data = df.groupby('SKU')['Quantity'].sum().reset_index()
  agg_dict = {row['SKU']: int(row['Quantity']) for _, row in agg_data.iterrows()}
else:
  agg_dict = {}

fastmovers = {
'BX8071512400' : '/intel-core-i5-12400f-12th-gen-alder-lake-6-core-2-5-ghz-lga-1700-desktop-processor-bx8071512400f/',
'100-100000593WOF' : '/amd-ryzen-5-7600x-desktop-processor-100-100000593wof/',
'BX8071512400F' : '/intel-core-i5-12400f-12th-gen-alder-lake-6-core-2-5-ghz-lga-1700-desktop-processor-bx8071512400f/',
'100-100000926WOF' : '/amd-ryzen-7-5700x-desktop-processor-8-cores-16-threads-3-4ghz-100-100000926wof/',
'Core i5-12600K' : '/intel-core-i5-12600k-12th-gen-alder-lake-processor/',
'100-100000252BOX' : '/amd-ryzen-5-5600g-desktop-processor-integrated-radeon-graphics-100-100000252box/',
'100-100000457BOX' : '/amd-ryzen-5-5500-desktop-processor-6-cores-12-threads-3-6ghz-100-100000457box/',
'100-100001015BOX' : '/amd-ryzen-5-7600-processor-with-radeon-graphics-100-100001015box/',
'BX8071514900K' : '/intel-core-i9-14900k-raptor-lake-refresh-processor-bx8071514900k/',
'100-100000910WOF' : '/amd-ryzen-7-7800x3d-gaming-processor-100-100000910wof/',
'BX8071514700K' : '/intel-core-i7-14700k-3-4-ghz-20-core-lga-1700-processor-bx8071514700k/',
'YD3200C5FHBOX' : '/amd-ryzen-3-3200g-with-radeon-vega-8-graphics-3rd-gen-desktop-processor/',
'100-100000061WOF' : '/amd-ryzen-9-5900x-desktop-processor-12-cores-24-threads-3-7ghz/',
'100-100000065BOX' : '/amd-ryzen-5-5600x-desktop-processor-6-cores-12-threads-3-7ghz/',
'100-100001488BOX' : '/amd-ryzen-5-5600gt-ryzen-5-5000-series-6-core-3-6-ghz-socket-am4-65w-amd-radeon-graphics-processor-100-100001488box/',
'BX8071512900K' : '/intel-core-i9-12900k-12th-gen-alder-lake-processor/',
'BX8071512700K' : '/intel-core-i7-12700k-12th-gen-alder-lake-processor/',
'BX8071513900K' : '/intel-core-i9-13900k-3-ghz-24-core-lga-1700-processor-bx8071513900k/',
'3200G OEM' : '/amd-ryzen-3-3200g-open-box-oem-processor-stock-cooler/',
'100-100001503WOF' : '/amd-ryzen-7-5700x3d-ryzen-7-5000-series-8-core-3-0-ghz-socket-am4-105w-none-integrated-graphics-processor-100-100001503wof/',
'100-100001488BOX' : 'amd-ryzen-5-5600gt-ryzen-5-5000-series-6-core-3-6-ghz-socket-am4-65w-amd-radeon-graphics-processor-100-100001488box/',
'BX8071514400F' : '/intel-core-i5-14400f-processor-bx8071514400f/',
'BX8071514700' : '/intel-core-i7-14700-processor-bx8071514700/',
'BX8071514400' : '/intel-core-i5-14400-10-core-lga-1700-processor-bx8071514400/',
'100-100000909WOF' : '/amd-ryzen-9-7900x3d-gaming-processor-100-100000909wof/',
'BX8071512700F' : '/intel-core-12th-gen-i7-12700f-desktop-processor-bx8071512700f/',
'100-100000589WOF' : '/amd-ryzen-9-7900x-desktop-processor-100-100000589wof/',
'7800X3D OEM Pack' : '/amd-ryzen-7-7800x3d-gaming-processor-oem-pack-no-stock-cooler/',
'100-100001404WOF' : '/amd-ryzen-7-9700x-3-8-ghz-8-core-am5-processor-100-100001404wof/',
'CB16GS3200' : '/crucial-16gb-laptop-ddr4-3200-mhz-sodimm-laptop-memory-ct16g4sfra32a/',
'CB8GS3200' : '/crucial-8gb-laptop-ddr4-3200-mhz-sodimm-laptop-memory-cb8gs3200/',
'CMK16GX4M1E3200C16' : '/corsair-vengeance-lpx-16gb-16gbx1-3200mhz-ddr4-desktop-memory-cmk16gx4m1e3200c16/',
'CMK8GX4M1E3200C16' : '/corsair-vengeance-lpx-8gb-8gbx1-3200mhz-ddr4-desktop-memory-cmk8gx4m1e3200c16/',
'F4-3200C16S-16GVK' : '/g-skill-ripjawsv-f4-3200c16s-16gvk-16-gb-ddr4-ram-memory/',
'F4-3200C16S-8GVKB' : '/g-skill-ripjaws-v-series-8gb-1x8gb-3200mhz-ddr4-memory-f4-3200c16s-8gvkb/',
'CMK16GX5M1B5200C40' : '/corsair-vengeance-16gb-1x16gb-ddr5-dram-5200mhz-c40-memory-cmk16gx5m1b5200c40/',
'CMK64GX5M2B6000C40' : '/corsair-vengeance-64gb-2x32gb-ddr5-6000mhz-c40-black-memory-kit-cmk64gx5m2b6000c40/',
'F5-6000J3238G32GX2-TZ5N' : '/g-skill-trident-z5-neo-64gb-2x32gb-6000mhz-ddr5-memory-f5-6000j3238g32gx2-tz5n/',
'KF552C40BB/32' : '/kingston-fury-beast-32gb-16gb-x2-ddr5-5200mhz-memory-kf552c40bbk2-32/',
'CB8GS2666' : '/crucial-8gb-ddr4-2666mhz-laptop-memory-cb8gs2666/',
'CMK32GX5M2E6000C36' : '/corsair-vengeance-ddr5-series-32gb-16gbx2-6000mhz-desktop-memory-cmk32gx5m2e6000c36/',
'F5-6000J3238F16GX2-FX5' : '/g-skill-flare-x5-32gb-2x16gb-6000mhz-ddr5-memory-f5-6000j3238f16gx2-fx5/',
'KF432C16BB/16' : '/kingston-fury-beast-16gb-ddr4-3200mhz-non-ecc-dimm-memory-kf432c16bb-16/',
'AD3S1600W4G11-R' : '/adata-premier-series-4gb-ddr3-ram-1600mhz-laptop-memory-ad3s1600w4g11-s/',
'AX4U30008G16A-SR30' : '/adata-xpg-gammix-d30-8gb-1x8gb-3000-mhz-ddr4-memory-ax4u300088g16a-sr30/',
'CT8G48C40U5' : '/crucial-8gb-1x8gb-ddr5-4800mhz-memory-ct8g48c40u5/',
'F4-3600C18S-16GVK' : '/g-skill-ripjaws-v-16gb-16gbx1-ddr4-3600mhz-desktop-memory-f4-3600c18s-16gvk/',
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
'Dual-RX7700XT-O12G' : '/asus-dual-radeon-rx-7700-xt-oc-edition-12gb-gddr6-grahic-card-dual-rx7700xt-o12g/',
'GV-N4060EAGLE OC-8GD' : '/gigabyte-geforce-rtx-4060-eagle-oc-8gb-gddr6-graphic-card-gv-n4060eagle-oc-8gd/',
'ZT-D40600E-10M' : '/zotac-gaming-geforce-rtx-4060-8gb-twin-edge-graphic-card-zt-d40600e-10m/',
'Arc A380 Challenger ITX' : '/asrock-intel-arc-a380-challenger-itx-6gb-graphic-card/',
'ROG-STRIX-RX560-4G-V2-GAMING' : '/asus-rog-strix-radeon-rx-560-v2-4gb-gddr5-gaming-graphic-card-rog-strix-rx560-4g-v2-gaming/',
'GV-N3050WF2OC-6GD' : '/gigabyte-geforce-rtx-3050-windforce-oc-6g-6gb-gddr6-graphics-card-gv-n3050wf2oc-6gd/',
'11314-06-20G' : '/sapphire-pulse-rx-6500-xt-itx-pure-oc-8gb-graphics-card-11314-06-20g/',
'GV-N3060WF2OC-12GD' : '/gigabyte-geforce-rtx-3060-windforce-oc-12gb-gddr6-graphic-card-gv-n3060wf2oc-12gd/',
'ZT-D40620E-10M' : '/zotac-gaming-geforce-rtx-4060-ti-16gb-twin-edge-graphic-card-zt-d40620e-10m/',
'ZT-T16520J-10L' : '/zotac-gaming-geforce-gtx-1650-amp-core-gddr6-graphic-card-zt-t16520j-10l/',
'DUAL-RTX4070-O12G-WHITE' : '/asus-dual-geforce-white-rtx-4070-oc-edition-12gb-gddr6x-graphic-card-dual-rtx4070-o12g-white/',
'GV-N407SAERO OC-12GD' : '/gigabyte-rtx-4070-super-aero-oc-12gb-gaming-graphics-card-gv-n407saero-oc-12gd/',
'GV-N407SGAMING OC-12GD' : '/gigabyte-rtx-4070-super-gaming-oc-12gb-graphics-card-gv-n407sgaming-oc-12gd/',
'PRIME-RTX5070TI-16G' : '/asus-prime-geforce-rtx-5070-ti-16gb-gddr7-graphic-card-prime-rtx5070ti-16g/',
'PRIME-RTX5070TI-O16G' : '/asus-prime-geforce-rtx-5070-ti-16gb-gddr7-oc-edition-graphic-card-prime-rtx5070ti-o16g/',
'TUF-RTX5070TI-O16G-GAMING' : '/asus-tuf-gaming-geforce-rtx-5070-ti-16gb-gddr7-oc-edition-graphic-card-tuf-rtx5070ti-o16g-gaming/',
'TUF-RTX5070TI-16G-GAMING' : '/asus-tuf-gaming-geforce-rtx-5070-ti-16gb-gddr7-edition-graphic-card-tuf-rtx5070ti-16g-gaming/',
'GeForce RTX 5080 16G VANGUARD SOC' : '/msi-geforce-rtx-5080-16g-vanguard-soc-graphic-card/',
'GeForce RTX 5080 16G INSPIRE 3X OC' : '/msi-geforce-rtx-5080-16g-inspire-3x-oc-graphics-card/',
'RTX 5080 Gaming Trio OC' : '/msi-geforce-rtx-5080-gaming-trio-oc-16gb-gddr7-graphics-card/',
'GV-N5080AORUS M-16GD' : '/gigabyte-aorus-geforce-rtx-5080-master-16g-graphic-card-gv-n5080aorus-m-16gd/',
'58NZN6MDBCWH' : '/galax-geforce-rtx-5080-1-click-oc-white-16gb-gddr7-graphic-card-58nzn6mdbcwh/',
'58NZN6MDBBOC' : '/galax-geforce-rtx-5080-1-click-oc-16gb-gddr7-graphic-card-58nzn6mdbboc/',
'RTX 5080 Ultra W OC 16GB-V' : '/colorful-igame-geforce-rtx-5080-ultra-w-oc-16gb-v-graphic-card/',
'GV-N5080GAMING OC-16GD' : '/gigabyte-rtx-5080-gaming-oc-16gb-graphics-card-gv-n5080gaming-oc-16gd/',
'GV-N5080AERO OC-16GD' : '/gigabyte-rtx-5080-aero-oc-sff-16gb-graphics-card-gv-n5080aero-oc-16gd/',
'ZT-B50800B-10P' : '/zotac-gaming-geforce-rtx-5080-amp-extreme-infinity-graphic-card-zt-b50800b-10p/',
'ZT-B50800J-10P' : '/zotac-gaming-geforce-rtx-5080-solid-oc-graphic-card-zt-b50800j-10p/',
'TUF-RTX5080-O16G-GAMING' : '/asus-tuf-gaming-rtx-5080-oc-16gb-gddr7-graphics-card-tuf-rtx5080-o16g-gaming/',
'ROG-ASTRAL-RTX5080-O16G-GAMING' : '/asus-rog-astral-geforce-rtx-5080-16gb-gddr7-oc-edition-graphic-card-rog-astral-rtx5080-o16g-gaming/',
'PRIME-RTX5080-O16G' : '/asus-prime-geforce-rtx-5080-16gb-gddr7-oc-edition-graphic-card-prime-rtx5080-o16g/',
'ZT-B50800D-10P' : '/zotac-gaming-geforce-rtx-5080-solid-graphic-card-zt-b50800d-10p/',
'RTX 5080 Gaming Trio OC' : '/msi-geforce-rtx-5080-gaming-trio-oc-16gb-gddr7-graphics-card/',
'ZT-B50900J-10P' : '/zotac-gaming-geforce-rtx-5090-solid-oc-32gb-gddr7-graphic-card-zt-b50900j-10p/',
'TUF-RTX5090-O32G-GAMING' : '/asus-tuf-gaming-geforce-rtx-5090-32gb-gddr7-oc-edition-graphic-card-tuf-rtx5090-o32g-gaming/',
'TUF-RTX5090-32G-GAMING' : '/asus-tuf-gaming-geforce-rtx-5090-32gb-gddr7-graphic-card-tuf-rtx5090-32g-gaming/',
}

#GOOGLE ANALYTICS
csvdata = {}
with open('.\\Misc\\prime-010325.csv', encoding='utf8') as csvfile:
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
yesterday = '2025-03-01' # str(removingDay.date())

# date = '2024-12-12'

# print(yesterday)

company = 'Prime'

for sku, viewers in finaldata.items():
  pageViews = viewers[0]
  orders = viewers[1]
  cursor.execute('''
  INSERT OR REPLACE INTO fastmoving_historical_analytics (sku, date, viewers, orders, company) VALUES (?, ?, ?, ?, ?)
  ''', (sku, yesterday, pageViews, orders, company))

conn.commit()
conn.close()