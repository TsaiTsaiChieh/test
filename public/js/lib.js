let app = {};
app.get = function (selector) {
    return document.querySelector(selector);
}
app.createElement = function (tagName, settings, parentElement) {
    let obj = document.createElement(tagName);
    if (settings.atrs) app.setAttributes(obj, settings.atrs);
    if (settings.stys) app.setStyles(obj, settings.stys);
    if (settings.evts) app.setEventsHandlers(obj, settings.evts);
    if (parentElement instanceof Element) parentElement.appendChild(obj);
    return obj;
}

app.setAttributes = function (obj, attributes) {
    for (let name in attributes) obj[name] = attributes[name];
    return obj;
}
app.setStyles = function (obj, styles) {
    for (let name in styles) obj.styles[name] = styles[name];
    return obj;
}
app.setEventsHandlers = function (obj, eventHandlers, useCapture) {
    for (let name in eventHandlers) {
        if (eventHandlers[name] instanceof Array) {
            for (let i = 0; i < eventHandlers[name].length; i++) {
                obj.addEventListener(name, eventHandlers[name][i], useCapture);
            }
        } else {
            obj.addEventListener(name, eventHandlers[name], useCapture);
        }
    }
    return obj;
}
app.ajax = function (method, src, callback) {
    let req = new XMLHttpRequest();
    req.open(method, src);
    req.onreadystatechange = function () {
        req.onload = function () {
            callback(this);
        }
    }
    req.send();
}
app.dateConversion = function (opendate) {
    opendate = Date.parse(opendate);
    return Math.ceil((Date.now() - opendate) / (1000 * 60 * 60 * 24));
}
app.countryTable = function (country) {
    switch (country) {
        case 2:
            return '台北市';
        case 3:
            return '新北市';
        case 4:
            return '基隆市';
        case 5:
            return '宜蘭縣';
        case 6:
            return '桃園縣';
        case 7:
            return '新竹縣';
        case 8:
            return '新竹市';
        case 9:
            return '苗栗縣';
        case 10:
            return '台中市';
        case 11:
            return '彰化縣';
        case 12:
            return '南投縣';
        case 13:
            return '雲林縣';
        case 14:
            return '嘉義縣';
        case 15:
            return '嘉義市';
        case 16:
            return '台南市';
        case 17:
            return '高雄市';
        case 18:
            return '屏東縣';
        case 19:
            return '花蓮縣';
        case 20:
            return '台東縣';
        case 21:
            return '澎湖縣';
        case 22:
            return '金門縣';
        case 23:
            return '連江縣';
    }

}
app.ageTable = function (age, kind) {
    let age_kind;
    if (age === 'A') age_kind = '成';
    else age_kind = '幼';
    if (kind === '貓') age_kind += '貓';
    else if (kind === '狗') age_kind += '犬';
    return age_kind;
}
app.sexTable = function (sex) {
    switch (sex) {
        case 'F':
            return '母';
        case 'M':
            return '公';
        case 'N':
            return '不確定';
        default:
            return '';
    }
}