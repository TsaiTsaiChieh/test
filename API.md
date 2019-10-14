# LNS-API-Doc
### Host Name
TsaiChieh.com
## Table of Contents
- [Response Object](#Response-Object)
    - [Pet Object](#Pet-Object)
    - [User Object](#User-Object)
    - [Attention Object](#Attention-Object)
    - [Message Object](#Message-Object)
    - [Video Object](#Video-Object)
- [Adoption APIs](#Adoption-APIs)
    - [List](#List)
    - [Details](#Details)
    - [Count](#Count)
- [User APIs](#User-APIs)
    - [Sign up](#Sign-up)
    - [Login](#Login)
    - [Details](#Details)
    - [Profile](#Profile)
    - [Update](#Update)
    - [Post adoption](#Post-adoption)
    - [Get adoption list](#Get-adoption-list)
    - [Delete adoption](#Delete-adoption)
    - [Update adoption](#Update-adoption)
    - [Add attention](#Add-attention)
    - [Get attention list](#Get-attention-list)
    - [Delete attention](#Delete-attention)
    - [Send message](#Send-message)
    - [Get message list](#Get-message-list)
    - [Get message](#Get-message)
- [Notice API](#Notice-API)
    - [Video information](#Video-information)

### Response Object
* #### `Pet Object`

Field | Type | Description
---------|----------|---------
id | Number | Pet id
db | Number | 1, 2, 3 represent government shelters, Taiwan adoption maps and native websites 
statuts | Number | 0, 1 and 2 represent homeless, had been adopted, temporarily not open for adoption
db_link | Number | Native without this value, representing the number of links to government shelters and Taiwan adoption maps
link_id | String |  Which is equivalent to the animal_subid of the government shelter
user_id | Number | Only the native website had this value, represent the user id that published the adoption information
kind | String | Pet category
petName | String | Pet name, there is almost no such value in government shelters
microchip | String | Pet microchip, always is null
sex | Char | Pet sex
age | Char | Pet age
color | String | Pet color
netuter | Char | Whether the pet is neutered
bacterin | Char | Whether the pet has a bacterin
county | Number | Where the pet is located
foundplace | String | Where the pet is found, only in government shelter
title | String | pet title
image | Array | pet image, at least zero, up to three
description | String | pet description
habit | String | pet habit
story | String | pet story
opendate | Date | Time when the pet enters the government shelter
limitation | Array | Adoption limitations
contactName | String | Name to contact if somebody wants to adopt a pet
contactMethod | String | Method to contact if somebody wants to adopt a pet
* #### `User Object`

Field | Type | Description
---------|----------|---------
id | Number | User's id
provider | String | Service provider, `native` or `facebook`
name | String | User's name
email | String | User's email
picture | String | User's picture
contactMethod | String | User's contact method

* #### `Attention Object`

Field | Type | Description
---------|----------|---------
id | Number | Attention id
user_id | Number | User's id
pet_id | Number | Pet id

* #### `Message Object`

Field | Type | Description
---------|----------|---------
id | Number | Message id
sender_id | Number | Sender's id
receiver_id | Number | Receiver id
sender_name | String | Sender's name
receiver_name | String | Receiver name
pet_id | Number | Pet id
msg | String | Message content
createTime | Number | Time to leave the message

* #### `Video Object`

Field | Type | Description
---------|----------|---------
id | Number | Video id
yt_id | Number | Youtuber's id
kind | Number | Video category, 0 and 1 represent dog and cat respectively
youtuber | String | Youtuber's name
tag | String | Video tag
title | String | Video title
subtitle | String | Video subtitle
---
## Adoption APIs
### List
* **End Point:** `/adoption/:category`
* **Method:** `GET`
* **Query Parameters:**

Field | Type | Description
---------|----------|---------
 category | String | Category for pet kind, options are `cat`, `dog` and `all`
 age | Char | (Optional) Age for pet, options are `A` and `C` 
 sex | Char | (Optional) Sex for pet, options are `M` and `F`
 region | number | (Optional) Region for pet, options are 1(北), 2(中), 3(南), 4(東), and 5(外島)
 order | String | (Optional) Time sequence of pets, the default (null) option is `asc`, otherwise, option is `desc`
 paging | String | (Optional) Paging for request next page, 20 records per pages
* **Request Example:**
`https://[Host_Name]/api/adoption/all` for 全部<br>
`https://[Host_Name]/api/adoption/dog?age=A` for 成犬<br>
`https://[Host_Name]/api/adoption/dog?sex=M&age=C` for 幼公犬 <br>
`https://[Host_Name]/api/adoption/cat?sex=F&region=1,2&age=A` for 在北中地區的成母貓 <br>
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 data | Array | Array of `Pet Object`
 paging| Number | Next page number. If there are no more pages, server will not return paging parameter
* **Success Response Example:**
_Reference adoption details API, and this API will show 20 records per pages_
* Error Description:

Code | Response
---------|----------
405 | Wrong request is not allowed in pet table
500 | Query error in pet Table
---
### Details
* **End Point:** `/adoption/details`
* **Method:** `GET`
* **Query Parameters:**

Field | Type | Description
---------|----------|---------
 id | Number | Pet id, required
* **Request Example:**
`https://[Host_Name]/api/adoption/details?id=282`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 data | `Pet Object` | Single pet information
* **Success Response Example:**
```JSON
{
    "paging": 2,
    "data": [
        {
            "id": 282,
            "db": 2,
            "db_link": "74334",
            "kind": "貓",
            "petName": "旺旺/仙貝",
            "sex": null,
            "age": "A",
            "color": null,
            "neuter": "F",
            "bacterin": null,
            "county": 3,
            "foundplace": null,
            "title": "可愛橘貓兄妹找新家",
            "image": [
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/brother2.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/sister2_0.jpg",
                "http://www.meetpets.org.tw/files_meetpets/imagecache/normal/lovekitty.jpg"
            ],
            "description": "新北/八里 可愛橘貓認養",
            "habit": "哥哥叫旺旺,是一隻活潑愛說話的貓 妹妹叫仙貝,個性較害羞,剛開始會躲起來,需要有愛心的飼主花多點時間培養感情, 大約需要1-2個星期讓她可以比較熟悉你的味道,適應新的環境",
            "story": "他們從小一起長大,年紀約2-3 yrs,個性可愛,很黏人,很愛乾淨,會顧家, 一直都是在家飼養,未接觸過外貓,我也定期為他們除蟲除蚤,讓貓咪身體是乾乾淨淨的... 2隻貓咪都有植入晶片(領養人需年滿20歲),都已完成結扎,身體情況良好 . 因我工作關係目前需在外租屋,不方便飼養寵物,現在想幫他們找愛他們的新主人. 真心希望能找到愛他們的新主人, 我不希望拆散他們兄妹,希望新主人是可以同時一起認養的, 有愛心&有意願者 歡迎聯繫我 (可預約時間看貓) 新飼主半年內請提供貓咪可愛的照片回傳/ 可提供原有貓砂及飼料(讓貓咪可以階段性轉移到新飼料)",
            "opendate": null,
            "limitation": [
                    "須年滿20歲",
                    "須同意絕育",
                    "須家人同意",
                    "須同意簽認養切結書",
                    "須同意後續追蹤"
            ],
            "contentName": "傅小姐",
            "contentTel": "0989204468"
        }
    ]
}
```
* Error Description:

Code | Response
---------|----------
404 | Id not found in pet table
500 | Query error in pet Table
---
### Count
* **End Point:** `/adoption/count`
* **Method:** `GET`
* **Query Parameters:**

Field | Type | Description
---------|----------|---------
category | String | Category for pet kind, options are `cat`, `dog` and `all`
age | Char | (Optional) Age for pet, options are `A` and `C` 
sex | Char | (Optional) Sex for pet, options are `M` and `F`
region | number | (Optional) Region for pet, options are 1(北), 2(中), 3(南), 4(東), and 5(外島)
order | String | (Optional) Time sequence of pets, the default (null) option is `asc`, otherwise, option is `desc`
paging | String | (Optional) Paging for request next page, 20 records per pages
* **Request Example:**
`https://[Host_Name]/api/adoption/count?kind=dog`
`https://[Host_Name]/api/adoption/count?kind=dog&age=C`
`https://[Host_Name]/api/adoption/count?kind=cat&sex=F&region=1,2&age=A`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 total | Number | Total number of pet which meet the search condition
 lastPage | Number | Last page of pet which meet the search condition
* **Success Response Example:**
```JSON
{
    "total": 6178,
    "lastPage": 308
}
```
* Error Description:

Code | Response
---------|----------
405 | Wrong request is not allowed in pet table
500 | Query error in pet Table
---
## User APIs
### Sign up
* **End Point:** `/user/signup` 
* **Method:** `POST`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Content-Type | String | Only accept application/json
* **Request Body:**

Field | Type | Description
---------|----------|---------
name | String | Required
email | String | Required 
password | String | Required
* **Request Body Example:**
```JSON
{
    "name": "test",
    "email": "test@gmail.com",
    "password": "testtest"
}
```
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 access_token | String | Access token from server
 access_expired | Number | Access token expired time in seconds
 user | `User Object` | User information
* **Success Response Example:**
```JSON
{
    "token": {
        "access_token": "d967b16228cdd87a7a4d4a19036b580b0f5ab1bcfbbfc5a7b7bb80f4dc0fd7a2",
        "access_expired": 3600
    },
    "user": {
        "id": 17,
        "name": "test",
        "email": "test@gmail.com"
    }
}
```
* Error Description:

Code | Response
---------|----------
406 | Email duplication registration
500 | Server error like connection, transcaction, commit, query insert error
---
### Login
* **End Point:** `/user/login`
* **Method:** `POST`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Content-Type | String | Only accept application/json
* **Request Body:**

Field | Type | Description
---------|----------|---------
name | String | Required
provider | String | Required. `native` or `facebook`
email | String | Required 
picture | String | Had this value when using facebook login
password | String | This value is not required when using facebook login
* **Request Body Example:**
```JSON
{
    "provider": "native",
    "name": "test",
    "email": "test@gmail.com",
    "password": "testtest"
}
```
or 
```JSON
{
    "provider": "facebook",
    "name": "fbtest",
    "email": "fbtest@gmail.com",
    "password": "",
    "picture": "url"
}
```
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 access_token | String | Access token from server
 access_expired | Number | Access token expired time in seconds
 user | `User Object` | User information
* **Success Response Example:**
```JSON
{
    "token": {
        "access_token": "3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994",
        "access_expired": 3600
    },
    "user": {
        "id": 17,
        "provider": "native",
        "name": "test",
        "email": "test@gmail.com",
        "picture": null
    }
}
```
* Error Description:

Code | Response
---------|----------
406 | Email or password is wrong
500 | Server error like connection, transcaction, commit, query insert error
---
### Profile
* **End Point:** `/user/profile`
* **Method:** `GET`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Authorization | String | Access token preceding Bearer . For example: `Bearer 3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994`

* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 user | `User Object` | User information
* **Success Response Example:**
```JSON
{
    "user": {
        "id": 17,
        "provider": "native",
        "name": "test",
        "email": "test@gmail.com",
        "contactMethod": null,
        "picture": null
    }
}
```
* Error Description:

Code | Response
---------|----------
406 | Invalid token
408 | Token expired
500 | Query Error in user&token table
---
### Update
* **End Point:** `/user/update`
* **Method:** `POST`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Content-Type | String | Only accept application/json
* **Request Body:**

Field | Type | Description
---------|----------|---------
userId | Number | Required
name | String | (Optional) User's name
picture | String | (Optional) User's picture
password | String | (Optional) User's password
contactMethod | String | (Optional) User's contact method
* **Request Body Example:**
```JSON
{
    "userId": 17,
    "name": "testUpdate",
    "picture": "17.jpg",
    "password": "0000",
    "contactMethod": "0987654321"
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Update user table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | Update Error in user Table
---
### Post adoption
* **End Point:** `/user/postAdoption` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
user_id | Number | Required
title | String | Required. Pet title
image | Array | Required. At least one pet image, up to three pet images
kind | Char | Required. Pet category
sex | Char | Required. Pet sex
age | Char | Required. Pet age
netuter | Char | Required. Whether the pet is neutered
county | Number | Required. Where the pet is located
description | String | Required. Pet description
limitation | Array | (Optional) Adoption limitations
contactName | String | Required. Name to contact if somebody wants to adopt a pet
contactMethod | String | Required. Method to contact if somebody wants to adopt a pet
color | String | (Optional) Pet color
petName | String | (Optional) Pet name
microchip | String | (Optional) Pet microchip
* **Request Body Example:**
```JSON
{ 
  "user_id": 17,
  "title": "幼貓送養喔",
  "image":
   "['17_1570893984334.jpg','17_1570893984380.jpg','17_1570893984395.jpg']",
  "kind": "貓",
  "sex": "F",
  "age": "C",
  "neuter": "F",
  "county": 4,
  "description": "真的很可愛的小貓",
  "limitation": "['年滿20歲','同意絕育','家人同意','同意簽認養切結書','同意後續追蹤']",
  "contactName": "林小姐",
  "contactMethod": "line:test123",
  "color": "白色",
  "petName": "小喵",
  "microchip": "cute0987654321"
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Insert into pet table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | S3 server error or insert error in pet Table
---
### Update adoption
* **End Point:** `/user/updateAdoption` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
user_id | Number | Required
status | Number | (Optional) Pet status
title | String | (Optional) Pet title
image | Array | (Optional) At least one pet image, up to three pet images
kind | Char | (Optional) Pet category
sex | Char | (Optional) Pet sex
age | Char | (Optional) Pet age
netuter | Char | (Optional) Whether the pet is neutered
county | Number | (Optional) Where the pet is located
description | String | (Optional) Pet description
limitation | Array | (Optional) Adoption limitations
contactName | String | (Optional) Name to contact if somebody wants to adopt a pet
contactMethod | String | (Optional) Method to contact if somebody wants to adopt a pet
color | String | (Optional) Pet color
petName | String | (Optional) Pet name
microchip | String | (Optional) Pet microchip
* **Request Body Example:**
```JSON
{ 
  "user_id": 17,
  "status": 1,
  "title": "幼貓送養喔!!!",
  "image":
   "['17_1570895349291.jpg']",
  "kind": "貓",
  "sex": "F",
  "age": "C",
  "neuter": "F",
  "county": 4,
  "description": "真的很可愛的小貓",
  "limitation": "['年滿20歲','同意絕育','家人同意']",
  "contactName": "林小姐",
  "contactMethod": "line:test123",
  "color": "白色",
  "petName": "小喵",
  "microchip": "cute0987654321"
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Update pet table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | S3 server error or insert error in pet Table
---
### Get adoption list
* **End Point:** `/user/getAdoptionList`
* **Method:** `GET`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Authorization | String | Access token preceding Bearer . For example: `Bearer 3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994`

* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 pet | `Pet Object` | Pet information
* **Success Response Example:**
```JSON
{ "data":
   [ 
       {
       "id": 8905,
       "db": 3,
       "status": 1,
       "db_link": null,
       "link_id": null,
       "user_id": 17,
       "kind": "貓",
       "petName": "小喵",
       "microchip": "cute0987654321",
       "sex": "F",
       "age": "C",
       "color": "白色",
       "neuter": "F",
       "bacterin": null,
       "county": 4,
       "foundplace": null,
       "title": "幼貓送養喔!",
       "image": "['17_1570895349291.jpg']",
       "description": "真的很可愛的小貓!",
       "habit": null,
       "story": null,
       "opendate": null,
       "limitation": "['年滿20歲','同意絕育','家人同意']",
       "contactName": "林小姐",
       "contactMethod": "line:test123"
       } 
    ] 
}
```
* Error Description:

Code | Response
---------|----------
406 | Invalid token
408 | Token expired
500 | Query Error in user&token table
---
### Delete adoption
* **End Point:** `/user/deleteAdoption` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
petId | Number | Required. Pet id

* **Request Body Example:**
```JSON
{ 
  "petId": 8905
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Delete the id in pet&attention table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | S3 server error or delete error in pet Table
---
### Add attention
* **End Point:** `/user/addAttention` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
userId | Number | Required
petId | Number | Required

* **Request Body Example:**
```JSON
{ 
  "userId": 17,
  "petId": 1
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Insert id in attention table successful."
}
or
{
    "Delete id in attention table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | Insert or delete error in pet Table
---
### Get attention list
* **End Point:** `/user/getAttentionList`
* **Method:** `GET`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Authorization | String | Access token preceding Bearer . For example: `Bearer 3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994`

* **Success Response: 200**

Field | Type | Description
---------|----------|---------
Attention | `Attention Object` | Included id, user_id, pet_id
Pet | `Pet Object` | Included db, image, title, opendate, status, sex
* **Success Response Example:**
```JSON
{ "data":
   [ 
       {
       "id": 24,
       "user_id": 17,
       "pet_id": 1,
       "db": 1,
       "image":"['17_1570895349291.jpg']",
       "title": "",
       "opendate": "2018-06-14T16:00:00.000Z",
       "status": 0,
       "sex": "M"
       } 
    ] 
}
```
* Error Description:

Code | Response
---------|----------
406 | Invalid token
408 | Token expired
500 | Query error in attention&pet table
---
### Delete attention
* **End Point:** `/user/deleteAttention` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
userId | Number | Required. User id
petId | Number | Required. Pet id

* **Request Body Example:**
```JSON
{ 
  "userId": 17,
  "petId": 2
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Delete the id in attention table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | Delete error in pet Table
---
### Send message
* **End Point:** `/user/sendMessage` 
* **Method:** `POST`
* **Request Body:**

Field | Type | Description
---------|----------|---------
senderId | Number | Required. Sender's id
receiverId | Number | Required. Receiver's id
petId | Number | Required. Pet id
senderName | String | Required. Sender's name
receiverName | String | Required. Receiver's id
message | String | Required. User's message
createTime | String | Required. Time to leave the message, by new Date().getTime() method

* **Request Body Example:**
```JSON
{ 
    "senderId": 1,
    "receiverId": 17,
    "petId": 8911,
    "senderName": "蔡采潔",
    "receiverName": "林小姐",
    "message": "請問可以領養嗎？",
    "createTime": 1570955432747
}
```
* **Success Response: 200**
* **Success Response Example:**
```JSON
{
    "Insert message table successful."
}
```
* Error Description:

Code | Response
---------|----------
500 | Insert error in message Table
---
### Get message list
* **End Point:** `/user/getMessageList`
* **Method:** `GET`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Authorization | String | Access token preceding Bearer . For example: `Bearer 3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994`

* **Success Response: 200**

Field | Type | Description
---------|----------|---------
Message | `Message Object` | Included id, sender_id, receiver_id, sender_name, pet_id, msg, createTime
image | Array | Pet images
title | String | Pet title

* **Success Response Example:**
```JSON
{ "data":
   [ 
       {
        "id": 16,
        "sender_id": 1,
        "receiver_id": 17,
        "sender_name": "蔡采潔",
        "receiver_name": "林小姐",
        "pet_id": 8911,
        "msg": "請問可以領養嗎？",
        "createTime": 1570955432747,
        "image": "['17_1570895349291.jpg']",
        "title": "狗狗"
       },
       {
        "id": 2,
        "sender_id": 17,
        "receiver_id": 3,
        "sender_name": "ㄘㄐ",
        "receiver_name": "QQ",
        "pet_id": 7959,
        "msg": "您好",
        "createTime": 1569753797617,
        "image": "['3_1569753526944.jpg', '3_1569753526956.jpg' ]",
        "title": "由於得了怪病，無法再飼養美美，急尋能照顧美美的優良飼主，希望是有經驗的..." 
       } 
    ] 
}
```
* Error Description:

Code | Response
---------|----------
406 | Invalid token
408 | Token expired
500 | Query error in message&pet table
---
### Get message
* **End Point:** `/user/getMessage`
* **Method:** `GET`
* **Request Headers:**

Field | Type | Description
---------|----------|---------
Authorization | String | Access token preceding Bearer . For example: `Bearer 3733dfc7c18372575de7183399ffc5894576047f992f3594bedf614229a43994`

* **Success Response: 200**

Field | Type | Description
---------|----------|---------
Message | `Message Object` | Included id, sender_id, receiver_id, sender_name, pet_id, msg, createTime
sender_picture | String | Sender's picture
receiver_picture | String | Receiver picture

* **Success Response Example:**
```JSON
{ "data":
   [ 
       {
       "id": 16,
       "sender_id": 1,
       "receiver_id": 17,
       "sender_name": "蔡采潔",
       "receiver_name": "林小姐",
       "pet_id": 8911,
       "msg": "請問可以領養嗎？",
       "createTime": 1570955432747,
       "sender_picture": "1.jpg",
       "receiver_picture": "17.jpg" },
    {
       "id": 17,
       "sender_id": 17,
       "receiver_id": 1,
       "sender_name": "testUpdate",
       "receiver_name": "蔡采潔",
       "pet_id": 8911,
       "msg": "請問目前職業是？",
       "createTime": 1570956449702,
       "sender_picture": "17.jpg",
       "receiver_picture": "1.jpg"
       }
    ]
}
```
* Error Description:

Code | Response
---------|----------
406 | Invalid token
408 | Token expired
500 | Query error in message&user table
---
## Notice API
### Video information
* **End Point:** 
 `/notice/videoInfo` 
* **Method:** `GET`
* **Request Example:**
`https://[Host_Name]/api/notice/videoInfo`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
Video | `Video Object` | Array of `video Object`
* **Success Response Example:**
```JSON
{
    "data": [
        {
            "id": 1,
            "yt_id": "nEfwHbvaE4M",
            "kind": 2,
            "youtuber": "好味小姐 Lady Flavor",
            "tag": "",
            "title": "【養貓要知道EP1】如何得到一隻貓？撿到貓？貓中途領養？收容所認養？｜貓奴新手指南",
            "subtitle": [
            "【方法2：跟中途領養貓咪】跟中途領養的優點：貓咪大多經過親人以及進入家庭前的訓練 愛媽養貓經驗豐富，有疑難雜症可以趕快請教 最適合新手<br> 【方法3：收容所認養貓咪】 尋找收容所貓咪的方式： 各地區收容所 上網搜尋全國動物收容管理系統 關注收容所網頁，參與收容所舉辦的送養活動<br> 跟收容所領養的步驟： 到收容所看貓 填寫自我評估表 簽領養切結書 負擔貓咪植入晶片及預防針 上網登記貓咪晶片資料"
          ]
        }
    ]
}
```