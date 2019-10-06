/* eslint-disable guard-for-in */
/* eslint-disable max-len */
app = {
  state: {
    auth: null, picture: null,
  },
  s3: 'https://s3.us-east-2.amazonaws.com/pethome.bucket',
};
app.getAll = function(selector) {
  return document.querySelectorAll(selector);
};
app.get = function(selector) {
  return document.querySelector(selector);
};
app.createElement = function(tagName, settings, parentElement) {
  const obj = document.createElement(tagName);
  if (settings.atrs) app.setAttributes(obj, settings.atrs);
  if (settings.stys) app.setStyles(obj, settings.stys);
  if (settings.evts) app.setEventsHandlers(obj, settings.evts);
  if (parentElement instanceof Element) parentElement.appendChild(obj);
  return obj;
};

app.setAttributes = function(obj, attributes) {
  for (const name in attributes) obj[name] = attributes[name];
  return obj;
};
app.setStyles = function(obj, styles) {
  for (const name in styles) obj.styles[name] = styles[name];
  return obj;
};
app.setEventsHandlers = function(obj, eventHandlers, useCapture) {
  for (const name in eventHandlers) {
    if (eventHandlers[name] instanceof Array) {
      for (let i = 0; i < eventHandlers[name].length; i++) {
        obj.addEventListener(name, eventHandlers[name][i], useCapture);
      }
    } else {
      obj.addEventListener(name, eventHandlers[name], useCapture);
    }
  }
  return obj;
};
app.ajax = function(method, src, args, headers, callback) {
  const req = new XMLHttpRequest();
  if (method == 'POST') {
    req.open(method, src);
    req.setRequestHeader('Content-Type', 'application/json');
    app.setRequestHeaders(req, headers);
    req.onreadystatechange = function() {
      req.onload = function() {
        callback(this);
      };
    };
    req.send(JSON.stringify(args));
  } else {
    req.open(method, `${src}?${args}`);
    app.setRequestHeaders(req, headers);
    req.onreadystatechange = function() {
      req.onload = function() {
        callback(this);
      };
    };
    req.send();
  }
};
app.ajaxFormData = function(src, args, callback) {
  const req = new XMLHttpRequest();
  req.open('POST', src);
  // req.setRequestHeader("Content-Type", "multipart/form-data");
  req.onreadystatechange = function() {
    req.onload = function() {
      callback(this);
    };
  };
  req.send(args);
};
app.setRequestHeaders = function(req, headers) {
  for (const key in headers) {
    req.setRequestHeader(key, headers[key]);
  }
};
app.dateConversion = function(opendate) {
  opendate = Date.parse(opendate);
  return Math.ceil((Date.now() - opendate) / (1000 * 60 * 60 * 24));
};
app.countryTable = function(country) {
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
};
app.ageTable = function(age, kind) {
  let ageKind;
  if (age === 'A') ageKind = '成';
  else ageKind = '幼';
  if (kind === '貓') ageKind += '貓';
  else if (kind === '狗') ageKind += '犬';
  return ageKind;
};
app.sexTable = function(sex) {
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
};
app.neuterTable = function(neuter) {
  switch (neuter) {
    case 'T':
      return '有';
    case 'F':
      return '否';
    default:
      return '未確定';
  }
};
app.loadPetDetails = function(petId) {
  const detailsＷrap = app.get('.details-wrap');
  const imgWrap = app.get('.details-wrap .img-wrap');
  // let infoWrap = app.get('.pet-details .info-wrap');
  const infoWrap = app.createElement('div', {atrs: {className: 'info-wrap'}}, detailsＷrap);
  document.addEventListener('keyup', function() {
    if (event.keyCode === 27) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      app.get('.close.details').click();
    }
  });
  app.get('.close.details').addEventListener('click', function() {
    app.get('.pet-details').style.display = 'none';
    // app.get('.details-wrap .img-wrap').classList.remove('.details-wrap .img-wrap');
    const img = app.getAll('.details-wrap .img-wrap img');
    for (let i = 0; i < img.length; i++) {
      img[i].remove();
    }
    infoWrap.remove();
  });
  app.ajax('GET', 'api/adoption/details', `id=${petId}`, {}, function(req) {
    const data = JSON.parse(req.responseText);
    // let titleWrap = app.createElement('div', { atrs: { className: 'title-wrap' } }, detailsＷrap);
    console.log('details:', data);
    if (data.title.length == 0) {
      const stayDay = app.dateConversion(data.opendate);
      app.get('h1.pet-title').innerHTML = `在收容所待${stayDay}天，可以帶我回家嗎？`;
    } else app.get('h1.pet-title').innerHTML = data.title;

    // pet-image
    if (data.image[0] === '') app.createElement('img', {atrs: {src: './imgs/pet-null.jpg'}}, imgWrap);
    else {
      for (let i = 0; i < data.image.length; i++) {
        if (data.db === 1) {
          const imgLink = app.createElement('a', {atrs: {target: '_blank', href: `https://asms.coa.gov.tw/Amlapp/App/AnnounceList.aspx?Id=${data.db_link}&AcceptNum=${data.link_id}&PageType=Adopt`}}, imgWrap);
          app.createElement('img', {atrs: {src: data.image[i]}}, imgLink);
        } else if (data.db === 2) {
          const imgLink = app.createElement('a', {atrs: {target: '_blank', href: `http://www.meetpets.org.tw/content/${data.db_link}`}}, imgWrap);
          app.createElement('img', {atrs: {src: data.image[i]}}, imgLink);
        } else if (data.db === 3) app.createElement('img', {atrs: {src: `${app.s3}/pet-img/${data.image[i]}`}}, imgWrap);
      }
    }
    // pet-name
    const petNameItem = app.createElement('div', {atrs: {className: 'petName item'}}, infoWrap);
    if (data.db === 1) {
      // app.get('.petName.item h4').innerHTML = '所屬收容所編號';
      // app.get('.petName.item p').innerHTML = data.db_link;
      app.createElement('h4', {atrs: {innerHTML: '所屬收容所編號'}}, petNameItem);
      app.createElement('p', {atrs: {innerHTML: data.db_link}}, petNameItem);
    } else {
      // app.get('.petName.item h4').innerHTML = '小名';
      // app.get('.petName.item p').innerHTML = data.petName;
      if (data.petName) {
        app.createElement('h4', {atrs: {innerHTML: '小名'}}, petNameItem);
        app.createElement('p', {atrs: {innerHTML: data.petName}}, petNameItem);
      }
    }
    // county
    // app.get('.county.item p').innerHTML = app.countryTable(data.county);
    const countyItem = app.createElement('div', {atrs: {className: 'county item'}}, infoWrap);
    app.createElement('h4', {atrs: {innerHTML: '地區'}}, countyItem);
    app.createElement('p', {atrs: {innerHTML: app.countryTable(data.county)}}, countyItem);
    // sex
    if (data.sex !== null) {
      const sexItem = app.createElement('div', {atrs: {className: 'sex item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '性別'}}, sexItem);
      app.createElement('p', {atrs: {innerHTML: app.sexTable(data.sex)}}, sexItem);
    }
    // age
    const ageItem = app.createElement('div', {atrs: {className: 'age item'}}, infoWrap);
    app.createElement('h4', {atrs: {innerHTML: '年齡'}}, ageItem);
    app.createElement('p', {atrs: {innerHTML: app.ageTable(data.age, data.kind)}}, ageItem);
    // color
    if (data.color !== '' && data.color !== null) {
      const colorItem = app.createElement('div', {atrs: {className: 'color item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '花色'}}, colorItem);
      app.createElement('p', {atrs: {innerHTML: data.color}}, colorItem);
    }
    // neuter
    const neuterItem = app.createElement('div', {atrs: {className: 'neuter item'}}, infoWrap);
    app.createElement('h4', {atrs: {innerHTML: '結紮'}}, neuterItem);
    app.createElement('p', {atrs: {innerHTML: app.neuterTable(data.neuter)}}, neuterItem);
    // bacterin
    if (data.bacterin !== null) {
      const bacterinItem = app.createElement('div', {atrs: {className: 'bacterin item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '狂犬病疫苗'}}, bacterinItem);
      app.createElement('p', {atrs: {innerHTML: app.neuterTable(data.bacterin)}}, bacterinItem);
    }
    // microchip
    if (data.microchip !== null) {
      const microchipItem = app.createElement('div', {atrs: {className: 'microchip item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '晶片號碼'}}, microchipItem);
      app.createElement('p', {atrs: {innerHTML: data.microchip}}, microchipItem);
    }
    // description
    if (data.description.length !== 0) {
      const descriptionItem = app.createElement('div', {atrs: {className: 'description item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '描述'}}, descriptionItem);
      app.createElement('p', {atrs: {innerHTML: data.description}}, descriptionItem);
    }
    // habit
    if (data.habit !== null) {
      const habitItem = app.createElement('div', {atrs: {className: 'habit item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '習性'}}, habitItem);
      app.createElement('p', {atrs: {innerHTML: data.habit}}, habitItem);
    }
    // story
    if (data.story !== null) {
      const storyItem = app.createElement('div', {atrs: {className: 'story item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '故事'}}, storyItem);
      app.createElement('p', {atrs: {innerHTML: data.story}}, storyItem);
    }
    // limitation
    if (data.limitation !== null) {
      const limitationItem = app.createElement('div', {atrs: {className: 'limitation item'}}, infoWrap);
      app.createElement('h4', {atrs: {innerHTML: '限制'}}, limitationItem);
      app.createElement('p', {atrs: {innerHTML: data.limitation}}, limitationItem);
    }
    // contactName
    const contactNameItem = app.createElement('div', {atrs: {className: 'contactName item'}}, infoWrap);
    app.createElement('h4', {atrs: {innerHTML: '聯絡人'}}, contactNameItem);
    app.createElement('p', {atrs: {innerHTML: data.contactName}}, contactNameItem);
    // contactMethod
    const contactMethodItem = app.createElement('div', {atrs: {className: 'contactMethod item'}}, infoWrap);
    app.createElement('h4', {atrs: {innerHTML: '聯絡方式'}}, contactMethodItem);
    app.createElement('p', {atrs: {innerHTML: data.contactMethod}}, contactMethodItem);
    // link
    if (data.db !== 3) {
      if (data.db_link.length !== null) {
        const linkItem = app.createElement('div', {atrs: {className: 'link item'}}, infoWrap);
        app.createElement('h4', {atrs: {innerHTML: '連結'}}, linkItem);
        if (data.db === 1) app.createElement('a', {atrs: {innerHTML: '全國推廣動物認領養平台', target: '_blank', href: `https://asms.coa.gov.tw/Amlapp/App/AnnounceList.aspx?Id=${data.db_link}&AcceptNum=${data.link_id}&PageType=Adopt`}}, linkItem);
        else if (data.db === 2) app.createElement('a', {atrs: {innerHTML: '台灣認養地圖', target: '_blank', href: `http://www.meetpets.org.tw/content/${data.db_link}`}}, linkItem);
      }
    }
  });
};
