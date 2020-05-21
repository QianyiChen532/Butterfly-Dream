let boxSz = 500;
let t;


let cols;
let rows;
let scale = 15;
let w = 1280;
let h = 840;

let zoff = 0;

let terrain = [];

let params = {
  x: -200,
  y: -200,
  z: 0,
  Cx: 0,
  Cy: 0,
  Cz: 0,
  debug:false,
  vZ:20,
  rotate:2.5
}

let size = 60;


let particles = [];
let particlesY = [];
let particlesB = [];

let particleSystem;

let range = 800;
let gui = new dat.gui.GUI();
gui.add(params, 'x').min(-range).max(range).step(0.05);
gui.add(params, 'y').min(-range).max(range).step(0.05);
gui.add(params, 'z').min(-range).max(range).step(0.05);
gui.add(params, 'Cx').min(-Math.PI/2).max(Math.PI/2).step(0.05);
gui.add(params, 'Cy').min(-Math.PI/2).max(Math.PI/2).step(0.05);
gui.add(params, 'Cz').min(-Math.PI/2).max(Math.PI/2).step(0.05);
gui.add(params, 'debug');
gui.add(params, 'vZ').min(-1000).max(1000).step(1);
gui.add(params, 'rotate').min(1).max(8).step(0.1);

function preload(){
  textureforSphere = loadImage('sprite.png');
  textureY = loadImage('bokeh-red.jpg');
  textureG = loadImage('bokeh-blue.jpg');
}

function setup() {

  createCanvas(1244, 700, WEBGL);

  // for (let i = 0; i < size; i++) {
  //   particles[i] = new Particle(textureforSphere);
  //   particlesY[i] = new Particle(textureforSphere);
  //   particlesB[i] = new Particle(textureforSphere);
  // }


  //----terrain
  cols = w / scale;
  rows = h / scale;

  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; // default value
    }
  }

}

function mousePressed(){

    particleSystem = new ParticleSystem(size/2);
}

function draw() {

  if(keyIsPressed && key=='s'){
    params.z++;
  }

//-----terrain--------
  // push();
  //
  // let xoff = 0;
  // for (let x = 0; x < cols; x++) {
  //
  //   let yoff = zoff;
  //   for (let y = 0; y < rows; y++) {
  //     terrain[x][y] = map(noise(xoff, yoff,1), 0, 1, -20, 50);
  //     yoff += 0.1;
  //   }
  //   xoff += 0.1;
  // }
  //
  // zoff -= 0.05;
  background(0);
//
//   stroke(5, 200, 244);
//   fill(5, 200, 200,50*(sin(frameCount*0.1)+1));
//
//
//
//   translate(0,0,200);
//   let r = map(mouseX,0,width,1,8);
//   rotateX(PI/params.rotate);
//   // console.log(r)
//   translate(-w/2,-h/3)
//
// // blendMode(BLEND);
//   for (let y = 0; y < rows-1; y++) {
//     beginShape(TRIANGLE_STRIP);
//     for (let x = 0; x < cols; x++) {
//       noStroke();
//       let alpha = map(abs(x*scale-width/2),0,width/2,100,0)
// // console.log(x*scale,w);
// let color = map(terrain[x][y],-20,50,100,255);
//       if(x*scale<3*w/8 || x*scale>5*w/8){
//         colorMode(HSB)
//         fill(200,80,alpha);
//           //stroke(45, 90, color,alpha);
//         rect(x*scale, y*scale, terrain[x][y],5,5);
//         // fill(45, 90, color,alpha);
//           fill(200,80,alpha-10);
//         vertex(x*scale, (y+1)*scale, terrain[x][y+1]);
//       }else{
//         // rect(x*scale, y*scale, terrain[x][y],5,5);
//       }
//
//     }
//     endShape();
//   }
//
//   pop();
//
//

  if(params.debug){
    push();
    noFill();
    stroke(255, 0, 0);
    box(500);
    pop();

  }

if (particleSystem!=undefined) {
    particleSystem.run();
}

//
// let c = map(noise(0,frameCount*0.01),0,1,0,25);
//   fill(0);
// //translate(windowWidth/2,windowHeight/4);
// // texture(textureY)
// rotateX(PI / 2.1);
// rotateY(millis() / 5000);
// cylinder(windowWidth*frameCount*0.01, -1000000);

// push();
// // noStroke();
// translate(windowWidth/2,windowHeight/4);
// // rotateX(PI / 2.1);
// // texture(textureY);
// // rotateX(params.x);
// // rotateZ(params.y);
// cylinder(windowWidth*2, -100000,false,false);
// pointLight(255, 255, 255, windowWidth/2, windowHeight*2, 400);
// pointLight(255, 255, 255, windowWidth, windowHeight*2, 400);
// pointLight(255, 255, 255, 0, windowHeight*2, 400);
// pop();
}


class Particle{

