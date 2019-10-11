/* eslint-disable max-len */
const menu = window.location.search.replace('?', '');

// Load member.pug 時，去拿 user 的資料
app.ajax('GET', 'api/user/profile', '', {'Authorization': `Bearer ${window.localStorage.getItem('auth')}`}, function(req) {
  console.log(req.responseText, req.status);
  // token 無效或過期，要重新登入
  if (req.status !== 200) {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('picture');
    window.localStorage.removeItem('provider');
    window.localStorage.removeItem('user-id');
    if (confirm('登入時間已逾期，請重新登入')) {
      window.location.href = './'; // 否則 .html 會一直重新導向，測試完要拿掉註解
    } else {
      window.location.href = './'; // 否則 .html 會一直重新導向，測試完要拿掉註解
    }
  }
  const user = JSON.parse(req.responseText).user;

  if (user.picture) {
    app.get('.left-profile img').src = user.picture;
  }
  if (user.name) {
    app.get('.left-name').innerHTML = user.name;
    app.get('.personal-info input.name').placeholder = user.name;
  }
  if (user.contactMethod) {
    app.get('.personal-info input.phone').placeholder = user.contactMethod;
  }
  if (user.picture) {
    if (user.picture.substring(0, 4) === 'http') {
      app.get('.left-profile img').src = user.picture;
    } else app.get('.left-profile img').src = `${app.s3}/user-pic/${user.picture}`;
  }
  app.get('.login-info p').innerHTML = user.email;
  app.get('.login-info #user-id').innerHTML = user.id;

  window.localStorage.setItem('name', user.name);
});
function initMenu(menu) {
  const change = app.get('.menu .change');
  const adopt = app.get('.menu .adopt');
  const edit = app.get('.menu .edit');
  const message = app.get('.menu .message');
  const attention = app.get('.menu .attention');
  if (menu === 'profile') {
    change.classList.add('active');
    app.get('.profile-wrap').style.display = 'flex';
  } else if (menu === 'adoption') {
    adopt.classList.add('active');
    app.get('.adoption-wrap').style.display = 'flex';
    app.get('button.adoption-btn').addEventListener('click', adoptionPost);
    app.get('button.adoption-btn').removeEventListener('click', updateAdoption);
  } else if (menu === 'edit') {
    edit.classList.add('active');
    app.get('.edit-wrap').style.display = 'block';
    getAdoptionList();
    app.get('button.adoption-btn').removeEventListener('click', adoptionPost);
  } else if (menu === 'attention') {
    attention.classList.add('active');
    app.get('.attention-wrap').style.display = 'block';
    getAttentionList();
  } else if (menu === 'message') {
    message.classList.add('active');
    app.get('.message-wrap').style.display = 'block';
    getMessageList();
  }
}
initMenu(menu);
// logout setting
logout();
function logout() {
  app.get('.logout').addEventListener('click', function() {
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('picture');
    window.localStorage.removeItem('provider');
    window.localStorage.removeItem('user-id');
    if (window.localStorage.getItem('provider') === 'facebook') {
      FB.api('/me/permissions', 'delete', function(res) {
      });
    }
    // window.location.href = 'adoption?kind=all&paging=0';
  });
}

