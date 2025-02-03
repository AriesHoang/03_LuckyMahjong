// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class UtilsStageLoading {

    public static loadRes<T>(url: string, type: any | null, cb?: LoadCompleteCallback<T>) {
        if (type) {
            cc.loader.loadRes(url, type, (err, res) => {
                if (err) {
                    cc.error(err.message || err);
                    if (cb) {
                        cb(err, res);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res);
                }
            });
        } else {
            cc.loader.load(url, (err, res) => {
                if (err) {
                    cc.error(err.message || err);
                    if (cb) {
                        cb(err, res as T);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res as T);
                }
            });
        }
    }
    public static preLoadRes<T>(url: string, type: any | null, cb?: LoadCompleteCallback<T>) {

        cc.resources.preload(url, type, (err, res) => {
            if (err) {
                cc.error(err.message || err);
                if (cb) {
                    //@ts-ignore
                    cb(err, res as T);
                }

                return;
            }

            if (cb) {
                //@ts-ignore
                cb(err, res as T);
            }
        });

    }
}
export type LoadCompleteCallback<T> = (error: Error | null, asset: T,...args: any) => void;