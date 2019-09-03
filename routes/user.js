const modules = require('../util/modules');
const router = modules.express.Router();
const userController = require('../controller/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
module.exports = router;