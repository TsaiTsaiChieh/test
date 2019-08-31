const adoptionModel = require('../model/adoptionModel');

module.exports = {
    list: function (req, res) {
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
}