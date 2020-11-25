// https://kylemcdonald.github.io/cv-examples/

var capture;
var previousPixels;
var flow;
var w = 640,
    h = 480;
var step = 8;

let vehicle;
let distance;
let force;

let theShader;
let shaderGraphics;

let slider01, slider02, slider03;

let song;
var go = false;

function preload() {
    // Load a sound file
    song = loadSound('assets/rach.mp3');
    theShader = loadShader('shader.vert', 'test_frac_motion.frag');

}

function setup() {

    slider01 = createSlider(0.0, 1.0, 0.1, 0.001);
    slider01.position(10, 10);
    slider01.style('width', '80px');

    slider02 = createSlider(0.0, 1.0, 0.1, 0.001);
    slider02.position(10, 30);
    slider02.style('width', '80px');

    slider03 = createSlider(0.0, 1.0, 0.1, 0.001);
    slider03.position(10, 50);
    slider03.style('width', '80px');

    getAudioContext().suspend();

    // shaders require WEBGL mode to work
    shaderGraphics = createGraphics(710, 400, WEBGL);
    shaderGraphics.noStroke();

    createCanvas(w, h);
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function () {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    capture.hide();

    flow = new FlowCalculator(step);

    vehicle = new Vehicle(random(w), random(h), random(3, 1), random(0.1, 0.2));

}

function copyImage(src, dst) {
    var n = src.length;
    if (!dst || dst.length != n) dst = new src.constructor(n);
    while (n--) dst[n] = src[n];
    return dst;
}

function same(a1, a2, stride, n) {
    for (var i = 0; i < n; i += stride) {
        if (a1[i] != a2[i]) {
            return false;
        }
    }
    return true;
}

function draw() {

    frameRate(15);
    var time = 0.1 * float(frameCount);
    var vposx = map(vehicle.position.x, 0, width, 0, w * 2.2);
    var vposy = (h - vehicle.position.y) * 1.6;

    var mousex = map(mouseX, 0, width, 0, w * 2.2);
    var mousey = (h - mouseY) * 1.6;

    // lets send the resolution, mouse, and time to our shader
    // before sending mouse + time we modify the data so it's more easily usable by the shader
    theShader.setUniform("iResolution", [w, h]);
    theShader.setUniform("iPosition", [vposx, vposy]);
    theShader.setUniform("iTime", time);
    theShader.setUniform('iMouse', [mousex, mousey]);
    theShader.setUniform("iSlider01", slider01.value());
    theShader.setUniform("iSlider02", slider02.value());
    theShader.setUniform("iSlider03", slider03.value());

    // shader() sets the active shader with our shader
    shaderGraphics.shader(theShader);
    // rect gives us some geometry on the screen
    shaderGraphics.rect(0, 0, w, h);

    image(capture, 0, 0, w, h);
    image(shaderGraphics, 0, 0, w, h);

    if (go) {
        let speed = map(vehicle.position.y, 0.01, h, 0, 2);
        speed = constrain(speed, 0.001, 1);
        song.rate(speed);
    }

    capture.loadPixels();
    if (capture.pixels.length > 0) {
        if (previousPixels) {

            // cheap way to ignore duplicate frames
            if (same(previousPixels, capture.pixels, 4, w)) {
                return;
            }

            flow.calculate(previousPixels, capture.pixels, capture.width, capture.height);
        }
        previousPixels = copyImage(capture.pixels, previousPixels);

        if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0) {

            strokeWeight(3);
            flow.flow.zones.forEach(function (zone) {

                let endDir = createVector(zone.u, zone.v);
                let begDir = createVector(zone.x, zone.y);
                distance = begDir.dist(vehicle.position);

                if (endDir.mag() > 10) {
                    fill(255, 255, 0);
                    line(zone.x, zone.y, zone.x + zone.u, zone.y + zone.v);
                    if (distance < 60) {
                        vehicle.follow(endDir);
                        vehicle.update();
                    }

                }

            })
        }

        vehicle.update();

        vehicle.r = 10;
        vehicle.borders();
        vehicle.display();
    }

}

function mousePressed() {

    userStartAudio();
    go = true;
    song.play();

}