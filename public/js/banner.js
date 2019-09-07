
function bannerInit(kind) {
    app.ajax('GET', 'api/adoption/count', `kind=${kind}`, {}, function (req) {
        let total = JSON.parse(req.responseText).total;
        if (kind === 'cat')
            app.get(`.${kind} p`).innerHTML = `目前有 ${total} 隻喵喵等待認領養`;
        else if (kind === 'dog') app.get(`.${kind} p`).innerHTML = `目前有 ${total} 隻狗狗等待認領養`;

    });
    app.get(`.${kind}-link`).href = `/adoption?kind=${kind}&paging=0`;
}

bannerInit('cat');
bannerInit('dog');