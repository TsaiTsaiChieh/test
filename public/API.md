# LNS-API-Doc
### Host Name
tsaichieh.com
### Response Object
* `Pet Object`
---
### Adoption List API
* **End Point:** 
 `/adoption/all` for 全部
 `/adoption/cat` for 貓
 `/adoption/dog` for 狗
* **Method:** `GET`
* **Query Parameters:**

Field | Type | Description
---------|----------|---------
 paging | String(Optional) | Paging for request next page
* **Request Example:**
 `https://[Host_Name]/api/adoption/all`
 `https://[Host_Name]/api/adoption/cat`
 `https://[Host_Name]/api/adoption/dog?paging=1`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 data | Array | Array of `Pet Object`
 paging| Number | Next page number. If there are no more pages, server will not return paging parameter
* **Success Response Example:**
```js
{
    paging: 2,
    data: [
        {
            id: 282,
            db: 2,
            db_link: "74334",
            kind: "貓",
            petName: "旺旺/仙貝",
            sex: null,
            age: "A",
            color: null,
            neuter: "F",
            bacterin: null,
            county: 3,
            foundplace: null,
            title: "可愛橘貓兄妹找新家",
            image: [
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/brother2.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/sister2_0.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/lovekitty.jpg"
            ],
            description: "新北/八里 可愛橘貓認養",
            habit: "哥哥叫旺旺,是一隻活潑愛說話的貓 妹妹叫仙貝,個性較害羞,剛開始會躲起來,需要有愛心的飼主花多點時間培養感情, 大約需要1-2個星期讓她可以比較熟悉你的味道,適應新的環境",
            story: "他們從小一起長大,年紀約2-3 yrs,個性可愛,很黏人,很愛乾淨,會顧家, 一直都是在家飼養,未接觸過外貓,我也定期為他們除蟲除蚤,讓貓咪身體是乾乾淨淨的... 2隻貓咪都有植入晶片(領養人需年滿20歲),都已完成結扎,身體情況良好 . 因我工作關係目前需在外租屋,不方便飼養寵物,現在想幫他們找愛他們的新主人. 真心希望能找到愛他們的新主人, 我不希望拆散他們兄妹,希望新主人是可以同時一起認養的, 有愛心&有意願者 歡迎聯繫我 (可預約時間看貓) 新飼主半年內請提供貓咪可愛的照片回傳/ 可提供原有貓砂及飼料(讓貓咪可以階段性轉移到新飼料)",
            opendate: null,
            limitation: [
                    "須年滿20歲",
                    "須同意絕育",
                    "須家人同意",
                    "須同意簽認養切結書",
                    "須同意後續追蹤"
            ],
            contentName: "傅小姐",
            contentTel: "0989204468"
        }
}
```
---
### Adoption details API
* **End Point:** 
 `/adoption/details` 
* **Method:** `GET`
* **Query Parameters:**

Field | Type | Description
---------|----------|---------
 id | Number | Pet id, required
* **Request Example:**
`https://[Host_Name]/api/adoption/details?id=3`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 data | `Pet Object` | Single pet information
* **Success Response Example:**
```js
{
    paging: 2,
    data: [
        {
            id: 282,
            db: 2,
            db_link: "74334",
            kind: "貓",
            petName: "旺旺/仙貝",
            sex: null,
            age: "A",
            color: null,
            neuter: "F",
            bacterin: null,
            county: 3,
            foundplace: null,
            title: "可愛橘貓兄妹找新家",
            image: [
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/brother2.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/sister2_0.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/lovekitty.jpg"
            ],
            description: "新北/八里 可愛橘貓認養",
            habit: "哥哥叫旺旺,是一隻活潑愛說話的貓 妹妹叫仙貝,個性較害羞,剛開始會躲起來,需要有愛心的飼主花多點時間培養感情, 大約需要1-2個星期讓她可以比較熟悉你的味道,適應新的環境",
            story: "他們從小一起長大,年紀約2-3 yrs,個性可愛,很黏人,很愛乾淨,會顧家, 一直都是在家飼養,未接觸過外貓,我也定期為他們除蟲除蚤,讓貓咪身體是乾乾淨淨的... 2隻貓咪都有植入晶片(領養人需年滿20歲),都已完成結扎,身體情況良好 . 因我工作關係目前需在外租屋,不方便飼養寵物,現在想幫他們找愛他們的新主人. 真心希望能找到愛他們的新主人, 我不希望拆散他們兄妹,希望新主人是可以同時一起認養的, 有愛心&有意願者 歡迎聯繫我 (可預約時間看貓) 新飼主半年內請提供貓咪可愛的照片回傳/ 可提供原有貓砂及飼料(讓貓咪可以階段性轉移到新飼料)",
            opendate: null,
            limitation: [
                    "須年滿20歲",
                    "須同意絕育",
                    "須家人同意",
                    "須同意簽認養切結書",
                    "須同意後續追蹤"
            ],
            contentName: "傅小姐",
            contentTel: "0989204468"
        }
}
```