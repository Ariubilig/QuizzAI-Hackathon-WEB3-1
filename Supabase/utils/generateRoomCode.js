export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array(6).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
}