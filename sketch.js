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

let flipProgress = 0;
let flipping = false;

function preload() {
  grid = loadImage('assets/img/grid.png', function(img){
    img.resize(grid_pr_x, grid_pr_y);
  });
  finalImage = loadImage('assets/img/finalImage.png', function(img){
    img.resize(grid_pr_x, grid_pr_y);
  });

  for (let i = 0; i < 12; i++) {
    const fileName = (i + 1) + '.png'; 

    loadImage('assets/img/puzzleBrickImg/' + fileName, function(img) {
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
}

function draw() {
  background(220);
  
  if(collected === 12){
    if (!flipping) {
      flipping = true;
    }
  }

  if (flipping) {
    push();
    translate(windowWidth / 2, windowHeight / 2);

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
      fill(0, 200, 0);
      textSize(50);
      textAlign(CENTER, CENTER);
      text("Collected!", 0, 0);
    }
    pop();
    return;
  }

  image(grid, (windowWidth - grid_pr_x) / 2, (windowHeight - grid_pr_y) / 2);

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
    if(selectedBrick.onPosition && !selectedBrick.counted){
        collected += 1;
        selectedBrick.counted = !selectedBrick.counted;
    } else if(!selectedBrick.onPosition && selectedBrick.counted){
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
    if(Math.sqrt((this.onPosition_x - this.x) ** 2 + (this.onPosition_y - this.y) ** 2) < 100){
       this.onPosition = true;
    } else {
       this.onPosition = false;
    }
  }
}
