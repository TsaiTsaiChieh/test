# 讓愛不流浪 | Love Never Stray
This website is an animal adoption platform. Users can quickly find pets through multiple search conditions, or published pet adoption information.

Website URL: https://TsaiChieh.com
## Table of Contents
- [Features](#Features)
- [Technologies](#Technologies)
- [Backend Architecture](#Backend-Architecture)
- [Database Schema](#Database-Schema)
- [API documentation](#API-documentation)
- [Contact](#Contact)

## Features
#### Homepage:
* Banner dynamically shows the number of currently homeless pets
#### Adoption:
* Integrate government shelters and Taiwan adoption map pet information for multiple condition search. <br>

![](https://i.imgur.com/aEp9b6J.gif)

* By clicking the pet image or title, the details information includes a link in which the user can go to the origin website to adopt the pet <br>

![](https://i.imgur.com/qqOm2d4.gif)

#### Member:
* Provide both native and FB Login <br>

![](https://i.imgur.com/ed6gses.gif)

* User can update their own profile <br>

![](https://i.imgur.com/rJ11c4C.gif)

* User can publish the pet adoption information <br>

![](https://i.imgur.com/mkami5W.gif)

* User can update the pet adoption information <br>

![](https://i.imgur.com/kodj8Hl.gif)

* User can track the adoption status of pets <br>

![](https://i.imgur.com/dNWGOek.gif)

* User can leave messages to the adopter or original owner <br>

![](https://i.imgur.com/m2YpGNo.gif)


#### Notice
* Notice Page provides some video links that a feeder should know and preparation before keeping a pet
## Technologies
* Applied **MVC** design pattern for better code readability
* **Node-schedule** for frequent database update
* **Web crawling** for approximately 8,000 pet information
* Prevented SQL injection attacks by **preparing queries**
* The server has set up on **AWS EC2**
* Image compress via canvas before uploading to **AWS S3** server
* Implemented database **CRUD** for user profile, adoption information, wishlist, and message function
* Applied **MySQL transaction** to ensure the data consistency
* Improved loading time using caching with **Redis** server
## Backend Architecture
![](https://i.imgur.com/tkJsXBm.jpg)
<br>

## Database Schema
![](https://i.imgur.com/kHdxcj3.png)

<br>

## Technology Stack
### Programming Language
* JavaScript
### Backend
* NodeJS
* ExpressJS
* Linux
* Nginx
* PM2
* Pug
### SQL Database
* MySQL
* CRUD
* Index, Primary key, Foreign key
* Transaction
* Redis
### Web Crawler
* Cheerio
* Axios
### AWS Cloud Platform
* Elastic Compute Cloud (EC2)
* Simple Storage Service (S3)
### Networking
* HTTP / HTTPS
* Domain Name System (DNS)
### Fornt-End
* HTML & CSS
* Bootstrap
* AJAX
### Third-party
* Facebook Login API
### Tools
* Git / GitHub
* Postman
* ESLint
* Unit test: Jest
### Key Concepts
* RESTful APIs
* Design Patterns: MVC
## API documentation
[API documation](https://github.com/TsaiTsaiChieh/pet_home/blob/master/API.md)
## Contact
Tsai, Tsai-Chieh 蔡采潔 <br>
jecica196@gmail.com
