import fs from "node:fs";
import path from "node:path";

const appPath = path.join(process.cwd(), "src", "App.jsx");
let source = fs.readFileSync(appPath, "utf8");

source = source.replace('import styles from "./GameMenu.module.css";\n', "");

const menuStart = source.indexOf("\nfunction GameMenu(");
const setupStart = source.indexOf("\nfunction GameSetup(");
if (menuStart === -1 || setupStart === -1 || setupStart <= menuStart) {
  throw new Error("Could not locate temporary GameMenu component");
}
source = source.slice(0, menuStart) + "\n" + source.slice(setupStart);

const tailStart = source.indexOf("export default function App({ gameSlug = null }) {");
if (tailStart === -1) throw new Error("Could not locate App navigation tail");

const newTail = `export default function App({ gameSlug = null }) {
  const router = useRouter();
  const gameConfig = gameSlug ? GAME_PAGES[gameSlug] : null;
  const [screen, setScreen] = useState(() => gameConfig ? gameConfig.setupScreen : "dashboard");
  const [gamePuzzles, setGamePuzzles] = useState(() => starterPuzzles.map(preparePuzzle));
  const [imageMode, setImageMode] = useState("included");
  const [traceSession, setTraceSession] = useState(null);
  const [letterMode, setLetterMode] = useState("sequential");
  const [flipTopic, setFlipTopic] = useState("mixed");
  const [drawingSelection, setDrawingSelection] = useState({ mode: "free", templateId: null });
  const app = useMemo(() => {
    const setupBack = () => gameConfig ? router.push("/") : setScreen("dashboard");
    const gameBackTarget = gameConfig ? gameConfig.setupScreen : "dashboard";
    if (screen === "setup") return <GameSetup onBack={setupBack} onStart={(nextPuzzles, mode) => { setGamePuzzles(nextPuzzles); setImageMode(mode); setScreen("game"); }} />;
    if (screen === "game") return <Game gamePuzzles={gamePuzzles} imageMode={imageMode} onExit={() => setScreen(gameBackTarget)} />;
    if (screen === "tracing-setup") return <TracingSetup brand={<Brand compact />} onBack={setupBack} onStart={(items, startIndex) => { setTraceSession({ items, startIndex }); setScreen("tracing-game"); }} />;
    if (screen === "tracing-game" && traceSession) return <TracingGame brand={<Brand compact />} items={traceSession.items} startIndex={traceSession.startIndex} onExit={() => setScreen(gameBackTarget)} />;
    if (screen === "letter-setup") return <LetterFlashSetup brand={<Brand compact />} onBack={setupBack} onStart={(mode) => { setLetterMode(mode); setScreen("letter-game"); }} />;
    if (screen === "letter-game") return <LetterFlashGame brand={<Brand compact />} mode={letterMode} onExit={() => setScreen(gameBackTarget)} />;
    if (screen === "flip-setup") return <WordFlipSetup brand={<Brand compact />} onBack={setupBack} onStart={(topic) => { setFlipTopic(topic); setScreen("flip-game"); }} />;
    if (screen === "flip-game") return <WordFlipGame brand={<Brand compact />} topic={flipTopic} onExit={() => setScreen(gameBackTarget)} />;
    if (screen === "drawing-setup") return <DrawingSetup brand={<Brand compact />} onBack={setupBack} onStart={(selection) => { setDrawingSelection(selection); setScreen("drawing-game"); }} />;
    if (screen === "drawing-game") return <DrawingGame brand={<Brand compact />} selection={drawingSelection} onExit={() => setScreen(gameBackTarget)} />;
    return <Dashboard onSelectWordGame={() => router.push("/games/guess-the-word")} onSelectTracing={() => router.push("/games/tracing")} onSelectLetters={() => router.push("/games/letter-flashcards")} onSelectWordFlip={() => router.push("/games/word-flip-cards")} onSelectDrawing={() => router.push("/games/draw-color")} />;
  }, [screen, gamePuzzles, imageMode, traceSession, letterMode, flipTopic, drawingSelection, gameConfig, router]);
  return app;
}
`;

source = source.slice(0, tailStart) + newTail;
fs.writeFileSync(appPath, source);
