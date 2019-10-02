/* eslint-disable new-cap */
const modules = require('../util/modules');
const adoptionController = require('../controller/adoptionController');
const router = modules.express.Router();

router.get('/details', adoptionController.get);
router.get('/count', adoptionController.count); // count 順序要在 category 上面，
router.get('/:category', adoptionController.list);
router.post('/', adoptionController.search);
module.exports = router;
