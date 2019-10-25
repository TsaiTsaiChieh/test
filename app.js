const modules = require('./util/modules');
const app = modules.express();
const PORT = process.env.PORT;

// 否則 Ajax Post 值傳不到後端
app.use(modules.bodyparser.json());
app.use(modules.bodyparser.urlencoded({extended: true}));

app.use(modules.express.static('public'));
const mainRouter = require('./routes');
const adoptionRouters = require('./routes/adoption');
const userRouters = require('./routes/user');
const noticeRouters = require('./routes/notice');

app.use(mainRouter);
app.use('/api/adoption', adoptionRouters);
app.use('/api/user', userRouters);
app.use('/api/notice', noticeRouters);
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(PORT, () => console.log(`讓愛不流浪 on port ${PORT}`));
