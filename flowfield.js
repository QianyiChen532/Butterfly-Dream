const RESOLUTION = 30;
let rows, cols;
let angles = [];
let vehicles = [];

let texture;

let params = {
  canvason:true,
  showlines:false,
  rotateScaler:0.5,
  noiseScaler:1,
  maxSpeed:5,
  steer:0.02,
  colorScaler:255

}

let gui = new dat.gui.GUI();
gui.add(params, 'canvason');
gui.add(params, 'showlines');
gui.add(params, 'rotateScaler').min(0).max(2).step(0.1);
gui.add(params, 'noiseScaler').min(0).max(10).step(1);
gui.add(params, 'maxSpeed').min(5).max(20).step(1);
gui.add(params, 'steer').min(0).max(1).step(0.01);
gui.add(params, 'colorScaler').min(0).max(255).step(5);

function preload(){
// song = loadSound('The xx - Intro.mp3');
texture = loadImage('sprite.png');

}
//
// function keyPressed() {
//   if (song.isPlaying()) {
//     // .isPlaying() returns a boolean
//     song.pause(); // .play() will resume from .pause() position
//     // background(255, 0, 0);
//   } else {
//     song.play();
//     // background(0, 255, 0);
//   }
// }

function setup() {
  createCanvas(1244,700);
  background(255);


  cols = ceil(width / RESOLUTION);
  rows = ceil(height / RESOLUTION);


}

function keyPressed(){
  if(key == 'a'){
    for (let i=0; i<100; i++) {
      vehicles.push( new Vehicle(width-10,height/2));
      vehicles.push( new Vehicle(10,height/2));

    }
  }

    if(key=='b'){
      params.steer = 0;
    }
    if(key=='s'){
      for (let i=0; i<100; i++) {
        vehicles.push( new Vehicle(width-10,height/2));
        vehicles.push( new Vehicle(10,height/2));

      }
    }


}

function draw() {

    if(params.canvason){
  background(0,80);
}
  // flow field
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      let x = c * RESOLUTION;
      let y = r * RESOLUTION;

      let freqX = (x + frameCount) * 0.01;
      let freqY = (y + frameCount) * 0.01 ;
      let noiseValue = noise(freqX, freqY); // range 0 to 1

      let angleFlowField = map(noiseValue, 0, 1, 0, TWO_PI*params.noiseScaler);
      let colorVal = map(noiseValue, 0, 1, 0, 50);

      //mouse

      // let sinValue = sin(frameCount * 0.05)*PI;
      //let vector = createVector(mouseX - x, mouseY - y);
      let vector = createVector(width/2 - x, height/2 - y);
      let angleMouse = vector.heading();

      let index = c + r * cols;
      let angle = angleMouse+angleFlowField*0.1;
      angles[index] = angle;
      console.log(angle);

//-----display lines--------
      if(params.showlines){
        push();
        translate(x + RESOLUTION/2, y + RESOLUTION/2);
        rotate(angle);
        stroke(255);

        line(0, 0, RESOLUTION/2, 0);
        pop();
      }

    }
  }

  // update and display the vehicles
  for (let i=0; i<vehicles.length; i++) {
    let v = vehicles[i];

    let c = floor(v.pos.x / RESOLUTION);
    let r = floor(v.pos.y / RESOLUTION);
    let index = c + r * cols;

    v.flow( angles[index] );
    //
    for (let j=0; j<vehicles.length; j++) {
      let otherV = vehicles[j];
      if (i != j) {
        v.avoid( otherV );
      }
    }

    v.update();
    v.reappear();
    v.display();


  }

  // console.log(frameRate());
}



class Vehicle {
  constructor(x,y) {
    this.pos = createVector(x,y);
    this.vel = createVector(random(-1),random(-1,1));
    this.acc = createVector();
    this.angle = 0;

    this.maxSpeed = 5;    // max desired vel
    this.maxForce = 0.1;  // max steering force

    this.detectRad = 80;

    this.foldingVel = random(0.3, 0.8);

    this.prevPos = this.pos.copy();
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();

    this.maxSpeed = params.maxSpeed;
  }
  applyForce(f) {
    let force = f.copy();
    // no mass yet
    this.acc.add(force);
  }
  avoid( targetObj ) {
    let desiredVel = p5.Vector.sub(targetObj.pos, this.pos);
    let distance = desiredVel.mag();
    desiredVel.normalize();
    if(distance < this.detectRad) {
      let speed = map(distance, 0, this.detectRad, this.maxSpeed, 0);
      desiredVel.mult(speed * -1); // flip the vel
      let steerForce = p5.Vector.sub(desiredVel, this.vel);
      steerForce.limit(this.maxForce * params.steer); //***
      this.applyForce( steerForce );
    }
  }
  avoidVec( target ) {
    let desiredVel = p5.Vector.sub(target, this.pos);
    let distance = desiredVel.mag();
    desiredVel.normalize();
    if(distance < this.detectRad) {
      let speed = map(distance, 0, this.detectRad, this.maxSpeed, 0);
      desiredVel.mult(speed * -1); // flip the vel
      let steerForce = p5.Vector.sub(desiredVel, this.vel);
      steerForce.limit(this.maxForce*0.7 ); //***
      this.applyForce( steerForce );
    }
  }

  seekVec( target ) {
    let desiredVel = p5.Vector.sub(target, this.pos);
    let distance = desiredVel.mag();

    desiredVel.normalize();
    if(distance > this.detectRad) {
      desiredVel.mult(this.maxSpeed);
    } else {
      let speed = map(distance, 0, this.detectRad, 0, this.maxSpeed);
      desiredVel.mult(-speed);

    }

    let steerForce = p5.Vector.sub(desiredVel, this.vel);
    steerForce.limit(this.maxForce);
    this.applyForce( steerForce );

  }

  flow( angle ) {
    let desiredVel = p5.Vector.fromAngle( angle );
    desiredVel.mult(this.maxSpeed);

    let steerForce = p5.Vector.sub(desiredVel, this.vel);
    steerForce.limit(this.maxForce);
    this.applyForce( steerForce );
  }
  reappear() {
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    else if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
    else if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
  }
  display() {
    push();

this.updatePrev();
    translate(this.pos.x, this.pos.y);
    rotate( this.angle );

    let freq = frameCount * this.foldingVel;
    let amp = 5;
    let sinValue = sin(freq) * amp;
    noStroke();

    let strokemaped = map(abs(width/2-this.pos.x),0,width/2,0,1);
    // console.log(strokemaped);
    noStroke();
    fill(strokemaped*params.colorScaler,1);
    beginShape();
    fill(200,50);
    noStroke();
    // ellipse(0,0,5)
     image(texture,0,0,10,10);
    // triangle(0, 0, -15, sinValue, -15, -sinValue);
    endShape();

    pop();
  }
  updatePrev() {
   this.prevPos.x = this.pos.x;
   this.prevPos.y = this.pos.y;
 }
}
