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
    let { sex } = req.query;

    if (!Number.isInteger(paging)) paging = 0;

    adoptionModel.list(category, sex, paging, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function count(req, res) {
    let { kind, sex } = req.query;
    adoptionModel.count(kind, sex, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function search(req, res) {
    let { kind, sex } = req.body;

    if (sex)
        if (sex.length === 2) sex = ''; // means all
    if (!kind || kind.includes('cat') && kind.includes('dog') && sex) res.redirect(`/adoption?kind=all&sex=${sex}&paging=0`);
    else if (!kind || kind.includes('cat') && kind.includes('dog')) res.redirect('/adoption?kind=all&paging=0');
    else if (kind.includes('cat') && sex) res.redirect(`/adoption?kind=cat&sex=${sex}&paging=0`);
    else if (kind.includes('cat')) res.redirect('/adoption?kind=cat&paging=0');
    else if (kind.includes('dog') && sex) res.redirect(`/adoption?kind=cat&sex=${sex}&paging=0`);
    else if (kind.includes('dog')) res.redirect('/adoption?kind=dog&paging=0');

}

module.exports = {
    list, get, search, count
}