const modules = require('../util/modules');
const router = modules.express.Router();
const userController = require('../controller/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', userController.profile);
router.post('/update', userController.update);
router.post('/postPet', userController.postPet);

module.exports = router;
