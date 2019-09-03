app.get('.login').addEventListener('click', function () {
    app.get('.login-page').style.display = 'block';
});
// 登入註冊切換
app.get('.change-signup').addEventListener('click', function () {
    app.get('.login-page').style.display = 'none';
    app.get('.signup-page').style.display = 'block';
});
app.get('.change-login').addEventListener('click', function () {
    app.get('.login-page').style.display = 'block';
    app.get('.signup-page').style.display = 'none';
});
// 關閉按鈕
app.get('.close.signup').addEventListener('click', function () {
    app.get('.signup-page').style.display = 'none';
});
app.get('.close.login').addEventListener('click', function () {
    app.get('.login-page').style.display = 'none';
});
// button click
app.get('.signup-page input.password').addEventListener('keyup', function () {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        app.get('.signup-page button').click();
    }
});
app.get('.login-page input.password').addEventListener('keyup', function () {
    if (event.keyCode === 13) {
        event.preventDefault();
        app.get('.login-page button').click();
    }
});
// for user page
function signup() {
    let email = app.get('.signup-page .email').value;
    let password = app.get('.signup-page .password').value;
    if (!email) {
        app.get('.signup-page .message').innerHTML = '請輸入帳號';
        app.get('.signup-page .message').style.opacity = '1';
    }
    else if (!password) {
        app.get('.signup-page .message').innerHTML = '請輸入密碼';
        app.get('.signup-page .message').style.opacity = '1';
    }
    else {
        // app.get('.signup-page .message').style.opacity = '0';
        app.get('.signup-page .message').style.opacity = '1';
        app.ajax('POST', 'api/user/signup', { email, password }, {}, function (req) {
            if (req.status === 406) {
                app.get('.signup-page .message').innerHTML = '已有此電子信箱';
                // app.get('.signup-page .message').style.opacity = '1';
            } else if (req.status === 500) {
                app.get('.signup-page .message').innerHTML = '伺服器錯誤，請稍後再試';
                // app.get('.signup-page .message').style.opacity = '1';
            }
            else {
                app.get('.signup-page .message').innerHTML = '註冊成功';
                app.get('.signup-page').style.display = 'none';
                window.location.href = 'adoption?kind=all&paging=0';
            }
        });

    }
}
function login() {
    let email = app.get('.login-page .email').value;
    let password = app.get('.login-page .password').value;
    let provider = 'native';
    if (!email) {
        app.get('.login-page .message').innerHTML = '請輸入帳號';
        app.get('.login-page .message').style.opacity = '1';
    }
    else if (!password) {
        app.get('.login-page .message').innerHTML = '請輸入密碼';
        app.get('.login-page .message').style.opacity = '1';
    }
    else {
        app.ajax('POST', 'api/user/login', { email, password, provider }, {}, function (req) {
            app.get('.login-page .message').style.opacity = '1';
            if (req.status === 406) {
                app.get('.login-page .message').innerHTML = '帳號密碼錯誤';
            } else if (req.status === 500) {
                app.get('.login-page .message').innerHTML = '伺服器錯誤，請稍後再試';
                // app.get('.signup-page .message').style.opacity = '1';
            }
            else {
                app.get('.login-page .message').innerHTML = '登入成功';
                app.get('.login-page').style.display = 'none';
                window.location.href = 'adoption?kind=all&paging=0';
            }
        });
    }
}
