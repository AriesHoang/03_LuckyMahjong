import { supportedTextLanguage } from "../../Manager/Config";
import TextController from "../../Manager/TextController";
import CustomChangeMultilingual from "./CustomChangeMultilingual";



const {ccclass, property} = cc._decorator;

@ccclass('LanguageUseImg')
export class LanguageUseImg {   
    @property({ type: cc.Enum(supportedTextLanguage) })
    languageId: supportedTextLanguage = supportedTextLanguage.en;
    
 
    @property(cc.SpriteFrame)
    public imageIcon: cc.SpriteFrame = null;
    
    @property()
    imageRequiredSize:boolean  = false;
    @property({
        visible() {
            return this.imageRequiredSize
        },
    })
    scale: number = 1;
    @property({
        type:[cc.Size],
        visible() {
            return this.imageRequiredSize
        },
    })
    size: cc.Size = null;
}

@ccclass
export default class CustomChangeToImage extends CustomChangeMultilingual {
    @property(cc.Sprite)
    sprite : cc.Sprite = null;
    isLoadRes:boolean;

    @property([LanguageUseImg])
    listLanguageUseImg : LanguageUseImg [] = [new LanguageUseImg()];

    config:LanguageUseImg = null;

    setSpriteFame(spriteFame:cc.SpriteFrame){
        if(this.sprite){
            this.sprite.spriteFrame = spriteFame;
            this.sprite.node.active = true;
        }
      
        else {
            let nodeX= new cc.Node();
            nodeX.parent = this.node;
            this.sprite =nodeX.addComponent(cc.Sprite);
            this.sprite.spriteFrame = spriteFame;
        }
    }

    loadKeyForConfig(key){
        this.node.children.forEach(element => {
            element.active = false;
        });
      
        if(!this.config.imageIcon)
        this.config.imageIcon = TextController.getTextSpriteFrame(key);
        
        this.setSpriteFame(this.config.imageIcon);
    }

    checkIsHaveConfig(idLanguag:supportedTextLanguage,key:string):boolean{
        this.config = this.listLanguageUseImg.find(element => element.languageId = idLanguag)
        if(this.config){
         
            this.loadKeyForConfig(key);
            return true;
        }
        return false;
    }
}
