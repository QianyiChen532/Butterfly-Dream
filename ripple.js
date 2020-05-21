
let r = 255;
let g = 200;
let b = 255;


let params = {

  amp1: 200,
  amp2: 200,
  amp3: 200,
  amp4:200,

  f1:0.004,
  f2:0.004,
  f3:0.003,
  f4:0.003


}

let ripples = [];

let range = 500;
let range2 = 0.05;
let gui = new dat.gui.GUI();
gui.add(params, 'amp1').min(-range).max(range).step(0.05);
gui.add(params, 'amp2').min(-range).max(range).step(0.05);
gui.add(params, 'amp3').min(-range).max(range).step(0.05);
gui.add(params, 'amp4').min(-range).max(range).step(0.05);
gui.add(params, 'f1').min(0).max(range2).step(0.001);
gui.add(params, 'f2').min(0).max(range2).step(0.001);
gui.add(params, 'f3').min(0).max(range2).step(0.001);
gui.add(params, 'f4').min(0).max(range2).step(0.001);



function setup() {
	createCanvas(1244,700);
	strokeWeight(2);
	background(0);

// for(let i=0;i<3;i++){
//   ripples.push( new Ripple(width/2,height/2,(i+1)*0.5));
// }

}

function keyPressed(){
    // ripples.push( new Ripple(mouseX,mouseY,0.5));
      ripples.push( new Ripple(width/2,height/2,1));
}

function draw() {
	background(0);


for(let i=0;i<ripples.length;i++){
  let r=ripples[i];
  r.update();
  r.display();
}

}

class Ripple{
  constructor(x,y,s){
    this.trail = [];
    this.trailLength = 200;
    this.x = 0;
    this.y = 0;

    this.origin = createVector(x,y);
    this.scl = s;
  }

  update(){

    	this.amp1 = sin(frameCount * params.f1) * params.amp3;
    	this.amp2 = cos(frameCount * params.f2) * params.amp4;

    	this.x = sin(frameCount * params.f3) * this.amp1;
    	this.y = cos(frameCount * params.f4) * this.amp2;

      	this.trail.push(createVector(this.x, this.y));

      	if (this.trail.length > this.trailLength) {
      			this.trail.splice(0, 1)
      	}


  }
  display(){
push();
// blendMode(BLEND);
scale(this.scl);
translate(this.origin.x,this.origin.y);
    for (let i = 0; i < this.trail.length; i++) {
      noFill();
      let c = map(i, 0, this.trailLength, 0, 255)
      let o = map(i, 0, this.trailLength, 0, 50)
      let d = map(i, 0, this.trailLength, 500, 1)
      if(key == 'a'){
        stroke(c,g,b,o)
      }else{
        stroke(c,o)
      }

      // console.log(c);
        ellipse(this.trail[i].x, this.trail[i].y, d, d);

    }
pop();
  }
}
