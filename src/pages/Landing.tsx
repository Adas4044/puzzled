import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import llamaPuzzleImg from "../assets/llama-puzzle.png";

// Dark mode: purple-tinted dark (accent #AF69EE)
const THEME = {
  bg: "#0f0d14",
  bgGlow: "rgba(175, 105, 238, 0.08)",
  accent: "#AF69EE",
  accentDim: "rgba(175, 105, 238, 0.5)",
  pieceFill: "#1a1625",
  pieceFillAlt: "#15121c",
  textMuted: "#8b8499",
  stroke: "rgba(175, 105, 238, 0.4)",
  strokeBright: "rgba(175, 105, 238, 0.7)",
  pieceBorder: "rgba(0, 0, 0, 0.4)",
};

const COLS = 3;
const ROWS = 3;
const PIECE_W = 140;
const PIECE_H = 140;
const TAB = 28;

function piecePath(
  col: number,
  row: number,
  cols: number,
  rows: number,
  w: number,
  h: number,
  tab: number
): string {
  const top = row === 0 ? 0 : row % 2 === 1 ? 1 : -1;
  const bottom = row === rows - 1 ? 0 : row % 2 === 0 ? 1 : -1;
  const left = col === 0 ? 0 : col % 2 === 1 ? 1 : -1;
  const right = col === cols - 1 ? 0 : col % 2 === 0 ? 1 : -1;
  const t = tab;
  const w3 = w / 3;
  const h3 = h / 3;
  let d = `M 0 0`;
  if (top === 0) d += ` L ${w} 0`;
  else {
    d += ` L ${w3} 0`;
    d += ` C ${w3} ${-top * t * 0.4} ${w3 + t * 0.3} ${-top * t} ${w / 2} ${-top * t}`;
    d += ` C ${w - t * 0.3} ${-top * t * 0.4} ${w * 2 / 3} 0 ${w * 2 / 3} 0`;
    d += ` L ${w} 0`;
  }
  if (right === 0) d += ` L ${w} ${h}`;
  else {
    d += ` L ${w} ${h3}`;
    d += ` C ${w + right * t * 0.4} ${h3} ${w + right * t} ${h3 + t * 0.3} ${w + right * t} ${h / 2}`;
    d += ` C ${w + right * t * 0.4} ${h - t * 0.3} ${w} ${h * 2 / 3} ${w} ${h * 2 / 3}`;
    d += ` L ${w} ${h}`;
  }
  if (bottom === 0) d += ` L 0 ${h}`;
  else {
    d += ` L ${w * 2 / 3} ${h}`;
    d += ` C ${w * 2 / 3} ${h + bottom * t * 0.4} ${w / 2 + t * 0.3} ${h + bottom * t} ${w / 2} ${h + bottom * t}`;
    d += ` C ${w3 - t * 0.3} ${h + bottom * t * 0.4} ${w3} ${h} ${w3} ${h}`;
    d += ` L 0 ${h}`;
  }
  if (left === 0) d += ` L 0 0`;
  else {
    d += ` L 0 ${h * 2 / 3}`;
    d += ` C ${-left * t * 0.4} ${h * 2 / 3} ${-left * t} ${h / 2 + t * 0.3} ${-left * t} ${h / 2}`;
    d += ` C ${-left * t * 0.4} ${h3 - t * 0.3} 0 ${h3} 0 ${h3}`;
    d += ` L 0 0`;
  }
  d += ` Z`;
  return d;
}

type Phase = "puzzle" | "solved";

