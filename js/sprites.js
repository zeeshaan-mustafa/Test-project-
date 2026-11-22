// ===== Drawing: hero, fairy, monsters, bosses and scenery (all original art drawn in code) =====

const HERO_PIXELS = [
  '.....kkkkk......',
  '....kttttTk.....',
  '...kttttttTk....',
  '...khhhhhhhk....',
  '...khsssssek....',
  '...khssssssk....',
  '....ksssssk.....',
  '...kkTtttTkk....',
  '..kskttttTksk...',
  '..kskbbybbksk...',
  '...kkttttTkk....',
  '....kTttttk.....',
  '....kTk.kTk.....',
  '....kBk.kBk.....',
  '...kBBk.kBBk....',
  '...kkkk.kkkk....',
];

function drawPixels(ctx, rows, x, y, scale, pal) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const col = pal[row[c]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Hero: feet at (x, groundY). swing: 0..1 sword swing progress (0 = resting).
function drawHero(ctx, x, groundY, t, opts) {
  const S = 4;
  const tunic = opts.tunic, sword = opts.sword;
  const bob = opts.walking ? Math.abs(Math.sin(t * 8)) * 3 : Math.sin(t * 2) * 1;
  const px = x - 8 * S, py = groundY - 16 * S - bob;
  const flash = opts.hurt && Math.floor(t * 20) % 2 === 0;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x, groundY + 2, 26, 6, 0, 0, Math.PI * 2); ctx.fill();

  // shield on back arm
  ctx.save();
  ctx.translate(px + 3 * S, py + 9 * S);
  ctx.fillStyle = '#1d2b5c';
  roundRect(ctx, -10, -4, 16, 22, 5); ctx.fill();
  ctx.fillStyle = '#4766c4';
  roundRect(ctx, -8, -2, 12, 18, 4); ctx.fill();
  ctx.fillStyle = '#f2c230';
  ctx.beginPath(); ctx.moveTo(-2, 2); ctx.lineTo(2, 8); ctx.lineTo(-2, 14); ctx.lineTo(-6, 8); ctx.closePath(); ctx.fill();
  ctx.restore();

  if (!flash) {
    drawPixels(ctx, HERO_PIXELS, px, py, S, {
      k: '#1a1a24', t: tunic.color, T: tunic.dark, h: '#7a4a1e', s: '#ffd2a6',
      e: '#1a1a24', b: '#6b3f1d', y: '#f2c230', B: '#6b3f1d',
    });
  }

  // sword in front hand
  const hx = px + 12 * S, hy = py + 9 * S;
  const sw = opts.swing || 0;
  const ang = sw > 0 ? (-1.9 + sw * 3.2) : -0.5;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  if (sword.glow) { ctx.shadowColor = sword.glow; ctx.shadowBlur = 14; }
  ctx.fillStyle = sword.blade;
  ctx.fillRect(4, -3, 34, 6);
  ctx.beginPath(); ctx.moveTo(38, -3); ctx.lineTo(46, 0); ctx.lineTo(38, 3); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(6, -2, 30, 2);
  ctx.fillStyle = '#f2c230'; ctx.fillRect(0, -8, 5, 16);
  ctx.fillStyle = '#6b3f1d'; ctx.fillRect(-9, -2, 9, 4);
  ctx.restore();

  // swing arc
  if (sw > 0 && sw < 0.8) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${0.8 - sw})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(hx, hy, 44, -1.9, -1.9 + sw * 3.2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFairy(ctx, x, y, t) {
  const wing = Math.sin(t * 30) * 0.5 + 0.5;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 1, x, y, 22);
  g.addColorStop(0, 'rgba(255,255,220,0.95)');
  g.addColorStop(0.35, 'rgba(255,210,250,0.6)');
  g.addColorStop(1, 'rgba(255,180,250,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,240,255,0.85)';
  ctx.beginPath(); ctx.ellipse(x - 7, y - 4, 8, 4 + wing * 3, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 7, y - 4, 8, 4 + wing * 3, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function eyes(ctx, x, y, gap, r, angry) {
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x - gap, y, r, 0, Math.PI * 2); ctx.arc(x + gap, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a24';
  ctx.beginPath(); ctx.arc(x - gap - r * 0.35, y + r * 0.1, r * 0.5, 0, Math.PI * 2);
  ctx.arc(x + gap - r * 0.35, y + r * 0.1, r * 0.5, 0, Math.PI * 2); ctx.fill();
  if (angry) {
    ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = Math.max(2, r * 0.35);
    ctx.beginPath();
    ctx.moveTo(x - gap - r, y - r * 1.2); ctx.lineTo(x - gap + r, y - r * 0.6);
    ctx.moveTo(x + gap + r, y - r * 1.2); ctx.lineTo(x + gap - r, y - r * 0.6);
    ctx.stroke();
  }
}

// Monster drawn with feet at (x, groundY). size multiplier s.
function drawMonster(ctx, kind, color, x, groundY, t, s = 1, angry = false) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(x, groundY + 2, 24 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, groundY);
  ctx.scale(s, s);
  const dark = shade(color, -50), light = shade(color, 60);
  switch (kind) {
    case 'slime': {
      const sq = Math.sin(t * 6) * 3;
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(0, -18 + sq / 2, 28 + sq, 20 - sq, 0, Math.PI, 0);
      ctx.lineTo(28 + sq, 0); ctx.lineTo(-28 - sq, 0); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(0, -18 + sq / 2, 25 + sq, 18 - sq, 0, Math.PI, 0);
      ctx.lineTo(25 + sq, -2); ctx.lineTo(-25 - sq, -2); ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.ellipse(-10, -28, 6, 4, -0.5, 0, Math.PI * 2); ctx.fill();
      eyes(ctx, -4, -18, 8, 5, angry);
      break;
    }
    case 'bat': {
      const fy = -44 + Math.sin(t * 5) * 8;
      const w = Math.sin(t * 18);
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(-8, fy); ctx.lineTo(-34, fy - 12 * w); ctx.lineTo(-26, fy + 6); ctx.lineTo(-16, fy + 2); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, fy); ctx.lineTo(34, fy - 12 * w); ctx.lineTo(26, fy + 6); ctx.lineTo(16, fy + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(0, fy, 13, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, fy - 8); ctx.lineTo(-7, fy - 20); ctx.lineTo(-2, fy - 10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, fy - 8); ctx.lineTo(7, fy - 20); ctx.lineTo(2, fy - 10); ctx.fill();
      eyes(ctx, -3, fy - 2, 5, 3.5, angry);
      break;
    }
    case 'ghost': {
      const fy = -30 + Math.sin(t * 3) * 5;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, fy - 8, 20, Math.PI, 0);
      ctx.lineTo(20, fy + 16);
      for (let i = 0; i < 4; i++) {
        const xx = 20 - (i + 0.5) * 10;
        ctx.quadraticCurveTo(xx + 5, fy + 16 + (i % 2 ? -6 : 6) + Math.sin(t * 8 + i) * 2, xx - 5, fy + 16);
      }
      ctx.lineTo(-20, fy - 8);
      ctx.fill();
      ctx.globalAlpha = 1;
      eyes(ctx, -4, fy - 8, 7, 4.5, angry);
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(-4, fy + 4, 4, 3 + Math.sin(t * 4), 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'mushroom': {
      const hop = Math.abs(Math.sin(t * 6)) * 6;
      ctx.translate(0, -hop);
      ctx.fillStyle = '#f4e6c8';
      roundRect(ctx, -12, -24, 24, 24, 6); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(0, -26, 28, 18, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      [[-14, -32, 5], [6, -36, 6], [16, -28, 4]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, Math.PI * 2); ctx.fill(); });
      eyes(ctx, -2, -14, 6, 4, angry);
      break;
    }
    case 'beetle': {
      const leg = Math.sin(t * 14) * 4;
      ctx.strokeStyle = dark; ctx.lineWidth = 4;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * 12, -10); ctx.lineTo(i * 14 + (i ? leg : -leg), 0); ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(4, -20, 28, 18, 0, Math.PI, 0); ctx.lineTo(32, -10); ctx.lineTo(-24, -10); ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.arc(-22, -16, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(4, -38); ctx.lineTo(4, -12); ctx.stroke();
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.ellipse(16, -28, 6, 3, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-40, -30); ctx.lineTo(-28, -24); ctx.fill();
      eyes(ctx, -24, -20, 4, 3.5, angry);
      break;
    }
    case 'imp': {
      const hop = Math.abs(Math.sin(t * 7)) * 8;
      ctx.translate(0, -hop);
      ctx.fillStyle = dark;
      ctx.fillRect(-10, -12, 6, 12); ctx.fillRect(4, -12, 6, 12);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(0, -28, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-14, -38); ctx.lineTo(-18, -54); ctx.lineTo(-6, -44); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, -38); ctx.lineTo(18, -54); ctx.lineTo(6, -44); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(16, -22); ctx.quadraticCurveTo(32, -20, 30, -36); ctx.stroke();
      eyes(ctx, -4, -30, 6, 4.5, true);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-8, -18, 4, 4); ctx.fillRect(0, -18, 4, 4);
      break;
    }
  }
  ctx.restore();
}

