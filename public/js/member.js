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

    if (user.picture) {
        app.get('.left-profile img').src = user.picture;
    }
    if (user.name) {
        app.get('.left-name').innerHTML = user.name;
        app.get('.personal-info input.name').placeholder = user.name;
    }
    if (user.phone) {
        app.get('.personal-info input.phone').placeholder = user.phone;
    }
    if (user.picture) {
        if (user.picture.substring(0, 5) === 'https')
            app.get('.left-profile img').src = user.picture;
        else app.get('.left-profile img').src = `./user-pic/${user.picture}`;
    }
    app.get('.login-info p').innerHTML = user.email;
    app.get('.login-info #user-id').innerHTML = user.id;
});
function initMenu(menu) {
    let change = app.get('.menu .change');
    let adopt = app.get('.menu .adopt');
    if (menu === 'profile') {
        change.classList.add('active');
        app.get('.info-wrap').style.display = 'flex';
    }
    else if (menu === 'adoption') {
        adopt.classList.add('active');
        app.get('.adoption-wrap').style.display = 'flex';
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
    let inputPhone = app.get('.personal-info input.phone').value;
    let uploadImg = app.get('.upload-img').files[0];
    let id = app.get('#user-id').innerHTML;
    if (inputName || inputPhone || uploadImg) {
        let formData = new FormData();
        if (uploadImg) {
            uploadImg = new File([uploadImg], id + ".jpg", { type: "image/jpeg" });
            formData.append('upload-img', uploadImg);
        }
        if (inputName) formData.append('inputName', inputName);
        if (inputPhone) formData.append('inputPhone', inputPhone);
        formData.append('userId', id);
        app.ajaxFormData('api/user/update', formData, function (req) {
            if (req.status === 500) console.log(`error happen: error code is ${req.status}`);
            else {
                if (uploadImg) window.localStorage.setItem('picture', uploadImg.name);
                location.reload('member');
            }
        });
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
    flag = checkForm(description, '請填寫寵物描述', flag);
    flag = checkForm(petTitle, '請填寫標題', flag);
    flag = fileLimitCheck(petImgs.files, 3, flag);
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
    for (let i = 0; i < petImgs.files.length; i++) {
        petImg = new File([petImgs.files[i]], `${userId}_${Date.now()}.jpg`, { type: "image/jpeg" });
        formData.append('petImgs', petImg);
    }
    if (flag) {
        app.get('.warning-msg').style.display = 'none';
        app.ajaxFormData('api/user/postPet', formData, function (req) {
            if (req.status === 500) {
                app.get('.warning-msg').innerHTML = '伺服器錯誤，請稍後再試';
            }
            else window.location.href = './adoption?kind=all&paging=0';
        });
    }
}
function fileLimitCheck(files, max, flag) {
    let warningMsg = app.get('.warning-msg');
    if (files.length > max) {
        flag = false;
        warningMsg.innerHTML = `上傳寵物的照片不得超過 ${max} 張`;
    }
    if (files.length === 0) {
        flag = false;
        warningMsg.innerHTML = '請至少上傳 1 張寵物的照片';
    }
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