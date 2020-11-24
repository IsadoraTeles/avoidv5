class Vehicle {
    constructor(x, y, ms, mf) {
        this.position = createVector(x, y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.r = 6;
        this.maxspeed = ms || 1;
        this.maxforce = mf || 0.01;
    }

    run() {
        this.update();
        this.borders();
        this.display();
    }

    // Implementing Reynolds' flow field following algorithm
    // http://www.red3d.com/cwr/steer/FlowFollow.html
    follow(force) {
        // What is the vector at that spot in the flow field?
        let desired = force;
        // Scale it up by maxspeed
        desired.mult(this.maxspeed);
        // Steering is desired minus velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        this.applyForce(steer);
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset accelerationelertion to 0 each cycle
        this.acceleration.mult(0);
    }

    // Wraparound
    borders() {
        if (this.position.x < -this.r) this.position.x = width + this.r;
        if (this.position.y < -this.r) this.position.y = height + this.r;
        if (this.position.x > width + this.r) this.position.x = -this.r;
        if (this.position.y > height + this.r) this.position.y = -this.r;
    }

    display() {
        // Draw a triangle rotated in the direction of velocity
        let theta = this.velocity.heading() + PI / 2;
        //stroke(0);
        //strokeWeight(2);
        fill(0);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }
}