// Bosses are big and stand on the right side.
function drawBoss(ctx, boss, x, groundY, t, hurtT) {
  const flash = hurtT > 0 && Math.floor(hurtT * 20) % 2 === 0;
  ctx.save();
  if (flash) ctx.globalAlpha = 0.5;
  const c = boss.color, d = shade(c, -60), l = shade(c, 60);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(x, groundY + 4, 90, 14, 0, 0, Math.PI * 2); ctx.fill();
  const b = Math.sin(t * 2) * 4;
  switch (boss.kind) {
    case 'slime':
      drawMonster(ctx, 'slime', c, x, groundY, t * 0.6, 3.6, true);
      ctx.fillStyle = '#f2c230';
      ctx.beginPath();
      const cy = groundY - 136 + b;
      ctx.moveTo(x - 40, cy); ctx.lineTo(x - 40, cy - 30); ctx.lineTo(x - 20, cy - 14); ctx.lineTo(x, cy - 36);
      ctx.lineTo(x + 20, cy - 14); ctx.lineTo(x + 40, cy - 30); ctx.lineTo(x + 40, cy); ctx.fill();
      break;
    case 'beetle':
      drawMonster(ctx, 'beetle', c, x, groundY, t * 0.7, 3.2, true);
      break;
    case 'golem': {
      ctx.translate(x, groundY + b);
      ctx.fillStyle = d;
      roundRect(ctx, -70, -150, 140, 110, 18); ctx.fill();
      ctx.fillStyle = c;
      roundRect(ctx, -62, -144, 124, 98, 14); ctx.fill();
      ctx.fillStyle = d;
      roundRect(ctx, -110, -130, 44, 90, 14); ctx.fill();
      roundRect(ctx, 66, -130, 44, 90, 14); ctx.fill();
      roundRect(ctx, -50, -44, 36, 44, 8); ctx.fill();
      roundRect(ctx, 14, -44, 36, 44, 8); ctx.fill();
      ctx.fillStyle = c;
      roundRect(ctx, -40, -205, 80, 62, 14); ctx.fill();
      ctx.fillStyle = l;
      ctx.beginPath(); ctx.moveTo(-30, -140); ctx.lineTo(-10, -120); ctx.lineTo(-30, -100); ctx.fill();
      eyes(ctx, -6, -178, 16, 9, true);
      break;
    }
    case 'drake': {
      ctx.translate(x, groundY - 40 + Math.sin(t * 3) * 10);
      const w = Math.sin(t * 6);
      ctx.fillStyle = d;
      ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(60, -130 - w * 30); ctx.lineTo(80, -50); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(-40, -140 - w * 30); ctx.lineTo(-60, -60); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(10, -40, 60, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-60, -78, 30, 22, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.ellipse(10, -26, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d;
      ctx.beginPath(); ctx.moveTo(-60, -98); ctx.lineTo(-50, -124); ctx.lineTo(-44, -94); ctx.fill();
      ctx.beginPath(); ctx.moveTo(60, -30); ctx.quadraticCurveTo(110, -10, 120, -50); ctx.lineTo(100, -40); ctx.quadraticCurveTo(90, -20, 62, -20); ctx.fill();
      eyes(ctx, -66, -84, 9, 6, true);
      break;
    }
    case 'king': {
      ctx.translate(x, groundY);
      ctx.fillStyle = '#1a1030';
      ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-40, -150 + b); ctx.lineTo(40, -150 + b); ctx.lineTo(70, 0); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-30, -140 + b); ctx.lineTo(30, -140 + b); ctx.lineTo(50, 0); ctx.fill();
      ctx.fillStyle = '#2a1a48';
      ctx.beginPath(); ctx.arc(0, -170 + b, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c230';
      ctx.beginPath(); ctx.moveTo(-30, -196 + b); ctx.lineTo(-30, -226 + b); ctx.lineTo(-15, -208 + b); ctx.lineTo(0, -232 + b);
      ctx.lineTo(15, -208 + b); ctx.lineTo(30, -226 + b); ctx.lineTo(30, -196 + b); ctx.fill();
      ctx.fillStyle = '#ff3b6b'; ctx.shadowColor = '#ff3b6b'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(-12, -172 + b, 6, 0, Math.PI * 2); ctx.arc(12, -172 + b, 6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#b9a6ff'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-60, -110 + b); ctx.lineTo(-90, -10); ctx.stroke();
      ctx.fillStyle = '#b9a6ff';
      ctx.beginPath(); ctx.arc(-60, -116 + b, 10 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// Glowing orb that bosses throw.
function drawOrb(ctx, x, y, color, t) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, 22);
  g.addColorStop(0, '#fff');
  g.addColorStop(0.4, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 22 + Math.sin(t * 12) * 2, 0, Math.PI * 2); ctx.fill();
}

function drawGem(ctx, x, y, s, color = '#3fe08a') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -10 * s); ctx.lineTo(6 * s, -3 * s); ctx.lineTo(6 * s, 5 * s); ctx.lineTo(0, 11 * s);
  ctx.lineTo(-6 * s, 5 * s); ctx.lineTo(-6 * s, -3 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.moveTo(0, -10 * s); ctx.lineTo(3 * s, -3 * s); ctx.lineTo(0, 4 * s); ctx.lineTo(-3 * s, -3 * s); ctx.fill();
  ctx.restore();
}

function drawHeart(ctx, x, y, s, fill) {
  // fill: 0 empty, 1 half, 2 full
  ctx.save();
  ctx.translate(x, y);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, 6 * s);
    ctx.bezierCurveTo(-10 * s, -2 * s, -6 * s, -10 * s, 0, -4 * s);
    ctx.bezierCurveTo(6 * s, -10 * s, 10 * s, -2 * s, 0, 6 * s);
  };
  path(); ctx.fillStyle = '#3a1a24'; ctx.fill();
  if (fill > 0) {
    ctx.save();
    if (fill === 1) { ctx.beginPath(); ctx.rect(-12 * s, -12 * s, 12 * s, 24 * s); ctx.clip(); }
    path(); ctx.fillStyle = '#ff3b5c'; ctx.fill();
    ctx.restore();
  }
  path(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// ===== Scenery =====
function drawScenery(ctx, W, H, groundY, region, scroll, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, region.sky[0]);
  sky.addColorStop(1, region.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, groundY);

  // sun / moon / stars
  if (region.id === 5) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137) % W, sy = (i * 71) % (groundY - 60);
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + i));
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f4f0ff';
    ctx.beginPath(); ctx.arc(W - 120, 60, 30, 0, Math.PI * 2); ctx.fill();
  } else if (region.id === 4) {
    ctx.fillStyle = 'rgba(255,200,120,0.25)';
    for (let i = 0; i < 20; i++) {
      const ex = (i * 97 + t * 20) % W, ey = groundY - ((i * 53 + t * 40) % groundY);
      ctx.fillRect(ex, ey, 3, 3);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,220,0.9)';
    ctx.beginPath(); ctx.arc(W - 110, 56, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 260 - scroll * 0.1) % (W + 200) + W + 200) % (W + 200) - 100, cy = 40 + (i % 2) * 30;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.arc(cx + 20, cy - 8, 22, 0, Math.PI * 2); ctx.arc(cx + 44, cy, 18, 0, Math.PI * 2); ctx.fill();
    }
  }

  // distant hills / mountains
  ctx.fillStyle = region.hills;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= W; x += 10) {
    const xx = x + scroll * 0.25;
    const y = groundY - 50 - Math.sin(xx * 0.008) * 30 - Math.sin(xx * 0.021) * 14;
    ctx.lineTo(x, region.id === 3 || region.id === 4 ? y - Math.abs(Math.sin(xx * 0.004)) * 60 : y);
  }
  ctx.lineTo(W, groundY); ctx.fill();

  if (region.id === 4) {
    ctx.fillStyle = '#ff6a2e';
    ctx.beginPath(); ctx.arc(W * 0.7 - (scroll * 0.25) % 2000, groundY - 120, 10 + Math.sin(t * 4) * 3, 0, Math.PI * 2); ctx.fill();
  }

  // decorations (parallax)
  const spacing = 220;
  const off = (scroll * 0.6) % spacing;
  for (let i = -1; i < W / spacing + 2; i++) {
    const dx = i * spacing - off + 60;
    drawDeco(ctx, region.deco, dx, groundY, i);
  }

  // ground
  ctx.fillStyle = region.ground;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = region.groundDark;
  const toff = scroll % 40;
  for (let x = -40; x < W + 40; x += 40) {
    ctx.fillRect(x - toff, groundY, 20, 6);
    ctx.fillRect(x - toff + 14, groundY + 22, 12, 4);
  }
}

