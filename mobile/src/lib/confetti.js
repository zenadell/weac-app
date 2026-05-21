// Stub mobile confetti — calls a global emitter set up by AppShell
let listeners = [];
export function onBurst(fn) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; }
export function popBurst(x = 0.5, y = 0.5) { listeners.forEach(l => l({ x, y })); }
export function celebrate() { popBurst(0.5, 0.4); setTimeout(() => popBurst(0.3, 0.6), 200); setTimeout(() => popBurst(0.7, 0.6), 400); }
