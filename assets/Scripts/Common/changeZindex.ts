

const {ccclass, property} = cc._decorator;

@ccclass
export default class changeZindex extends cc.Component {

    // onLoad () {}

    start () {
        this.node.zIndex = 100;
    }

    // update (dt) {}
}
