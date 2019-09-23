const noticeModel = require('../model/noticeModel');
function videoInfo(req, res) {
    noticeModel.videoInfo().then(function (body) {
        res.json(body);
    })
        .catch(function (err) {
            res(err.status);
            res(err.error);
        });
}
module.exports = { videoInfo };