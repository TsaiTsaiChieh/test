const modules = require('./util/modules');
const crawler = modules.express();
const PORT = process.env.CRAWLER_PORT;
const update = {
  gov: require('./crawler/govShelterUpdate'),
  map: require('./crawler/adoptionMapUpdate'),
};

modules.schedule.scheduleJob('0 0 */1 * * *', function() { // 秒、分、時、日、月、周幾
  console.log(Date.now());
  update.gov.crawledGovShelter();
  setTimeout(function() {
    console.log(Date.now());
    update.map.updateAdoptionMap();
  }, 60000); // 1 minute
});

crawler.listen(PORT, () => console.log(`Crawler on port ${PORT}`));
