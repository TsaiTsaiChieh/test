const urlParams = new URLSearchParams(window.location.search);
let kind = urlParams.get('kind');
let paging = parseInt(urlParams.get('paging'));
if (paging == null) paging = 0;

app.ajax('GET', `api/adoption/${kind}?paging=${paging}`, function (req) {
    let data = JSON.parse(req.responseText).data;
    const pet_list = app.get('.pet-list');
    for (let i = 0; i < data.length; i++) {
        let pet_img;
        let title;
        let item = app.createElement('div', { atrs: { className: 'item' } }, pet_list);
        let img_wrap = app.createElement('div', { atrs: { className: 'img-wrap' } }, item);
        if (data[i].image[0].length == 0) pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: './imgs/pet-null.jpg' } }, img_wrap);
        else pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: data[i].image[0] } }, img_wrap);
        // pet_img.addEventListener('click', function () {
        //     app.get('.details').style.display = 'flex';
        // });


        let text_wrap = app.createElement('div', { atrs: { className: 'text-wrap' } }, item);
        if (data[i].title.length == 0) {
            let stayDay = app.dateConversion(data[i].opendate);
            title = app.createElement('h2', { atrs: { className: 'title', innerHTML: `在收容所待 ${stayDay} 天，可以帶我回家嗎？` } }, text_wrap);
        }
        else title = app.createElement('h2', { atrs: { className: 'title', innerHTML: data[i].title } }, text_wrap);
        let profile = app.createElement('div', { atrs: { className: 'profile' } }, text_wrap);
        let county = app.createElement('div', { atrs: { className: 'county' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '地區' } }, county);
        app.createElement('span', { atrs: { innerHTML: app.countryTable(data[i].county) } }, county);
        let age = app.createElement('div', { atrs: { className: 'age' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '年齡' } }, age);
        app.createElement('span', { atrs: { innerHTML: app.ageTable(data[i].age, data[i].kind) } }, age);
        let name = app.createElement('div', { atrs: { className: 'name' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '姓名' } }, name);
        if (data[i].petName) {
            if (data[i].petName.length >= 11)
                app.createElement('span', { atrs: { innerHTML: data[i].petName.substring(11, -1) } }, name);
            else app.createElement('span', { atrs: { innerHTML: data[i].petName } }, name);
        }
        let sex = app.createElement('div', { atrs: { className: 'sex' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '性別' } }, sex);
        app.createElement('span', { atrs: { innerHTML: app.sexTable(data[i].sex) } }, sex);
        let color = app.createElement('div', { atrs: { className: 'color' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '顏色' } }, color);
        app.createElement('span', { atrs: { innerHTML: data[i].color } }, color);
        app.createElement('div', { atrs: { className: 'line' } }, pet_list);
    }
});

app.ajax('GET', `api/adoption/count?kind=${kind}`, function (req) {
    let lastPage = JSON.parse(req.responseText).lastPage;
    const pagination = app.get('.pagination');
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&paging=0`, innerHTML: '«第一頁' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&paging=${paging > 0 ? paging - 1 : 0}`, innerHTML: '«上一頁' } }, pagination);
    let paging_list = app.createElement('div', { atrs: { className: 'paging-list' } }, pagination);
    for (let i = Math.floor(paging / 10) * 10; i < Math.floor(paging / 10) * 10 + 10 && i < lastPage; i++) {
        if (i == paging) app.createElement('a', { atrs: { className: 'active', href: `/adoption?kind=${kind}&paging=${i}`, innerHTML: i + 1 } }, paging_list);
        else app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&paging=${i}`, innerHTML: i + 1 } }, paging_list);
    }
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&paging=${paging < lastPage ? paging + 1 : lastPage}`, innerHTML: '下一頁›' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&paging=${lastPage}`, innerHTML: '最後一頁»' } }, pagination);
});
// app.pet_img.click = function () {
//     app.get('.details').style.display = 'flex';
// }