let menu = window.location.search.replace('?', '');

// Load member.pug 時，去拿 user 的資料
app.ajax('GET', 'api/user/profile', '', { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {
    // token 無效或過期，要重新登入
    if (req.status !== 200) {
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('picture');
        window.localStorage.removeItem('provider');
        window.localStorage.removeItem('user-id');
        window.location.href = './'; // 否則 .html 會一直重新導向，測試完要拿掉註解
    }
    let user = JSON.parse(req.responseText).user;
    console.log(user);

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
        if (user.picture.substring(0, 4) === 'http')
            app.get('.left-profile img').src = user.picture;
        else app.get('.left-profile img').src = `${app.s3}/user-pic/${user.picture}`;
    }
    app.get('.login-info p').innerHTML = user.email;
    app.get('.login-info #user-id').innerHTML = user.id;

    window.localStorage.setItem('name', user.name);
});
function initMenu(menu) {
    let change = app.get('.menu .change');
    let adopt = app.get('.menu .adopt');
    let edit = app.get('.menu .edit');
    let message = app.get('.menu .message');
    let attention = app.get('.menu .attention');
    if (menu === 'profile') {
        change.classList.add('active');
        app.get('.profile-wrap').style.display = 'flex';
    }
    else if (menu === 'adoption') {
        adopt.classList.add('active');
        app.get('.adoption-wrap').style.display = 'flex';
        app.get('button.adoption-btn').addEventListener('click', adoptionPost);
        app.get('button.adoption-btn').removeEventListener('click', updateAdoption);
    }
    else if (menu === 'edit') {
        edit.classList.add('active');
        app.get('.edit-wrap').style.display = 'block';
        getAdoptionList();
        app.get('button.adoption-btn').removeEventListener('click', adoptionPost);
    }
    else if (menu === 'attention') {
        attention.classList.add('active');
        app.get('.attention-wrap').style.display = 'block';
        getAttentionList();
    }
    else if (menu === 'message') {
        message.classList.add('active');
        app.get('.message-wrap').style.display = 'block';
        getMessageList();
    }

}
initMenu(menu);
// logout setting
logout();
function logout() {
    app.get('.logout').addEventListener('click', function () {
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('picture');
        window.localStorage.removeItem('provider');
        window.localStorage.removeItem('user-id');
        if (window.localStorage.getItem('provider') === 'facebook') {
            FB.api('/me/permissions', 'delete', function (res) {
            });
        }
        // window.location.href = 'adoption?kind=all&paging=0';
    });
}

