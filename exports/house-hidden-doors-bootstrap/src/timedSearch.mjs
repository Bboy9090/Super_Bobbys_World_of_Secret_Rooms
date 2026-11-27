// Pure timed-search rules. Clock values are supplied by the caller in monotonic milliseconds.
export const TARGETS = Object.freeze(["key", "watch", "feather", "bell", "moon", "letter"]);
export const OBJECTS = Object.freeze([...TARGETS, "book", "vase", "cup", "apple", "bottle", "candle", "globe", "frame", "bowl", "dice", "leaf", "lamp"]);
export const DURATION = 90000;
function checkTime(now, previous) {
  if (!Number.isFinite(now) || now < previous) throw new Error("Invalid monotonic clock");
}
export function start(now) {
  checkTime(now, 0);
  return { status:"running", deadline:now + DURATION, now, found:[], mistakes:0, hints:2, highlighted:null, score:0 };
}
export function tick(s, now) {
  checkTime(now, s.now);
  if (s.status !== "running") return s;
  return {...s, now, status:now >= s.deadline ? "lost" : "running"};
}
export function remaining(s) { return Math.max(0, Math.ceil((s.deadline-s.now)/1000)); }
export function select(s, id, now) {
  if (!OBJECTS.includes(id)) throw new Error("Unknown scene object");
  const v = tick(s, now);
  if (v.status !== "running" || v.found.includes(id)) return v;
  if (!TARGETS.includes(id)) {
    const next = {...v, mistakes:v.mistakes+1, deadline:v.deadline-3000};
    return tick(next, now);
  }
  const found = [...v.found,id];
  const won = found.length === TARGETS.length;
  const score = won ? Math.max(0, found.length*100+remaining(v)*10-v.mistakes*25-(2-v.hints)*50) : found.length*100;
  return {...v, found, highlighted:v.highlighted===id?null:v.highlighted, score, status:won?"won":"running"};
}
export function hint(s, now) {
  const v = tick(s, now);
  if (v.status !== "running" || v.hints===0 || v.highlighted!==null) return v;
  const id = TARGETS.find(x=>!v.found.includes(x));
  return tick({...v, hints:v.hints-1, highlighted:id, deadline:v.deadline-5000}, now);
}
