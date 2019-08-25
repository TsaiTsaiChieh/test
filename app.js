const modules = require('./util/modules');
const app = modules.express();

app.use(modules.express.static('public'));
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3000, () => console.log('Make Love Not Stray at port 3000.'));

app.get('/', (req, res) => {
    res.render('index');
});