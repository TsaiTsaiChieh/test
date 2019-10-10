const modules = require('./util/modules');
const app = modules.express();
const update = {
  gov: require('./crawler/govShelterUpdate'),
  map: require('./crawler/adoptionMapUpdate'),
};

app.use(modules.bodyparser.json()); // 否則 Ajax Post 值傳不到後端
app.use(modules.bodyparser.urlencoded({extended: true}));

app.use(modules.express.static('public'));
const mainRouter = require('./routes');
const adoptionRouters = require('./routes/adoption');
const userRouters = require('./routes/user');
const noticeRouters = require('./routes/notice');
const PORT = process.env.PORT || 3000;


app.use(mainRouter);
app.use('/api/adoption', adoptionRouters);
app.use('/api/user', userRouters);
app.use('/api/notice', noticeRouters);
app.set('views', './views');
app.set('view engine', 'pug');

modules.schedule.scheduleJob('0 0 */3 * * *', function() { // 秒、分、時、日、月、周幾
  console.log(Date.now());
  update.gov.crawledGovShelter();
  setTimeout(function() {
    console.log(Date.now());
    update.map.updateAdoptionMap();
  }, 60000); // 1 minute
});

app.listen(3000, () => console.log(`讓愛不流浪 on port ${PORT}`));
