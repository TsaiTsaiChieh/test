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
    let { sex, region } = req.query;

    if (!Number.isInteger(paging)) paging = 0;

    adoptionModel.list(category, sex, region, paging, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function count(req, res) {
    let { kind, sex, region } = req.query;
    adoptionModel.count(kind, sex, region, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function search(req, res) {
    let { kind, sex, region } = req.body;
    if (sex)
        if (sex.length === 2) sex = ''; // means all
    if (!kind || kind.includes('cat') && kind.includes('dog')) res.redirect(`/adoption?kind=all&${queryString(sex, region)}`);
    else if (kind.includes('cat')) res.redirect(`/adoption?kind=cat&${queryString(sex, region)}`);
    else if (kind.includes('dog')) res.redirect(`/adoption?kind=dog&${queryString(sex, region)}`);

}
function queryString(sex, region) {
    if (sex && region) return `sex=${sex}&region=${region}&paging=0`;
    else if (region) return `&region=${region}&paging=0`;
    else if (sex) return `sex=${sex}&paging=0`;
    else return 'paging=0';
}
module.exports = {
    list, get, search, count
}