import kaboom from "kaboom";

const TILE_WIDTH = 20;

const startGame = () => {

    document.querySelector("#pre-game").style = "visibility: hidden; display: none;";

    kaboom({
        background: [25, 25, 25],
        scale: 1,
    });

    // Can't do ScreenOrientation on iOS Safari
    // load(new Promise((resolve) => {
    //     if (ScreenOrientation && typeof ScreenOrientation.lock === "function") {
    //         ScreenOrientation.lock("landscape");
    //     }
    //     resolve("ok");
    // }));

    loadSprite("ralph", "ralph.png");
    loadSprite("scaffold", "scaffold.png");
    loadSprite("movingPlatform", "movingPlatform.png");
    loadSprite("coin", "coin.png");
    loadSprite("flag", "flag.png");
    loadSprite("explosion", "explosion.png", {
        sliceX: 3,
        sliceY: 3,
        anims: {
            pop: {
                from: 0,
                to: 8,
                speed: 12
            }
        }
    });
    loadSound("boom", "boom.m4a");
    loadSound("aroo", "aroo.m4a");

    function explode(player) {
        play("boom", { speed: 2 });
        const playerPos = player.pos;

        destroy(player);

        const explosion = add([sprite("explosion"), pos(playerPos), color(WHITE)]);
        explosion.play("pop");

        wait(1, () => {
            destroy(explosion)
            go("gameOver");
        })

    }

    let hasStartedGame = false;

    scene("title", () => {
        let hasGrantedPermission = false;

        // Has to be touchend to prompt for permissions
        window.addEventListener("touchend", () => {
            if (!hasStartedGame) {
                hasStartedGame = true;
                play("aroo", { speed: 4, detune: 2000 });
                handleClick();
            }
        });


        const handleClick = async () => {
            if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
                const value = await DeviceMotionEvent.requestPermission();
                if (value === "granted") {
                    hasGrantedPermission = true;
                } else {
                    titleText.text = "Accelerometer is required to play. Please enable access.\n\n";
                }
            } else {
                hasGrantedPermission = true;
            }

            if (hasGrantedPermission) {
                go("main");
                play("aroo", { speed: 4, detune: 2000 });
            }
        };

        onClick(handleClick);

        // const handleClick = async () => {
        //     if (hasGrantedPermission) {
        //         go("main");
        //     } else {
        //         if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
        //             add([rect(10, 10), pos(10, 0), body(), area(), color(GREEN)]);
        //             const response = await DeviceMotionEvent.requestPermission();
        //             if (response === "granted") {
        //                 hasGrantedPermission = true;
        //                 permissionsButton.text = "Tap to play!";
        //             }
        //         } else {
        //             go("main");
        //         }
        //     }
        // };

        const titleText = add([
            text("RICKETY RALPH'S RICKETY RIDE\n\nTap to start!", { size: 48 })
        ]);

        onKeyDown(["enter", "space"], () => {
            handleClick();
        });
    });


    scene("main", () => {
        let player;
        const startTime = Date.now();

        const map = addLevel([
            "=====================================================================",
            "=                                                                   =",
            "=                                                                   =",
            "= R                                                                 =",
            "===========================                                         =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                 ===============================m  =",
            "=                                   =                               =",
            "=                                   =                          C    =",
            "=                                   =                == == == ===   =",
            "=                                   =       C                       =",
            "=                                   =============                   =",
            "=                                   =                               =",
            "=                                   =============================M  =",
            "=                                   =                               =",
            "=                                   =                               =",
            "=                                   =   =============================",
            "=           ==============          =                               =",
            "=                        =          =                               =",
            "=============  ===       ===============================            =",
            "=               =        =                                          =",
            "=               =        =                                          =",
            "=               =        =                                          =",
            "=M  =============                  :::::::::::::::::::::::::=========",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=   =============                                                   =",
            "=                ==                                                 =",
            "=                        C                                          =",
            "=     C            ==   ==                                          =",
            "=M  =====                =                                          =",
            "=                    ==  =                                          =",
            "=                        =                                          =",
            "=                        =                                          =",
            "=M  =====   =        =====                                          =",
            "=           =      ==                                               =",
            "=           =                                                       =",
            "=           =    ==                                                 =",
            "=   =====M  =                                                       =",
            "=              ==                                                   =",
            "=                                                                   =",
            "=M  ===========                                                     =",
            "=                                                                   =",
            "=                                                                   =",
            "=                     ============================                  =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                           ======                  =",
            "=                                                                   =",
            "=                     ==================          m  ================",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "==============M                                                     =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                                                   =",
            "=                            =============                          =",
            "=                                                                   =",
            "=                                                                   =",
            "=                                            ====                   =",
            "=                                                                   =",
            "=                                                    =====          =",
            "=                                                               *   =",
            "=====================================================================",
        ], {
            width: TILE_WIDTH,
            height: TILE_WIDTH,
            "=": () => [sprite("scaffold", { height: TILE_WIDTH, width: TILE_WIDTH }), area(), solid(), "ground"],
            ":": () => [sprite("scaffold", { height: TILE_WIDTH, width: TILE_WIDTH }), color(BLACK), area(), solid(), "ground", "crumbling"],
            "R": () => ["ralphStart"],
            "*": () => [sprite("flag", { height: TILE_WIDTH, width: TILE_WIDTH }), area(), "goal"],
            // Elevator width is * 3 to avoid having three platforms for each one
            "m": () => [sprite("movingPlatform", { height: TILE_WIDTH, width: TILE_WIDTH * 3 }), area(), solid(), "movingPlatform", "ground", { moveFactor: 1 }],
            // Elevator width is * 3 to avoid having three platforms for each one
            "M": () => [sprite("movingPlatform", { height: TILE_WIDTH, width: TILE_WIDTH * 3 }), area(), solid(), "movingPlatform", "ground", { moveFactor: 2 }],
            "C": () => [sprite("coin", { height: TILE_WIDTH, width: TILE_WIDTH }), area(), "coin"],
        });

        every("ralphStart", (ralphStart) => {
            player = add([
                sprite("ralph", { height: TILE_WIDTH, width: TILE_WIDTH }),
                pos(ralphStart.pos),
                area(),
                body(),
                rotate(0),
                {
                    vel: 0,
                    acc: 10,
                    maxVel: 500,
                    maxSafeVel: 350,
                    isActivatingPlatforms: false, // Controls whether moving platforms should be activated
                    isAirborne: false,
                    airborneCount: 0, // Used to determine how long the player has been in the air to decide if landing is safe
                    maxSafeAirborneCount: 0.5, // In seconds
                }
            ]);
        });

        every("movingPlatform", (movingPlatform) => {
            movingPlatform.originalY = movingPlatform.pos.y;
            let targetPosY = movingPlatform.originalY;

            movingPlatform.onUpdate(() => {
                if (player.pos.dist(movingPlatform.pos) < 300 && player.isActivatingPlatforms) {
                    targetPosY = movingPlatform.originalY - (movingPlatform.moveFactor * (TILE_WIDTH * 2));
                } else {
                    targetPosY = movingPlatform.originalY;
                }
                const lerped = lerp(movingPlatform.pos.y, targetPosY, 0.25);
                const isCloseEnough = Math.abs(lerped - targetPosY) < 1.5;

                movingPlatform.pos.y = isCloseEnough ? targetPosY : lerped;

            });
        });

        // Coins
        let coinsCollected = 0;
        const coinsText = add([
            text("Coins collected: 0", { size: 24 }),
            pos(10, 10),
            fixed(),
        ]);


        // DEBUG
        // const velText = add([text("Vel: 0", { size: 24 }, pos(player.pos.x, player.pos.y - 24))]);
        // velText.onUpdate(() => {
        //     velText.pos = [player.pos.x, player.pos.y - 24]
        //     velText.text = `Vel: ${player.vel}`;
        // });
        // const rotText = add([text("Rot: 0", { size: 24 }, pos(player.pos.x, player.pos.y - 48))]);
        // rotText.onUpdate(() => {
        //     rotText.pos = [player.pos.x, player.pos.y - 48]
        //     rotText.text = `Rot: ${player.angle}`;
        // });

        player.onCollide("crumbling", (crumbling) => {
            wait(0.25, () => {
                destroy(crumbling);
            });
        });

        player.onCollide("ground", (ground) => {
            const collisionAngle = player.pos.angle(ground.pos);
            const hasHitWall = collisionAngle === 0 || collisionAngle === 180;


            // The player can die when they crash into the ground, or when they're more than 45 degrees rotated when they hit the ground
            // They can also die when they hit the ground after being airborne for too long (player.airborneCount)
            if (
                (hasHitWall && Math.abs(player.vel) > player.maxSafeVel)
                || (player.isAirborne && Math.abs(player.angle) > 45)
                || (player.isAirborne && player.airborneCount >= player.maxSafeAirborneCount)) {
                explode(player);
            }

            player.angle = 0;

            if (hasHitWall) {
                player.vel = 0;
            }

            player.isAirborne = false;

        });

        player.onCollide("coin", (coin) => {
            coinsCollected++;
            coinsText.text = `Coins collected: ${coinsCollected}`;
            destroy(coin);
            play("boom", { speed: 8, detune: 8000 });
        });

        player.onCollide("goal", () => go("victory", { coinsCollected, startTime, endTime: Date.now() }));

        window.addEventListener("deviceorientation", (e) => {
            // TODO: Auto-detect which side of the device is to the left and use that to determine which rotation value to use
            // TODO: Consolidate this and the keyboard movement into one function
            if (Math.abs(player.vel) < player.maxVel) {
                // The raw input makes the movement very sensitive
                player.vel += (e.beta / 5);
            }

            // Rotate player in air
            if (!player.isGrounded()) {
                player.angle += (e.beta / 10);
            }
        });

        const activatePlatforms = () => {
            if (!player.isActivatingPlatforms) {
                player.isActivatingPlatforms = true;
            }
        };

        const deactivatePlatforms = () => {
            if (player.isActivatingPlatforms) {
                player.isActivatingPlatforms = false;
            }
        };


        onMouseDown(() => activatePlatforms());
        onMouseRelease(() => deactivatePlatforms());

        keyPress("space", () => activatePlatforms());
        keyRelease("space", () => deactivatePlatforms());

        keyDown("right", () => {
            if (player.vel < player.maxVel) {
                player.vel += player.acc;
            }

            if (!player.isGrounded()) {
                player.angle += player.acc / 5;
            }
        });

        keyDown("left", () => {
            if (player.vel > -player.maxVel) {
                player.vel -= player.acc;
            }

            if (!player.isGrounded()) {
                player.angle -= player.acc / 5;
            }
        });

        keyDown("y", () => {
            console.log("Screen pos: ", player.screenPos(), "Width: ", width());
        });

        player.onUpdate(() => {
            player.move(player.vel, 0);
            camPos(player.pos.x, player.pos.y + 100);
            // TODO: Make camera try to keep player at upper left
            // const lerpedCamPos = lerp(camPos(), camPos(), 1.0);

            if (!player.isGrounded()) {
                player.isAirborne = true;
                // Add one to airborneCount per second (1 * dt() is one per second)
                // When too many add up, we'll kill them when they hit the ground
                // (stand in for detecting velocity y, since body() doesn't do that)
                player.airborneCount += 1 * dt();
                // Rotate while airborne due to velocity in addition to the rotation from movement
                player.angle += player.vel / 100;
            } else {
                // Reset airborne count when hitting the ground
                player.airborneCount = 0;
                if (Math.abs(player.vel) > 0.025) {
                    // Lose some velocity while grounded (if moving faster than 0.025 to avoid rounding errors)
                } else if (Math.round(player.vel) < 0) {
                    player.vel++;
                } else {
                    player.vel--;
                }
            }
        });
    });

    scene("gameOver", () => {
        add([text("Game Over!\n\nTap to try again", { size: 36 })]);
        const playAgain = () => go("main");
        onTouchEnd(playAgain);
        onKeyPress("enter", () => playAgain());
        onClick(playAgain);
    });

    scene("victory", ({ coinsCollected, startTime, endTime }) => {
        play("aroo", { speed: 4, detune: 2000 });
        // TODO: Score based on coins and time to complete
        add([text(`You win! You collected ${coinsCollected} coins!\n\nYou completed the level in ${(endTime - starTime) / 1000} seconds!\n\nTap to try again`, { size: 36 })]);
        const playAgain = () => go("main");
        onTouchEnd(playAgain);
        onKeyPress("enter", () => playAgain());
        onClick(playAgain);
    });

    go("title");
};

document.querySelector("#start button").onclick = startGame;
