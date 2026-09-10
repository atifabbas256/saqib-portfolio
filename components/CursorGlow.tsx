"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
uniform sampler2D uTrail;
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uFrame;
uniform float uAmbient;
uniform float uTrailAmt;
uniform float uScroll;
uniform float uPhosphor;
uniform float uGrain;
uniform vec3 uBase;
uniform float uLightMode;
in vec2 vUv;
out vec4 frag;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(11.7, 5.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * vec2(uAspect, 1.0);
  float t = uTime;

  vec2 warp = vec2(
    fbm(uv * 1.4 + t * 0.020),
    fbm(uv * 1.4 - t * 0.016 + 7.31));
  float n = fbm(uv * 2.1 + (warp - 0.5) * 1.3 + vec2(0.0, t * 0.012));
  float field = n - 0.5;

  float trail = texture(uTrail, vUv).r;

  float breathe = 0.85 + 0.15 * sin(t * 0.25);
  float energy = uAmbient * breathe + uScroll;
  float lum = field * energy * 0.16
            + trail * uTrailAmt * 0.22 * (0.55 + 0.45 * n);

  vec3 col;
  if (uLightMode > 0.5) {
    float fiber = (vnoise(uv * 420.0) - 0.5) * 0.012;
    col = uBase + fiber - max(lum, field * energy * 0.05) * vec3(1.0, 0.98, 0.95);
  } else {
    vec3 tint = mix(vec3(1.0, 0.99, 0.96), vec3(0.55, 1.0, 0.6), uPhosphor);
    col = uBase + lum * tint;
  }

  float g = hash(vUv * uRes + fract(uFrame * 0.618) * 71.0) - 0.5;
  col += g * (0.014 * uGrain + 0.004);

  frag = vec4(col, 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const value = Number.parseInt(clean.slice(0, 6), 16);
  if (Number.isNaN(value)) return [24 / 255, 20 / 255, 17 / 255];
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}

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

export default function CursorGlow() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!media.matches && !isAdmin);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [isAdmin]);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = () => {
      if (disposed) return;

      const canvas = document.getElementById("reactive-field");
      if (!(canvas instanceof HTMLCanvasElement)) return;

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

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        drawW = Math.round(innerWidth * dpr);
        drawH = Math.round(innerHeight * dpr);
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

      const readBase = () =>
        hexToRgb(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--background")
            .trim() || "#181411",
        );

      let base = readBase();
      let lightMode = Number(document.documentElement.dataset.theme === "light");

      const themeObserver = new MutationObserver(() => {
        base = readBase();
        lightMode = Number(document.documentElement.dataset.theme === "light");
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      const pointer = {
        x: 0.5,
        y: 0.5,
        tx: 0.5,
        ty: 0.5,
        speed: 0,
        has: false,
      };
      let clickPulse = 0;
      let scrollEnergy = 0;
      let lastScrollY = window.scrollY;
      let lastPointerX: number | null = null;
      let lastPointerY = 0;

      const onPointerMove = (event: PointerEvent) => {
        pointer.tx = event.clientX / innerWidth;
        pointer.ty = 1 - event.clientY / innerHeight;
        if (lastPointerX !== null) {
          const distance = Math.hypot(
            event.clientX - lastPointerX,
            event.clientY - lastPointerY,
          );
          pointer.speed = Math.min(1, pointer.speed + distance / 90);
        }
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        pointer.has = true;
      };

      const onPointerDown = (event: PointerEvent) => {
        pointer.tx = pointer.x = event.clientX / innerWidth;
        pointer.ty = pointer.y = 1 - event.clientY / innerHeight;
        pointer.has = true;
        clickPulse = 1.4;
      };

      const onScroll = () => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;
        scrollEnergy = Math.min(1, scrollEnergy + delta / 900);
      };

      const trailUniforms = {
        uPrev: gl.getUniformLocation(trailProgram, "uPrev"),
        uRes: gl.getUniformLocation(trailProgram, "uRes"),
        uAspect: gl.getUniformLocation(trailProgram, "uAspect"),
        uPoint: gl.getUniformLocation(trailProgram, "uPoint"),
        uInject: gl.getUniformLocation(trailProgram, "uInject"),
        uRadius: gl.getUniformLocation(trailProgram, "uRadius"),
      };

      const displayUniforms = {
        uTrail: gl.getUniformLocation(displayProgram, "uTrail"),
        uRes: gl.getUniformLocation(displayProgram, "uRes"),
        uAspect: gl.getUniformLocation(displayProgram, "uAspect"),
        uTime: gl.getUniformLocation(displayProgram, "uTime"),
        uFrame: gl.getUniformLocation(displayProgram, "uFrame"),
        uAmbient: gl.getUniformLocation(displayProgram, "uAmbient"),
        uTrailAmt: gl.getUniformLocation(displayProgram, "uTrailAmt"),
        uScroll: gl.getUniformLocation(displayProgram, "uScroll"),
        uPhosphor: gl.getUniformLocation(displayProgram, "uPhosphor"),
        uGrain: gl.getUniformLocation(displayProgram, "uGrain"),
        uBase: gl.getUniformLocation(displayProgram, "uBase"),
        uLightMode: gl.getUniformLocation(displayProgram, "uLightMode"),
      };

      let raf = 0;
      let time = 0;
      let frame = 0;
      let lastNow = performance.now();

      const render = (now: number) => {
        const dt = Math.min(0.05, (now - lastNow) / 1000);
        lastNow = now;
        time += dt;
        frame += 1;

        pointer.x += (pointer.tx - pointer.x) * 0.11;
        pointer.y += (pointer.ty - pointer.y) * 0.11;
        pointer.speed *= 0.86;
        clickPulse *= 0.8;
        scrollEnergy *= 0.94;

        const inject =
          (pointer.has ? 0.5 * pointer.speed * 0.55 : 0) + 0.6 * clickPulse;

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
        gl.uniform1f(trailUniforms.uRadius, 0.075 + 0.05 * clickPulse);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        ping = 1 - ping;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, drawW, drawH);
        gl.useProgram(displayProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[ping]);
        gl.uniform1i(displayUniforms.uTrail, 0);
        gl.uniform2f(displayUniforms.uRes, drawW, drawH);
        gl.uniform1f(displayUniforms.uAspect, drawW / drawH);
        gl.uniform1f(displayUniforms.uTime, time);
        gl.uniform1f(displayUniforms.uFrame, frame);
        gl.uniform1f(displayUniforms.uAmbient, 0.34);
        gl.uniform1f(displayUniforms.uTrailAmt, 0.55);
        gl.uniform1f(displayUniforms.uScroll, 0.5 * scrollEnergy * 0.6);
        gl.uniform1f(displayUniforms.uPhosphor, 0.18);
        gl.uniform1f(displayUniforms.uGrain, 0.5);
        gl.uniform3f(displayUniforms.uBase, base[0], base[1], base[2]);
        gl.uniform1f(displayUniforms.uLightMode, lightMode);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        raf = requestAnimationFrame(render);
      };

      const onVisibility = () => {
        cancelAnimationFrame(raf);
        if (!document.hidden) {
          lastNow = performance.now();
          raf = requestAnimationFrame(render);
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(render);

      cleanup = () => {
        cancelAnimationFrame(raf);
        themeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
        for (const texture of textures) gl.deleteTexture(texture);
        for (const framebuffer of framebuffers) gl.deleteFramebuffer(framebuffer);
        gl.deleteProgram(trailProgram);
        gl.deleteProgram(displayProgram);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
      };
    };

    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(boot, { timeout: 1200 })
        : window.setTimeout(boot, 250);

    return () => {
      disposed = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as number);
      }
      cleanup?.();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      id="reactive-field"
      aria-hidden
      className="reactive-field"
    />
  );
}
