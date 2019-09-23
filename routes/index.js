const modules = require('../util/modules');
const router = modules.express.Router();

router.get('/', (req, res) => {
    res.render('index');
});
router.get('/adoption', (req, res) => {
    res.render('adoption');
});
router.get('/member', (req, res) => {
    res.render('member');
});
router.get('/notice', (req, res) => {
    res.render('notice');
});

module.exports = router;