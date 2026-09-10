"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const TRAIL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform float uAspect;
uniform vec2 uPoint;
uniform float uInject;
uniform float uRadius;
in vec2 vUv;
out vec4 frag;
void main() {
  vec2 px = 1.0 / uRes;
  float c = texture(uPrev, vUv).r;
  float blur =
    texture(uPrev, vUv + vec2(px.x, 0.0)).r +
    texture(uPrev, vUv - vec2(px.x, 0.0)).r +
    texture(uPrev, vUv + vec2(0.0, px.y)).r +
    texture(uPrev, vUv - vec2(0.0, px.y)).r;
  float v = mix(c, blur * 0.25, 0.4);
  v = max(v * 0.962 - 0.0012, 0.0);
  vec2 a = vec2(uAspect, 1.0);
  float d = distance(vUv * a, uPoint * a);
  v += uInject * exp(-(d * d) / (uRadius * uRadius));
  frag = vec4(v, 0.0, 0.0, 1.0);
}`;

const DISPLAY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uTrail;
uniform vec2 uRes;
uniform vec2 uTrailRes;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform float uFrame;
uniform float uWarp;
uniform float uSwirl;
uniform float uChroma;
uniform float uBoost;
uniform float uGrain;
in vec2 vUv;
out vec4 frag;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

vec2 coverUv(vec2 uv) {
  return uv * uCoverScale + uCoverOffset;
}

void main() {
  float t = clamp(texture(uTrail, vUv).r, 0.0, 1.0);
  float s = smoothstep(0.02, 0.6, t);

  vec2 px = 1.0 / uTrailRes;
  vec2 g = vec2(
    texture(uTrail, vUv + vec2(px.x, 0.0)).r -
      texture(uTrail, vUv - vec2(px.x, 0.0)).r,
    texture(uTrail, vUv + vec2(0.0, px.y)).r -
      texture(uTrail, vUv - vec2(0.0, px.y)).r);
  vec2 disp = g * uWarp + vec2(-g.y, g.x) * uSwirl;

  vec3 col;
  col.r = texture(uImage, coverUv(vUv + disp * (1.0 + uChroma))).r;
  col.g = texture(uImage, coverUv(vUv + disp)).g;
  col.b = texture(uImage, coverUv(vUv + disp * (1.0 - uChroma))).b;

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(lum), col, 1.0 + uBoost * s), 0.0, 1.0);

  float gr = hash(vUv * uRes + fract(uFrame * 0.618) * 71.0) - 0.5;
  col += gr * (uGrain * s + 0.006);

  frag = vec4(col, 1.0);
}`;

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
) {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");

  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertSrc],
    [gl.FRAGMENT_SHADER, fragSrc],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
    }
    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);
  return program;
}

function coverScale(canvasAspect: number, imageAspect: number) {
  let scaleX = 1;
  let scaleY = 1;
  if (imageAspect > canvasAspect) scaleX = canvasAspect / imageAspect;
  else scaleY = imageAspect / canvasAspect;
  return [scaleX, scaleY, (1 - scaleX) / 2, (1 - scaleY) / 2] as const;
}

