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
    // res.send(id);
}
function list(req, res) {
    let category = req.params.category;
    let paging = parseInt(req.query.paging);
    if (!Number.isInteger(paging)) paging = 0;

    adoptionModel.list(category, paging, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function count(req, res) {
    let { kind } = req.query;
    adoptionModel.count(kind, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function post(req, res) {
    let { kind } = req.body;
    if (!kind) res.redirect('/adoption?kind=all&paging=0');
    else if (kind.includes('cat') && kind.includes('dog')) res.redirect('/adoption?kind=all&paging=0');
    else if (kind.includes('cat')) res.redirect('/adoption?kind=cat&paging=0');
    else if (kind.includes('dog')) res.redirect('/adoption?kind=dog&paging=0');
}

module.exports = {
    list, get, post, count
}