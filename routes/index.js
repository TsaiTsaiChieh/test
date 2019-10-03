/* eslint-disable new-cap */
const modules = require('../util/modules');
const indexController = require('../controller/indexController');
const router = modules.express.Router();

router.get('/', indexController.index);
router.get('/adoption', indexController.adoption);
router.get('/member', indexController.member);
router.get('/notice', indexController.notice);

module.exports = router;
