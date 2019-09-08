const modules = require('./util/modules');
const app = modules.express();
const cst = require('./util/constants');

app.use(modules.bodyparser.json()); // 否則 Ajax Post 直傳不到後端
app.use(modules.bodyparser.urlencoded({ extended: true }));

app.use(modules.express.static('public'));
const mainRouter = require('./routes');
const adoptionRouters = require('./routes/adoption');
const userRouters = require('./routes/user');



app.use(mainRouter);
app.use('/api/adoption', adoptionRouters);
app.use('/api/user', userRouters);
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3000, () => console.log('讓愛不流浪 at port 3000.'));