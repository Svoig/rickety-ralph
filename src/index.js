import kaboom from "kaboom";

window.addEventListener("touchend", async (e) => {
    const h1 = document.createElement("h1");
    h1.textContent = "touchend";
    document.body.appendChild(h1);

    const value = await DeviceOrientationEvent.requestPermission();
    h1.textContent = value;
});

const TILE_WIDTH = 5;

kaboom({
    background: [50, 100, 200],
    scale: 2,
});


scene("title", () => {
    let hasGrantedPermission = false;

    const touchListener = window.addEventListener("touchend", async () => {
        if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
            add([rect(10, 10), pos(10, 0), area(), body(), color(GREEN)]);
            await DeviceMotionEvent.requestPermission();
            window.removeEventListener(touchListener);
            go("main");
        }
    });

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
        text("RICKETY RALPH'S RICKETY RIDE\n\nTap to start!", { size: 24 })
    ]);

    const permissionsButton = add([
        rect(100, 200),
        color([0, 200, 50]),
        pos(0, 150),
        text("Tap to grant accelerometer permissions", { size: 14 }),
    ]);


    onClick(handleClick)
    onTouchStart(handleClick);
    onKeyPress("enter", () => handleClick());
});


scene("main", () => {
    let player;

    const map = addLevel([
        "=                                                                   =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                R                                  =",
        "=                             ==============                        =",
        "=                                                                   =",
        "=                                                                   =",
        "=                                                              ======",
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
    });

    every("ralphStart", (ralphStart) => {
        player = add([
            rect(TILE_WIDTH, TILE_WIDTH),
            color(255, 0, 0),
            pos(ralphStart.pos),
            area(),
            body(),
            {
                vel: 0,
                acc: 10,
                maxVel: 500,
                maxSafeVel: 250,
                isAirborne: false
            }
        ]);
    });

    const velText = add([text("0", { size: 10 }, pos(player.pos.x, player.pos.y - 10))]);
    velText.onUpdate(() => {
        velText.pos = [player.pos.x, player.pos.y - 10]
        velText.text = player.vel;
    });

    player.onCollide("ground", (ground) => {
        const collisionAngle = player.pos.angle(ground.pos);
        const hasHitWall = collisionAngle === 0 || collisionAngle === 180;

        // The player can die when they hit the ground from being airborne, or when they crash into the ground
        if ((player.isAirborne || hasHitWall) && Math.abs(player.vel) > player.maxSafeVel) {
            go("gameOver");
        }

        if (hasHitWall) {
            player.vel = 0;
        }

        player.isAirborne = false;

    });

    player.onCollide("goal", () => go("victory"));

    window.addEventListener("deviceorientation", (e) => {
        console.log(e);
        if (Math.abs(player.vel) < player.maxVel) {
            player.vel += e.beta;
        }
    });

    keyDown("right", () => {
        if (player.vel < player.maxVel) {
            player.vel += player.acc;
        }
    });

    keyDown("left", () => {
        if (player.vel > -player.maxVel) {
            player.vel -= player.acc;
        }
    });

    player.onUpdate(() => {
        player.move(player.vel, 0);
        if (!player.isGrounded()) {
            player.isAirborne = true;
        } else if (Math.abs(player.vel) > 0.025) {
            // Lose some velocity while grounded (if moving faster than 0.025 to avoid rounding errors)
            if (Math.round(player.vel) < 0) {
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
