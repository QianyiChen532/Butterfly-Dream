let params = {
  noiseMax:3,
  phase:1,
  seed:99,
  zoff:0.1,
  velFreq:0.1,
  amp:80,
  rMax:255,
  scaler:4,
  damping: 0.9,
  k: 0.2,
  len: 2,
  lenMax: 150
}

let ball,spring;
let gui = new dat.gui.GUI();
gui.add(params, 'damping').min(0.7).max(1).step(0.01);
gui.add(params, 'k').min(0).max(1).step(0.01);
gui.add(params, 'len').min(2).max(200).step(5);
gui.add(params, 'lenMax').min(2).max(500).step(1);


let bg
let bgm;
let zoff;
let velFreq;

let amplitude;


gui.add(params,'noiseMax').min(0).max(10).step(0.5);
gui.add(params,'seed').min(0).max(200).step(1);
gui.add(params,'velFreq').min(0).max(1).step(0.01);
gui.add(params,'amp').min(1).max(200).step(1);
gui.add(params,'rMax').min(0).max(500).step(1);
gui.add(params,'scaler').min(0).max(10).step(1);

let waves = [];

function preload(){
  bg = loadImage('sprite.png');
  bgm = loadSound('nearLight.mp3');
}

// function mousePressed() {
//   if (bgm.isPlaying() ){
//     bgm.stop();
//   } else {
//     bgm.play();
//     console.log('play');
//   }
// }

function keyPressed(){
  if(key == 'b'){
    if (bgm.isPlaying() ){
      bgm.stop();
    } else {
      bgm.play();
      console.log('play');
    }
  }
  if(key == 'a'){
    waves.push( new Wave(2,10));
  }
}

function setup() {

  createCanvas(1344,700);
  background(0);

  waves.push( new Wave(5));

  ball = new Ball(width  , height / 2 + 100);
  spring = new Spring(width , height / 2, 100);

  //audio features
  amplitude = new p5.Amplitude();


}

function draw() {
  noiseSeed(params.seed);
  background(0,99);


  let level = amplitude.getLevel();
  let amp = map(level,0,1,0,20);

  spring.connect(ball);
  ball.update();
  ball.drag();

  spring.display(ball);
  ball.display();

  for(let i=0;i<waves.length;i++){
    let b = waves[i];
    for(let x = 0;x<width;x+=3){
      b.display(x,amp,abs(ball.pos.y-height/2)-100);
      // b.display(x,20*i,11,amp);
    //  fill(255,0,0);
      // ellipse(b.pos.x,b.pos.y+height/2,40);
    }
    b.update();

  }

  // console.log(frameRate());

}

class Wave{
  constructor(r){
    this.pos = createVector(0,0);
    this.vel = createVector(1,1);;
    this.acc = createVector(0,1);
    this.r = r;


    this.angle = 0;
    this.anglevel = 1;

  }
  update(){
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.pos.y+=10;
    this.angle += this.anglevel;

    this.acc.mult(0);
  }
  display(x,afromAudio,spring){
    // console.log(afromAudio);
    //frameCount only

    // console.log(spring);
    let sinval3 = sin(frameCount*0.05+x*0.05);
    let scaler = map(sinval3,-1,1,4,15)
    push();
    translate(0,height/2);

    let xoff = map(cos(x+frameCount*params.velFreq),-1,1,0,0.5);
    let yoff = map(sin(x),-1,1,0,+params.noiseMax);
    let r = map(noise(xoff,yoff,zoff),0,1,0,params.rMax);

    let freq = x*0.005+frameCount*0.01*params.scaler;
    let amp,lerpedAmp;
    //
    // if(afromAudio<10){
    //   amp = params.amp*noise(xoff,yoff);
    // }else{
    //    lerpedAmp = lerp(20,afromAudio,0.8)
    //   amp = (20+lerpedAmp)*noise(xoff,yoff);
    //   amp*=0.5;
    // }

    // let sinValue = amp*sin(freq)+amp/2*sin(freq);

    let sinValue1 = spring*2*sin(freq);

    this.pos.x = x;
    this.pos.y = sinValue1;
    //
    // afromAudio*=0.9;


    let c = map(noise(xoff,yoff,zoff),0,1,0,280);
    let size = map(noise(xoff,yoff,zoff),0,1,0,80);
    let alpha = map(noise(xoff,yoff,zoff),0,1,100,70);
    noFill();

    colorMode(RGB);
    blendMode(ADD);
    noStroke();

    fill(c,200,255,100)
    ellipse(x,this.pos.y,size/16);

    //randomparticles
    fill(200,200,255,alpha)

    //
    // let particleOffset = map(Math.floor(11),0,100,2,15)
    let springOff = map(spring,0,100,0,height/2);
    let h = map(noise(x*100+frameCount*0.01),0,1,-springOff
    ,springOff);


    ellipse(x,this.pos.y+h,size/20);

    pop();
    // }


  }
}

class Spring {
  constructor(x, y, len) {
    this.anchor = createVector(x, y);
    this.len = len;
    this.lenMax = len * 5;
    this.k = 0.5;
  }
  display(b) {
    this.drawAnchor();
    this.drawLine(b);
  }
  drawAnchor() {
    push();
    rectMode(CENTER);
    rect(this.anchor.x, this.anchor.y, 10, 10);
    pop();
  }
  drawLine(b) {
    push();
    stroke(255);
    line(this.anchor.x, this.anchor.y, b.pos.x, b.pos.y);
    pop();
  }
  connect(b) {
    let vector = p5.Vector.sub(b.pos, this.anchor);
    let distance = vector.mag();
    let direction = vector.copy().normalize();

    let stretch = distance - this.len;
    // hooke's law
    let force = direction.copy();
    force.mult(-1 * this.k * stretch);
    b.applyForce(force);

    // let's constrain the length
    if (distance > this.lenMax) {
      direction.mult(this.lenMax);
      b.pos = p5.Vector.add(this.anchor, direction);
      b.vel.mult(0);
    }else if (distance < this.len*0.5) {
      direction.mult(this.len*0.5);
      b.pos = p5.Vector.add(this.anchor, direction);
      b.vel.mult(0);
    }
  }
}

class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();

    this.damping = 0.9;
  }
  display() {
    push();
    stroke(255);
    strokeWeight(2);
    fill(200);
    ellipse(this.pos.x, this.pos.y, 30, 30);
    pop();
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    // damping

    this.damping = params.damping;
    this.k = params.k;
    this.lenMax = params.lenMax;

    this.vel.mult(this.damping);


  }
  applyForce(force) {

    this.acc.add(force);
  }
  drag() {
    let distance = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    if (mouseIsPressed ) {
      this.pos.x = mouseX;
      this.pos.y = mouseY;
    }
  }
}
