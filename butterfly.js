"use strict";
var yoff = 0;

let boids = [];

let mainButterfly;
let params = {
  flapSpeed:60
}

let gui = new dat.gui.GUI();
gui.add(params, 'flapSpeed').min(5).max(100).step(1);

function setup() {
  createCanvas(1244,700);
  mainButterfly = new Butterfly(width/2,height/2,'blue')

}

function mousePressed(){
  if(mouseX<width/2){
    for (let i = 0; i < 5; i++) {
      boids.push(new Boid(mouseX, mouseY,'blue'));
    }
  }
  else{
    for (let i = 0; i < 5; i++) {
      boids.push(new Boid(mouseX, mouseY,'red'));
    }
  }


}

function keyPressed(){
  for (let i = 0; i < boids.length; i++) {
    let b = boids[i];
  if(key == 'c'){
    let center = createVector(width/2,height/2);
    b.seek(center);
    console.log('c');
  }
}

}


function draw() {

  background(0,95);

  for (let i = 0; i < boids.length; i++) {
    let b = boids[i];

    b.separate(boids);
     b.cohesion(boids);
     b.align(boids);

    b.update();
    b.reappear();
    b.display();


  }

  //mainButterfly.display();
  mainButterfly.update();


}


class Boid {
  constructor(x, y,color) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector();
    this.angle = 0;
    this.colorScheme = color;

    this.maxSpeed = 3;
    this.maxSteerForce = 3;
      this.maxForce = 0.05;

    this.separateDistance = 60;
    this.neighborDistance = 200;

    //---for draw
    this.flapRate = 60;
    this.counter =0;

    this.rightWidth1 = 30;
    this.wingHeightUp=20;
    this.rightWidth2 = 30;
    this.wingHeightDown = 20;

    this.wingWidth1 = 30;
    this.wingWidth2 =20;

    this.randomr= random(30,80);
     this.detectRad = 10;


  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
    let c = noise(0, this.flapRate+frameCount*0.01+this.angle);
    this.counter = map(c,0,1,0,this.flapRate);


  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }
  // flock(others) {
  //   //
  // }
  seek(target) {


    let desiredVel = p5.Vector.sub(target, this.pos);
  let distance = desiredVel.mag();

  desiredVel.normalize();
  if(distance > this.detectRad) {
    desiredVel.mult(this.maxSpeed);
  } else {
    let speed = map(distance, 0, this.detectRad, 0, this.maxSpeed);
    desiredVel.mult(speed);

  }

  let steerForce = p5.Vector.sub(desiredVel, this.vel);
  steerForce.limit(this.maxSteerForce);
  this.applyForce( steerForce );

  }
  seek2(target) {


    let desiredVel = p5.Vector.sub(target, this.pos);
  let distance = desiredVel.mag();

  desiredVel.normalize();
  if(distance > this.detectRad) {
    desiredVel.mult(this.maxSpeed);
  } else {
    let speed = map(distance, 0, this.detectRad, 0, this.maxSpeed);
    desiredVel.mult(speed);

  }

  let steerForce = p5.Vector.sub(desiredVel, this.vel);
  steerForce.limit(this.maxForce);
  this.applyForce( steerForce );

  }

  separate(others) {
    // avg direction (distance)
    let vector = createVector(); // sum
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.separateDistance) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(distance);
        // sum
        vector.add(diff);
        count++;
      }
    }
    if (count > 0) {

      vector.setMag(this.maxSpeed);
      // steerForce
      vector.sub(this.vel);
      vector.limit(this.maxForce); // force
    }

    this.applyForce(vector);
  }

  cohesion(others) {
    // avg position
    let vector = createVector(); //sum, position
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        vector.add(other.pos); // sum
        count++;
      }
    }
    if (count > 0) {
      vector.div(count); // avg, position
      this.seek2(vector);
    }
  }

  align(others) {

    let vector = createVector(); // sum, vel
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        vector.add(other.vel); // sum
        count++;
      }
    }
    if (count > 0) {
      vector.div(count); // avg, vel
      vector.setMag(this.maxSpeed);
      let steerForce = p5.Vector.sub(vector, this.vel);
      steerForce.limit(this.maxForce);
      this.applyForce(steerForce);
    }
  }
  reappear() {
    // x
    if (this.pos.x < 0) {
      this.pos.x = width;
    } else if (this.pos.x > width) {
      this.pos.x = 0;
    }
    // y
    if (this.pos.y < 0) {
      this.pos.y = height;
    } else if (this.pos.y > height) {
      this.pos.y = 0;
    }
  }
  display() {

    let flipAmount = 0.5;
    this.rightWidth1 = this.flapOffset(0, this.wingWidth1, false);
    this.rightWidth2 = this.flapOffset(0, this.wingWidth2, false);
    this.leftWidth1 = this.flapOffset(this.wingWidth1,0,true)
    this.leftWidth2 = this.flapOffset(this.wingWidth2,0,true)
    this.leftWidth2 = lerp(this.wingWidth2,this.flapOffset(this.wingWidth2,0,true),flipAmount);


    push();
    translate(this.pos.x, this.pos.y);

    rotate(this.angle-PI/2+10);
    colorMode(HSB);
    blendMode(SCREEN);
    noStroke();
    if(this.colorScheme == 'blue'){
      fill(210,80,this.randomr);//randomr:0-100
    }else{
      fill(14,60,this.randomr);//randomr:0-100
    }

    scale(this.randomr/75)
    // ellipse(0,0,this.leftWidth1*0.5,this.leftWidth1*1.5);//body
    triangle(0,0,this.rightWidth1, -this.wingHeightUp, this.rightWidth2, this.wingHeightDown);


    triangle(0,0,-this.leftWidth1, -this.wingHeightUp, -this.leftWidth2, this.wingHeightDown);

    pop();



  }

  flapOffset(start,end,leftside){

    let freq = this.counter * (2*PI)/params.flapSpeed;
    let amount = ((sin(freq)+1)/2);
    if(leftside) {
      amount = 1 - amount;
    }
    amount = amount * 0.9;
    return start + amount*(end-start);
  }
}

