export enum DIALOG_STATE {
    Hide,
    Moving,
    Show
}
const {ccclass, property} = cc._decorator;

@ccclass
export default class DialogBase extends cc.Component {
    curState: DIALOG_STATE = DIALOG_STATE.Hide;
    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;
    
    start () {

    }

    // update (dt) {}
}
