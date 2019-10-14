const adoptionModel = require('../model/adoptionModel');


test('Test adoption count api', async function() {
  const req = {};
  req.query = {kind: 'cat', sex: 'F', region: '1,2', age: 'C'};
  const result = await adoptionModel.count(req);
  expect(result).toHaveProperty('total');
  expect(result).toHaveProperty('lastPage');
});

