# 美玲的同名環島

[開啟網站](https://tenmalog.github.io/meiling-island-trip/)

為美玲整理的環島停靠清單，搭配依提供照片繪製的旅行人物、移動地圖頭像與海岸明信片。

- 收錄 63 家公開商業據點，涵蓋 15 個縣市。
- 本島 61 家依環島順序巡覽，澎湖店家與外送服務另列。
- 預設臺北出發、逆時針；可更換起點與方向。
- 每站預設 0.8 秒，可切換為 0.4 秒快轉或 1.6 秒慢看。
- 搜尋、縣市與類型篩選，以及儲存在目前瀏覽器的停靠清單。

地圖連線是停靠順序示意；實際道路請使用各店的 Google 地圖連結。公開商業資料整理於 2026-10-30，營業與預約資訊請向店家確認。

## 本機使用

不需要安裝套件或編譯。直接開啟 `index.html`，或在資料夾執行：

```sh
python -m http.server 8765
```

然後開啟 `http://127.0.0.1:8765/`。商家清單、停靠收藏與地圖動畫可離線使用；外部地圖與來源連結需要網路。

## 網站檔案

- `index.html`：頁面、商家清單與搜尋／停靠互動。
- `assets/trip-order.js`：本島地區巡覽順序。
- `assets/loop-journey.js`：巡覽播放與人物導覽。
- `assets/taiwan-geography.js`：台灣輪廓，來源為 [Natural Earth](https://www.naturalearthdata.com/)。
- `assets/journey.css`、`assets/meiling.css`：響應版面及人物設計。
- `assets/meiling-*.webp`：網頁使用的圖片；同名 PNG 保存插畫與貼圖原稿。

人物旅行情境為依提供圖片製作的插畫，並非實際到訪照片。停靠清單記錄想去的店，不代表已經到訪。

## GitHub Pages 發布

推送至 `main` 後，`.github/workflows/pages.yml` 自動將 `index.html` 與 `assets/` 發布至 GitHub Pages，也可在 Actions 手動執行。

本機 `verification/` 保存查核紀錄、舊版快照與畫面核對，未加入公開儲存庫或網站發布內容。