// eslint-disable-next-line no-unused-vars
function updateProfile() {
  const inputName = app.get('.personal-info input.name').value;
  const inputContactMethod = app.get('.personal-info input.phone').value;
  const password = app.get('.personal-info input.password').value;
  let uploadImg = app.get('.upload-img').files[0];
  const id = app.get('#user-id').innerHTML;
  let fileAppend;
  if (inputName || inputContactMethod || uploadImg || password) {
    const formData = new FormData();
    if (uploadImg) {
      uploadImg = new File([uploadImg], id + '.jpg', {type: 'image/jpeg'});
      // formData.append('upload-img', uploadImg);
      fileAppend = new Promise(function(resolve, reject) {
        const canvasBlob = compressFile(uploadImg);
        canvasBlob.then(function(blob) {
          const myFile = blobToFile(blob, `${id}.jpg`);
          formData.append('upload-img', myFile);
          resolve(formData);
        }).catch(function(err) {
          // nothing
        });
      });
    }
    if (inputName) formData.append('inputName', inputName);
    if (inputContactMethod) formData.append('inputContactMethod', inputContactMethod);
    if (password) formData.append('password', password);
    formData.append('userId', id);
    if (uploadImg) {
      fileAppend.then(function(formData) {
        app.get('.lds-dual-ring-2').style.display = 'flex';
        app.ajaxFormData('api/user/update', formData, function(req) {
          if (req.status === 500) {
            app.get('.lds-dual-ring-2').style.display = 'none';
          } else {
            if (uploadImg) window.localStorage.setItem('picture', uploadImg.name);
            location.reload('member');
          }
        });
      });
    } else {
      app.get('.lds-dual-ring-2').style.display = 'flex';
      app.ajaxFormData('api/user/update', formData, function(req) {
        if (req.status === 500) {
          app.get('.lds-dual-ring-2').style.display = 'none';
        } else {
          if (uploadImg) window.localStorage.setItem('picture', uploadImg.name);
          location.reload('member');
        }
      });
    }
  }
}
function adoptionPost() {
  let flag = true;
  const petTitle = app.get('.adoption-info input.title').value;
  const petImgs = app.get('.pet-img');
  const kind = app.get('.adoption-info input[name="kind"]:checked').value;
  const sex = app.get('.adoption-info input[name="sex"]:checked').value;
  const age = app.get('.adoption-info input[name="age"]:checked').value;
  const neuter = app.get('.adoption-info input[name="neuter"]:checked').value;
  const county = app.get('.adoption-info select').value;
  const petColor = app.get('.adoption-info input.pet-color').value;
  const petName = app.get('.adoption-info input.pet-name').value;
  const description = app.get('.adoption-info .description').value;
  const microchip = app.get('.adoption-info .pet-microchip').value;
  const limitation = [];
  const limitationChecked = document.querySelectorAll('.limitation');
  for (let i = 0; limitationChecked[i]; i++) {
    if (limitationChecked[i].checked) limitation.push(limitationChecked[i].value);
  }
  const contactName = app.get('.adoption-info input.contact-name').value;
  const contactMethod = app.get('.adoption-info input.contact-method').value;

  // checkForm
  flag = checkForm(contactMethod, '請填寫聯絡方式', flag);
  flag = checkForm(contactName, '請填寫聯絡人', flag);
  flag = checkForm(description, '請填寫毛孩的描述', flag);
  flag = checkForm(petTitle, '請填寫標題', flag);
  flag = fileLimitCheck(petImgs.files, 3, flag, 0);
  // formData
  const formData = new FormData();
  const userId = window.localStorage.getItem('user-id');
  formData.append('userId', userId);
  formData.append('petTitle', petTitle);
  formData.append('kind', kind);
  formData.append('sex', sex);
  formData.append('age', age);
  formData.append('neuter', neuter);
  formData.append('county', county);
  formData.append('petColor', petColor);
  formData.append('petName', petName);
  formData.append('description', description);
  formData.append('microchip', microchip);
  formData.append('limitation', limitation);
  formData.append('contactName', contactName);
  formData.append('contactMethod', contactMethod);
  const fileAppend = new Promise(function(resolve, reject) {
    let loaded = 0;
    for (let i = 0; i < petImgs.files.length; i++) {
      petImg = new File([petImgs.files[i]], `${userId}_${Date.now()}.jpg`, {type: 'image/jpeg'});
      const canvasBlob = compressFile(petImg);
      canvasBlob.then(function(blob) {
        loaded++;
        const myFile = blobToFile(blob, `${userId}_${Date.now()}.jpg`);
        formData.append('petImgs', myFile);
        if (loaded === petImgs.files.length) resolve(formData);
      }, function(err) {
        reject(err);
      });
    }
  });

  if (flag) {
    app.get('.warning-msg').style.display = 'none';
    app.get('.adoption-wrap .lds-dual-ring-2').style.display = 'flex';
    fileAppend.then(function(formData) {
      app.ajaxFormData('api/user/postAdoption', formData, function(req) {
        if (req.status === 500) {
          app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
          app.get('.adoption-wrap. lds-dual-ring-2').style.display = 'none';
        } else if (req.status === 200) {
          app.get('.adoption-wrap .lds-dual-ring-2').style.display = 'none';
          window.location.href = './member?edit';
        }
      });
    });
  }
}
function blobToFile(theBlob, fileName) {
  // A Blob() is almost a File() - it's just missing the two properties below which we will add
  const file = new File([theBlob], fileName, {type: 'image/jpg', lastModified: Date.now()});
  return file;
}
function fileLimitCheck(files, max, flag, update) {
  const warningMsg = app.get('.warning-msg');

  if (files.length > max) {
    flag = false;
    warningMsg.innerHTML = `上傳毛孩的照片不得超過 ${max} 張`;
  }
  if (files.length === 0 && update === 0) {
    flag = false;
    warningMsg.innerHTML = '請至少上傳 1 張毛孩的照片';
  }
  if (files.length === 0 && update === 1) flag = true;
  return flag;
}
function checkForm(value, msg, flag) {
  const warningMsg = app.get('.warning-msg');
  if (!value) {
    warningMsg.style.display = 'block';
    warningMsg.innerHTML = msg;
    flag = false;
  }
  return flag;
}

