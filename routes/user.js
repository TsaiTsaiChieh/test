/* eslint-disable max-len */
/* eslint-disable new-cap */
const modules = require('../util/modules');
const router = modules.express.Router();
const userController = require('../controller/userController');
const verification = require('../util/verification');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', verification.token, userController.profile);
router.post('/profile', verification.token, userController.update);
router.post('/postAdoption', verification.token, userController.postAdoption);
router.get('/getAdoptionList', verification.token, userController.getAdoptionList);
router.post('/deleteAdoption', verification.token, userController.deleteAdoption);
router.post('/updateAdoption', verification.token, userController.updateAdoption);
router.post('/sendMessage', verification.token, userController.sendMessage);
router.get('/getMessageList', verification.token, userController.getMessageList);
router.get('/getMessage', verification.token, userController.getMessage);
router.post('/addAttention', verification.token, userController.addAttention);
router.get('/getAttentionList', verification.token, userController.getAttentionList);
router.post('/deleteAttention', verification.token, userController.deleteAttention);

module.exports = router;
