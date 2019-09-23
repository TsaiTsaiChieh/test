const modules = require('../util/modules');
const router = modules.express.Router();
const noticeController = require('../controller/noticeController');

router.get('/videoInfo', noticeController.videoInfo);
module.exports = router;