  constructor(startX,x,startY,y,t) {
    this.pos = createVector(random(startX,x), random(startY,y), random(boxSz));
    this.vel = createVector(random(-1,1),random(-1,1),random(0,20));
    this.acc = createVector(0,0,1);

    this.maxSpeed = 5; // max speed;
    this.maxSteerForce = 0.05; // max steering force

    this.separateDistance = 30;
    this.neighborDistance = 50;

    this.texture = t;
  }


  update() {
    //----
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed); //***
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
    ///----

    this.vel.z = params.vZ;

    if(keyIsPressed && key=='a'){
        this.maxSpeed += 0.1;
        console.log(  this.maxSpeed );
    }else if(keyIsPressed && key=='b'){
        this.maxSpeed -= 0.1;
        console.log(  this.maxSpeed );
    }


    if(this.pos.x > boxSz)
    this.pos.x = 0;
    if(this.pos.x < 0)
    this.pos.x = boxSz;
    if(this.pos.y > boxSz)
    this.pos.y = 0;
    if(this.pos.y < 0)
    this.pos.y = boxSz;
    if(this.pos.z > boxSz)
    this.pos.z = 0;
    if(this.pos.z < 0)
    this.pos.z = boxSz;
  }

  applyForce(force) {
    this.acc.add(force);
  }
  flock(boids) {
    let sepaForce = this.separate(boids);
    let coheForce = this.cohesion(boids);
    let alignForce = this.align(boids);
    sepaForce.mult(1.5);
    coheForce.mult(1);

    this.applyForce(sepaForce);
    // this.applyForce(coheForce);
    // this.applyForce(alignForce);
  }
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxSteerForce);
    return steer;
  }

  separate(others) {
    let vector = createVector(); // sum for now
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.separateDistance) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(distance);

        vector.add(diff);
        count++;
      }
    }

    if (count > 0) {
      vector.div(count);
    }
    if (vector.mag() > 0) {
      // desired velocity
      vector.setMag(this.maxSpeed);
      // steering force
      vector.sub(this.vel);
      vector.limit(this.maxSteerForce);
    }
    return vector;
  }
  cohesion(others) {
    let position = createVector(); //sum
    let count = 0;
    for (let i=0; i<others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if ((distance > 0) && (distance < this.neighborDistance)) {
        position.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      position.div(count); // becames average
      return this.seek(position);
    }
    return position;
  }
  align(others) {
    let velocity = createVector(); //sum
    let count = 0;
    for (let i=0; i<others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if ((distance > 0) && (distance < this.neighborDistance)) {
        velocity.add(other.vel);
        count++;
      }
    }
    if (count > 0) {
      velocity.div(count);

      velocity.setMag(this.maxSpeed);

      let steer = p5.Vector.sub(velocity, this.vel);
      steer.limit(this.maxSteerForce);
      return steer;
    }
    return velocity;
  }

  show() {

    push();
    // fill(255, 181, 150);
    noStroke();
    translate(this.pos);
    texture(this.texture);
//     ambientLight(250);
// ambientMaterial(70, 130, 250*abs(sin(frameCount*0.01)));

    sphere(2);
    pop();
  }
}


class YellowP extends Particle {

  constructor(startX,x,startY,y,t) {
    super();
      this.pos = createVector(random(startX,x), random(startY,y), random(boxSz));
    this.texture = t;

  }

  show() {
    push();

    noStroke();
    translate(this.pos);
    texture(this.texture);

    sphere(2);
    pop();
  }

}

class BlueP extends Particle {

  constructor(startX,x,startY,y,t) {
    super();
      this.pos = createVector(random(startX,x), random(startY,y), random(boxSz));
    this.texture = t;

  }

  show() {
    push();

    noStroke();
    translate(this.pos);
    texture(this.texture);

    sphere(2);
    pop();
  }

}

class ParticleSystem{
  constructor(s){
    this.particles=[];
    this.particlesY=[];
    this.particlesB=[];
    this.size = s;
    this.scl = random(0.2, 1.2);
    //this.origin = createVector(x,y)

    for (let i = 0; i < this.size; i++) {
      this.particles[i] = new Particle(0,boxSz,0,boxSz,textureforSphere);
      this.particlesY[i] = new YellowP(0,boxSz/2,0,boxSz/2,textureY);
      this.particlesB[i] = new BlueP(0,boxSz,0,boxSz,textureG);
    }
  }

  run(){
    push();

    // scale(this.scl,this.scl,this.scl);
    translate(params.x, params.y, params.z);
    rotateY(params.Cz);
    rotateX(params.Cy);
    rotateZ(params.Cx);


    for(let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.flock(this.particles);
      p.update();
      p.show();

    }

    for(let k = 0; k < this.particlesY.length; k++) {
      let py = this.particlesY[k];
      py.flock(this.particlesY);
      py.update();
      py.show();

    }

    for(let j = 0; j < this.particlesB.length; j++) {
      let pb = this.particlesB[j];
      pb.flock(this.particlesB);
      pb.update();
      pb.show();

    }

    pop();

  }
}
