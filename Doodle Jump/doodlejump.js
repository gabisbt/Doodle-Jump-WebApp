let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

let velocityX = 0;
let velocityY = 0; 
let initialVelocityY = -2; 
let gravity = 0.10;


let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;
let platformImg1;

let score = 0;
let maxScore = 0;
let gameOver = false;

let audio = new Audio('sounds/jump.wav');
let audio1 = new Audio('sounds/gameover.wav');


window.onload = function () {
    const container = document.getElementById("container");
    const captureButton = document.getElementById("capture-button");
    const previewContainer = document.getElementById("preview-container");
    const downloadButton = document.getElementById("download-button");

    captureButton.addEventListener("click", async () => {
        downloadButton.classList.remove("hide");
        const canvas = await html2canvas(container);
        const imageURL = canvas.toDataURL();
        previewContainer.innerHTML = `<img src="${imageURL}" id="image">`;
        downloadButton.href = imageURL;
        downloadButton.download = "image.png";
    });


    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./img/doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./img/doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./img/platform.png";

    platformImg1 = new Image();
    platformImg1.src = "./img/platform-broken.png";

    velocityY = initialVelocityY ;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    downloadButton.classList.add("hide");
    previewContainer.innerHTML = "";

}

function update() {
    const boostButton = document.getElementById("boost");
    const hardButton = document.getElementById("hard");
    const resetButton = document.getElementById("reset");
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity / 1.2;
    doodler.y += velocityY / 1.2;
    if (doodler.y > board.height) {
        audio1.play();
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY - 2; 
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY - 2; 
            audio.play();
            if (platform.img === platformImg1) {
                platformArray.splice(i, 1); 
            }
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); 
        newPlatform(); 
    }

    boostButton.addEventListener("click", function () {
        velocityY = initialVelocityY - 3;
    });

    resetButton.addEventListener("click", function () {
        context.globalAlpha = 1;
    });

    hardButton.addEventListener("click", function () {
        for (let i = 0; i < platformArray.length; i++) {
            let platform = platformArray[i];
            context.globalAlpha = 0.2;
            context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
        }
    });

    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillStyle = "red";
        context.font = "20px sans-serif";
        context.fillText("Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
        context.fillText("Score: " + score, boardWidth / 7, boardHeight * 8.3 / 9);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { 
        velocityX = 2;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { 
        velocityX = -2;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        audio.play();
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);

    let platform1 = {
        img: platformImg1,
        x: boardWidth / 2,
        y: boardHeight - 150,
        width: platformWidth,
        height: platformHeight
    }
    platformArray.push(platform1);

    for (let i = 0; i < 8; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        }

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); 
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    }

    let random = Math.floor(Math.random() * 10); 
    if (random < 2) {
        platform.img = platformImg1;
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
        a.x + a.width > b.x &&   
        a.y < b.y + b.height &&  
        a.y + a.height > b.y;    
}

function updateScore() {
    let points = Math.floor(50 * Math.random()); 
    if (velocityY < 0) { 
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}


