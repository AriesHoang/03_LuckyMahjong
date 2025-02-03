import { GameConfig } from "../../Manager/Config";


const { ccclass, property } = cc._decorator;

enum E_WHEEL_STATE {
    IDLE = 0,
    SWING_START,
    ACCELERATE_SPIN,
    CONSTANT_SPIN,
    STOP_ACCELERATE_SPIN,
    SPIN_TO_RESULT, //Spin to result
    SWING_STOP,
    TRANSITIONING
};

@ccclass
export default class SpinWheel extends cc.Component {
    private _onStateFinish: Function = null;
    private _state: E_WHEEL_STATE = E_WHEEL_STATE.IDLE;
    public set state(v: E_WHEEL_STATE) { this._state = v; }
    private _curSpeed: number = 0; //in angle
    private _timeSpin: number = 0;
    private _resultAngle: number = null;
    private _angleToResult: number = null;
    private _spinToResultAccelerate: number = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        if (this._state != E_WHEEL_STATE.IDLE) {
            this._timeSpin += dt;
        }

        if (this._state == E_WHEEL_STATE.ACCELERATE_SPIN) {
            this._curSpeed += GameConfig.wheelSpin.startAccelerate * dt * 4;
            this._curSpeed = Math.min(this._curSpeed, GameConfig.wheelSpin.maxSpinSpeed);
            this.rotateBy(this._curSpeed * dt);
            if (this._curSpeed >= GameConfig.wheelSpin.maxSpinSpeed) {
                this.state = E_WHEEL_STATE.TRANSITIONING;
                if (this._onStateFinish) {
                    this._onStateFinish();
                }
            }
        } else if (this._state == E_WHEEL_STATE.CONSTANT_SPIN) {
            this.rotateBy(this._curSpeed * dt);
            if (this._timeSpin >= GameConfig.wheelSpin.stopDelay) {
                this.state = E_WHEEL_STATE.TRANSITIONING;
                if (this._onStateFinish) {
                    this._onStateFinish();
                }
            }
        } else if (this._state == E_WHEEL_STATE.STOP_ACCELERATE_SPIN) {
            this._curSpeed -= GameConfig.wheelSpin.stopAccelerate * dt * 2;
            this._curSpeed = Math.max(this._curSpeed, GameConfig.wheelSpin.minStopSpeed);
            this.rotateBy(this._curSpeed * dt);
            if (this._curSpeed <= GameConfig.wheelSpin.minStopSpeed) {
                this.state = E_WHEEL_STATE.TRANSITIONING;
                if (this._onStateFinish) {
                    this._onStateFinish();
                }
            }
        } else if (this._state == E_WHEEL_STATE.SPIN_TO_RESULT) {
            this.rotateBy(this._curSpeed * dt);
            this._angleToResult -= this._curSpeed * dt;
            if (this._angleToResult <= 0) {
                this.state = E_WHEEL_STATE.TRANSITIONING;
                if (this._onStateFinish) {
                    this._onStateFinish();
                }
            }
        } else if (this._state == E_WHEEL_STATE.TRANSITIONING) {
            this.rotateBy(this._curSpeed * dt);
        }
    }

    spinPromise(): Promise<any> {
        this._timeSpin = 0;
        return this.swingAtStartPromise()
            .then(this.accelerateSpinPromise.bind(this))
            .then(this.spinAtConstantPromise.bind(this));
    }

    showResultPromise(resultAngle: number, onStopFn: Function = null): Promise<any> {
        return this.stopAccelerateSpinPromise()
            .then(() => {
                let objTween = { startVal: 0 };
                cc.Tween.stopAllByTarget(objTween);
                cc.tween(objTween)
                    .delay(Math.abs(resultAngle - this.node.angle) / (GameConfig.wheelSpin.minStopSpeed * 1000) + 1.5)
                    .call(() => {
                        if (onStopFn) onStopFn();
                    })
                    .start();
                return this.spinToResultPromise(resultAngle);
            })
            .then(() => {
                return this.swingAtEndPromise();
            });
    }

    reset() {
        this.node.angle = 0;
    }

    rotateBy(angle: number) {
        this.node.angle -= angle;
    }

    setAngle(angle) {
        this.node.angle = angle;
    }

    swingAtStartPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.state = E_WHEEL_STATE.SWING_START;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .by(GameConfig.wheelSpin.startSwingTime, { angle: GameConfig.wheelSpin.startSwingAngle })
                .call(resolve.bind(this))
                .start();
        });
    }

    accelerateSpinPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.state = E_WHEEL_STATE.ACCELERATE_SPIN;
            this._onStateFinish = resolve;
        });
    }

    spinAtConstantPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.state = E_WHEEL_STATE.CONSTANT_SPIN;
            this._onStateFinish = resolve;
        });
    }

    stopAccelerateSpinPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.state = E_WHEEL_STATE.STOP_ACCELERATE_SPIN;
            this._onStateFinish = resolve;
        });
    }

    spinToResultPromise(resultAngle: number): Promise<any> {
        return new Promise((resolve: Function) => {
            this._resultAngle = resultAngle;
            this._angleToResult = this.node.angle - resultAngle;
            //min angle is 180
            while (this._angleToResult < 180) { this._angleToResult += 360; }
            //calculate spin to result accelerate
            this.state = E_WHEEL_STATE.SPIN_TO_RESULT;
            this._onStateFinish = resolve;
        });
    }

    swingAtEndPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.state = E_WHEEL_STATE.SWING_STOP;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .by(GameConfig.wheelSpin.endSwingTime * 0.5, { angle: -GameConfig.wheelSpin.endSwingAngle })
                .by(GameConfig.wheelSpin.endSwingTime * 0.5, { angle: GameConfig.wheelSpin.endSwingAngle })
                //.to(GameConfig.wheelSpin.endSwingTime * 0.5, { angle: this._resultAngle })
                .call(() => {
                    this.node.angle = this._resultAngle;
                    resolve();
                })
                .start();
        });
    }
}
