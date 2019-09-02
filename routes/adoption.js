const modules = require('../util/modules');
const adoptionController = require('../controller/adoptionController');
const router = modules.express.Router();


router.get('/details', adoptionController.get);
router.get('/count', adoptionController.count);
router.get('/:category', adoptionController.list);
router.post('/', adoptionController.post);
module.exports = router;