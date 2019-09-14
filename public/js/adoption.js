const urlParams = new URLSearchParams(window.location.search);
let kind = urlParams.get('kind');
let paging = parseInt(urlParams.get('paging'));
if (paging == null) paging = 0;
let sex = urlParams.get('sex');
let region = urlParams.get('region');
console.log(kind, sex, region);
function searchActive(kind, sex, region) {
    if (kind && kind !== 'all') {
        console.log('test:', app.get(`.kind #${kind} label`));
        app.get(`.kind label.${kind}`).classList.add('active');
    }
    if (sex) app.get(`.sex label.${sex}`).classList.add('active');
    if (region) {
        region = region.split(',');
        region.forEach(function (element) {
            app.get(`.county label._${element}`).classList.add('active');
        });
    }
}
searchActive(kind, sex, region);
function queryString(sex, region, paging) {
    if (region && sex) return `sex=${sex}&region=${region}&paging=${paging}`;
    else if (region) return `region=${region}&paging=${paging}`;
    else if (sex) return `sex=${sex}&paging=${paging}`;
    else return `paging=${paging}`;
}


app.ajax('GET', `api/adoption/${kind}`, queryString(sex, region, paging), {}, function (req) {
    let data = JSON.parse(req.responseText).data;
    const pet_list = app.get('.pet-list');
    for (let i = 0; i < data.length; i++) {
        let pet_img;
        let title;
        let item = app.createElement('div', { atrs: { className: 'item' } }, pet_list);
        let img_wrap = app.createElement('div', { atrs: { className: 'img-wrap' } }, item);
        if (data[i].image[0].length == 0) pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: './imgs/pet-null.jpg' } }, img_wrap);
        else {
            if (data[i].db === 3) pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: `./pet-img/${data[i].image[0]}` } }, img_wrap);
            else pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: data[i].image[0] } }, img_wrap);
        }
        pet_img.addEventListener('click', function () {
            app.get('.pet-details').style.display = 'block';
            loadPetDetails(data[i].id);
        });
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
            // if (data[i].petName.length >= 11)
            // app.createElement('span', { atrs: { innerHTML: data[i].petName.substring(11, -1) } }, name);
            app.createElement('span', { atrs: { innerHTML: data[i].petName } }, name);
        }
        let sex = app.createElement('div', { atrs: { className: 'sex' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '性別' } }, sex);
        app.createElement('span', { atrs: { innerHTML: app.sexTable(data[i].sex) } }, sex);
        let color = app.createElement('div', { atrs: { className: 'color' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '顏色' } }, color);
        app.createElement('span', { atrs: { innerHTML: data[i].color } }, color);
        app.createElement('div', { atrs: { className: 'line' } }, pet_list);
        // app.createElement('button', { arts: { innerHTML: '認養我', type: 'submit' } }, pet_list);
    }
});


