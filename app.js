const modules = require('./util/modules');
const app = modules.express();
const cst = require('./util/constants');
// app.use(modules.bodyparser.urlencoded({ extended: true }));

app.use(modules.express.static('public'));
const adoptRouters = require('./routes/adoption');
app.use(`/api/adoption`, adoptRouters);
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3000, () => console.log('Love Never Stray at port 3000.'));

app.get('/', (req, res) => {
    res.render('index');
});