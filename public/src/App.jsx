import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  card: "#222222",
  border: "#2E2E2E",
  gold: "#C9A84C",
  goldLight: "#E8C96A",
  goldDim: "#7A6030",
  burgundy: "#6B1E2E",
  burgundyLight: "#8B2840",
  text: "#F0EDE8",
  muted: "#8A8680",
  accent: "#C9A84C",
};

const COACH_SYSTEM_PROMPT = `You are Coach Marcus, the personal AI life coach for Infinite Coaching — a premium personal development brand. Your mission is to help clients build discipline, confidence, mindset, and consistency.

Your coaching style:
- Direct, grounded, and no-nonsense — you don't sugarcoat, but you are never harsh
- Warm and encouraging, but you hold people accountable
- You speak from a place of wisdom, not lectures
- You ask powerful questions that make people think
- You keep responses focused and practical — never vague or generic
- You believe everyone has what it takes, they just need the right structure and mindset
- Short, punchy sentences when making a point. Longer when explaining a concept.

Your areas of expertise:
- Mindset transformation
- Building discipline and daily habits
- Confidence and identity work
- Goal setting and execution
- Emotional intelligence
- Overcoming self-sabotage and limiting beliefs
- Consistency and follow-through

Rules:
- Always respond as Coach Marcus, never break character
- Keep responses under 200 words — concise is powerful
- End most responses with one direct question or a clear action step
- Never give generic motivational fluff — be specific and real
- If someone is struggling, acknowledge it briefly then pivot to action
- Sign off naturally — no need to say "Coach Marcus" at the end every time`;

const programs = [
  { id: 1, title: "Becoming a Better You", subtitle: "Core Program", modules: 12, progress: 42, icon: "🌱", color: "#6B1E2E" },
  { id: 2, title: "Discipline & Consistency", subtitle: "Mastery Track", modules: 8, progress: 15, icon: "⚡", color: "#2A3B2A" },
  { id: 3, title: "Confidence Rebuild", subtitle: "Identity System", modules: 10, progress: 0, icon: "🔥", color: "#2A2A3B" },
  { id: 4, title: "Emotional Control", subtitle: "Mindset Reset", modules: 9, progress: 0, icon: "🧠", color: "#3B2A2A" },
];

const habits = [
  { id: 1, name: "Wake up by 6AM", streak: 12, done: true },
  { id: 2, name: "Read 10 pages", streak: 7, done: true },
  { id: 3, name: "No phone mornings", streak: 3, done: false },
  { id: 4, name: "Daily reflection", streak: 21, done: false },
  { id: 5, name: "Exercise", streak: 5, done: true },
];

const journalPrompts = [
  "What challenged you today?",
  "What did you avoid — and why?",
  "What did you do well?",
  "What will you do differently tomorrow?",
  "Where are you making excuses?",
];

const quotes = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
];

const starterPrompts = [
  "I keep starting things and not finishing them.",
  "How do I build more confidence?",
  "I feel stuck and don't know where to start.",
  "Give me a morning routine that actually works.",
  "How do I stop self-sabotaging?",
];

const BOOKING_URL = "https://iammarcjai.setmore.com?utm_source=qr-code&utm_medium=settings-share-bp";

export default function InfiniteCoachingApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [habitList, setHabitList] = useState(habits);
  const [journalEntry, setJournalEntry] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const [savedEntries, setSavedEntries] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [goalText, setGoalText] = useState("");
  const [goals, setGoals] = useState([
    { id: 1, text: "Launch my coaching brand online", milestone: "Build website", done: false },
    { id: 2, text: "Read 12 books this year", milestone: "Finish current book", done: false },
  ]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleHabit = (id) => setHabitList(h => h.map(x => x.id === id ? { ...x, done: !x.done } : x));

  const saveJournal = () => {
    if (!journalEntry.trim()) return;
    setSavedEntries(e => [{ prompt: journalPrompts[activePrompt], text: journalEntry, date: new Date().toLocaleDateString() }, ...e]);
    setJournalEntry("");
    setActivePrompt(p => (p + 1) % journalPrompts.length);
  };

  const addGoal = () => {
    if (!goalText.trim()) return;
    setGoals(g => [...g, { id: Date.now(), text: goalText, milestone: "Define first step", done: false }]);
    setGoalText("");
  };

  const sendMessage = async (text) => {
    const userMsg = text || inputText.trim();
    if (!userMsg || isLoading) return;
    setInputText("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-ipc": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: COACH_SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Let me think on that. Try again in a moment.";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Something went wrong connecting. Try again." }]);
    }
    setIsLoading(false);
  };

  const doneCount = habitList.filter(h => h.done).length;
  const growthScore = Math.round((doneCount / habitList.length) * 100);

  const tabs = [
    { id: "home", label: "Home", icon: "⬡" },
    { id: "programs", label: "Programs", icon: "◈" },
    { id: "habits", label: "Habits", icon: "◉" },
    { id: "journal", label: "Journal", icon: "◻" },
    { id: "coach", label: "Coach", icon: "✦" },
    { id: "book", label: "Book", icon: "📅" },
  ];

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: COLORS.text, maxWidth: 430, margin: "0 auto",
      position: "relative", paddingBottom: activeTab === "coach" ? 0 : 80,
    }}>
      <div style={{ background: "#000", padding: "8px 20px 6px", display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted }}>
        <span>9:41</span>
        <span>▌▌▌▌ ⬡ 100%</span>
      </div>
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Infinite Coaching</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Becoming A Better You</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>M</div>
      </div>
      <div style={{ padding: "0 0 20px" }}>
        {activeTab === "home" && <HomeTab quote={quotes[1]} habitList={habitList} growthScore={growthScore} doneCount={doneCount} setActiveTab={setActiveTab} />}
        {activeTab === "programs" && <ProgramsTab programs={programs} selected={selectedProgram} setSelected={setSelectedProgram} />}
        {activeTab === "habits" && <HabitsTab habitList={habitList} toggleHabit={toggleHabit} doneCount={doneCount} />}
        {activeTab === "journal" && <JournalTab prompt={journalPrompts[activePrompt]} entry={journalEntry} setEntry={setJournalEntry} onSave={saveJournal} entries={savedEntries} />}
        {activeTab === "book" && <BookTab />}
        {activeTab === "coach" && <CoachTab messages={messages} inputText={inputText} setInputText={setInputText} sendMessage={sendMessage} isLoading={isLoading} starterPrompts={starterPrompts} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0A0A0A", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 100 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: activeTab === tab.id ? COLORS.gold : COLORS.muted, transition: "color 0.2s", padding: "2px 6px" }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
