
const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomScrollView extends cc.ScrollView {
    @property(cc.Float)
    wheelPrecision: number = -0.5;
    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.elastic = false;   //custom wheel precision has boundaries issue with elastic mode
    }

    // start () {

    // }

    // update (dt) {}

    protected onEnable(): void {    
        super.onEnable();
        if (!CC_EDITOR) {
            this.node.off(cc.Node.EventType.MOUSE_WHEEL);
            this.node.on(cc.Node.EventType.MOUSE_WHEEL, this._onCustomMouseWheel, this, true);
        }
        super["_updateScrollBarState"]();
        super["_calculateBoundary"]();
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.MOUSE_WHEEL, this._onCustomMouseWheel, this, true);
        super.onDisable();
    }

    private _onCustomMouseWheel (event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (super["hasNestedViewGroup"](event, captureListeners)) return;

        let deltaMove = cc.v2(0, 0);
        let wheelPrecision = this.wheelPrecision;
        if(CC_JSB || CC_RUNTIME) {
            wheelPrecision = -7;
        }
        if(this.vertical) {
            deltaMove = cc.v2(0, event.getScrollY() * wheelPrecision);
        }
        else if(this.horizontal) {
            deltaMove = cc.v2(event.getScrollY() * wheelPrecision, 0);
        }

        super["_mouseWheelEventElapsedTime"] = 0;
        super["_processDeltaMove"](deltaMove);

        if(!super["_stopMouseWheel"]) {
            super["_handlePressLogic"]();
            super.schedule(super["_checkMouseWheel"], 1.0 / 60);
            super["_stopMouseWheel"] = true;
        }

        super["_stopPropagationIfTargetIsMe"](event);
    }
}
