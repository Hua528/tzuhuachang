# GAS 聯絡表單部署說明

本文件說明如何將履歷網站的聯絡表單寫入 Google 試算表。

## 一、資料流程

```text
index.html 表單
    -> script.js 讀取 data-gas-endpoint
    -> GAS Web App 的 doPost(e)
    -> Google 試算表 appendRow()
```

前端表單送出的欄位名稱固定為：

```text
name
email
message
```

GAS 後端必須使用相同的欄位名稱讀取資料。

## 二、建立 Google 試算表

1. 建立一份新的 Google 試算表。
2. 將工作表分頁命名為 `工作表1`，或稍後同步修改 GAS 的 `SHEET_NAME`。
3. 第一列建立標題：

```text
時間 | 姓名 | Email | 訊息
```

4. 從試算表網址取得 `SPREADSHEET_ID`：

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

只複製 `/d/` 與 `/edit` 之間的內容，不要包含：

```text
https://docs.google.com/spreadsheets/d/
/edit
?gid=0
#gid=0
```

## 三、建立 GAS 後端

在 Google 試算表選擇：

```text
擴充功能 -> Apps Script
```

刪除原本程式，完整貼上以下內容：

```javascript
const SPREADSHEET_ID = '貼上真正的 Spreadsheet ID';
const SHEET_NAME = '工作表1';

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      return createResponse(false, '沒有收到表單資料');
    }

    const name = String(e.parameter.name || '').trim();
    const email = String(e.parameter.email || '').trim();
    const message = String(e.parameter.message || '').trim();

    if (!name || !email || !message) {
      return createResponse(false, '姓名、Email、訊息皆為必填');
    }

    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createResponse(false, `找不到工作表：${SHEET_NAME}`);
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      message
    ]);

    return createResponse(true, '資料已成功寫入');
  } catch (error) {
    console.error(error);
    return createResponse(false, error.message);
  }
}

function doGet() {
  return createResponse(true, 'GAS Web App is running');
}

function createResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 必須修改的地方

只修改這兩個設定：

```javascript
const SPREADSHEET_ID = '真正的試算表 ID';
const SHEET_NAME = '工作表1';
```

不要把整段試算表網址放入 `SPREADSHEET_ID`，錯誤範例：

```javascript
const SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/.../edit?gid=0';
```

## 四、授權 GAS

1. 在 Apps Script 編輯器上方的函式選單選擇 `doPost`。
2. 按「執行」。
3. 第一次執行時按「檢查權限」。
4. 選擇 Google 帳戶。
5. 若看到警告，選擇「進階」。
6. 選擇「前往專案」。
7. 按「允許」。

如果出現 Spreadsheet 權限錯誤，請確認 Apps Script 使用的 Google 帳戶對該試算表具有編輯權限。

## 五、部署成 Web App

1. Apps Script 右上角選擇「部署」。
2. 選擇「新增部署作業」。
3. 類型選擇「網頁應用程式」。
4. 「執行身分」選擇「我」。
5. 「誰可以存取」選擇「任何人」。
6. 按「部署」。
7. 複製產生的 Web App URL。

URL 必須長這樣：

```text
https://script.google.com/macros/s/部署ID/exec
```

前端需要 `/exec` 結尾的網址，不要使用：

```text
https://script.google.com/macros/d/...
```

## 六、填入 index.html

本專案的 GAS URL 唯一設定位置在 `index.html` 的表單：

```html
<form
  class="contact-form"
  id="contact-form"
  data-gas-endpoint="https://script.google.com/macros/s/部署ID/exec"
  hidden>
```

將 `data-gas-endpoint` 的值替換為剛剛複製的 Web App URL。

`script.js` 會自動讀取這個值：

```javascript
const endpoint = contactForm.dataset.gasEndpoint?.trim() || '';
```

不要再於 `script.js` 另外寫一份 GAS URL，避免兩邊版本不一致。

## 七、修改 GAS 後重新部署

GAS 程式修改後，不能只按儲存。請依序操作：

1. 選擇「部署」。
2. 選擇「管理部署」。
3. 找到目前的 Web App 部署，按鉛筆圖示編輯。
4. 版本選擇「新增版本」。
5. 確認存取權仍是「任何人」。
6. 按「部署」。

如果沒有建立新版本，原本的 `/exec` URL 可能仍執行舊程式。

## 八、用 curl 測試

將以下網址換成實際的 Web App URL：

```bash
curl -L -X POST \
  -d 'name=測試姓名&email=test@example.com&message=這是測試訊息' \
  'https://script.google.com/macros/s/部署ID/exec'
```

成功時應回傳類似：

```json
{"success":true,"message":"資料已成功寫入"}
```

並且試算表新增一列：

```text
時間 | 測試姓名 | test@example.com | 這是測試訊息
```

也可以用瀏覽器直接開啟 Web App URL 測試 `doGet`：

```text
GAS Web App is running
```

## 九、常見錯誤

### `Illegal spreadsheet id or key`

原因通常是：

- `SPREADSHEET_ID` 仍是 placeholder。
- 貼入了完整試算表網址，而不是 ID。
- ID 前後多了空白或引號格式錯誤。
- GAS 尚未重新部署新版本。
- 部署使用的 Google 帳戶沒有試算表權限。

### `找不到工作表`

`SHEET_NAME` 必須完全符合試算表底部的分頁名稱，包括大小寫與空白：

```javascript
const SHEET_NAME = '工作表1';
```

### 前端顯示成功但試算表沒有資料

目前前端使用 `mode: 'no-cors'`，瀏覽器無法讀取 GAS 回應內容，因此只要請求送出，可能會顯示成功。真正的後端狀態請以：

- `curl` 回應
- GAS 的「執行作業」紀錄
- Google 試算表是否新增資料

為準。

### 前端顯示 `GAS Web App URL 尚未設定`

確認 `index.html` 的 `data-gas-endpoint`：

- 不可為空白。
- 必須是 GAS Web App URL。
- 必須以 `/exec` 結尾。
- 不可填 Google 試算表網址。

## 十、目前專案的責任分工

| 檔案 | 責任 |
| --- | --- |
| `index.html` | 表單欄位與 GAS Web App URL 設定 |
| `script.js` | 展開表單、驗證欄位、送出資料、顯示狀態 |
| `styles.css` | 表單與按鈕外觀 |
| GAS 專案 | 接收 `doPost(e)` 並寫入試算表 |
| Google 試算表 | 儲存聯絡資料 |
