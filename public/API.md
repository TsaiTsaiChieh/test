# LNS-API-Doc
### Host Name
tsaichieh.com
### API Version
1.0
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
`https://[Host_Name]/api/[API_Version]/adoption/all`
`https://[Host_Name]/api/[API_Version]/adoption/cat`
`https://[Host_Name]/api/[API_Version]/adoption/dog?paging=1`
* **Success Response: 200**

Field | Type | Description
---------|----------|---------
 data | Array | Array of `Pet Object`
 paging| Number | Next page number. If there are no more pages, server will not return paging parameter
* **Success Response Example:**
