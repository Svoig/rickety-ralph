import kaboom from "kaboom";

const TILE_WIDTH = 20;

kaboom({
    background: [50, 100, 200],
    scale: 0.5,
});

loadSprite("ralph", "ralph.png");


scene("title", () => {
    let hasGrantedPermission = false;

    touchEnd(async () => {
        if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
            await DeviceMotionEvent.requestPermission();
            go("main");
        }
    })

    const handleClick = async () => {
        if (hasGrantedPermission) {
            go("main");
        } else {
            if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
                add([rect(10, 10), pos(10, 0), body(), area(), color(GREEN)]);
                const response = await DeviceMotionEvent.requestPermission();
                if (response === "granted") {
                    hasGrantedPermission = true;
                    permissionsButton.text = "Tap to play!";
                }
            } else {
                go("main");
            }
        }
    };

    add([
        text("RICKETY RALPH'S RICKETY RIDE\n\nTap to start!", { size: 48 })
    ]);

    const permissionsButton = add([
        rect(100, 200),
        color([0, 200, 50]),
        pos(0, 150),
        text("Tap to grant accelerometer permissions", { size: 28 }),
    ]);


    onClick(handleClick)
    onTouchStart(handleClick);
    onKeyPress("enter", () => handleClick());
});


scene("main", () => {
    let player;

    const map = addLevel([
        "=====================================================================",
        "=                                                                   =",
        "=                                                                   =",
        "= R                                                                 =",
        "==========================                                          =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=        == == ==                  ==================================",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=           ==============         ==                               =",
        "=                                                                   =",
        "=========MMM   ===                   MMM=========================   =",
        "=               =                                                   =",
        "=               =                                                   =",
        "=               =                                                   =",
        "=MMM=============                                             ===MMM=",
        "=                                                                   =",
        "=                               ===========================mmm      =",
        "=                                                                   =",
        "=================                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                               *   =",
        "=====================================================================",
    ], {
        width: TILE_WIDTH,
        height: TILE_WIDTH,
        "=": () => [rect(TILE_WIDTH, TILE_WIDTH), color(GREEN), area(), solid(), "ground"],
        "R": () => ["ralphStart"],
        "*": () => [rect(TILE_WIDTH, TILE_WIDTH), color(YELLOW), area(), "goal"],
        "m": () => [rect(TILE_WIDTH, TILE_WIDTH), color(BLUE), area(), solid(), "movingPlatform", "ground", { moveFactor: 1 }],
        "M": () => [rect(TILE_WIDTH, TILE_WIDTH), color(BLUE), area(), solid(), "movingPlatform", "ground", { moveFactor: 2 }],
    });

    every("ralphStart", (ralphStart) => {
        player = add([
            // rect(TILE_WIDTH, TILE_WIDTH),
            sprite("ralph"),
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
            if (player.isActivatingPlatforms) {
                targetPosY = movingPlatform.originalY - (movingPlatform.moveFactor * (TILE_WIDTH * 2));
            } else {
                targetPosY = movingPlatform.originalY;
            }
            const lerped = lerp(movingPlatform.pos.y, targetPosY, 0.125);
            const isCloseEnough = Math.abs(lerped - targetPosY) < 1;

            movingPlatform.pos.y = isCloseEnough ? targetPosY : lerped;

        });
    });

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

    player.onCollide("ground", (ground) => {
        const collisionAngle = player.pos.angle(ground.pos);
        const hasHitWall = collisionAngle === 0 || collisionAngle === 180;


        // The player can die when they crash into the ground, or when they're more than 45 degrees rotated when they hit the ground
        // They can also die when they hit the ground after being airborne for too long (player.airborneCount)
        if (
            (hasHitWall && Math.abs(player.vel) > player.maxSafeVel)
            || (player.isAirborne && Math.abs(player.angle) > 45)
            || (player.isAirborne && player.airborneCount >= player.maxSafeAirborneCount)) {
            go("gameOver");
        }

        player.angle = 0;

        if (hasHitWall) {
            player.vel = 0;
        }

        player.isAirborne = false;

    });

    player.onCollide("goal", () => go("victory"));

    window.addEventListener("deviceorientation", (e) => {
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

    player.onUpdate(() => {
        // TODO: Make camera try to keep player at upper left
        camPos(player.pos);
        player.move(player.vel, 0);

        if (!player.isGrounded()) {
            player.isAirborne = true;
            // Add one to airborneCount per second (1 * dt() is one per second)
            // When too many add up, we'll kill them when they hit the ground
            // (stand in for detecting velocity y, since body() doesn't do that)
            player.airborneCount += 1 * dt();
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

scene("victory", () => {
    add([text("You win!\n\nTap to try again", { size: 36 })]);
    const playAgain = () => go("main");
    onTouchEnd(playAgain);
    onKeyPress("enter", () => playAgain());
    onClick(playAgain);
});

go("title");