// jQuery 壓縮圖片
function compressFile(file) {
  return new Promise(function(resolve, reject) {
    const compressRatio = 0.8; // 圖片壓縮比例
    const imgNewWidth = 400; // 圖片新寬度
    const fileReader = new FileReader();
    const img = new Image();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d'); // 返回一個用於在畫布上繪圖的環境
    fileReader.onload = function(e) {
      dataUrl = e.target.result;
      // 取得圖片
      img.src = dataUrl;
    }; // 於讀取完成時觸發
    fileReader.readAsDataURL(file);
    // 圖片載入後
    img.onload = function() {
      const width = this.width; // 圖片原始寬度
      const height = this.height; // 圖片原始高度
      const imgNewHeight = imgNewWidth * height / width; // 圖片新高度
      // 使用 canvas 調整圖片寬高
      canvas.width = imgNewWidth;
      canvas.height = imgNewHeight;
      context.clearRect(0, 0, imgNewWidth, imgNewHeight);

      // 調整圖片尺寸
      context.drawImage(img, 0, 0, imgNewWidth, imgNewHeight);


      // canvas 轉換為 blob 格式、上傳

      canvas.toBlob(function(blob) {
        if (blob) resolve(blob);
        // 輸入上傳程式碼
      }, 'image/jpg', compressRatio);
    };
  });
}

