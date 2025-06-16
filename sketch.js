let pixeled;
let backgroundSound;
let yapSound;
let soundCheck = false;
let puzzleBricks = [];
let puzzleBrickImg = [];
let selectedBrick = null;

let loadedCount = 0;

let pr = 8;
let grid_pr_x = 3024 / pr;
let grid_pr_y = 4032 / pr;
let img_pr = 1350 / pr;

let ready = false;
let collected = 0;
let next_button;

let flipProgress = 0;
let flipping = false;

let countdown = 3;

let confetti = [];
let showConfetti = false;

let answers = [
  "Hmmm... sounds like a *you* problem.",
  "Maybe go touch some grass?",
  "I would care, but I’m on break.",
  "And what do you want me to do about that?",
  "Bold of you to assume I care.",
  "Kinda sounds like you just need a nap.",
  "That's cute. Anyway...",
  "Maybe don’t?",
  "Let’s not do this again.",
  "It’s giving... not my problem.",
  "Oh nooo... anyway.",
  "You’ll live.",
  "Yikes, have you tried logging off?",
  "Ever considered... not thinking about it?",
  "I would explain, but you wouldn’t get it.",
  "Mmmkay. And?",
  "Yeah that’s not my vibe.",
  "Sure. Definitely. Absolutely. (No.)",
  "Honestly? Just shove it in a jar and scream at it later.",
  "Maybe the real issue is asking the internet for advice.",
  "Sounds like you need a snack and a nap.",
  "Don’t bring that energy here.",
  "Sorry, I’m just a little guy. I can’t help you.",
  "This seems like something your therapist should hear, not me.",
  "Wow, that’s crazy. Did you want a sticker or?",
  "Genuinely? I stopped listening halfway.",
  "Let me pretend to care... okay, done.",
  "That’s not even a real problem.",
  "No thoughts. Just vibes. Try it.",
  "You really typed that out and hit enter, huh?",
  "Go argue with a wall. It’ll respond more kindly."
];

