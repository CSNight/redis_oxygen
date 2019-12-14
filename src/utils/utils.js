export function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
    }
    return fmt;
}

export function parseSec(sec) {
    let d = Math.floor(sec / (60 * 60 * 24));
    let h = Math.floor((sec - (60 * 60 * 24 * d)) / 3600);
    let m = Math.floor((sec - 60 * 60 * 24 * d - 3600 * h) / 60);
    let s = sec - 60 * 60 * 24 * d - 3600 * h - 60 * m;
    let t = "";
    if (d > 0) {
        t += d + "天"
    }
    if (h > 0) {
        t += h + "时"
    }
    if (m > 0) {
        t += m + "分"
    }
    if (s > 0) {
        t += s + "秒"
    }
    return t;
}

export function guid() {
    /**
     * @return {string}
     */
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16)
            .substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-"
        + S4() + S4() + S4());
}

export function isNum(obj) {
    return obj === +obj
}