# 讓愛不流浪 | Love Never Stray
---
This website is an animal adoption platform. Users can quickly find pets through multiple search conditions, or published pet adoption information. <br>
Website URL: https://TsaiChieh.com
## Table of Contents
- [Preview](#Preview)
- [Features](#Features)
- [Technologies](#Technologies)
- [Backend Architecture](#Backend-Architecture)
- [Database Schema](#Database-Schema)
- [Contact](#Contact)
## Preview
![](https://i.imgur.com/HZdHsPa.gif)

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
* Applied MVC design pattern for better code readability
* Node-schedule for frequent database update
* Web crawling for approximately 7,000 pet information
* Error handling by assigning status code carefully
* The server has set up on AWS EC2
* Image compress via canvas before uploading to S3 server
* Implemented database CRUD for user profile, adoption information, wishlist, and message function
* Applied MySQL transaction to ensure the data consistency
* Improved loading time using caching with Redis server
## Backend Architecture
![](https://i.imgur.com/pKPDqsw.png)

<br>

## Database Schema
![](https://i.imgur.com/Bc5DsNa.png)

<br>

## Technology Stack
### Programming Language
* JavaScritp
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
### Third Party
* Facebook Login API
### Tools
* Git / GitHub
* Postman
* ESLint
* Unit test: Jest
### Key Concepts
* RESTful APIs
* Design Patterns: MVC
## Contact
Tsai, Tsai-Chieh 蔡采潔 <br>
jecic196@gmail.com