function getAdoptionList() {
  app.ajax('GET', 'api/user/getAdoptionList', '', {'Authorization': `Bearer ${window.localStorage.getItem('auth')}`}, function(req) {
    const data = JSON.parse(req.responseText).data;
    const itemList = app.get('.edit-wrap .item-list ');
    if (data.length === 0) app.createElement('div', {atrs: {className: 'null-msg', innerHTML: '目前無任何送養的紀錄喔！'}}, itemList);
    for (let i = 0; i < data.length; i++) {
      const item = app.createElement('div', {atrs: {className: `item item_${data[i].id}`}}, itemList);
      const petImg = app.createElement('img', {atrs: {className: 'pet-img', src: `${app.s3}/pet-img/${data[i].image[0]}`}}, item);
      petImg.addEventListener('click', function() {
        app.get('.pet-details').style.display = 'block';
        app.loadPetDetails(data[i].id);
      });
      const smallWrap = app.createElement('div', {atrs: {className: 'small-wrap'}}, item);
      app.createElement('h4', {atrs: {innerHTML: data[i].title}}, smallWrap);
      const statusWrap = app.createElement('div', {atrs: {className: 'status-wrap'}}, smallWrap);
      const statusLight = app.createElement('div', {atrs: {className: 'status-light'}}, statusWrap);
      statusLight.style.background = statusColor(data[i].status);
      app.createElement('div', {atrs: {className: 'status-text', innerHTML: `${statusText(data[i].status)}`}}, statusWrap);
      app.createElement('img', {atrs: {className: 'sex-icon', src: `./imgs/${data[i].sex === 'F' ? 'female.png' : 'male.png'}`}}, statusWrap);
      const edit = app.createElement('img', {atrs: {src: './imgs/edit.png', className: 'edit'}}, item);
      edit.addEventListener('click', function() {
        getAdoption(data[i].id, data[i]);
      });
      const remove = app.createElement('img', {atrs: {src: './imgs/remove.png', className: 'remove'}}, item);
      remove.addEventListener('click', function() {
        deleteAdoption(data[i].id);
      });
      app.createElement('div', {atrs: {className: `line line_${data[i].id}`}}, itemList);
    }
  });
}
function statusColor(status) {
  if (status === 2) return 'lightseagreen';
  else if (status === 1) return 'lightgreen';
  else return 'lightsalmon';
}
function statusText(status) {
  if (status === 2) return '暫不開放認養';
  else if (status === 1) return '已認養';
  else return '未認養';
}
function deleteAdoption(petId) {
  if (confirm('確定要刪除嗎？會將自己以及其他人的關注和留言都刪除喔！')) {
    app.ajax('POST', 'api/user/deleteAdoption', {petId}, {}, function(req) {
      const msg = app.get('.edit-wrap .msg');
      msg.style.display = 'block';
      if (req.status === 500) msg.innerHTML = '伺服器錯誤，請稍後再試';
      else {
        msg.innerHTML = '刪除成功！';
        app.get(`.edit-wrap .item-list .item_${petId}`).remove();
        app.get(`.line_${petId}`).remove();
      }
    });
  } else {
    // 取消
  }
}
function getAdoption(petId, data) {
  app.get('.adoption-wrap .status-radio').style.display = 'flex';
  if (data.status === 2) app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(4)').checked = true;
  else if (data.status === 1) app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(3)').checked = true;
  else app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(2)').checked = true;
  const adoptionWrap = app.get('.adoption-wrap');
  app.get('.adoption-wrap .title-wrap').innerHTML = '編輯送養紀錄';
  app.get('.adoption-wrap .subtitle-wrap').innerHTML = '編輯毛孩的基本資料，請務必詳實填寫';
  app.get('.adoption-wrap').style.display = 'flex';
  app.get('.edit-wrap').style.display = 'none';
  const lastPage = app.createElement('img', {atrs: {className: 'lastPage', src: './imgs/lastPage.png'}}, adoptionWrap);
  const imgWrap = app.get('.img-wrap');
  data.image.forEach(function(ele) {
    app.createElement('img', {atrs: {className: 'img-preview', src: `${app.s3}/pet-img/${ele}`}}, imgWrap);
  });
  app.get('.adoption-wrap label.btn.btn-info i').innerHTML = '重傳毛孩的照片';
  app.get('.adoption-info .title').value = data.title;
  app.get(`.adoption-info input[type=radio]:nth-child(${data.kind === '狗' ? 2 : 3})`).checked = true;
  if (data.sex === 'M') app.get(`.adoption-info .sex-wrap input[type=radio]:nth-child(2)`).checked = true;
  else if (data.sex === 'F') app.get(`.adoption-info .sex-wrap input[type=radio]:nth-child(3)`).checked = true;
  else app.get(`.adoption-info .sex-wrap input[type=radio]:nth-child(4)`).checked = true;
  app.get(`.adoption-info .age-wrap input[type=radio]:nth-child(${data.age === 'C' ? 2 : 3})`).checked = true;
  app.get(`.adoption-info .neuter-wrap input[type=radio]:nth-child(${data.neuter === 'F' ? 2 : 3})`).checked = true;
  app.get('.adoption-info select').value = data.county;
  if (data.color !== 'null') app.get('.adoption-info .pet-color').value = data.color;
  if (data.petName !== 'null') app.get('.adoption-info .pet-name').value = data.petName;
  app.get('.adoption-info .description').value = data.description;
  if (data.microchip !== 'null') app.get('.adoption-info .pet-microchip').value = data.microchip;
  app.getAll('.adoption-info .requirement input').forEach(function(ele) {
    ele.checked = false;
  }); // 歸零
  if (data.limitation[0] !== '') {
    data.limitation.forEach(function(ele) {
      app.get(`.adoption-wrap .requirement input[value=${ele}]`).checked = true;
    });
  }
  app.get('.adoption-info .contact-name').value = data.contactName;
  app.get('.adoption-info .contact-method').value = data.contactMethod;
  // update adoption setting
  const updateButton = app.get('button.adoption-btn');
  // updateButton.innerHTML = '送養更新';
  // updateButton.removeEventListener('click', adoptionPost);
  updateButton.addEventListener('click', function() {
    updateAdoption(petId);
  });
  // last page setting
  lastPage.addEventListener('click', function() {
    app.get('.adoption-wrap').style.display = 'none';
    app.get('.edit-wrap').style.display = 'block';
    const imgPreview = app.getAll('.img-wrap .img-preview');
    imgPreview.forEach(function(ele) {
      ele.remove();
    }); // clear up the element(s)
    app.get('.warning-msg').style.display = 'none';
  });
}
function updateAdoption(petId) {
  let flag = true;
  const form = getAdoptionForm();
  // checkForm
  form.status = app.get('.adoption-wrap .status-radio input[name="status"]:checked').value;
  flag = checkForm(form.contactMethod, '請填寫聯絡方式', flag);
  flag = checkForm(form.contactName, '請填寫聯絡人', flag);
  flag = checkForm(form.description, '請填寫毛孩描述', flag);
  flag = checkForm(form.petTitle, '請填寫標題', flag);
  flag = fileLimitCheck(form.petImgs.files, 3, flag, 1);
  // formData
  const formData = new FormData();
  const userId = window.localStorage.getItem('user-id');
  // formData.append('userId', userId);
  formData.append('petId', petId);
  formData.append('status', form.status);
  formData.append('petTitle', form.petTitle);
  formData.append('kind', form.kind);
  formData.append('sex', form.sex);
  formData.append('age', form.age);
  formData.append('neuter', form.neuter);
  formData.append('county', form.county);
  formData.append('petColor', form.petColor);
  formData.append('petName', form.petName);
  formData.append('description', form.description);
  formData.append('microchip', form.microchip);
  formData.append('limitation', form.limitation);
  formData.append('contactName', form.contactName);
  formData.append('contactMethod', form.contactMethod);

  if (form.petImgs.files.length > 0) {
    const fileAppend = new Promise(function(resolve, reject) {
      let loaded = 0;
      for (let i = 0; i < form.petImgs.files.length; i++) {
        petImg = new File([form.petImgs.files[i]], `${userId}_${Date.now()}.jpg`, {type: 'image/jpeg'});
        const canvasBlob = compressFile(petImg);
        canvasBlob.then(function(blob) {
          loaded++;
          const myFile = blobToFile(blob, `${userId}_${Date.now()}.jpg`);
          formData.append('petImgs', myFile);
          if (loaded === form.petImgs.files.length) resolve(formData);
        }, function(err) {
          reject(err);
        });
      }
    });
    if (flag) {
      app.get('.adoption-wrap .lds-dual-ring-2').style.display = 'flex';
      app.get('.warning-msg').style.display = 'none';
      fileAppend.then(function(formData) {
        app.ajaxFormData('api/user/updateAdoption', formData, function(req) {
          if (req.status === 500) {
            app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
          } else window.location.href = './member?edit';
        });
      });
    }
  } else if (form.petImgs.files.length === 0) {
    if (flag) {
      app.get('.adoption-wrap .lds-dual-ring-2').style.display = 'flex';
      app.get('.warning-msg').style.display = 'none';
      app.ajaxFormData('api/user/updateAdoption', formData, function(req) {
        if (req.status === 500) {
          app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
          app.get('.lds-dual-ring-2').style.display = 'none';
        } else window.location.href = './member?edit';
        app.get('.lds-dual-ring-2').style.display = 'none';
      });
    }
  }
}

