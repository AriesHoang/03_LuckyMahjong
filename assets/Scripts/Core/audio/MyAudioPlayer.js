import AudioPlayer, {AudioObject} from "./AudioPlayer";
import {AudioPlayId} from "../../config/AudioPlayId";


cc.Class({
    extends: AudioPlayer,

    properties: {
        arrayAudioObj: {
            type: [AudioObject],
            default: function () {
                let arr = [];
                for (let key in AudioPlayId) {
                    let a = new AudioObject();
                    a.name = AudioPlayId[key + ""];
                    a.isMusic = false;
                    a.audioClip = null;
                    arr.push(a);
                }
                return arr;
            },
            override: true
        }
    }

});
