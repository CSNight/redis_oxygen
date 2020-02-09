import {Message} from "element-ui";
import {isNum} from "../utils/utils";

export default {
    channel: '',
    WS: null,
    eventMethods: [],
    isConnected: false,
    connect: function (uid) {
        let thisCallback = this;
        //判断当前浏览器是否支持WebSocket
        if ('WebSocket' in window) {
            this.WS = new WebSocket("wss://127.0.0.1:13244/websocket_stream?uid=" + uid);
        } else {
            Message({
                message: "当前浏览器不支持websocket",
                type: 'error',
                duration: 3 * 1000
            });
        }
        //连接发生错误的回调方法
        this.WS.onerror = function () {
            Message({
                message: "Websocket连接错误",
                type: 'error',
                duration: 3 * 1000
            });
            thisCallback.isConnected = false;
            thisCallback.broadcast("wsErr", "Websocket连接错误");
        };
        //连接成功建立的回调方法
        this.WS.onopen = function () {
            thisCallback.isConnected = true;
            Message({
                message: "Websocket连接成功",
                type: 'success',
                duration: 3 * 1000
            });
            thisCallback.broadcast("wsOpen", "Websocket连接错误");
        };
        //接收到消息的回调方法
        this.WS.onmessage = function (event) {
            let data = event.data;
            let msgObj = JSON.parse(data);
            switch (msgObj.rmt) {
                case "INIT":
                    thisCallback.channel = msgObj.body;
                    break;
                case "RESP":
                case "UNKNOWN":
                case "MONITOR":
                case "MONITORCON":
                case "DEMONITOR":
                case "SUBCON":
                case "PUBSUB":
                case "DESUB":
                    thisCallback.emit("msgRev", msgObj, msgObj.appId);
                    break;
                case"KEYWATCH":
                case"DEKEYWATCH":
                case"KEYWATCHCON":
                case"SHAKESTART":
                case"SHAKEFINISH":
                case"SHAKEPROCESS":
                    thisCallback.emit("dtRev", msgObj, msgObj.appId);
                    break;
                case"STAT_STARTED":
                case"STAT_STOPPED":
                case"RMS_STAT":
                    thisCallback.emit("stRev", msgObj, msgObj.appId);
                    break;
                case "ERROR":
                    thisCallback.emit("msgRev", msgObj, msgObj.appId);
                    thisCallback.emit("dtRev", msgObj, msgObj.appId);
                    thisCallback.emit("stRev", msgObj, msgObj.appId);
            }
        };
        this.WS.onclose = function () {
            thisCallback.isConnected = false;
            Message({
                message: "WebSocket连接关闭",
                type: 'warning',
                duration: 3 * 1000
            });
            thisCallback.broadcast("wsClose", "WebSocket连接关闭");
        };
        window.onbeforeunload = function () {
            thisCallback.close();
        };
    }, send: function (msg, rt, appId, ins, ct) {
        let request = {
            rt: rt,
            ct: ct,
            msg: msg,
            appId: appId,
            ins: ins
        };
        this.WS.send(JSON.stringify(request));
    }, close: function () {
        if (this.WS !== null) {
            this.WS.close();
        }
    }, async: function (args, handler) {
        setTimeout(() => {
            handler.method.apply(handler.method, [args])
        }, 10)
    }, on: function (eventName, listener, id) {
        let delay = 0;
        let identifier = "";
        if (arguments.length === 3 && isNum(arguments[2])) {
            delay = parseInt(arguments[2]);
            identifier = "";
        } else if (arguments.length === 3 && !isNum(arguments[2])) {
            identifier = id;
        } else if (arguments.length === 4) {
            delay = parseInt(arguments[3]);
            identifier = id;
        }
        this.eventMethods.push({
            identifier: identifier,
            eventName: eventName,
            method: listener,
            delay: delay
        });
        return identifier;
    }, emit: function (eventName, data, evtId) {
        for (let index = 0; index < this.eventMethods.length; index++) {
            let handler = this.eventMethods[index];
            if (handler.eventName === eventName && evtId && handler.identifier === evtId) {
                this.async(data, handler);
                break;
            } else if (!evtId && handler.eventName === eventName) {
                this.async(data, handler);
            }
        }
    }, broadcast: function (eventName, data) {
        if (!this.eventMethods) this.eventMethods = [];
        for (let index = 0; index < this.eventMethods.length; index++) {
            let handler = this.eventMethods[index];
            if (handler.eventName === eventName) {
                this.async(data, handler);
            }
        }
    }, un: function (eventName, id) {
        for (let index = 0; index < this.eventMethods.length; index++) {
            let handler = this.eventMethods[index];
            if (id) {
                if (handler.eventName === eventName && handler.identifier === id) {
                    this.eventMethods.splice(index, 1);
                    index--;
                }
            } else {
                if (handler.eventName === eventName) {
                    this.eventMethods.splice(index, 1);
                    index--;
                }
            }
        }
    }, clear: function () {
        this.eventMethods = [];
    }, destroy: function () {
        this.eventMethods = [];
    }
}
