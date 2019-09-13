const modules = require('./util/modules');
const app = modules.express();
const cst = require('./util/constants');
const update = {
    gov: require('./crawler/conGov_v3'),
    map: require('./crawler/adoptionMap_v2')
};
// const x = require('./crawler/conGov_v3')

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

var rule2 = new modules.schedule.RecurrenceRule();
var times2 = [0, 5, 10, 15, 25, 30, 35, 40, 45, 50, 55];
rule2.minute = times2;
modules.schedule.scheduleJob(rule2, function () { //秒、分、時、日、月、周幾
    console.log('scheduleCronstyle:' + new Date());
    update.map.updateAdoptionMap();
    update.gov.updateGov();
});



app.listen(3000, () => console.log('讓愛不流浪 at port 3000.'));