const adoptionModel = require('../model/adoptionModel');

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
    let size = 10;

    adoptionModel.list(category, paging, size).then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res.status(404);
            res.send(err);
        });
}
function post(req, res) {
    res.json(req.body);
    console.log(req.body);
}
module.exports = {
    list, get, post
}