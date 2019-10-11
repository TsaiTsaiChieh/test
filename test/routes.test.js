/* eslint-disable max-len */
const modules = require('../util/modules');

// test('Fetch the video information', async function() {
//   const response = await modules.axios.get('https://tsaichieh.com/api/notice/videoInfo');
//   expect(response.data.data[0].yt_id).toBe('nEfwHbvaE4M');
// });
// video API
// const yt_id = ['nEfwHbvaE4M', 'e22nNN8TwwM', 'qwKCpZZJBYw', 'Jv9N1_P4YI0', 'hGHU1GngS6Q',
//   '7ENaBNc0ehg', 'XqHxM5bUs-w', 'JH2vEeIsh_o', 'fPmnno0tXaI', 'lXQk_t-xzL8'];
// test('Fetch the video information', async function() {
//   const response = await modules.axios.get('https://tsaichieh.com/api/notice/videoInfo');
//   yt_id.forEach(function(ele, index) {
//     expect(response.data.data[index].yt_id).toBe(ele);
//   });
// });

/** *  User API ****/
// signup
// test('Testing user duplication registration in signup API', function() {
//   modules.axios.post('https://tsaichieh.com/api/user/signup', {
//     name: '測試名字',
//     email: 'jecica196@gmail.com',
//     password: '0000',
//   }).then(function() {
//   }).catch(function(err) {
//     // Email duplication registration
//     expect(err.code).toBe(406);
//   });
// });
// login
test('Testing user login API', async function() {
  // const user = {email: 'jecica196@gmail.com',provider: 'native'};
  const response = await modules.axios.post('https://tsaichieh.com/api/user/login', {
    email: 'jecica196@gmail.com',
    password: '0000',
    provider: 'native',
  });
  // console.log(response.data.user);

  expect(response.data.user).objectContaining({provider: 'native', email: 'jecica196@gmail.com'});
});

// const axios = modules.axios;
// jest.spyOn(userModel, 'signup');
// test('Testing user signup API', function() {
//   const user = [{
//     name: '測試名字',
//     email: 'tttt@gmail.com'}];
//   const resp = {data: user};
//   axios.post.mockImplementation(resp);
//   return axios.post('https://tsaichieh.com/api/user/signup')
//       .then(function(data) {
//         console.log(data);
//       })
//       .catch(function(err) {
//         console.log(err);
//       });
// });

// const userModel = {
//   signup: function() {
//     modules.axios.post('https://tsaichieh.com/api/user/signup', {
//       name: '測試名字',
//       email: 'ttttt@gmail.com',
//       password: '0000',
//     }).then(function(data) {
//       return data;
//     });
//   },
// };
