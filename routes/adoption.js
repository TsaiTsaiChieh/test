const modules = require('../util/modules');
const adoptionController = require('../controller/adoptionController');
const router = modules.express.Router();


router.get('/details', adoptionController.get);
router.get('/count', adoptionController.count);
router.get('/:category', adoptionController.list);

router.post('/', adoptionController.post);
// router.get('/:category', function (req, res) {
//     let category = req.params.category;
//     let paging = parseInt(req.query.paging);
//     if (!Number.isInteger(paging)) paging = 0;
//     let size = 10;
//     let offset = paging * size;

//     switch (category) {
//         case 'all':
//             mysql.con.query(`SELECT * FROM pet LIMIT ${offset},${size}`, function (err, result) {
//                 for (let i = 0; i < result.length; i++) {
//                     result[i].image = JSON.parse(result[i].image);
//                     result[i].description = JSON.parse(result[i].description);
//                     result[i].habit = JSON.parse(result[i].habit);
//                     result[i].story = JSON.parse(result[i].story);
//                     result[i].limitation = JSON.parse(result[i].limitation);
//                 }
//                 res.json(result);
//             });
//             break;
//         case 'cat':
//             mysql.con.query(`SELECT * FROM pet WHERE kind = '貓' LIMIT ${offset},${size}`, function (err, result) {
//                 for (let i = 0; i < result.length; i++) {
//                     result[i].image = JSON.parse(result[i].image);
//                     result[i].description = JSON.parse(result[i].description);
//                     result[i].habit = JSON.parse(result[i].habit);
//                     result[i].story = JSON.parse(result[i].story);
//                     result[i].limitation = JSON.parse(result[i].limitation);
//                 }
//                 res.json(result);
//             });
//             break;
//         case 'dog':
//             mysql.con.query(`SELECT * FROM pet WHERE kind = '狗' LIMIT ${offset},${size}`, function (err, result) {
//                 for (let i = 0; i < result.length; i++) {
//                     result[i].image = JSON.parse(result[i].image);
//                     result[i].description = JSON.parse(result[i].description);
//                     result[i].habit = JSON.parse(result[i].habit);
//                     result[i].story = JSON.parse(result[i].story);
//                     result[i].limitation = JSON.parse(result[i].limitation);
//                 }
//                 res.json(result);
//             });
//             break;
//     }


// });
module.exports = router;