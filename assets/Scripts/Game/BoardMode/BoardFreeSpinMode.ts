import { clientEvent } from "../../Core/observer/clientEvent";
import BoardData, { SpinResultInfo } from "../../Data/GamePlay/BoardData";
import { Cfg, GameConfig } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import Utils from "../../Utils/Utils";
import BoardUI, { ActionCheckWin, E_BOARD_STATE } from "../BoardUI";
import ItemSymbol from "../ItemSymbol";
import MultiplierInfo from "../MultiplierInfo";
import SpinReel from "../SpinReel";
import StickyLayer from "../StickyLayer";
import { BaseBoardMode, IBoardMode } from "./IBoardMode";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import ShakeAction from "../../Core/ShakeAction";
import GameController from "../GameController";
import TextController from "../../Manager/TextController";
import BoardNormalMode from "./BoardNormalMode";


const { ccclass, property } = cc._decorator;
const animDefault = {
    4: { nameAnime: "1.1", index: 1 },
    5: { nameAnime: "2.1", index: 2 },
    6: { nameAnime: "3.1", index: 3 },
    7: { nameAnime: "4.1", index: 4 },
    8: { nameAnime: "5.1", index: 5 }
}

@ccclass
export default class BoardFreeSpinMode extends BoardNormalMode implements IBoardMode {
  


}