function updateProfile() {
    let inputName = app.get('.personal-info input.name').value;
    let inputContactMethod = app.get('.personal-info input.phone').value;
    let uploadImg = app.get('.upload-img').files[0];
    let id = app.get('#user-id').innerHTML;
    let fileAppend;
    if (inputName || inputContactMethod || uploadImg) {
        let formData = new FormData();
        if (uploadImg) {
            uploadImg = new File([uploadImg], id + ".jpg", { type: "image/jpeg" });
            // formData.append('upload-img', uploadImg);
            fileAppend = new Promise(function (resolve, reject) {
                let canvasBlob = compressFile(uploadImg);
                canvasBlob.then(function (blob) {
                    let myFile = blobToFile(blob, `${id}.jpg`);
                    formData.append('upload-img', myFile);
                    resolve(formData);
                }).catch(function (err) {
                    // nothing
                });
            });
        }
        if (inputName) formData.append('inputName', inputName);
        if (inputContactMethod) formData.append('inputContactMethod', inputContactMethod);
        formData.append('userId', id);
        if (uploadImg) {
            fileAppend.then(function (formData) {
                app.ajaxFormData('api/user/update', formData, function (req) {
                    if (req.status === 500) console.log(`error happen: error code is ${req.status}`);
                    else {
                        if (uploadImg) window.localStorage.setItem('picture', uploadImg.name);
                        location.reload('member');
                    }
                });
            });
        }
        else {
            app.ajaxFormData('api/user/update', formData, function (req) {
                if (req.status === 500) console.log(`error happen: error code is ${req.status}`);
                else {
                    if (uploadImg) window.localStorage.setItem('picture', uploadImg.name);
                    location.reload('member');
                }
            });
        }
    }
}
function adoptionPost() {
    let flag = true;
    let petTitle = app.get('.adoption-info input.title').value;
    let petImgs = app.get('.pet-img');
    let kind = app.get('.adoption-info input[name="kind"]:checked').value;
    let sex = app.get('.adoption-info input[name="sex"]:checked').value;
    let age = app.get('.adoption-info input[name="age"]:checked').value;
    let neuter = app.get('.adoption-info input[name="neuter"]:checked').value;
    let county = app.get('.adoption-info select').value;
    let petColor = app.get('.adoption-info input.pet-color').value;
    let petName = app.get('.adoption-info input.pet-name').value;
    let description = app.get('.adoption-info .description').value;
    let microchip = app.get('.adoption-info .pet-microchip').value;
    let limitation = [];
    let limitationChecked = document.querySelectorAll('.limitation');
    for (let i = 0; limitationChecked[i]; i++) {
        if (limitationChecked[i].checked) limitation.push(limitationChecked[i].value);
    }
    let contactName = app.get('.adoption-info input.contact-name').value;
    let contactMethod = app.get('.adoption-info input.contact-method').value;

    // checkForm
    flag = checkForm(contactMethod, '請填寫聯絡方式', flag);
    flag = checkForm(contactName, '請填寫聯絡人', flag);
    flag = checkForm(description, '請填寫毛孩的描述', flag);
    flag = checkForm(petTitle, '請填寫標題', flag);
    flag = fileLimitCheck(petImgs.files, 3, flag, 0);
    // formData
    let formData = new FormData();
    let userId = window.localStorage.getItem('user-id');
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
    let fileAppend = new Promise(function (resolve, reject) {
        let loaded = 0;
        for (let i = 0; i < petImgs.files.length; i++) {
            petImg = new File([petImgs.files[i]], `${userId}_${Date.now()}.jpg`, { type: "image/jpeg" });
            let canvasBlob = compressFile(petImg);
            canvasBlob.then(function (blob) {
                loaded++;
                let myFile = blobToFile(blob, `${userId}_${Date.now()}.jpg`);
                formData.append('petImgs', myFile);
                if (loaded === petImgs.files.length) resolve(formData);
            }, function (err) {
                // console.log(err);
                // formData.append('petImgs', petImg);
            });

        }

    });

    if (flag) {
        app.get('.warning-msg').style.display = 'none';
        fileAppend.then(function (formData) {
            app.ajaxFormData('api/user/postAdoption', formData, function (req) {
                if (req.status === 500) {
                    app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
                }
                else window.location.href = './member?edit';
                console.log(userId);
            });
        });

    }
}
function blobToFile(theBlob, fileName) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    var file = new File([theBlob], fileName, { type: 'image/jpg', lastModified: Date.now() });
    return file;
}
function fileLimitCheck(files, max, flag, update) {
    let warningMsg = app.get('.warning-msg');

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
    let warningMsg = app.get('.warning-msg');
    if (!value) {
        warningMsg.style.display = 'block';
        warningMsg.innerHTML = msg;
        flag = false;
    }
    return flag;
}
function printFormData(formData) {
    // Display the key/value pairs
    for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
    }
}

// jQuery 壓縮圖片
function compressFile(file) {
    return new Promise(function (resolve, reject) {
        let compressRatio = 0.8; // 圖片壓縮比例
        let imgNewWidth = 400; // 圖片新寬度
        let fileReader = new FileReader();
        let img = new Image();
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d"); // 返回一個用於在畫布上繪圖的環境
        fileReader.onload = function (e) {
            dataUrl = e.target.result;
            // 取得圖片
            img.src = dataUrl;
        }; //於讀取完成時觸發
        fileReader.readAsDataURL(file);
        // 圖片載入後
        img.onload = function () {
            let width = this.width; // 圖片原始寬度
            let height = this.height; // 圖片原始高度
            let imgNewHeight = imgNewWidth * height / width; // 圖片新高度
            // 使用 canvas 調整圖片寬高
            canvas.width = imgNewWidth;
            canvas.height = imgNewHeight;
            context.clearRect(0, 0, imgNewWidth, imgNewHeight);

            // 調整圖片尺寸
            context.drawImage(img, 0, 0, imgNewWidth, imgNewHeight);


            // canvas 轉換為 blob 格式、上傳

            canvas.toBlob(function (blob) {
                if (blob) resolve(blob);
                // 輸入上傳程式碼
            }, "image/jpg", compressRatio);
        };
    });

}

