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



app.use(mainRouter);
app.use('/api/adoption', adoptionRouters);
app.use('/api/user', userRouters);
app.set('views', './views');
app.set('view engine', 'pug');

let rule = new modules.schedule.RecurrenceRule();
// let times = [0, 1, 2, 3, 4, 5, 15, 16];
let times = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
// rule.hour = times;
rule.minute = times;
modules.schedule.scheduleJob(rule, function () { //秒、分、時、日、月、周幾
    console.log('scheduleCronstyle:' + new Date());
    update.map.updateAdoptionMap();
    setTimeout(function () { update.gov.updateGov(); }, 300000); // 五分鐘
});



app.listen(3000, () => console.log('讓愛不流浪 at port 3000.'));