function getAdoptionForm() {
  const form = {};
  form.petTitle = app.get('.adoption-info input.title').value;
  form.petImgs = app.get('.pet-img');
  form.kind = app.get('.adoption-info input[name="kind"]:checked').value;
  form.sex = app.get('.adoption-info input[name="sex"]:checked').value;
  form.age = app.get('.adoption-info input[name="age"]:checked').value;
  form.neuter = app.get('.adoption-info input[name="neuter"]:checked').value;
  form.county = app.get('.adoption-info select').value;
  form.petColor = app.get('.adoption-info input.pet-color').value;
  form.petName = app.get('.adoption-info input.pet-name').value;
  form.description = app.get('.adoption-info .description').value;
  form.microchip = app.get('.adoption-info .pet-microchip').value;
  const limitation = [];
  const limitationChecked = document.querySelectorAll('.limitation');
  for (let i = 0; limitationChecked[i]; i++) {
    if (limitationChecked[i].checked) limitation.push(limitationChecked[i].value);
  }
  form.limitation = limitation;
  form.contactName = app.get('.adoption-info input.contact-name').value;
  form.contactMethod = app.get('.adoption-info input.contact-method').value;
  return form;
}
function getAttentionList() {
  app.ajax('GET', 'api/user/getAttentionList', '', {'Authorization': `Bearer ${window.localStorage.getItem('auth')}`}, function(req) {
    const data = JSON.parse(req.responseText).data;

    const itemList = app.get('.attention-wrap .item-list');
    if (data.length === 0) app.createElement('div', {atrs: {className: 'null-msg', innerHTML: '目前無任何關注的毛孩喔！'}}, itemList);
    else {
      data.forEach(function(ele) {
        const item = app.createElement('div', {atrs: {className: `item item_${ele.pet_id}`}}, itemList);
        let petImg;
        if (ele.db === 3) petImg = app.createElement('img', {atrs: {className: 'pet-img', src: `${app.s3}/pet-img/${ele.image[0]}`}}, item);
        else {
          if (ele.image[0] === '') petImg = app.createElement('img', {atrs: {className: 'pet-img', src: './imgs/pet-null-small.png'}}, item);
          else petImg = app.createElement('img', {atrs: {className: 'pet-img', src: `${ele.image[0]}`}}, item);
        }
        petImg.addEventListener('click', function() {
          app.get('.pet-details').style.display = 'block';
          app.loadPetDetails(ele.pet_id);
        });
        const smallWrap = app.createElement('div', {atrs: {className: 'small-wrap'}}, item);
        if (!ele.title) app.createElement('h4', {atrs: {innerHTML: `在收容所待 ${app.dateConversion(ele.opendate)} 天，可以帶我回家嗎？`}}, smallWrap);
        else app.createElement('h4', {atrs: {innerHTML: ele.title}}, smallWrap);
        const statusWrap = app.createElement('div', {atrs: {className: 'status-wrap'}}, smallWrap);
        const statusLight = app.createElement('div', {atrs: {className: 'status-light'}}, statusWrap);
        statusLight.style.background = statusColor(ele.status);
        app.createElement('div', {atrs: {className: 'status-text', innerHTML: `${statusText(ele.status)}`}}, statusWrap);
        app.createElement('img', {atrs: {className: 'sex-icon', src: `./imgs/${ele.sex === 'F' ? 'female.png' : 'male.png'}`}}, statusWrap);
        // let edit = app.createElement('img', { atrs: { src: './imgs/edit.png', className: 'edit' } }, item);
        // edit.addEventListener('click', function () { getAdoption(data[i].id, data[i]) });
        const remove = app.createElement('img', {atrs: {src: './imgs/remove.png', className: 'remove'}}, item);
        remove.addEventListener('click', function() {
          deleteAttention(ele.pet_id);
        });
        app.createElement('div', {atrs: {className: `line line_${ele.pet_id}`}}, itemList);
      });
    }
  });
}
function deleteAttention(petId) {
  if (confirm('確定要刪除嗎？')) {
    const userId = Number.parseInt(window.localStorage.getItem('user-id'));
    app.ajax('POST', 'api/user/deleteAttention', {petId, userId}, {}, function(req) {
      const msg = app.get('.attention-wrap .msg');
      msg.style.display = 'block';
      if (req.status === 500) msg.innerHTML = '伺服器錯誤，請稍後再試';
      else {
        msg.innerHTML = '刪除成功！';
        app.get(`.attention-wrap .item-list .item_${petId}`).remove();
        app.get(`.line_${petId}`).remove();
      }
    });
  } else {
    // 取消
  }
}

