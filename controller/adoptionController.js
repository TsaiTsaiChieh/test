const adoptionModel = require('../model/adoptionModel');
let size = 20; // 一頁要 show 幾個
function get(req, res) {
    let id = parseInt(req.query.id);
    if (!Number.isInteger(id)) {
        res.status(404);
        res.send({ error: "Wrong id Request" })
    }
    adoptionModel.get(id).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });

}
function list(req, res) {
    let category = req.params.category;
    let paging = parseInt(req.query.paging);
    let { sex, region, order, age } = req.query;
    if (!Number.isInteger(paging)) paging = 0;

    adoptionModel.list(category, sex, region, order, age, paging, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function count(req, res) {
    let { kind, sex, region, order, age } = req.query;
    adoptionModel.count(kind, sex, region, order, age, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function search(req, res) {
    let { kind, sex, region, order, age } = req.body;
    if (sex)
        if (sex.length === 2) sex = ''; // means all
    if (!kind || kind.includes('cat') && kind.includes('dog')) res.redirect(`/adoption?kind=all&${queryString(sex, region, order, age)}`);
    else if (kind.includes('cat')) res.redirect(`/adoption?kind=cat&${queryString(sex, region, order, age)}`);
    else if (kind.includes('dog')) res.redirect(`/adoption?kind=dog&${queryString(sex, region, order, age)}`);

}
function queryString(sex, region, order, age) {
    let searchUrl = '';
    if (sex && region) searchUrl = `sex=${sex}&region=${region}&`;
    else if (region) searchUrl = `region=${region}&`;
    else if (sex) searchUrl = `sex=${sex}&`;
    if (order === 'desc') searchUrl = searchUrl.concat(`order=${order}&`);
    if (age) searchUrl = searchUrl.concat(`age=${age}&`);
    searchUrl = searchUrl.concat('paging=0');
    return searchUrl;
}
module.exports = {
    list, get, search, count
}