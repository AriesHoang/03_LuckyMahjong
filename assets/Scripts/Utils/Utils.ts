import {E_JACKPOT_TYPE} from "../Data/GamePlayData";
import CurrencyConverter from "../Common/CurrencyConverter";
import {Cfg, GameCertification} from "../Manager/Config";
import TextController from "../Manager/TextController";

function LRUCache(size) {
    this.count = 0;
    this.limit = size;
    this.datas = {};
    this.head = null;
    this.tail = null;
}

LRUCache.prototype.moveToHead = function (node) {
    node.next = this.head;
    node.prev = null;
    if (this.head !== null) 
        this.head.prev = node;
    this.head = node;
    if (this.tail === null) 
        this.tail = node;
    this.count++;
    this.datas[node.key] = node;
}


LRUCache.prototype.remove = function (node) {
    if (node.prev !== null) {
        node.prev.next = node.next;
    } else {
        this.head = node.next;
    }
    if (node.next !== null) {
        node.next.prev = node.prev;
    } else {
        this.tail = node.prev;
    }
    delete this.datas[node.key];
    this.count--;
}

LRUCache.prototype.get = function (key) {
    const node = this.datas[key];
    if (node) {
        this.remove(node);
        this.moveToHead(node);
        return node.value;
    }
    return null;
}

LRUCache.prototype.clear = function () {
    this.count = 0;
    this.datas = {};
    this.head = null;
    this.tail = null;
}

LRUCache.prototype.has = function (key) {
    return !!this.datas[key];
}

LRUCache.prototype.delete = function (key) {
    const node = this.datas[key];
    this.remove(node);
}

const { ccclass, property } = cc._decorator;
let measureCache = new LRUCache(100);
@ccclass
export default class Utils extends cc.Component {

