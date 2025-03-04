/* eslint-disable max-len */
// 註冊登入或 profile 按鈕
// 因為要在調用 removeEventListener 確實抓到 loginEvent function
function memberEvent() {
  app.get('.login-page').style.display = 'block';
  app.get('.member p').innerHTML = '登入';
}
// 若沒有 auth(token)，使用者可開啟登入/註冊頁面
// 所以 token 過期後，要去清 localStorage
if (!window.localStorage.getItem('auth')) {
  app.get('.member').addEventListener('click', memberEvent);
} else if (window.localStorage.getItem('auth')) {
  app.get('.member p').innerHTML = '會員';
  app.get('.member').addEventListener('click', function() {
    window.location.href = 'member?profile';
  });
}
// 登入註冊切換
app.get('.change-signup').addEventListener('click', function() {
  app.get('.login-page').style.display = 'none';
  app.get('.signup-page').style.display = 'block';
});
app.get('.change-login').addEventListener('click', function() {
  app.get('.login-page').style.display = 'block';
  app.get('.signup-page').style.display = 'none';
});
// 關閉按鈕
app.get('.close.signup').addEventListener('click', function() {
  app.get('.signup-page').style.display = 'none';
});
app.get('.close.login').addEventListener('click', function() {
  app.get('.login-page').style.display = 'none';
});
// button click
app.get('.signup-page input.password').addEventListener('keyup', function() {
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    app.get('.signup-page button').click();
  }
});
app.get('.login-page input.password').addEventListener('keyup', function() {
  if (event.keyCode === 13) {
    event.preventDefault();
    app.get('.login-page button').click();
  }
});

// for user page
// eslint-disable-next-line no-unused-vars
function signup() {
  const name = app.get('.signup-page .name').value;
  const email = app.get('.signup-page .email').value;
  const password = app.get('.signup-page .password').value;

  if (!name) {
    app.get('.signup-page .message').innerHTML = '請輸入姓名';
    app.get('.signup-page .message').style.opacity = '1';
  } else if (!email) {
    app.get('.signup-page .message').innerHTML = '請輸入帳號';
    app.get('.signup-page .message').style.opacity = '1';
  } else if (!password) {
    app.get('.signup-page .message').innerHTML = '請輸入密碼';
    app.get('.signup-page .message').style.opacity = '1';
  } else {
    // app.get('.signup-page .message').style.opacity = '0';
    app.get('.signup-page .message').style.opacity = '1';
    app.ajax('POST', 'api/user/signup', {name, email, password}, {}, function(req) {
      if (req.status === 406) {
        app.get('.signup-page .message').innerHTML = '已有此電子信箱';
        // app.get('.signup-page .message').style.opacity = '1';
      } else if (req.status === 500) {
        app.get('.signup-page .message').innerHTML = '伺服器錯誤，請稍後再試';
        // app.get('.signup-page .message').style.opacity = '1';
      } else {
        loginSuccessEvent('signup-page', 'native', req);
      }
    });
  }
}
// eslint-disable-next-line no-unused-vars
function login() {
  const email = app.get('.login-page .email').value;
  const password = app.get('.login-page .password').value;
  const provider = 'native';
  if (!email) {
    app.get('.login-page .message').innerHTML = '請輸入帳號';
    app.get('.login-page .message').style.opacity = '1';
  } else if (!password) {
    app.get('.login-page .message').innerHTML = '請輸入密碼';
    app.get('.login-page .message').style.opacity = '1';
  } else {
    app.ajax('POST', 'api/user/login', {email, password, provider}, {}, function(req) {
      if (req.status === 406) {
        app.get('.login-page .message').innerHTML = '帳號密碼錯誤';
        app.get('.login-page .message').style.opacity = '1';
      } else if (req.status === 500) {
        app.get('.login-page .message').innerHTML = '伺服器錯誤，請稍後再試';
        app.get('.login-page .message').style.opacity = '1';
      } else {
        loginSuccessEvent('login-page', 'native', req);
      }
    });
  }
}
function loginSuccessEvent(className, provider, req) {
  const data = JSON.parse(req.responseText);
  app.get(`.${className} .message`).style.color = 'black';
  app.get(`.${className} .message`).innerHTML = '登入成功';
  app.get(`.${className} .message`).style.opacity = '1';
  window.setTimeout(function() {
    app.get(`.${className}`).style.display = 'none';
  }, 2000);
  window.localStorage.setItem('auth', data.token.access_token);
  window.localStorage.setItem('provider', provider);
  window.localStorage.setItem('name', data.user.name);
  if (className === 'signup-page' && provider === 'native') {
    window.localStorage.setItem('picture', null);
  } else window.localStorage.setItem('picture', data.user.picture);

  window.localStorage.setItem('user-id', data.user.id);
  // 登入成功後要把可開啟登入註冊頁面的監聽器拿掉
  app.get('.member').removeEventListener('click', memberEvent);
  app.get('.member p').innerHTML = '會員';
  app.get('.member').addEventListener('click', function() {
    window.location.href = 'member';
  });
  location.reload(); // 才會更新會員圖片
}
function userInit() {
  const picture = window.localStorage.getItem('picture');
  if (picture !== 'null') {
    if (picture.substring(0, 4) === 'http') {
      app.get('.member img').src = picture;
    } else app.get('.member img').src = `${app.s3}/user-pic/${picture}`;
  } else {
    app.get('.member img').src = './imgs/login_big.jpg';
  }
};
userInit();
// facebook login
// eslint-disable-next-line no-unused-vars
function checkLoginState() { // Called when a person is finished with the Login Button.
  FB.login(function(response) {
    statusChangeCallback(response);
  });
}
function statusChangeCallback(response) { // Called with the results from FB.getLoginStatus().
  console.log('click');
  // The current login status of the person.
  if (response.status === 'connected') { // Logged into your webpage and Facebook.
    // app.state.auth = response.authResponse;
    FB.api('/me?fields=name,email,picture.width(500)', function(response) {
      saveFBtoDB(response);
    });
  }
}
window.fbAsyncInit = function() {
  FB.init({
    appId: '2263463080567166',
    cookie: true,
    xfbml: true,
    version: 'v4.0',
  });

  FB.getLoginStatus(function(response) { // Called after the JS SDK has been initialized.
    // statusChangeCallback(response);        // Returns the login status.
  });
};

(function(d, s, id) { // Load the SDK asynchronously
  let js;
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function saveFBtoDB(response) {
  let {name, email, picture} = response;
  picture = picture.data.url;
  const provider = 'facebook';
  if (email) { // 確定有撈到電子郵件才進資料庫
    app.ajax('POST', 'api/user/login', {email, name, picture, provider}, {}, function(req) {
      if (req.status === 500) {
        app.get('.login-page .message').innerHTML = '伺服器錯誤，請稍後再試';
      } else loginSuccessEvent('login-page', 'facebook', req);
    });
  }
}
