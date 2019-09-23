const modules = require('./util/modules');
const app = modules.express();
const cst = require('./util/constants');
const update = {
    gov: require('./crawler/conGov_v3'),
    map: require('./crawler/adoptionMap_v2')
};
// const x = require('./crawler/conGov_v3')

app.use(modules.bodyparser.json()); // 否則 Ajax Post 值傳不到後端
app.use(modules.bodyparser.urlencoded({ extended: true }));

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

// let rule = new modules.schedule.RecurrenceRule();
// let times = [];
// for (let i = 0; i < 24; i++) times.push(i + 1);
// rule.hour = times;
// rule.minute = times;
modules.schedule.scheduleJob('0 30 0-23 * * *', function () { //秒、分、時、日、月、周幾
    console.log(new Date());
    update.gov.updateGov();
    setTimeout(function () {
        console.log(new Date(Date.now()));
        update.map.updateAdoptionMap();
    }, 60000); // 五分鐘
});


app.listen(3000, () => console.log('讓愛不流浪 at port 3000.'));