	static getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(
			/[?&]+([^=&]+)=([^&]*)/gi,
			//@ts-ignore
			function (m, key, value) {
				vars[key] = value;
			}
		);
		return vars;
	}

	static consoleLog(str) {
		if (CC_DEBUG)
			cc.log(str);
	}

	static getHttp(url, pars, callback, accessToken = null) {
		var http = new XMLHttpRequest();
		let parStr = "";

		if (pars && Array.isArray(pars) && pars.length > 0) {
			for (let i = 0; i < pars.length; i++) {
				if (i == 0) {
					parStr = parStr + "?" + pars[i][0] + "=" + pars[i][1];
				} else {
					parStr = parStr + "&" + pars[i][0] + "=" + pars[i][1];
				}
			}
		} else if (typeof pars == "object") {
			parStr = parStr + "?";
			for (let v in pars) {
				parStr += v + "=" + pars[v] + "&";
			}
			parStr = parStr.substr(0, parStr.length - 1);
		}

		let urlNew = url + parStr;

		http.open("GET", urlNew, true);
		http.onloadend = () => {
			// var result = JSON.parse(http.responseText);
			if (http.readyState == 4 && http.status == 200) {
				callback(null, http.responseText);
			} else if (http.readyState == 4) {
				callback(http.responseText, null);
			}
		};
		http.onerror = (err) => {
			callback(err, null);
		};
		http.ontimeout = (err) => {
			callback(err, null);
		};

		if (Cfg.playerToken) {
			http.setRequestHeader("Authorization", Cfg.playerToken);
		}

		http.send();
	}

	static postHttp(
		url,
		pars,
		callback,
		contentType = "application/json",
		accessToken = null
	) {
		var http = new XMLHttpRequest();
		http.open("POST", url, true);
		http.setRequestHeader("Content-type", contentType);

		http.onloadend = () => {
			if (http.readyState == 4 && http.status >= 200 && http.status < 300) {
				callback(null, http.response);
			} else if (http.readyState == 4) {
				callback(http.response, null);
			}
		};

		http.onerror = (err) => {
			callback(err, null);
		};

		http.ontimeout = (err) => {
			callback(err, null);
		};

		if (Cfg.playerToken) {
			http.setRequestHeader("Authorization", Cfg.playerToken);
		}

		http.send(pars);
	}

	static exitApp(redirectURL: string = null) {
		if (redirectURL != undefined && redirectURL != null && redirectURL != '#') {
			//redirect
			window.location.replace(redirectURL);
		} else {
			//reload, as we cannot close the window (dont have permission)
			window.location.reload();
		}
	}

	static formatFloatToString(num, maxDigitNum = 2, useLocale = true, curStr = "") {
		return CurrencyConverter.getCreditString(num);

		num = parseFloat(num.toFixed(10));
		let str = num.toString();
		let num_digits_after_decimal = (str.indexOf(".") != -1 ? str.length - 1 - str.indexOf(".") : 0);
		if (maxDigitNum > 0)
			num_digits_after_decimal = Math.min(num_digits_after_decimal, maxDigitNum);
		let locale_opt = useLocale ?
			{
				minimumFractionDigits: Math.max(num_digits_after_decimal, 2),
				maximumFractionDigits: 2,
				style: curStr.length > 0 ? "currency" : "decimal",
				currency: curStr.length > 0 ? curStr : "USD"
			}
			: {};
		if (num_digits_after_decimal >= 2)
			return useLocale ? parseFloat(str).toLocaleString(undefined, locale_opt) : str;
		else
			return useLocale ? num.toLocaleString(undefined, locale_opt) : num.toFixed(Cfg.decimalDigits);
	}


	static getCurrencyStr(): string {
		return (Cfg.currency ? Cfg.currency : "") + " ";
	}

	static MixCurrecyStr(balance): string {
		return this.getCurrencyStr() + CurrencyConverter.getCreditString(balance);
	}

	static parseFloatToLocaleString(nvalue: string): string {
		let locale_opt =
		{
			minimumFractionDigits: 0,
			style: "decimal"
		};
		return parseFloat(nvalue).toLocaleString(undefined, locale_opt)
	}

	static randomArr(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	static changeParent(node, newParent) {
		if (node.parent == newParent) return;
		var getWorldRotation = function (node) {
			var currNode = node;
			var resultRot = currNode.angle;
			do {
				currNode = currNode.parent;
				if (!Utils.isEmpty(currNode))
					resultRot += currNode.angle;
			} while (!Utils.isEmpty(currNode) && currNode.parent != null);
			resultRot = resultRot % 360;
			return resultRot;
		};

		var oldWorRot = getWorldRotation(node);
		var newParentWorRot = getWorldRotation(newParent);
		var newLocRot = oldWorRot - newParentWorRot;

		var oldWorPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
		var newLocPos = newParent.convertToNodeSpaceAR(oldWorPos);

		node.parent = newParent;
		node.position = newLocPos;
		node.angle = newLocRot;
	}

	static enumToString(enumType, value) {
		for (var k in enumType)
			if (enumType[k] == value) {
				return k;
			}
		return null;
	}

	static randomFromTo(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static randomFromToFloat(min, max) {
		return Math.random() * (max - min + 1) + min;
	}

	static isEmpty(value: any): boolean {
		return (value == null || typeof (value) == 'undefined');
	}

	static getGMTString(date: Date) {
		let offset_m = -date.getTimezoneOffset();
		let offset_sign = (offset_m >= 0 ? '+' : '-');
		offset_m = Math.abs(offset_m);
		let offset_h = Math.floor(offset_m / 60);
		offset_m = offset_m % 60;
		return 'GMT' + offset_sign + offset_h + ':' + (offset_m <= 9 ? '0' + offset_m : offset_m);
	}

	static formatDate(date: Date, isShortFormat: boolean = false) {
		let s = date.getSeconds();
		let min = date.getMinutes();
		let h = date.getHours();
		let d = date.getDate();
		let m = date.getMonth() + 1;
		let y = date.getFullYear();
		return isShortFormat ?
			'' + (h <= 9 ? '0' + h : h) + ':' + (min <= 9 ? '0' + min : min) + ':' + (s <= 9 ? '0' + s : s) + ' ' + (m <= 9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d)
			: '' + y + '/' + (m <= 9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + ' ' + (h <= 9 ? '0' + h : h) + ':' + (min <= 9 ? '0' + min : min) + ' (' + Utils.getGMTString(date) + ')';
	}

	static getErrorMessage(err: any, language: string): string {

		let message: string = null;
		if ((typeof err === 'string' || err instanceof String)) {
			const json_obj = JSON.parse(err as string);
			let code_id: number = json_obj["code"];
			if (code_id != undefined && code_id != null) {
				//message from code
				message = TextController.getRawText("error_msg_" + code_id.toString());
			} else {
				//direct message from Backend
				message = TextController.getRawText(json_obj["message"]);
			}
		}
		//default message
		if (message == undefined || message == null) {
			message = TextController.getRawText("error_msg_02");
		}
		return message;
	}
	static showPopup(
		node,
		scaleSt = null,
		scaleFn = null,
		deltaScale = null,
		deltaTime = null
	) {
		let scaleFinal = scaleFn || 1;
		let scaleStart = scaleSt || 0;
		let scale = deltaScale || 0.015;
		let time = deltaTime || 0.08;
		cc.tween(node)
			.to(time, { scale: scaleFinal + scale })
			.to(time, { scale: scaleFinal - scale })
			.to(time, { scale: scaleFinal })
			.start();
		node.scale = scaleFinal;
	}

	static validateCertificationData(gameFeatures){
		for (const key in GameCertification) {
			if (Object.hasOwnProperty.call(GameCertification, key)) {
				if (gameFeatures.hasOwnProperty(key)) {
					GameCertification[key] = gameFeatures[key];
				}
			}
		}
	}
	static delayTime(time:number){
		return new Promise((resolve: Function)=>{
			cc.tween({}).delay(time).call(()=>{
				resolve();
			}).start();
		})
	}

	// static _calculateParagraphLength (paragraphedStrings, ctx) {
    //     let paragraphLength = [];
	//
    //     for (let i = 0; i < paragraphedStrings.length; ++i) {
    //         let width = Utils.safeMeasureText(ctx, paragraphedStrings[i], _fontDesc);
    //         paragraphLength.push(width);
    //     }
	//
    //     return paragraphLength;
    // }
	static safeMeasureText (ctx, string, desc) {
        let font = desc || ctx.font;
        let key = font + "\uD83C\uDFAE" + string;
        let cache = measureCache.get(key);
        if (cache !== null) {
            return cache;
        }

        let metric = ctx.measureText(string);
        let width = metric && metric.width || 0;
        measureCache.put(key, width);

        return width;
    }
	static findIndexIn2dArray = (array, search) => array.findIndex((n) => n.every((e, i) => search[i] !== undefined && search[i] === e));

	static getTitleWin(winRate): string{
		cc.log("getTitleWin: " + winRate);
		let strWinTitle = "";
		if(winRate >= 5 && winRate <= 15){
			strWinTitle = "big-win";
		}else if(winRate > 15 && winRate <= 35){
			strWinTitle = "mega-win";
		}else if(winRate > 35){
			strWinTitle = "super-mega-win";
		}
		return strWinTitle;
	}
	static cloneObject(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
}
export type LoadCompleteCallback<T> = (error: Error | null, asset: T, ...args: any) => void;
