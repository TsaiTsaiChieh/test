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

module.exports = router;