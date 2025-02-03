
import { supportedTextLanguage } from "../../Manager/Config";


const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomChangeMultilingual extends cc.Component {
    loadKeyForConfig(key){}
    checkIsHaveConfig(idLanguag:supportedTextLanguage,key:string,data?:any):boolean{
        return false;
    }
}
