const modules = require('../util/modules');
const mysql = require('../util/db');

function ageTable(ageString) {
    if (ageString === 'ADULT') return 'A';
    else return 'C';
}
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小時 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
function opendateTable(opendateString) {
    if (opendateString.length == 0) return new Date().Format("yyyy-MM-dd");
    else return opendateString;
}

function ajaxReturn(page) {
    return new Promise(function (resolve, reject) {
        var xmlhttp = new modules.xmlhttprequest.XMLHttpRequest();
        xmlhttp.open("GET", `http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL&$top=1000&$skip=${1000 * page}&animal_status=OPEN`);
        xmlhttp.onload = function () {
            let data = JSON.parse(this.responseText);
            if (data.length === 0) {
                resolve(true);
            }
            else if (data.length != 0) {
                resolve(false);
            }
            else reject(null);
        }
        xmlhttp.send();
    });
}

modules.async.waterfall([
    function (next) {
        // 抓 skip 總共有多少資料，i == 7 時，就沒資料了，所以 next()
        async function getFeedback() {
            let flag;
            for (let i = 1; ; i++) {
                flag = await ajaxReturn(i);
                if (flag) {
                    next(null, i);
                    break;
                }
                // console.log(i, flag);
            }
        }
        getFeedback();
    },
    function (lastPage, next) {
        let insert_pet = [];
        let loaded = 0;
        for (let page = 0; page < lastPage; page++) {
            let xmlhttp = new modules.xmlhttprequest.XMLHttpRequest();
            xmlhttp.open("GET", `http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL&$top=1000&$skip=${1000 * page}&animal_status=OPEN`);
            xmlhttp.onload = function () {
                let data = JSON.parse(this.responseText);
                for (let j = 0; j < data.length; j++) {
                    insert_pet.push({
                        db: 1, db_link: data[j].animal_subid, kind: data[j].animal_kind, sex: data[j].animal_sex,
                        age: ageTable(data[j].animal_age), color: data[j].animal_colour, neuter: data[j].animal_sterilization,
                        bacterin: data[j].animal_bacterin, county: data[j].animal_area_pkid, foundplace: data[j].animal_foundplace,
                        title: data[j].animal_title, image: JSON.stringify([data[j].album_file]),
                        description: JSON.stringify(data[j].animal_remark), opendate: opendateTable(data[j].animal_opendate),
                        contactName: data[j].shelter_name, contactMethod: data[j].shelter_tel
                    });
                } // end for /** data.length */ loop
                loaded++;
                if (loaded == lastPage) next(null, insert_pet);
            }
            xmlhttp.send();
        }
    },
    function (insert_pet, next) {
        insert_pet.forEach(element => {
            mysql.con.query('INSERT INTO pet SET ?', element, function (err, result) {
                if (err) throw err;
                else console.log(result);
            });
        });
    }
], function (err, result) { });