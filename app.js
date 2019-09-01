const modules = require('./util/modules');
const app = modules.express();
const cst = require('./util/constants');
app.use(modules.bodyparser.urlencoded({ extended: true }));

app.use(modules.express.static('public'));
const mainRouter = require('./routes');
const adoptionRouters = require('./routes/adoption');
// const controller = require();

app.use(mainRouter);
app.use('/api/adoption', adoptionRouters);
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3000, () => console.log('讓愛不流浪 at port 3000.'));