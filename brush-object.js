
//inkline
class Ink {
  constructor(x, y, prev,d) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, random(1, 3));
    this.acc = createVector();
    this.dia = d;
    this.prev = prev;

    this.lifespan =1;
    this.lifereduction = 0.1;
    this.isDone = false;
  }
  setDiameter( d ) {
    this.dia = d;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.mult(params.damping);
  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(f);
  }
  display() {


    let r = map(this.dia, 1, 10, 1, 30);
    colorMode(RGB);
    blendMode(BLEND);

    let distX = map(abs(mouseX-width/2),0,width/2,150,200);

    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let pmx = pmouseX - width / 2;
    let pmy = pmouseY - height / 2;

    translate(width/2,height/2);
    let symmetry = 4;
    let xoff=0;
    if (mouseIsPressed)
    xoff += 1;


    let angle = 360 / symmetry;
    for (let i = 0; i < symmetry; i++) {
      angleMode(DEGREES);
      rotate(angle);
      // console.log(distX);
      stroke(distX,100);
      let d = dist(mx, my, pmx, pmy);
      let sw = map(d, 0, 30, 15,5);
      // console.log(d);
      strokeWeight(sw);

      line(mx, my, pmx, pmy);

      push();

      scale(1,-1);
      line(mx, my, pmx, pmy);
      pop();

    }
  }


  // ellipse(this.pos.x, this.pos.y,2);
  //  ellipse(width-this.pos.x, height-this.pos.y,2);
  //  ellipse(width-this.pos.x, this.pos.y, 2);
  //  ellipse(this.pos.x, height-this.pos.y, 2);

  // displayDebug(prev) {
  //   push();
  //
  //   beginshape();
  //   storke(10);
  //   strokeWeight(r);
  //
  //   vertex(this.pos.x, this.pos.y);
  //   vertex(prev.pos.x, prev.pos.y);
  //   endShape();
  //   pop();
  // }
  life(){
    this.lifespan -= this.lifereduction;
    if(this.lifespan < 0){
      this.isDone = true;
    }

  }
}

//spring movement for brush
class Brush {
  constructor(x, y) {
    this.brushes = [];
    this.pos = createVector(x + random(-1, 1), y + random(-1, 1)); // brush
    this.posPrev = this.pos.copy();
    this.anchor = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector();

    this.dia = 10;

    this.len = params.len;
    this.lenMax = this.len * params.lenMax;
    this.k = params.k; //0-1
    this.damping = params.damping;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    //
    this.vel.mult(params.damping);

    // update anchor
    this.anchor.x = mouseX+sin(frameCount*0.01);
    this.anchor.y = mouseY;

    //size
    let vFactor = this.vel.mag();
    vFactor *= 0.6;
    this.dia = map(10 - vFactor, -10, 10, 1, 5);
    this.acc.mult(0);

    // update the value according to the params
    this.len = params.len;
    this.lenMax = this.len * params.lenMax;
    this.k = params.k; //0-1
    this.damping = params.damping;
  }
  updatePreviousPosition() {
    this.posPrev = this.pos.copy();
  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(f);
  }

  spring() {
    let vector = p5.Vector.sub(this.pos, this.anchor);
    let distance = vector.mag();
    let direction = vector.copy().normalize();

    let stretch = distance - this.len;
    let force = direction.copy();
    force.mult(-1 * stretch * this.k);
    this.applyForce(force);

    //constrain length
    if (distance > this.lenMax) {
      direction.mult(this.lenMax);
      this.pos = p5.Vector.add(this.anchor, direction);
      this.vel.mult(0.9);
    }

  }

  display() {
    push();

    beginShape();
    for(let x=0;x<this.dia;x+=this.dia/4){
      stroke(255,30);
      strokeWeight(1);
      let noiseVal = map(noise(frameCount*0.01,sin(x+frameCount*0.01),1),0,1,10,5);
      curveVertex(this.pos.x, sin(this.pos.y)+this.pos.y);
      curveVertex(this.anchor.x-x*2, this.anchor.y+noiseVal);
      // curveVertex(this.anchor.x-x, this.anchor.y+sin(noiseVal));
      // console.log(this.anchor.x-x, this.pos.y+noiseVal);
      //  curveVertex(this.pos.x+x, this.pos.y+noiseVal);

      //       ellipse(this.pos.x, this.pos.y,5)

      //       fill(200,0,0,100);
      //       ellipse(this.anchor.x-x*2, this.anchor.y+noiseVal,5)

    }

    endShape(CLOSE);
    pop();
  }

}
