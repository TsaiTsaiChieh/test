/* eslint-disable max-len */
const modules = require('../util/modules');

// test('Fetch the video information', async function() {
//   const response = await modules.axios.get('https://tsaichieh.com/api/notice/videoInfo');
//   expect(response.data.data[0].yt_id).toBe('nEfwHbvaE4M');
// });
// video API
const yt_id = ['nEfwHbvaE4M', 'e22nNN8TwwM', 'qwKCpZZJBYw', 'Jv9N1_P4YI0', 'hGHU1GngS6Q',
  '7ENaBNc0ehg', 'XqHxM5bUs-w', 'JH2vEeIsh_o', 'fPmnno0tXaI', 'lXQk_t-xzL8'];
test('Fetch the video information', async function() {
  const response = await modules.axios.get('https://tsaichieh.com/api/notice/videoInfo');
  yt_id.forEach(function(ele, index) {
    expect(response.data.data[index].yt_id).toBe(ele);
  });
});

// signup
test('Testing user duplication registration in signup API', function() {
  modules.axios.post('https://tsaichieh.com/api/user/signup', {
    name: '測試名字',
    email: 'jecica196@gmail.com',
    password: '0000',
  }).then(function() {
  }).catch(function(err) {
    // Email duplication registration
    expect(err.code).toBe(406);
  });
});