function getAdoptionList() {
    app.ajax('GET', 'api/user/getAdoptionList', '', { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {
        let data = JSON.parse(req.responseText).data;
        console.log('getAdoptionList', data);

        let itemList = app.get('.edit-wrap .item-list ');
        if (data.length === 0) app.createElement('div', { atrs: { className: 'null-msg', innerHTML: '目前無任何送養的紀錄喔！' } }, itemList);
        for (let i = 0; i < data.length; i++) {
            let item = app.createElement('div', { atrs: { className: `item item_${data[i].id}` } }, itemList);
            let petImg = app.createElement('img', { atrs: { className: 'pet-img', src: `${app.s3}/pet-img/${data[i].image[0]}` } }, item);
            petImg.addEventListener('click', function () {
                app.get('.pet-details').style.display = 'block';
                app.loadPetDetails(data[i].id);
            });
            let smallWrap = app.createElement('div', { atrs: { className: 'small-wrap' } }, item);
            app.createElement('h4', { atrs: { innerHTML: data[i].title } }, smallWrap);
            let statusWrap = app.createElement('div', { atrs: { className: 'status-wrap' } }, smallWrap);
            let statusLight = app.createElement('div', { atrs: { className: 'status-light' } }, statusWrap);
            statusLight.style.background = statusColor(data[i].status);
            app.createElement('div', { atrs: { className: 'status-text', innerHTML: `${statusText(data[i].status)}` } }, statusWrap);
            app.createElement('img', { atrs: { className: 'sex-icon', src: `./imgs/${data[i].sex === 'F' ? 'female.png' : 'male.png'}` } }, statusWrap)
            let edit = app.createElement('img', { atrs: { src: './imgs/edit.png', className: 'edit' } }, item);
            edit.addEventListener('click', function () { getAdoption(data[i].id, data[i]); });
            let remove = app.createElement('img', { atrs: { src: './imgs/remove.png', className: 'remove' } }, item);
            remove.addEventListener('click', function () { deleteAdoption(data[i].id); });
            app.createElement('div', { atrs: { className: `line line_${data[i].id}` } }, itemList);
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
    if (confirm("確定要刪除嗎？")) {
        app.ajax('POST', 'api/user/deleteAdoption', { petId }, {}, function (req) {
            let msg = app.get('.edit-wrap .msg');
            msg.style.display = 'block';
            console.log(req.responseText, req.status);

            if (req.status === 500) msg.innerHTML = '伺服器錯誤，請稍後再試';
            else {
                msg.innerHTML = '刪除成功！';
                app.get(`.edit-wrap .item-list .item_${petId}`).remove();
                app.get(`.line_${petId}`).remove();
            }
        });
    }
    else {
        // 取消
    }
}
function getAdoption(petId, data) {
    app.get('.adoption-wrap .status-radio').style.display = 'flex';
    if (data.status === 2) app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(4)').checked = true;
    else if (data.status === 1) app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(3)').checked = true;
    else app.get('.adoption-wrap .status-radio input[type=radio]:nth-child(2)').checked = true;
    let adoptionWrap = app.get('.adoption-wrap');
    app.get('.adoption-wrap .title-wrap').innerHTML = '編輯送養紀錄';
    app.get('.adoption-wrap .subtitle-wrap').innerHTML = '編輯毛孩的基本資料，請務必詳實填寫';
    app.get('.adoption-wrap').style.display = 'flex';
    app.get('.edit-wrap').style.display = 'none';
    let lastPage = app.createElement('img', { atrs: { className: 'lastPage', src: './imgs/lastPage.png' } }, adoptionWrap);
    let imgWrap = app.get('.img-wrap');
    data.image.forEach(function (ele) {
        app.createElement('img', { atrs: { className: 'img-preview', src: `${app.s3}/pet-img/${ele}` } }, imgWrap);
    });
    app.get('.adoption-wrap label.btn.btn-info i').innerHTML = '重傳毛孩的照片';
    app.get('.adoption-info .title').value = data.title;
    app.get(`.adoption-info input[type=radio]:nth-child(${data.kind === '狗' ? 2 : 3})`).checked = true;
    if (data.sex === 'M') app.get(`.adoption-info input[type=radio]:nth-child(5)`).checked = true;
    else if (data.sex === 'F') app.get(`.adoption-info input[type=radio]:nth-child(5)`).checked = true;
    else app.get(`.adoption-info input[type=radio]:nth-child(7)`).checked = true;
    app.get(`.adoption-info input[type=radio]:nth-child(${data.age === 'C' ? 9 : 10})`).checked = true;
    app.get(`.adoption-info input[type=radio]:nth-child(${data.age === 'F' ? 12 : 13})`).checked = true;
    app.get('.adoption-info select').value = data.county;
    if (data.color !== 'null') app.get('.adoption-info .pet-color').value = data.color;
    if (data.petName !== 'null') app.get('.adoption-info .pet-name').value = data.petName;
    app.get('.adoption-info .description').value = data.description;
    if (data.microchip !== 'null') app.get('.adoption-info .pet-microchip').value = data.microchip;
    app.getAll('.adoption-info .requirement input').forEach(function (ele) { ele.checked = false }); // 歸零
    if (data.limitation[0] !== "") data.limitation.forEach(function (ele) { app.get(`.adoption-wrap .requirement input[value=${ele}]`).checked = true; });
    app.get('.adoption-info .contact-name').value = data.contactName;
    app.get('.adoption-info .contact-method').value = data.contactMethod;
    // update adoption setting
    let updateButton = app.get('button.adoption-btn')
    // updateButton.innerHTML = '送養更新';
    // updateButton.removeEventListener('click', adoptionPost);
    updateButton.addEventListener('click', function () { updateAdoption(petId) });
    // last page setting
    lastPage.addEventListener('click', function () {
        app.get('.adoption-wrap').style.display = 'none';
        app.get('.edit-wrap').style.display = 'block';
        let imgPreview = app.getAll('.img-wrap .img-preview');
        imgPreview.forEach(function (ele) { ele.remove(); }); // clear up the element(s)
        app.get('.warning-msg').style.display = 'none';
    });

}
function updateAdoption(petId) {
    // console.log(petId);
    let flag = true;
    let form = getAdoptionForm();
    // checkForm
    form.status = app.get('.adoption-wrap .status-radio input[name="status"]:checked').value;
    flag = checkForm(form.contactMethod, '請填寫聯絡方式', flag);
    flag = checkForm(form.contactName, '請填寫聯絡人', flag);
    flag = checkForm(form.description, '請填寫毛孩描述', flag);
    flag = checkForm(form.petTitle, '請填寫標題', flag);
    flag = fileLimitCheck(form.petImgs.files, 3, flag, 1);
    // formData
    let formData = new FormData();
    let userId = window.localStorage.getItem('user-id');
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
        let fileAppend = new Promise(function (resolve, reject) {
            let loaded = 0;
            for (let i = 0; i < form.petImgs.files.length; i++) {
                petImg = new File([form.petImgs.files[i]], `${userId}_${Date.now()}.jpg`, { type: "image/jpeg" });
                let canvasBlob = compressFile(petImg);
                canvasBlob.then(function (blob) {
                    loaded++;
                    let myFile = blobToFile(blob, `${userId}_${Date.now()}.jpg`);
                    formData.append('petImgs', myFile);
                    if (loaded === form.petImgs.files.length) resolve(formData);
                }, function (err) {
                    // console.log(err);
                    // formData.append('petImgs', petImg);
                });
            }
        });
        if (flag) {
            app.get('.warning-msg').style.display = 'none';
            fileAppend.then(function (formData) {
                app.ajaxFormData('api/user/updateAdoption', formData, function (req) {
                    if (req.status === 500) {
                        app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
                    }
                    else window.location.href = './member?edit';
                });
            });
        }
    }
    else if (form.petImgs.files.length === 0) {
        if (flag) {
            app.get('.warning-msg').style.display = 'none';
            app.ajaxFormData('api/user/updateAdoption', formData, function (req) {
                if (req.status === 500) {
                    app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
                }
                else window.location.href = './member?edit';
            });
        }
    }

    // console.log(form.petImgs.files);
}

function getAdoptionForm() {
    let form = {};
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
    let limitation = [];
    let limitationChecked = document.querySelectorAll('.limitation');
    for (let i = 0; limitationChecked[i]; i++) {
        if (limitationChecked[i].checked) limitation.push(limitationChecked[i].value);
    }
    form.limitation = limitation;
    form.contactName = app.get('.adoption-info input.contact-name').value;
    form.contactMethod = app.get('.adoption-info input.contact-method').value;
    return form;
}
function getAttentionList() {
    app.ajax('GET', 'api/user/getAttentionList', '', { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {

        let data = JSON.parse(req.responseText).data;

        let itemList = app.get('.attention-wrap .item-list');
        if (data.length === 0) app.createElement('div', { atrs: { className: 'null-msg', innerHTML: '目前無任何關注的毛孩喔！' } }, itemList);
        else {
            data.forEach(function (ele) {
                let item = app.createElement('div', { atrs: { className: `item item_${ele.pet_id}` } }, itemList);
                let petImg;
                if (ele.db === 3) petImg = app.createElement('img', { atrs: { className: 'pet-img', src: `${app.s3}/pet-img/${ele.image[0]}` } }, item);
                else {
                    if (ele.image[0] === "") petImg = app.createElement('img', { atrs: { className: 'pet-img', src: './imgs/pet-null-small.png' } }, item);
                    else petImg = app.createElement('img', { atrs: { className: 'pet-img', src: `${ele.image[0]}` } }, item);
                }
                petImg.addEventListener('click', function () {
                    app.get('.pet-details').style.display = 'block';
                    app.loadPetDetails(ele.pet_id);
                });
                let smallWrap = app.createElement('div', { atrs: { className: 'small-wrap' } }, item);
                if (!ele.title) app.createElement('h4', { atrs: { innerHTML: `在收容所待 ${app.dateConversion(ele.opendate)} 天，可以帶我回家嗎？` } }, smallWrap);
                else app.createElement('h4', { atrs: { innerHTML: ele.title } }, smallWrap);
                let statusWrap = app.createElement('div', { atrs: { className: 'status-wrap' } }, smallWrap);
                let statusLight = app.createElement('div', { atrs: { className: 'status-light' } }, statusWrap);
                statusLight.style.background = statusColor(ele.status);
                app.createElement('div', { atrs: { className: 'status-text', innerHTML: `${statusText(ele.status)}` } }, statusWrap);
                app.createElement('img', { atrs: { className: 'sex-icon', src: `./imgs/${ele.sex === 'F' ? 'female.png' : 'male.png'}` } }, statusWrap);
                // let edit = app.createElement('img', { atrs: { src: './imgs/edit.png', className: 'edit' } }, item);
                // edit.addEventListener('click', function () { getAdoption(data[i].id, data[i]) });
                let remove = app.createElement('img', { atrs: { src: './imgs/remove.png', className: 'remove' } }, item);
                remove.addEventListener('click', function () {
                    deleteAttention(ele.pet_id);
                });
                app.createElement('div', { atrs: { className: `line line_${ele.pet_id}` } }, itemList);
            });
        }
    });
}
function deleteAttention(petId) {
    if (confirm("確定要刪除嗎？")) {
        let userId = Number.parseInt(window.localStorage.getItem('user-id'));
        app.ajax('POST', 'api/user/deleteAttention', { petId, userId }, {}, function (req) {
            let msg = app.get('.attention-wrap .msg');
            msg.style.display = 'block';
            if (req.status === 500) msg.innerHTML = '伺服器錯誤，請稍後再試';
            else {
                msg.innerHTML = '刪除成功！';
                app.get(`.attention-wrap .item-list .item_${petId}`).remove();
                app.get(`.line_${petId}`).remove();
            }
        });
    }
    else {
        // 取消
    }
}

function getMessageList() {
    app.ajax('GET', 'api/user/getMessageList', '', { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {
        let data = JSON.parse(req.responseText).data;
        console.log(data);

        let userId = Number.parseInt(window.localStorage.getItem('user-id'));
        let itemList = app.get('.message-wrap .item-list ');
        if (data.length === 0) app.createElement('div', { atrs: { className: 'null-msg', innerHTML: '目前無任何訊息喔！' } }, itemList);
        data.forEach(function (ele) {
            let item = app.createElement('div', { atrs: { className: `item item_${ele.id}` } }, itemList);
            let petImg = app.createElement('img', { atrs: { className: 'pet-img', src: `${app.s3}/pet-img/${ele.image[0]}` } }, item);
            petImg.addEventListener('click', function () {
                app.get('.pet-details').style.display = 'block';
                app.loadPetDetails(ele.pet_id);
            });
            let smallWrap = app.createElement('div', { atrs: { className: 'small-wrap' } }, item);
            app.createElement('h4', { atrs: { innerHTML: ele.title } }, smallWrap);
            let statusWrap = app.createElement('div', { atrs: { className: 'status-wrap' } }, smallWrap);
            app.createElement('div', { atrs: { className: 'message', innerHTML: `${ele.msg.substring(0, 5)}...` } }, statusWrap);
            app.createElement('div', { atrs: { className: 'contactName', innerHTML: `${ele.sender_id === userId ? `to ${ele.receiver_name}` : `from ${ele.sender_name}`}` } }, statusWrap);
            let timeWrap = app.createElement('div', { atrs: { className: 'time-wrap' } }, smallWrap);
            app.createElement('img', { atrs: { className: 'arrow-img', src: `${ele.sender_id === userId ? './imgs/arrow-right.png' : './imgs/arrow-left.png'}` } }, timeWrap);
            app.createElement('div', { atrs: { className: 'time', innerHTML: ` at ${new Date(ele.createTime).toLocaleString()}` } }, timeWrap);
            let view = app.createElement('img', { atrs: { className: 'view', src: './imgs/view.png' } }, item);
            view.addEventListener('click', function () { messageView(userId, ele.pet_id, ele.sender_id, ele.receiver_id); });
            app.createElement('div', { atrs: { className: `line line_${ele.id}` } }, itemList);
        });
    });
}
function messageView(userId, petId, sender_id, receiver_id) {
    app.ajax('GET', 'api/user/getMessage', `petId=${petId}&senderId=${sender_id}&receiverId=${receiver_id}`, { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {
        let data = JSON.parse(req.responseText).data;

        let chatWrap = app.get('.chat-wrap');
        chatWrap.style.display = 'flex';
        let contentWrap = app.createElement('div', { atrs: { className: 'content-wrap' } }, app.get('.content-parent'));
        app.get('.chat-wrap .subtitle').innerHTML = `${sender_id === userId ? `和${data[0].receiver_name}的對話` : `和${data[0].sender_name}的對話`}`;
        app.get('.message-wrap').style.display = 'none'; // 讓前一頁的訊息列表
        data.forEach(function (ele, index) {
            console.log(index, ele);
            if (ele.sender_id === userId) { // 我自己的訊息
                let rightMessage = app.createElement('div', { atrs: { className: 'right-message' } }, contentWrap);
                if (ele.sender_picture === null) app.createElement('img', { atrs: { className: 'header', src: './imgs/login_big.jpg' } }, rightMessage);
                else if (ele.sender_picture.substring(0, 4) === 'http') app.createElement('img', { atrs: { className: 'header', innerHTML: `${ele.sender_picture}` } }, rightMessage);
                else app.createElement('img', { atrs: { className: 'header', src: `./user-pic/${ele.sender_picture}` } }, rightMessage);
                app.createElement('div', { atrs: { className: 'content', innerHTML: `${ele.msg}` } }, rightMessage);
                app.createElement('div', { atrs: { className: 'time', innerHTML: `${new Date(ele.createTime).toLocaleString()}` } }, rightMessage);
            }
            else if (ele.receiver_id === userId) {
                let leftMessage = app.createElement('div', { atrs: { className: 'left-message' } }, contentWrap);
                if (ele.sender_picture === null) app.createElement('img', { atrs: { className: 'header', src: './imgs/login_big.jpg' } }, leftMessage);
                else if (ele.sender_picture.substring(0, 4) === 'http') app.createElement('img', { atrs: { className: 'header', innerHTML: `${ele.sender_picture}` } }, leftMessage);
                else app.createElement('img', { atrs: { className: 'header', src: `./user-pic/${ele.sender_picture}` } }, leftMessage);
                app.createElement('div', { atrs: { className: 'content', innerHTML: `${ele.msg}` } }, leftMessage);
                app.createElement('div', { atrs: { className: 'time', innerHTML: `${new Date(ele.createTime).toLocaleString()}` } }, leftMessage);
            }
        });
        contentWrap.scrollTop = contentWrap.scrollHeight; // 捲軸才會在最底下
        app.get('img.lastPage').addEventListener('click', function () {
            chatWrap.style.display = 'none';
            app.get('.message-wrap').style.display = 'flex';
            contentWrap.remove();
        });
        let sendMessageBtn = app.get('.chat-wrap .btn-wrap');
        if (data[0].sender_id === userId) sendMessageBtn.setAttribute('class', `btn-wrap petId_${data[0].pet_id} receiverId_${data[0].receiver_id} receiverName_${data[0].receiver_name}`)
        else if (data[0].receiver_id === userId) sendMessageBtn.setAttribute('class', `btn-wrap petId_${data[0].pet_id} receiverId_${data[0].sender_id} receiverName_${data[0].sender_name}`)
        sendMessageBtn.addEventListener('click', memberSendMessage);
    });
}
function memberSendMessage() {
    let classNames = this.className.split(' ');
    let msgInput = app.get('.chat-wrap .msg-input');
    let message = msgInput.value;
    let sendMessageBtn = app.get('.chat-wrap .btn-wrap');
    let senderId = Number.parseInt(window.localStorage.getItem('user-id'));
    let senderName = window.localStorage.getItem('name');
    let receiverId = Number.parseInt(classNames[2].replace('receiverId_', ''));
    let receiverName = classNames[3].replace('receiverName_', '');
    let petId = classNames[1].replace('petId_', '');
    message = message.replace(/\r\n|\n/g, "");
    if (!message) {
        msgInput.placeholder = '傳點訊息吧！'
        msgInput.classList.add('error');
    }
    else if (message) {
        let createTime = new Date().getTime();
        app.ajax('POST', 'api/user/sendMessage', { senderId, receiverId, petId, message, senderName, receiverName, createTime }, {}, function (req) {
            if (req.status === 500) app.get('.chat-wrap .error-msg').innerHTML = '伺服器錯誤，請稍後再試';
            else {
                msgInput.classList.remove('error');
                msgInput.value = ''; // 清空訊息
                let contentWrap = app.get('.content-wrap');
                let rightMessage = app.createElement('div', { atrs: { className: 'right-message' } }, contentWrap);
                let picture = window.localStorage.getItem('picture');
                if (picture === null) app.createElement('img', { atrs: { className: 'header', src: './imgs/login_big.jpg' } }, rightMessage);
                else if (picture.substring(0, 4) === 'http') app.createElement('img', { atrs: { className: 'header', innerHTML: `${picture}` } }, rightMessage);
                else app.createElement('img', { atrs: { className: 'header', src: `./user-pic/${picture}` } }, rightMessage);
                app.createElement('div', { atrs: { className: 'content', innerHTML: `${message}` } }, rightMessage);
                app.createElement('div', { atrs: { className: 'time', innerHTML: `${new Date(createTime).toLocaleString()}` } }, rightMessage);
                contentWrap.scrollTop = contentWrap.scrollHeight;
            }
        });
    }
    // console.log(message, `我${senderId}`, `我${senderName}`, petId, receiverId, receiverName);
}
