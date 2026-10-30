美玲的同名環島

開啟網頁：
1. 保留 index.html 與 assets 資料夾在同一層。
2. 用 Chrome 或 Edge 開啟 index.html。

商家清單與環島巡覽動畫可以離線使用。
動畫預設每站0.8秒，可切換0.4秒快轉或1.6秒慢看。
預設臺北出發、逆時針，亦可選起點與切換方向；本島61家商家可加入停靠清單，澎湖與外送另列。
Google 地圖和資料來源的外部連結需要網路。

上傳至靜態網站服務時，請一起上傳 index.html 與 assets 資料夾。
verification 資料夾保存查核、位置來源及整理紀錄，網頁執行不需要它。

更新資料：python verification/update_site.py
顯示文案：verification/display-copy.json
巡覽位置：verification/map-locations.json
環島順序：assets/trip-order.js
動畫與版面：assets/loop-journey.js、assets/journey.css

美玲人物客製：
assets/meiling.css 為人物與明信片版面。
assets/meiling-traveler.png、meiling-guide.png、meiling-coast-postcard.png 為依提供照片生成的三張插畫原稿。
網頁使用同名 WebP 版本加快載入，並保留原圖與透明度。
assets/meiling-bath-original.png、meiling-laugh-original.png 為提供的原始貼圖。
生成提示詞：verification/meiling-image-prompts.md（內建 image_gen）。
