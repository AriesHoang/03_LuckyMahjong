window.boot = function () {
    cc.textUtils.label_lastWordRex = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёảàãáạâấầẫẩậăắằẵẳặẻèẽéẹêểềễếệỏòõóọôốồỗổộơởờỡớợủùũúụửừữứựẢÀÃÁẠÂẤẦẪẨẬĂẮẰẴẲẶẺÈẼÉẸÊỂỀỄẾỆỎÒÕÓỌÔỐỒỖỔỘƠỞỜỠỚỢỦÙŨÚỤỬỪỮỨỰỬỨỮỰÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ]+|\S)$/;
    cc.textUtils.label_lastEnglish = /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёảàãáạâấầẫẩậăắằẵẳặẻèẽéẹêểềễếệỏòõóọôốồỗổộơởờỡớợủùũúụửừữứựẢÀÃÁẠÂẤẦẪẨẬĂẮẰẴẲẶẺÈẼÉẸÊỂỀỄẾỆỎÒÕÓỌÔỐỒỖỔỘƠỞỜỠỚỢỦÙŨÚỤỬỪỮỨỰỬỨỮỰÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ]+$/;
    cc.textUtils.label_firstEnglish = /^[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёảàãáạâấầẫẩậăắằẵẳặẻèẽéẹêểềễếệỏòõóọôốồỗổộơởờỡớợủùũúụửừữứựẢÀÃÁẠÂẤẦẪẨẬĂẮẰẴẲẶẺÈẼÉẸÊỂỀỄẾỆỎÒÕÓỌÔỐỒỖỔỘƠỞỜỠỚỢỦÙŨÚỤỬỪỮỨỰỬỨỮỰÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ]/;
    cc.textUtils.label_russian = /[а-яА-ЯёЁ]/;

    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var deleteTextNodes = function(a) {
        var ch = Array.from(a.childNodes);
      for (var i = 0; i < ch.length; i++) {
        ch[i].nodeType === 3 ?  a.removeChild(ch[i]) :  deleteTextNodes(ch[i]);
      }
    };
    var onProgress = function(finish, total){
        const percent = Math.floor((finish/total)*100);
        const percentText = document.getElementById('percent-text');
        deleteTextNodes(percentText);
        const text = document.createTextNode("" + percent);
        percentText.appendChild(text);
    };

    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    var onStart = function () {
        // cc.director.preloadScene("GameScene");
        
        // ----- nagaLoadingChanges ------ //
        let isDoneVideo = false;
        let isDoneLoadScene = false;
        var defaultSence;

        var HideBG = function(){
            document.getElementById('background-container').style.visibility = 'hidden';
        }
        var CheckCanOpenSecene = function () {
            if (!isDoneLoadScene || !isDoneVideo) return;
            cc.director.runSceneImmediate(defaultSence);
            if (cc.sys.isBrowser) {
                const myTimeout = setTimeout( HideBG, .5); // this time has been given in css file
              
                var canvas = document.getElementById('GameCanvas');
                canvas.style.visibility = '';
                var div = document.getElementById('GameDiv');
                if (div) {
                    div.style.backgroundImage = '';
                }
                console.log('Success to load scene: ' + launchScene);
            }

        }
        // ----- nagaLoadingChanges ------ //

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen(false);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });
        console.log('------ start load game ------')
        // ----- nagaLoadingChanges ------ //

        var bgImg = document.getElementById('background-img');
        bgImg.src = "src/background.jpg";

        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {

                    defaultSence = scene;
                    isDoneLoadScene = true;
                    CheckCanOpenSecene();

                    // cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        // var splashContainer = document.getElementById('background-container');
                        // splashContainer.style.visibility = 'hidden';
                        // var canvas = document.getElementById('GameCanvas');
                        //     canvas.style.visibility = '';
                        // var div = document.getElementById('GameDiv');
                        // if (div) {
                        //     div.style.backgroundImage = '';
                        // }
                        // console.log('Success to load scene: ' + launchScene);
                    }
                }
            }
        );
        // ----- nagaLoadingChanges ------ //

        SplashAnimation().then((result) => {
            isDoneVideo = true;
            // document.getElementById('fade').classList.add("transparent");
            CheckCanOpenSecene();
        });
    };

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.2f4d1.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.2f4d1.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
    window.SplashAnimation();
}

SplashAnimation = function (){
    return new Promise((resolve, reject) => {
        const spriteWidth = 200;
        const spriteHeight = 140;
        const sheetWidth = 1600;
        const sheetHeight = 2100;
        const rows = sheetHeight / spriteHeight; // 15 hàng
        const cols = sheetWidth / spriteWidth;  // 8 cột

        // Tạo animation từ spritesheet
        const imgElement = document.createElement('img');
        imgElement.src = 'src/splashLogo.png';
        // imgElement.style.position = 'absolute';
        imgElement.style.width = `${spriteWidth}px`;
        imgElement.style.height = `${spriteHeight}px`;
        imgElement.style.objectFit = 'none';
        imgElement.style.objectPosition = '0 0';
        imgElement.style.scale = '1.4';
        
        const container = document.getElementById("sprite");
        container.appendChild(imgElement);

        let currentFrame = 0;
    const totalFrames = rows * cols;
    const fps = 30; // Frame per second
    let animateSprite = ()=>{
        const col = currentFrame % cols;
        const row = Math.floor(currentFrame / cols);
        imgElement.style.objectPosition = `-${col * spriteWidth}px -${row * spriteHeight}px`;
        currentFrame = (currentFrame + 1) % totalFrames;
        if(currentFrame == 119)
        {
            resolve();
            return;
        }else
            setTimeout(animateSprite, 1000 / fps);
    }

    animateSprite();
      });
}