class Butterfly extends Boid{
  constructor(x, y,color){
    super(x, y,color);
  }
  update(){
    let c = noise(0, this.flapRate+frameCount*0.01+this.angle);
    this.counter = map(c,0,1,0,this.flapRate);
  }
  display(){

    let flipAmount = 1;
    this.rightWidth1 = this.flapOffset(0, this.wingWidth1, false);
    this.rightWidth2 = this.flapOffset(0, this.wingWidth2, false);
    this.leftWidth1 = this.flapOffset(this.wingWidth1,0,true)
    this.leftWidth2 = this.flapOffset(this.wingWidth2,0,true)
    this.leftWidth2 = lerp(this.wingWidth2,this.flapOffset(this.wingWidth2,0,true),flipAmount);


    push();
    translate(this.pos.x, this.pos.y);

    // rotate(this.angle-PI/2+10);
    colorMode(RGB);
    //blendMode(ADD);
    noStroke();
    scale(10)
    if(this.colorScheme == 'blue'){
      fill(255,10);//randomr:0-100
    }else{
      fill(310,60,this.randomr);//randomr:0-100
    }

    triangle(0,0,this.rightWidth1, -this.wingHeightUp, this.rightWidth2, this.wingHeightDown);


    triangle(0,0,-this.leftWidth1, -this.wingHeightUp, -this.leftWidth2, this.wingHeightDown);

    pop();

    push();

    translate(this.pos.x, this.pos.y);

    // rotate(this.angle-PI/2+10);
    colorMode(RGB);
    blendMode(ADD);
    noStroke();
    scale(15)
    if(this.colorScheme == 'blue'){
      fill(80,6);//randomr:0-100
    }
    triangle(0,0,this.rightWidth1, -this.wingHeightUp, this.rightWidth2, this.wingHeightDown);
    triangle(0,0,-this.leftWidth1, -this.wingHeightUp, -this.leftWidth2, this.wingHeightDown);

    pop();

    push();

    translate(this.pos.x, this.pos.y);

    // rotate(this.angle-PI/2+10);
    colorMode(RGB);
    //blendMode(ADD);
    noStroke();
    scale(13)
    if(this.colorScheme == 'blue'){
      fill(10,1);//randomr:0-100
    }
    triangle(0,0,this.rightWidth1, -this.wingHeightUp, this.rightWidth2, this.wingHeightDown);
    triangle(0,0,-this.leftWidth1, -this.wingHeightUp, -this.leftWidth2, this.wingHeightDown);

    pop();
  }


}