export default function Landing() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>(
    window.innerWidth < 768 ? "solved" : "puzzle"
  );
  const [dragging, setDragging] = useState(false);
  const [piecePos, setPiecePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapped, setSnapped] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const missingCol = COLS - 1;
  const missingRow = ROWS - 1;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && boardRef.current) {
      const board = boardRef.current.getBoundingClientRect();
      setPiecePos({
        x: board.left + COLS * PIECE_W + 60,
        y: board.top + (ROWS * PIECE_H) / 2 - PIECE_H / 2,
      });
      setInitialized(true);
    }
  }, [initialized]);

  const getSlotRect = () => {
    if (!boardRef.current) return null;
    const board = boardRef.current.getBoundingClientRect();
    return {
      x: board.left + missingCol * PIECE_W,
      y: board.top + missingRow * PIECE_H,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (snapped) return;
    e.preventDefault();
    setDragging(true);
    setDragOffset({ x: e.clientX - piecePos.x, y: e.clientY - piecePos.y });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (snapped) return;
    const touch = e.touches[0];
    setDragging(true);
    setDragOffset({ x: touch.clientX - piecePos.x, y: touch.clientY - piecePos.y });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setPiecePos({ x: clientX - dragOffset.x, y: clientY - dragOffset.y });
    };
    const onUp = () => {
      if (!dragging) return;
      setDragging(false);
      const slot = getSlotRect();
      if (!slot) return;
      if (Math.hypot(piecePos.x - slot.x, piecePos.y - slot.y) < 60) {
        setPiecePos({ x: slot.x, y: slot.y });
        setSnapped(true);
        setTimeout(() => {
          setTransitioning(true);
          setTimeout(() => setPhase("solved"), 700);
        }, 600);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, dragOffset, piecePos]);

  useEffect(() => {
    if (phase !== "solved") return;
    const t = setTimeout(() => navigate("/tutorial"), 7000);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  const totalW = COLS * PIECE_W;
  const totalH = ROWS * PIECE_H;
  const pieceColors: Record<string, string> = {
    "0-0": THEME.pieceFillAlt, "1-0": THEME.pieceFill, "2-0": THEME.pieceFillAlt,
    "0-1": THEME.pieceFill, "1-1": THEME.pieceFillAlt, "2-1": THEME.pieceFill,
    "0-2": THEME.pieceFillAlt, "1-2": THEME.pieceFill,
  };
  const pieceAccent: Record<string, string> = {
    "0-0": THEME.accent, "1-0": THEME.accentDim, "2-0": THEME.accent,
    "0-1": THEME.accentDim, "1-1": THEME.accent, "2-1": THEME.accentDim,
    "0-2": THEME.accent, "1-2": THEME.accentDim,
  };
  const missingPiecePathD = piecePath(missingCol, missingRow, COLS, ROWS, PIECE_W, PIECE_H, TAB);

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: THEME.bg }}>
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
        style={{ opacity: transitioning ? 0 : 1, pointerEvents: transitioning ? "none" : "auto" }}
      >
        {phase === "puzzle" && (
          <>
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: totalW + 200,
                height: totalH + 200,
                background: `radial-gradient(circle, ${THEME.bgGlow} 0%, transparent 70%)`,
                filter: "blur(40px)",
              }}
            />
            <div className="flex flex-col items-center gap-8">
              <p className="text-sm tracking-widest uppercase font-light select-none" style={{ letterSpacing: "0.25em", color: THEME.textMuted }}>
                drag the piece into place
              </p>
              <div ref={boardRef} className="relative" style={{ width: totalW, height: totalH }}>
                {Array.from({ length: ROWS }).map((_, row) =>
                  Array.from({ length: COLS }).map((_, col) => {
                    const key = `${col}-${row}`;
                    const isMissing = col === missingCol && row === missingRow;
                    const path = piecePath(col, row, COLS, ROWS, PIECE_W, PIECE_H, TAB);
                    return (
                      <div
                        key={key}
                        className="absolute"
                        style={{
                          left: col * PIECE_W,
                          top: row * PIECE_H,
                          width: PIECE_W + TAB * 2,
                          height: PIECE_H + TAB * 2,
                          marginLeft: -TAB,
                          marginTop: -TAB,
                        }}
                      >
                        <svg
                          width={PIECE_W + TAB * 2}
                          height={PIECE_H + TAB * 2}
                          viewBox={`${-TAB} ${-TAB} ${PIECE_W + TAB * 2} ${PIECE_H + TAB * 2}`}
                          style={{ overflow: "visible" }}
                        >
                          <path
                            d={path}
                            fill={isMissing ? "transparent" : pieceColors[key] || THEME.pieceFill}
                            stroke={isMissing ? THEME.strokeBright : THEME.pieceBorder}
                            strokeWidth={isMissing ? 2 : 1}
                            strokeDasharray={isMissing ? "6 4" : "none"}
                          />
                          {!isMissing && (
                            <>
                              <path d={path} fill="none" stroke={pieceAccent[key] || THEME.accent} strokeWidth="0.5" strokeOpacity="0.2" />
                              <text
                                x={PIECE_W / 2}
                                y={PIECE_H / 2 + 5}
                                textAnchor="middle"
                                fill={pieceAccent[key] || THEME.accent}
                                fontSize="11"
                                fontFamily="Inter, system-ui"
                                fontWeight="500"
                                opacity="0.35"
                                style={{ userSelect: "none" }}
                              >
                                {["medical", "device", "field", "manual", "repair", "guide", "clinic", "tech"][col + row * COLS]}
                              </text>
                            </>
                          )}
                        </svg>
                      </div>
                    );
                  })
                )}
                {snapped && (
                  <div
                    className="absolute inset-0 rounded pointer-events-none landing-snap-pulse"
                    style={{ background: `radial-gradient(circle at 83% 83%, ${THEME.bgGlow} 0%, transparent 55%)` }}
                  />
                )}
              </div>
            </div>
            {initialized && (
              <div
                ref={pieceRef}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                className="fixed"
                style={{
                  left: piecePos.x,
                  top: piecePos.y,
                  width: PIECE_W + TAB * 2,
                  height: PIECE_H + TAB * 2,
                  marginLeft: -TAB,
                  marginTop: -TAB,
                  cursor: snapped ? "default" : dragging ? "grabbing" : "grab",
                  zIndex: 100,
                  transition: snapped ? "left 0.3s cubic-bezier(.34,1.56,.64,1), top 0.3s cubic-bezier(.34,1.56,.64,1)" : "none",
                  filter: dragging ? `drop-shadow(0 0 20px ${THEME.accentDim})` : `drop-shadow(0 0 10px ${THEME.stroke})`,
                }}
              >
                <svg
                  width={PIECE_W + TAB * 2}
                  height={PIECE_H + TAB * 2}
                  viewBox={`${-TAB} ${-TAB} ${PIECE_W + TAB * 2} ${PIECE_H + TAB * 2}`}
                  style={{ overflow: "visible", display: "block" }}
                >
                  <defs>
                    <clipPath id="llama-piece-clip">
                      <path d={missingPiecePathD} />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#llama-piece-clip)">
                    <image href={llamaPuzzleImg} x={0} y={0} width={PIECE_W} height={PIECE_H} preserveAspectRatio="xMidYMid meet" />
                  </g>
                  <path d={missingPiecePathD} fill="none" stroke={THEME.strokeBright} strokeWidth="2" />
                  <path d={missingPiecePathD} fill="none" stroke={THEME.accent} strokeWidth="0.75" strokeOpacity="0.5" />
                </svg>
              </div>
            )}
          </>
        )}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700"
        style={{ opacity: phase === "solved" ? 1 : 0, pointerEvents: phase === "solved" ? "auto" : "none" }}
      >
        <div className="text-center select-none">
          <div
            className="font-black leading-none tracking-tighter landing-gradient-text"
            style={{
              fontSize: "clamp(80px, 18vw, 200px)",
              background: `linear-gradient(135deg, #E8E0F5 0%, ${THEME.accent} 50%, #C4B5E0 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
              letterSpacing: "-0.04em",
            }}
          >
            puzzled
          </div>
          <p className="text-sm tracking-widest uppercase mt-6 font-light landing-fade-up" style={{ letterSpacing: "0.3em", color: THEME.textMuted }}>
            making manuals make sense
          </p>
        </div>
        {phase === "solved" && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-xs" style={{ color: THEME.textMuted }}>Continuing in a few moments…</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes landing-gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes landing-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes landing-snap-pulse-kf { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
        .landing-gradient-text { animation: landing-gradient-shift 4s ease infinite; }
        .landing-fade-up { animation: landing-fade-up 1s ease 0.4s both; }
        .landing-snap-pulse { animation: landing-snap-pulse-kf 0.6s ease-out; }
      `}</style>
    </div>
  );
}
