import kaboom from "kaboom";

const TILE_WIDTH = 5;

kaboom({
    background: [50, 100, 200],
    scale: 2,
});


scene("title", () => {
    let hasGrantedPermission = false;

    window.addEventListener("deviceorientation", (e) => {

                add([rect(10, 10), pos(10, 0), body(), area(), color(RED)]);
    });

    const touchListener = window.addEventListener("touchstart", async () => {
            if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
                add([rect(10, 10), pos(10, 0), body(), area(), color(GREEN)]);
                await DeviceMotionEvent.requestPermission();
                window.removeEventListener(clickListener);
                go("main");
            }
    });

    const handleClick = () => {
        // go("main");
        if (hasGrantedPermission) {
            go("main");
        } else {
            // if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
            //     add([rect(10, 10), pos(10, 0), body(), area(), color(GREEN)]);
            //     DeviceMotionEvent.requestPermission();
            // } else if (DeviceMotionEvent) {
            //     hasGrantedPermission = true;
            //     window.addEventListener("deviceorientation", (e) => {
            //         console.log("TILT!! ", e);
            //     })
            //     add([rect(10, 10), pos(10, 0), body(), area(), color(BLUE)]);
            // }
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
});


scene("main", () => {
    const player = add([
        rect(TILE_WIDTH, TILE_WIDTH),
        color(255, 0, 0),
        pos(100, 100),
        area(),
        body(),
        {
            vel: 0,
            acc: 10,
            maxVel: 500,
        }
    ]);

    const ground = add([
        rect(width(), 200),
        pos(0, height() - 200),
        color(0, 150, 0),
        area(),
        solid(),
    ]);

    window.addEventListener("touchstart", (e) => {
        add([rect(TILE_WIDTH, TILE_WIDTH), pos(100, 0), color(WHITE), area(), body()]);
        if (player.vel < player.maxVel) {
            player.vel += player.acc;
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
    });
});

go("title");