function drawDeco(ctx, kind, x, gy, i) {
  ctx.save();
  switch (kind) {
    case 'tree':
      ctx.fillStyle = '#7a4a1e'; ctx.fillRect(x - 6, gy - 50, 12, 50);
      ctx.fillStyle = '#3e9e3e';
      ctx.beginPath(); ctx.arc(x, gy - 64, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#58b858';
      ctx.beginPath(); ctx.arc(x - 8, gy - 72, 14, 0, Math.PI * 2); ctx.fill();
      if (i % 2) { ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.arc(x + 10, gy - 58, 4, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'pine':
    case 'snowpine':
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 5, gy - 20, 10, 20);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = kind === 'pine' ? (k % 2 ? '#1f5a35' : '#256b40') : '#2f6e55';
        ctx.beginPath(); ctx.moveTo(x - 32 + k * 6, gy - 18 - k * 26); ctx.lineTo(x, gy - 62 - k * 26); ctx.lineTo(x + 32 - k * 6, gy - 18 - k * 26); ctx.fill();
        if (kind === 'snowpine') {
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.moveTo(x - 10 + k * 2, gy - 48 - k * 26); ctx.lineTo(x, gy - 62 - k * 26); ctx.lineTo(x + 10 - k * 2, gy - 48 - k * 26); ctx.fill();
        }
      }
      break;
    case 'cactus':
      ctx.fillStyle = '#3d9a4a';
      roundRect(ctx, x - 10, gy - 70, 20, 70, 10); ctx.fill();
      roundRect(ctx, x - 30, gy - 50, 12, 30, 6); ctx.fill();
      roundRect(ctx, x - 30, gy - 26, 26, 10, 5); ctx.fill();
      roundRect(ctx, x + 18, gy - 60, 12, 28, 6); ctx.fill();
      roundRect(ctx, x + 4, gy - 38, 26, 10, 5); ctx.fill();
      break;
    case 'rock':
      ctx.fillStyle = '#2e1a14';
      ctx.beginPath(); ctx.moveTo(x - 30, gy); ctx.lineTo(x - 18, gy - 40); ctx.lineTo(x + 6, gy - 52); ctx.lineTo(x + 30, gy); ctx.fill();
      ctx.fillStyle = '#ff6a2e';
      ctx.fillRect(x - 6, gy - 30, 4, 28);
      break;
    case 'pillar':
      ctx.fillStyle = '#4a4466'; ctx.fillRect(x - 16, gy - 110, 32, 110);
      ctx.fillStyle = '#5c5680'; ctx.fillRect(x - 22, gy - 118, 44, 12);
      ctx.fillStyle = '#ffb347';
      ctx.beginPath(); ctx.arc(x, gy - 132, 6 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
      break;
  }
  ctx.restore();
}
