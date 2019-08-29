const modules = require('../util/modules');
// url = 'http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL&$top=2';
url = 'http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL';
// url = 'http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL&$top=1000&$skip=6000'

// var flag = true
// var i = 0;
// for (let i = 0; i < 20; i++) {
//     var xmlhttp = new modules.xmlhttprequest.XMLHttpRequest();
//     xmlhttp.onreadystatechange = function () {
//         if (xmlhttp.readyState == 4 && this.status == 200) {
//             if (this.responseText.length == 0) { break; }
//             var data = JSON.parse(this.responseText);
//             console.log(data.length);

//         }
//     }
//     console.log(`${url}&$top=1000&$skip=${1000 * i}`);

//     xmlhttp.open("GET", `${url}&$top=1000&$skip=${1000 * i}`);
//     xmlhttp.send();

// }
for (let i = 0; i < 8; i++) {
    ajax(i).then(function (length) {
        console.log(length);
    });
}
function ajax(i) {
    return new Promise(function (resolve, reject) {
        var xmlhttp = new modules.xmlhttprequest.XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                resolve(data.length);
            }
        }
        xmlhttp.open("GET", `${url}&$top=1000&$skip=${1000 * i}`);
        xmlhttp.send();
    });
}



