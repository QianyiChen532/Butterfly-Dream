
//initiate particles
let brushDetail = 10;
let brushes;
let inkdrop = [];
let smoke = [];
let blobs = [];

let w = 800;
let h = 800;

let params = {
  damping: 0.75,
  k: 0.5,
  stroke: 20,
  len: 2,
  lenMax: 10,
  debugMode: false,
  noiseMin: 5,
  noiseMax: 10,
  strokeMax:10
};


let gui = new dat.gui.GUI();
gui.add(params, 'damping').min(0).max(1).step(0.1);
gui.add(params, 'k').min(0).max(1).step(0.1);
gui.add(params, 'stroke').min(2).max(40).step(1);
gui.add(params, 'len').min(2).max(15).step(1);
gui.add(params, 'lenMax').min(2).max(15).step(1);
gui.add(params, 'strokeMax').min(5).max(60).step(1);
// gui.add(params, 'debugMode');

function setup() {
  createCanvas(1244,700);
  background(0);
  brushes = new Brush(width / 2, height / 2);
}

function draw() {
  // background(220);
noCursor();
  push();
  //blendMode(SCREEN);
  //blendMode(ADD);
  brushes.spring();
  brushes.update();


  if (mouseIsPressed) {
    brushes.display();
    let distance = p5.Vector.sub(brushes.pos, brushes.posPrev).mag();
    // console.log(distance);

    for (let i = brushDetail; i <= distance/2; i += brushDetail) {
      let amount = map(i, 0, distance, 0, 1.0);
      let pos = p5.Vector.lerp(brushes.posPrev, brushes.pos, amount);

      inkdrop.push(new Ink(pos.x, pos.y,brushes.posPrev, brushes.dia));

    }

  }

  for (let i = 1; i < inkdrop.length; i++) {
    inkdrop[i].update();
    inkdrop[i].life();
    if (inkdrop[i].isDone){
      inkdrop.splice(0,1);
    }

    if (params.debugMode) {
      inkdrop[i].displayDebug(inkdrop[i - 1]);
    } else if(inkdrop[i] != undefined) {
      inkdrop[i].display();

    }
  }
  //
  //
  // fill(255);
  // text(frameRate(), 10, 20);
  pop();

  //
  brushes.updatePreviousPosition();
}



function keyPressed() {
  inkdrop.length = 0;
  for (let i = 0; i < blobs.length; i++) {
    blobs[i].movearound = true;
  }
}