function loadPetDetails(petId) {
    let details_wrap = app.get('.details-wrap');
    let img_wrap = app.get('.details-wrap .img-wrap');
    // let info_wrap = app.get('.pet-details .info-wrap');
    let info_wrap = app.createElement('div', { atrs: { className: 'info-wrap' } }, details_wrap);
    document.addEventListener('keyup', function () {
        if (event.keyCode === 27) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            app.get('.close.details').click();
        }
    });
    app.get('.close.details').addEventListener('click', function () {
        app.get('.pet-details').style.display = 'none';
        // app.get('.details-wrap .img-wrap').classList.remove('.details-wrap .img-wrap');
        let img = app.getAll('.details-wrap .img-wrap img');
        for (let i = 0; i < img.length; i++) {
            img[i].remove();
        }
        info_wrap.remove();
    });
    app.ajax('GET', 'api/adoption/details', `id=${petId}`, {}, function (req) {
        let data = JSON.parse(req.responseText);

        console.log(data);
        if (data.title.length == 0) {
            let stayDay = app.dateConversion(data.opendate);
            app.get('h1.pet-title').innerHTML = `在收容所待${stayDay}天，可以帶我回家嗎？`;

        }
        else app.get('h1.pet-title').innerHTML = data.title;

        // pet-image
        if (data.image[0] === '') app.createElement('img', { atrs: { src: './imgs/pet-null.jpg' } }, img_wrap);
        else {
            for (let i = 0; i < data.image.length; i++) {
                if (data.db === 2 || data.db === 1)
                    app.createElement('img', { atrs: { src: data.image[i] } }, img_wrap);
                else if (data.db === 3) app.createElement('img', { atrs: { src: `./pet-img/${data.image[i]}` } }, img_wrap);

            }
        }
        // pet-name
        let petNameItem = app.createElement('div', { atrs: { className: 'petName item' } }, info_wrap);
        if (data.db === 1) {
            // app.get('.petName.item h4').innerHTML = '所屬收容所編號';
            // app.get('.petName.item p').innerHTML = data.db_link;
            app.createElement('h4', { atrs: { innerHTML: '所屬收容所編號' } }, petNameItem);
            app.createElement('p', { atrs: { innerHTML: data.db_link } }, petNameItem);
        }
        else {
            // app.get('.petName.item h4').innerHTML = '小名';
            // app.get('.petName.item p').innerHTML = data.petName;
            app.createElement('h4', { atrs: { innerHTML: '小名' } }, petNameItem);
            app.createElement('p', { atrs: { innerHTML: data.petName } }, petNameItem);
        }
        // county
        // app.get('.county.item p').innerHTML = app.countryTable(data.county);
        let countyItem = app.createElement('div', { atrs: { className: 'county item' } }, info_wrap);
        app.createElement('h4', { atrs: { innerHTML: '地區' } }, countyItem);
        app.createElement('p', { atrs: { innerHTML: app.countryTable(data.county) } }, countyItem);
        // sex
        if (data.sex !== null) {
            let sexItem = app.createElement('div', { atrs: { className: 'sex item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '性別' } }, sexItem);
            app.createElement('p', { atrs: { innerHTML: app.sexTable(data.sex) } }, sexItem);
        }
        // age 
        let ageItem = app.createElement('div', { atrs: { className: 'age item' } }, info_wrap);
        app.createElement('h4', { atrs: { innerHTML: '年齡' } }, ageItem);
        app.createElement('p', { atrs: { innerHTML: app.ageTable(data.age, data.kind) } }, ageItem);
        // color
        if (data.color !== null) {
            let colorItem = app.createElement('div', { atrs: { className: 'color item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '花色' } }, colorItem);
            app.createElement('p', { atrs: { innerHTML: data.color } }, colorItem);
        }
        // neuter
        let neuterItem = app.createElement('div', { atrs: { className: 'neuter item' } }, info_wrap);
        app.createElement('h4', { atrs: { innerHTML: '結紮' } }, neuterItem);
        app.createElement('p', { atrs: { innerHTML: app.neuterTable(app.neuter) } }, neuterItem);
        // bacterin
        if (data.bacterin !== null) {
            let bacterinItem = app.createElement('div', { atrs: { className: 'bacterin item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '狂犬病疫苗' } }, bacterinItem);
            app.createElement('p', { atrs: { innerHTML: app.neuterTable(data.bacterin) } }, bacterinItem);
        }
        //microchip
        if (data.microchip !== null) {
            let microchipItem = app.createElement('div', { atrs: { className: 'microchip item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '晶片號碼' } }, microchipItem);
            app.createElement('p', { atrs: { innerHTML: data.microchip } }, microchipItem);
        }
        //description
        if (data.description.length !== 0) {
            let descriptionItem = app.createElement('div', { atrs: { className: 'description item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '描述' } }, descriptionItem);
            app.createElement('p', { atrs: { innerHTML: data.description } }, descriptionItem);
        }
        // habit
        if (data.habit !== null) {
            let habitItem = app.createElement('div', { atrs: { className: 'habit item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '習性' } }, habitItem);
            app.createElement('p', { atrs: { innerHTML: data.habit } }, habitItem);
        }
        // story
        if (data.story !== null) {
            let storyItem = app.createElement('div', { atrs: { className: 'story item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '故事' } }, storyItem);
            app.createElement('p', { atrs: { innerHTML: data.story } }, storyItem);
        }
        // limitation
        if (data.limitation !== null) {
            let limitationItem = app.createElement('div', { atrs: { className: 'limitation item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '限制' } }, limitationItem);
            app.createElement('p', { atrs: { innerHTML: data.limitation } }, limitationItem);
        }
        // contactName
        let contactNameItem = app.createElement('div', { atrs: { className: 'contactName item' } }, info_wrap);
        app.createElement('h4', { atrs: { innerHTML: '聯絡人' } }, contactNameItem);
        app.createElement('p', { atrs: { innerHTML: data.contactName } }, contactNameItem);
        // contactMethod
        let contactMethodItem = app.createElement('div', { atrs: { className: 'contactMethod item' } }, info_wrap);
        app.createElement('h4', { atrs: { innerHTML: '聯絡方式' } }, contactMethodItem);
        app.createElement('p', { atrs: { innerHTML: data.contactMethod } }, contactMethodItem);
        // link
        if (data.db_link.length !== null) {
            let linkItem = app.createElement('div', { atrs: { className: 'link item' } }, info_wrap);
            app.createElement('h4', { atrs: { innerHTML: '連結' } }, linkItem);
            if (data.db === 1) app.createElement('a', { atrs: { innerHTML: '全國推廣動物認領養平台', target: '_blank', href: `https://asms.coa.gov.tw/Amlapp/App/AnnounceList.aspx?Id=${data.db_link}&AcceptNum=${data.link_id}&PageType=Adopt` } }, linkItem);
            else if (data.db === 2) app.createElement('a', { atrs: { innerHTML: '台灣認養地圖', target: '_blank', href: `http://www.meetpets.org.tw/content/${data.db_link}` } }, linkItem);
        }
    });

}
// app.ajax('GET', `api/adoption/count?kind=${kind}`, {}, function (req) {
app.ajax('GET', 'api/adoption/count', `kind=${kind}&${queryString(sex, region, paging)}`, {}, function (req) {
    let lastPage = JSON.parse(req.responseText).lastPage;
    const pagination = app.get('.pagination');
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, 0)}`, innerHTML: '«第一頁' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, paging > 0 ? paging - 1 : 0)}`, innerHTML: '«上一頁' } }, pagination);
    let paging_list = app.createElement('div', { atrs: { className: 'paging-list' } }, pagination);
    for (let i = Math.floor(paging / 10) * 10; i < Math.floor(paging / 10) * 10 + 10 && i <= lastPage; i++) {
        if (i === paging) app.createElement('a', { atrs: { className: 'active', href: `/adoption?kind=${kind}&${queryString(sex, region, i)}`, innerHTML: i + 1 } }, paging_list);
        else app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, i)}`, innerHTML: i + 1 } }, paging_list);
    }
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, paging < lastPage ? paging + 1 : lastPage)}`, innerHTML: '下一頁›' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, lastPage)}`, innerHTML: '最後一頁»' } }, pagination);
});
