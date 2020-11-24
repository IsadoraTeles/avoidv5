// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123+u_mouse.x*0.00002);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 10

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5; // sombre ou clair
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.8 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy*3.;
    // st += st * abs(sin(u_time*0.1)*3.0);
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*u_time)*u_mouse.x*(-0.04);
    q.y = fbm( st + vec2(2.0))*u_mouse.y*(-0.09);

    vec2 m = u_mouse;
    
    vec2 dm = m.xy;
    if (dot(dm, dm) > 0.0)
    dm = normalize(dm);
    vec2 d = gl_FragCoord.xy - m.xy;
    float adjust = max(0.0, (50.0 - length(d)) / 10.0);
    vec2 lala = adjust * dm * u_time*0.0001;
    
    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + lala + 0.155*u_time );
    r.y = fbm( st + 1.0*q + lala + 0.626*u_time);

    float f = fbm(st+r);
    
    
    
    color = mix(vec3(0.101961,0.619608,0.666667),
    vec3(0.666667,0.666667,0.498039),
    clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
    vec3(0,0,0.164706),
    clamp(length(q),0.0,1.0));

    color = mix(color,
    vec3(0.666667,1,1),
    clamp(length(r.x),length(r.y),0.8));

    gl_FragColor = vec4((f*f*f+.7*f*f+.5*f)*color,1.);
}