type ReactiveImageProps = {
  src: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export default function ReactiveImage({
  src,
  alt = "",
  sizes = "100vw",
  priority = false,
  className = "",
}: ReactiveImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !image || !host) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    let trailProgram: WebGLProgram;
    let displayProgram: WebGLProgram;
    try {
      trailProgram = createProgram(gl, VERT, TRAIL_FRAG);
      displayProgram = createProgram(gl, VERT, DISPLAY_FRAG);
    } catch {
      return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let drawW = 0;
    let drawH = 0;
    let simW = 0;
    let simH = 0;
    let ping = 0;
    const textures: WebGLTexture[] = [];
    const framebuffers: WebGLFramebuffer[] = [];
    let imageW = 0;
    let imageH = 0;
    let imageReady = false;
    const imageTexture = gl.createTexture();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      drawW = Math.max(2, Math.round(host.clientWidth * dpr));
      drawH = Math.max(2, Math.round(host.clientHeight * dpr));
      canvas.width = drawW;
      canvas.height = drawH;
      simW = Math.max(2, drawW >> 2);
      simH = Math.max(2, drawH >> 2);

      for (const texture of textures) gl.deleteTexture(texture);
      for (const framebuffer of framebuffers) gl.deleteFramebuffer(framebuffer);
      textures.length = 0;
      framebuffers.length = 0;

      for (let i = 0; i < 2; i += 1) {
        const texture = gl.createTexture();
        if (!texture) continue;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          simW,
          simH,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const framebuffer = gl.createFramebuffer();
        if (!framebuffer) continue;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0,
        );
        textures.push(texture);
        framebuffers.push(framebuffer);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const pointer = {
      x: 0.5,
      y: 0.5,
      tx: 0.5,
      ty: 0.5,
      speed: 0,
      inside: false,
    };
    let clickPulse = 0;
    let energy = 0;
    let lastX: number | null = null;
    let lastY = 0;
    let frame = 0;
    let raf = 0;

    const trailUniforms = {
      uPrev: gl.getUniformLocation(trailProgram, "uPrev"),
      uRes: gl.getUniformLocation(trailProgram, "uRes"),
      uAspect: gl.getUniformLocation(trailProgram, "uAspect"),
      uPoint: gl.getUniformLocation(trailProgram, "uPoint"),
      uInject: gl.getUniformLocation(trailProgram, "uInject"),
      uRadius: gl.getUniformLocation(trailProgram, "uRadius"),
    };

    const displayUniforms = {
      uImage: gl.getUniformLocation(displayProgram, "uImage"),
      uTrail: gl.getUniformLocation(displayProgram, "uTrail"),
      uRes: gl.getUniformLocation(displayProgram, "uRes"),
      uTrailRes: gl.getUniformLocation(displayProgram, "uTrailRes"),
      uCoverScale: gl.getUniformLocation(displayProgram, "uCoverScale"),
      uCoverOffset: gl.getUniformLocation(displayProgram, "uCoverOffset"),
      uFrame: gl.getUniformLocation(displayProgram, "uFrame"),
      uWarp: gl.getUniformLocation(displayProgram, "uWarp"),
      uSwirl: gl.getUniformLocation(displayProgram, "uSwirl"),
      uChroma: gl.getUniformLocation(displayProgram, "uChroma"),
      uBoost: gl.getUniformLocation(displayProgram, "uBoost"),
      uGrain: gl.getUniformLocation(displayProgram, "uGrain"),
    };

    const render = () => {
      frame += 1;
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;
      pointer.speed *= 0.86;
      clickPulse *= 0.8;

      const inject =
        (pointer.inside ? 0.55 * pointer.speed : 0) + 0.6 * clickPulse;
      energy = Math.max(Math.max(0.962 * energy - 0.0012, 0), inject);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1 - ping]);
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(trailProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[ping]);
      gl.uniform1i(trailUniforms.uPrev, 0);
      gl.uniform2f(trailUniforms.uRes, simW, simH);
      gl.uniform1f(trailUniforms.uAspect, drawW / drawH);
      gl.uniform2f(trailUniforms.uPoint, pointer.x, pointer.y);
      gl.uniform1f(trailUniforms.uInject, inject);
      gl.uniform1f(trailUniforms.uRadius, 0.15 + 0.05 * clickPulse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      ping = 1 - ping;

      const [scaleX, scaleY, offsetX, offsetY] = coverScale(
        drawW / drawH,
        imageW / imageH,
      );

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, drawW, drawH);
      gl.useProgram(displayProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(displayUniforms.uImage, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[ping]);
      gl.uniform1i(displayUniforms.uTrail, 1);
      gl.uniform2f(displayUniforms.uRes, drawW, drawH);
      gl.uniform2f(displayUniforms.uTrailRes, simW, simH);
      gl.uniform2f(displayUniforms.uCoverScale, scaleX, scaleY);
      gl.uniform2f(displayUniforms.uCoverOffset, offsetX, offsetY);
      gl.uniform1f(displayUniforms.uFrame, frame);
      gl.uniform1f(displayUniforms.uWarp, 0.45);
      gl.uniform1f(displayUniforms.uSwirl, 0.16);
      gl.uniform1f(displayUniforms.uChroma, 0.26);
      gl.uniform1f(displayUniforms.uBoost, 0.22);
      gl.uniform1f(displayUniforms.uGrain, 0.05);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!pointer.inside && energy < 0.004 && clickPulse < 0.01) {
        canvas.style.opacity = "0";
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (!imageReady) return;
      canvas.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(render);
    };

    const uploadImage = () => {
      if (!image.naturalWidth) return;
      imageW = image.naturalWidth;
      imageH = image.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      imageReady = true;
      if (pointer.inside) start();
    };

    if (image.complete && image.naturalWidth) uploadImage();
    else image.addEventListener("load", uploadImage);

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      if (lastX !== null) {
        const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
        pointer.speed = Math.min(1, pointer.speed + distance / 90);
      }
      lastX = event.clientX;
      lastY = event.clientY;
      pointer.inside = true;
      start();
    };

    const onDown = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.ty = pointer.y = 1 - (event.clientY - rect.top) / rect.height;
      clickPulse = 1.2;
      start();
    };

    const onLeave = () => {
      pointer.inside = false;
      lastX = null;
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      image.removeEventListener("load", uploadImage);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      canvas.style.opacity = "0";
      for (const texture of textures) gl.deleteTexture(texture);
      for (const framebuffer of framebuffers) gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(imageTexture);
      gl.deleteProgram(trailProgram);
      gl.deleteProgram(displayProgram);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, [enabled, src]);

  return (
    <>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`.trim()}
        unoptimized
      />
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="reactive-image-canvas"
        />
      )}
    </>
  );
}
