let softBody;
let NUMP = 100;
let BALLRADIUS = 10;
let SCRSIZE = 400;
let FINAL_PRESSURE = 0.01;
let KS = 1.0;
let KD = 0.1;

let myPoints = [];
let mySprings = [];
let myRelPoints = [];

function setup() {
    createCanvas(720, 400);
    softBody = new SoftBody(100, 100, 64);
}

function draw() {
    background(127);
    softBody.update();
    softBody.display();
}

class MaterialPoint {
    constructor(x, y, vx, vy, fx, fy) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.force = createVector(fx, fy);
    }
}

class LinearPrint {
    constructor(i, j, length, nx, ny) {
        this.i = i;
        this.j = j;
        this.length = length;
        this.normalVector = createVector(nx, ny);
    }
}

// creates simulation object
function CreateBall() {
    let i;

    for (i = 0; i < NUMP; i++) {
        myPoints[i].x = BALLRADIUS * Math.sin(i * (2.0 * 3.14) / NUMP);
        myPoints[i].y = BALLRADIUS * Math.cos(i * (2.0 * 3.14) / NUMP) + SCRSIZE / 1
    }
    for (i = 0; i < NUMP; i++) {
        AddSpring(i, i, i + 1)
        AddSpring(i - 1, i - 1, 1)
    }

}

// store springs and calculates length of spring and pi to update springs
function AddSpring(pi, i, j){
    mySpings[pi].i = i;
    mySpings[pi].j = j;
    mySprings[pi].length = Math.sqrt(
       ( myPoints[i].x - myPoints[j].x) *
       ( myPoints[i].x - myPoints[j].x) +
       ( myPoints[i].y - myPoints[j].y) *
       ( myPoints[i].y - myPoints[j].y)
    )
}

// update gravity. double check pressure
function UpdateGravity(Pressure) {
    for (i = 0; i < NUMP; i++) {
        myPoints[i].fx  = 0;
        myPoints[i].fy  = MASS * GY * 
            (Pressue - FINAL_PRESSURE >= 0)
    }
}

// get spring force acting on both ends
function SpringLinearForce() {

    for (let i=0; i < NUMS ; i++){
        const x1 = myRelPoints[ mySprings[i].i ].x;
        const y1 = myRelPoints[ mySprings[i].i ].y;
        const x2 = myRelPoints[ mySprings[i].j ].x;
        const y2 = myRelPoints[ mySprings[i].j ].y;

        // calculate sqr distance
        r12d = Math.sqrt ( (x1 - x2) * (x1 - x2) + 
        (y1 - y2) * (y1 - y2) )

        if (r12d != 0)  // start = end
        {
            // get veolociies of start and end points
            vx12 = myRelPoints[ mySprings[i].i ].vx - 
            myRelPoints[ mySprings[i].j ].vx

            vy12 = myRelPoints[ mySprings[i].i ].vy -
            myRelPoints[ mySprings[i].j ].vy

            // calculate force value
            f = (r12d - mySprings[i].length) *KS +
            (vx12 * (x1 - x2) + vy12 * (y1 - y2)) * KD / r12d;

            // force vector
            Fx =  ((x1-x2) / r12d) * f;
            Fy =  ((y1-y2) / r12d) * f;

            // acummulate force for starting point
            myRelPoints[ mySprings[i].i ].fx -= Fx;
            myRelPoints[ mySprings[i].i ].fy -= Fy;

            // acummulate force for ending point
            myRelPoints[ mySprings[i].j ].fx += Fx;
            myRelPoints[ mySprings[i].j ].fy += Fy;
        }
    }
}

// calculate Volume of the ball
function CalculateVolume() {
    let volume = 0; // Initialize volume
    // Gauss Thereom
    for (let i = 0; i < NUMP; i++){
        const x1 = myPoints[i].x;
       const y1 = myPoints[i].y;
       const x2 = myPoints[i + 1].x;
       const y2 = myPoints[i + 1].y;

    //    calculate sqr (distance)
    r12d = Math.sqrt ( (x1 - x2) * (x1 - x2) + 
    (y1 - y2) * (y1 - y2) )

     volume += (0.5 * fabs(x1-x2) *
        fabs(mySprings[i].nx)   * (r12d))
    }

    return volume
}

// calculate value of pressure force
function CalculatePressureForce() {
    let pressure = 0; // Initialize pressure
    // Gauss Thereom
    for (let i = 0; i < NUMS-1; i++){
        const x1 = myRelPoints[ mySprings[i].i ].x;
        const y1 = myRelPoints[ mySprings[i].i ].y;
        const x2 = myRelPoints[ mySprings[i].j ].x;
        const y2 = myRelPoints[ mySprings[i].j ].y;

        // calculate sqr distance
        r12d = Math.sqrt ( (x1 - x2) * (x1 - x2) +
        (y1 - y2) * (y1 - y2) )

        let pressurev = r12d * Pressure * (1.0*f/volume)
        
        myPoints[ mySprings[i].i ].fx += 
        mySprings[i].nx * pressurev

        myPoints[ mySprings[i].i ].fx += 
        mySprings[i].ny * pressurev

        myPoints[ mySprings[i].j ].fx +=
        mySprings[i].nx * pressurev

        myPoints[ mySprings[i].j ].fy += 
        mySprings[i].ny * pressurev
    }


    // integrate Euler
    function IntegrateEler()
    {
        
    }
}
function mousePressed() {
    softBody.clicked(mouseX, mouseY);
}

class SoftBody {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = random(-1, 1);
        this.speedY = random(-1, 1);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > width || this.x < 0) this.speedX *= -1;
        if (this.y > height || this.y < 0) this.speedY *= -1;
    }

    display() {
        ellipse(this.x, this.y, this.size, this.size);
    }

    clicked(px, py) {
        let d = dist(px, py, this.x, this.y);
        if (d < this.size / 2) {
            this.speedX = random(-5, 5);
            this.speedY = random(-5, 5);
        }
    }
}