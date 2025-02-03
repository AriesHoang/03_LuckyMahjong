import CurrencyConverter from "../../Common/CurrencyConverter";
import CustomScrollView from "../../Core/CustomScrollView";
import { Cfg, GameCertification } from "../../Manager/Config";
import TextController from "../../Manager/TextController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Rule extends cc.Component {

    static inst: Rule = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    scrollView: cc.Node = null;

    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    @property(cc.Label)
    versionLabel: cc.Label = null;

    private onHideCallback: Function = null;

    @property(cc.Node)
    autoSpinContent: cc.Node[] = [];
    @property(cc.Node)
    turboSpinContent: cc.Node[] = [];
    @property(cc.Node)
    buyFeatureContent: cc.Node[] = [];
    @property(cc.Node)
    gambleFeatureContent: cc.Node[] = [];
    @property(cc.Node)
    anteBetFeatureContent: cc.Node[] = [];
    @property(cc.Node)
    jackpotFeatureContent: cc.Node[] = [];

    @property(cc.Label)
    rtpLabel: cc.Label = null;

    @property(sp.Skeleton)
    skeletonPurple: sp.Skeleton = null;

    @property(cc.Label)
    lbPurple: cc.Label = null;

    start() {
        Rule.inst = this;
        this.bg.height = this.node.height;
        this.bg.y = - this.node.height;
        this.bg.active = false;

        this.versionLabel.string = TextController.getRawText('GAME_VERSION').split("{0}").join(Cfg.gameVersionStr);
        // this.versionLabel.string = "Version " + Cfg.gameVersionStr;

        this.updateActiveLayout(this.autoSpinContent, GameCertification.show_autoplay_feature);
        this.updateActiveLayout(this.turboSpinContent, GameCertification.show_turbo_feature);
        this.updateActiveLayout(this.buyFeatureContent, GameCertification.show_buy_feature);
        this.updateActiveLayout(this.gambleFeatureContent, GameCertification.show_gamble_feature);
        this.updateActiveLayout(this.anteBetFeatureContent, GameCertification.show_ante_bet_feature);
        this.updateActiveLayout(this.jackpotFeatureContent, GameCertification.show_jackpot_feature);

        if (this.rtpLabel) {
            const rtpString: string = CurrencyConverter.getCreditString(Cfg.rtpValue);
            this.rtpLabel.string = TextController.getRawText("RULE_RTP_1").replace(/\d+(\.\d+)?/g, rtpString);
        }
        // let a = 0;
        // let b = 1;
        // this.schedule( async ()=>{
          
        //   await  this.onChangeProcessPurple(a,b);
        //   let name_anim = "stack_"+ b;
        //   this.skeletonPurple.setAnimation(0,name_anim, true);
        //     a++;
        //     b++;
        //
        //     if(a>=5){
        //         a = 0;
        //         b = 1;
        //     }
        // },1)
        
    }

    // onChangeProcessPurple(fromVCol:number,vCol: number): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         if(vCol != 5){
    //             this.lbPurple.string = "1"
    //         }
    //         let name_anim = "stack_"+fromVCol +"->"+ vCol;
    //         this.skeletonPurple.setAnimation(0,name_anim, false);
    //         this.skeletonPurple.setCompleteListener((trackEntry) => {
    //             if(vCol == 5){
    //                 this.lbPurple.string = "2"
    //             }
    //             if (trackEntry['animation']['name'] == name_anim) {
    //                 resolve();
    //             }
    //         });
    //     })
    //
    // }


    updateActiveLayout(contentArray , enabled){
        contentArray.forEach(element => {
            if (element) element.active = enabled;
        });
    }

    update(dt) {
        let viewRect = cc.rect(- this.scrollView.width / 2, - this.scrollViewContent.y - this.scrollView.height, this.node.width, this.node.height);
        for (let i = 0; i < this.scrollViewContent.children.length; i++) {
            const node = this.scrollViewContent.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    }

    showPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            let scrollView = this.scrollView.getComponent(CustomScrollView);
            scrollView.content.y = 0;

            this.bg.active = true;
            cc.tween(this.bg)
                .to(.5, { y: -110 }, { easing: 'cubicIn' })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    hidePromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            let _this = this;
            cc.tween(this.bg)
                .to(.5, { y: - _this.node.height }, { easing: 'cubicOut' })
                .call(() => {
                    _this.bg.active = false;
                    resolve();
                })
                .start();
        });
    }
}