function getMessageList() {
  app.ajax('GET', 'api/user/getMessageList', '', {'Authorization': `Bearer ${window.localStorage.getItem('auth')}`}, function(req) {
    console.log('data', req.responseText);

    const data = JSON.parse(req.responseText).data;
    const userId = Number.parseInt(window.localStorage.getItem('user-id'));
    const itemList = app.get('.message-wrap .item-list ');
    if (data.length === 0) app.createElement('div', {atrs: {className: 'null-msg', innerHTML: '目前無任何留言喔！'}}, itemList);
    data.forEach(function(ele) {
      const item = app.createElement('div', {atrs: {className: `item item_${ele.id}`}}, itemList);
      const petImg = app.createElement('img', {atrs: {className: 'pet-img', src: `${app.s3}/pet-img/${ele.image[0]}`}}, item);
      petImg.addEventListener('click', function() {
        app.get('.pet-details').style.display = 'block';
        app.loadPetDetails(ele.pet_id);
      });
      const smallWrap = app.createElement('div', {atrs: {className: 'small-wrap'}}, item);
      app.createElement('h4', {atrs: {innerHTML: ele.title}}, smallWrap);
      const statusWrap = app.createElement('div', {atrs: {className: 'status-wrap'}}, smallWrap);
      app.createElement('div', {atrs: {className: 'message', innerHTML: `${ele.msg.substring(0, 5)}...`}}, statusWrap);
      app.createElement('div', {atrs: {className: 'contactName', innerHTML: `${ele.senderId === userId ? `to ${ele.receiver_name}` : `from ${ele.sender_name}`}`}}, statusWrap);
      const timeWrap = app.createElement('div', {atrs: {className: 'time-wrap'}}, smallWrap);
      app.createElement('img', {atrs: {className: 'arrow-img', src: `${ele.senderId === userId ? './imgs/arrow-right.png' : './imgs/arrow-left.png'}`}}, timeWrap);
      app.createElement('div', {atrs: {className: 'time', innerHTML: ` at ${new Date(ele.createTime).toLocaleString()}`}}, timeWrap);
      const view = app.createElement('img', {atrs: {className: 'view', src: './imgs/view.png'}}, item);
      view.addEventListener('click', function() {
        messageView(userId, ele.pet_id, ele.sender_id, ele.receiver_id);
      });
      app.createElement('div', {atrs: {className: `line line_${ele.id}`}}, itemList);
    });
  });
}
function messageView(userId, petId, senderId) {
  app.ajax('GET', 'api/user/getMessage', `petId=${petId}`, {'Authorization': `Bearer ${window.localStorage.getItem('auth')}`}, function(req) {
    console.log(req.responseText);

    const data = JSON.parse(req.responseText).data;
    console.log('test:::::;', data[0]);

    const chatWrap = app.get('.chat-wrap');
    chatWrap.style.display = 'flex';
    const contentWrap = app.createElement('div', {atrs: {className: 'content-wrap'}}, app.get('.content-parent'));
    app.get('.chat-wrap .subtitle').innerHTML = `${senderId === userId ? `和${data[0].receiver_name}的對話` : `和${data[0].sender_name}的對話`}`;
    app.get('.message-wrap').style.display = 'none'; // 讓前一頁的訊息列表
    data.forEach(function(ele) {
      if (ele.sender_id === userId) { // 我自己的訊息
        const rightMessage = app.createElement('div', {atrs: {className: 'right-message'}}, contentWrap);
        if (ele.sender_picture === null) app.createElement('img', {atrs: {className: 'header', src: './imgs/login_big.jpg'}}, rightMessage);
        else if (ele.sender_picture.substring(0, 4) === 'http') app.createElement('img', {atrs: {className: 'header', innerHTML: `${ele.sender_picture}`}}, rightMessage);
        else app.createElement('img', {atrs: {className: 'header', src: `${app.s3}/user-pic/${ele.sender_picture}`}}, rightMessage);
        app.createElement('div', {atrs: {className: 'content', innerHTML: `${ele.msg}`}}, rightMessage);
        app.createElement('div', {atrs: {className: 'time', innerHTML: `${new Date(ele.createTime).toLocaleString()}`}}, rightMessage);
      } else if (ele.receiver_id === userId) {
        const leftMessage = app.createElement('div', {atrs: {className: 'left-message'}}, contentWrap);
        if (ele.sender_picture === null) app.createElement('img', {atrs: {className: 'header', src: './imgs/login_big.jpg'}}, leftMessage);
        else if (ele.sender_picture.substring(0, 4) === 'http') app.createElement('img', {atrs: {className: 'header', innerHTML: `${ele.sender_picture}`}}, leftMessage);
        else app.createElement('img', {atrs: {className: 'header', src: `${app.s3}/user-pic/${ele.sender_picture}`}}, leftMessage);
        app.createElement('div', {atrs: {className: 'content', innerHTML: `${ele.msg}`}}, leftMessage);
        app.createElement('div', {atrs: {className: 'time', innerHTML: `${new Date(ele.createTime).toLocaleString()}`}}, leftMessage);
      }
    });
    contentWrap.scrollTop = contentWrap.scrollHeight; // 捲軸才會在最底下
    app.get('img.lastPage').addEventListener('click', function() {
      chatWrap.style.display = 'none';
      app.get('.message-wrap').style.display = 'flex';
      contentWrap.remove();
    });
    const sendMessageBtn = app.get('.chat-wrap .btn-wrap');
    if (data[0].sender_id === userId) sendMessageBtn.setAttribute('class', `btn-wrap petId_${data[0].pet_id} receiverId_${data[0].receiver_id} receiverName_${data[0].receiver_name}`);
    else if (data[0].receiver_id === userId) {
      sendMessageBtn.setAttribute('class', `btn-wrap petId_${data[0].pet_id} receiverId_${data[0].sender_id} receiverName_${data[0].sender_name}`);
    }
    sendMessageBtn.addEventListener('click', memberSendMessage);
  });
}
function memberSendMessage() {
  const classNames = this.className.split(' ');
  const msgInput = app.get('.chat-wrap .msg-input');
  let message = msgInput.value;
  const senderId = Number.parseInt(window.localStorage.getItem('user-id'));
  const senderName = window.localStorage.getItem('name');
  const receiverId = Number.parseInt(classNames[2].replace('receiverId_', ''));
  const receiverName = classNames[3].replace('receiverName_', '');
  const petId = classNames[1].replace('petId_', '');
  message = message.replace(/\r\n|\n/g, '');
  if (!message) {
    msgInput.placeholder = '傳點訊息吧！';
    msgInput.classList.add('error');
  } else if (message) {
    const createTime = new Date().getTime();
    app.ajax('POST', 'api/user/sendMessage', {senderId, receiverId, petId, message, senderName, receiverName, createTime}, {}, function(req) {
      console.log(req.responseText);

      if (req.status === 500) app.get('.chat-wrap .error-msg').innerHTML = '伺服器錯誤，請稍後再試';
      else {
        msgInput.classList.remove('error');
        msgInput.value = ''; // 清空訊息
        const contentWrap = app.get('.content-wrap');
        const rightMessage = app.createElement('div', {atrs: {className: 'right-message'}}, contentWrap);
        const picture = window.localStorage.getItem('picture');
        if (picture === null) app.createElement('img', {atrs: {className: 'header', src: './imgs/login_big.jpg'}}, rightMessage);
        else if (picture.substring(0, 4) === 'http') app.createElement('img', {atrs: {className: 'header', innerHTML: `${picture}`}}, rightMessage);
        else app.createElement('img', {atrs: {className: 'header', src: `${app.s3}/user-pic/${picture}`}}, rightMessage);
        app.createElement('div', {atrs: {className: 'content', innerHTML: `${message}`}}, rightMessage);
        app.createElement('div', {atrs: {className: 'time', innerHTML: `${new Date(createTime).toLocaleString()}`}}, rightMessage);
        contentWrap.scrollTop = contentWrap.scrollHeight;
      }
    });
  }
}
