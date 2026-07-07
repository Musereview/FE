precision highp float;

varying vec2 vUv;
uniform sampler2D tScene;   // 배경 + 타이틀
uniform sampler2D tHeight;  // MW 유리 height 맵
uniform vec2 uRes;
uniform float uScale;       // 굴절 강도
uniform float uSpread;      // 법선 샘플 간격
uniform float uRim;         // 가장자리 하이라이트

void main() {
  vec2 e = vec2(uSpread) / uRes;
  float hL = texture2D(tHeight, vUv - vec2(e.x, 0.0)).r;
  float hR = texture2D(tHeight, vUv + vec2(e.x, 0.0)).r;
  float hD = texture2D(tHeight, vUv - vec2(0.0, e.y)).r;
  float hU = texture2D(tHeight, vUv + vec2(0.0, e.y)).r;
  vec2 grad = vec2(hR - hL, hU - hD);
  vec2 uv = vUv + grad * uScale;
  vec3 col = texture2D(tScene, uv).rgb;
  float edge = length(grad);
  col = mix(col, vec3(1.0), clamp(edge * uRim, 0.0, 0.5));
  gl_FragColor = vec4(col, 1.0);
}