function preload() {
  pixeled = loadFont('assets/Font/Anton-Regular.ttf');
  backgroundSound = loadSound('assets/sound/bob.mp3');
  yapSound = loadSound('assets/sound/yap.mp3');
  grid = loadImage('assets/img/grid.png', function (img) {
    img.resize(grid_pr_x, grid_pr_y);
  });
  finalImage = loadImage('assets/img/finalImage.png', function (img) {
    img.resize(grid_pr_x, grid_pr_y);
  });

  for (let i = 0; i < 12; i++) {
    const fileName = (i + 1) + '.png';

    loadImage('assets/img/puzzleBrickImg/' + fileName, function (img) {
      img.resize(img_pr, img_pr);
      puzzleBrickImg[i] = { img: img, name: fileName };
      loadedCount++;

      if (loadedCount === 12) {
        puzzleBrickImg = shuffle(puzzleBrickImg);

        for (let i = 0; i < 12; i++) {
          const data = puzzleBrickImg[i];
          puzzleBricks.push(new puzzleBrick(i + 1, data.img, data.name));
        }

        ready = true;
      }
    });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  randomAnswer = random(answers);
}

function draw() {
  background('#F8F8F8');

  if (collected === 12) {
    if (!flipping) {
      flipping = true;
      backgroundSound.stop();
    }
  }

  if (flipping) {
    push();
    translate(windowWidth / 2, windowHeight / 2);

    if (countdown > 0 && flipProgress == 1) {
      countdown -= 0.01;
    }
    flipProgress += 0.02;
    if (flipProgress > 1) flipProgress = 1;

    let angle = flipProgress * PI;
    scale(cos(angle), 1);

    if (flipProgress < 0.5) {
      image(finalImage, -grid_pr_x / 2, -grid_pr_y / 2);
    } else {
      scale(-1, 1);
      fill(255);
      rect(-grid_pr_x / 2, -grid_pr_y / 2, grid_pr_x, grid_pr_y);
      fill('#');
      textFont(pixeled);
      textAlign(CENTER, CENTER);
      textSize(40);
      if (countdown > 0) {
        fill('#474747');
        text((countdown > 0 ? "Your answer in ... " + Math.floor(countdown) : "Your answer in ... " + 0), 0, 0);
      } else {
        if (!showConfetti) {
          showConfetti = true;
          next_button = createButton('Try again🤗');
  next_button.position(windowWidth / 2 - 70, windowHeight / 2 + 80);
  next_button.style('font-size', '16px');
  next_button.style('padding', '10px 20px');
  next_button.style('background-color', '#f44336');
  next_button.style('color', 'white');
  next_button.style('border', 'none');
  next_button.style('border-radius', '8px');
  next_button.style('cursor', 'pointer');
  next_button.mousePressed(() => {
    if (yapSound && !yapSound.isPlaying()){
    yapSound.play();
    }
    setTimeout(()=>{
      window.location.href = 'https://nnstna.github.io/interface1/'; 
    },1500);
   
  });
          for (let i = 0; i < 200; i++) {
            confetti.push(new Confetti());
          }
        }
        fill('#054FF0');
        text(randomAnswer, -grid_pr_x / 2, 0, grid_pr_x);
        for (let c of confetti) {
          c.update();
          c.display();
        }
      }
    }
    pop();
    return;
  }

  image(grid, (windowWidth - grid_pr_x) / 2, (windowHeight - grid_pr_y) / 2);
  if (collected < 12) {
    fill('#474747');
    textSize(24);
    textFont(pixeled);
    textAlign(CENTER, TOP);
    text("Complete puzzle to reveal your answer", windowWidth / 2, 30);
  }
  if (ready) {
    for (let brick of puzzleBricks) {
      if (brick.isSelected) {
        brick.followCursor();
      }
      brick.display();
    }
  }
}

function mousePressed() {
  if (!soundCheck) {
    backgroundSound.loop();
    soundCheck = true;
  }

  for (let brick of puzzleBricks) {
    if (brick.isClicked(mouseX, mouseY)) {
      brick.isSelected = true;
      selectedBrick = brick;
      break;
    }
  }
}

function mouseReleased() {
  if (selectedBrick) {
    if (selectedBrick.onPosition && !selectedBrick.counted) {
      collected += 1;
      selectedBrick.counted = !selectedBrick.counted;
    } else if (!selectedBrick.onPosition && selectedBrick.counted) {
      collected -= 1;
      selectedBrick.counted = !selectedBrick.counted;
    }
    selectedBrick.isSelected = false;
    selectedBrick = null;
  }
}

class puzzleBrick {
  constructor(pos, img, imgName) {
    this.pos = pos;
    this.img = img;
    this.imgName = imgName;
    this.isSelected = false;
    this.counted = false;
    this.onPosition = false;
    this.onPosition_x = (windowWidth - grid_pr_x) / 2 + (((parseInt(this.imgName) - 1) % 3) * (grid_pr_x / 3));
    this.onPosition_y = (windowHeight - grid_pr_y) / 2 + (Math.floor((parseInt(this.imgName) - 1) / 3)) * (grid_pr_y / 4);

    const margin_x = (windowWidth - grid_pr_x - (4 * img_pr)) / 6;
    const margin_y = (windowHeight - (3 * img_pr)) / 4;

    this.x = margin_x + ((margin_x + img_pr) * (pos % 2)) + (((windowWidth + grid_pr_x) / 2) * Math.floor(pos / 6.1));
    this.y = margin_y + ((margin_y + img_pr) * Math.floor((pos % 6.1) / 2.1));
  }

  display() {
    image(this.img, this.x, this.y);
  }

  isClicked(mx, my) {
    return (
      mx >= this.x &&
      mx <= this.x + img_pr &&
      my >= this.y &&
      my <= this.y + img_pr
    );
  }

  followCursor() {
    this.x = mouseX - img_pr / 2;
    this.y = mouseY - img_pr / 2;
    if (Math.sqrt((this.onPosition_x - this.x) ** 2 + (this.onPosition_y - this.y) ** 2) < 100) {
      this.onPosition = true;
    } else {
      this.onPosition = false;
    }
  }
}

class Confetti {
  constructor() {
    this.x = random(-grid_pr_x / 2, grid_pr_x / 2);
    this.y = random(-200, 0);
    this.size = random(5, 10);
    this.speedY = random(2, 5);
    this.color = color(random(255), random(255), random(255));
    this.angle = random(TWO_PI);
    this.rotation = random(-0.1, 0.1);
  }

  update() {
    this.y += this.speedY;
    this.angle += this.rotation;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(this.color);
    rect(0, 0, this.size, this.size / 2);
    pop();
  }
}
