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
function BookTab() {
  const sessionTypes = [
    { icon: "🌱", title: "Discovery Session", duration: "30 min", desc: "New to coaching? Let's find out where you are and where you want to go.", tag: "Great to start" },
    { icon: "⚡", title: "Breakthrough Session", duration: "60 min", desc: "Dig deep into a specific challenge — mindset, habits, confidence, or direction.", tag: "Most popular" },
    { icon: "🔥", title: "Intensive Session", duration: "90 min", desc: "A full reset. Build your personalized growth plan from the ground up.", tag: "Deep work" },
  ];
  return (
    <div>
      <div style={{ margin: "16px 16px 0", background: `linear-gradient(135deg, ${COLORS.burgundy}DD, #0F0A04)`, border: `1px solid ${COLORS.burgundyLight}55`, borderRadius: 16, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.04, lineHeight: 1 }}>✦</div>
        <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>1-on-1 Coaching</div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.02em" }}>Ready to invest<br />in yourself?</div>
        <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, margin: "0 0 18px" }}>Book a private session with Marc directly. Real coaching, real accountability, real results.</p>
        <button onClick={() => window.open(BOOKING_URL, "_blank")} style={{ width: "100%", padding: "14px", background: `linear-gradient(90deg, ${COLORS.goldDim}, ${COLORS.gold})`, border: "none", borderRadius: 12, color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "0.04em" }}>Book Your Session →</button>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        <SectionLabel>Choose Your Session</SectionLabel>
        {sessionTypes.map((s, i) => (
          <div key={i} onClick={() => window.open(BOOKING_URL, "_blank")} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.burgundy}88, #1A0D0A)`, border: `1px solid ${COLORS.burgundyLight}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.gold, border: `1px solid ${COLORS.goldDim}`, borderRadius: 99, padding: "2px 7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.tag}</div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.gold, marginBottom: 5 }}>⏱ {s.duration}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
            <div style={{ color: COLORS.gold, fontSize: 18, flexShrink: 0, marginTop: 4 }}>›</div>
          </div>
        ))}
        <div style={{ margin: "4px 0 20px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, border: `2px solid ${COLORS.gold}` }}>M</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Marc Jai</div>
            <div style={{ fontSize: 11, color: COLORS.gold, marginBottom: 4 }}>Founder · Infinite Coaching</div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>Life coach specializing in mindset, discipline, and personal transformation.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachTab({ messages, inputText, setInputText, sendMessage, isLoading, starterPrompts }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 170px)" }}>
      <div style={{ margin: "16px 16px 0", background: `linear-gradient(135deg, #1A0D12, #0F0A04)`, border: `1px solid ${COLORS.goldDim}`, borderRadius: 16, padding: "18px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, border: `2px solid ${COLORS.gold}` }}>M</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Coach Marcus</div>
          <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.08em" }}>INFINITE COACHING · AI LIFE COACH</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50" }} />
            <span style={{ fontSize: 10, color: COLORS.muted }}>Available now</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 16, borderTopLeftRadius: 4 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>What's going on? I'm here. Whether you're stuck, struggling, or just need a push in the right direction — let's work through it.</p>
              <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6 }}>What do you need to tackle today?</p>
            </div>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Common struggles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {starterPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 13, textAlign: "left", cursor: "pointer", lineHeight: 1.4 }}>{p}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, marginBottom: 2 }}>M</div>
            )}
            <div style={{ maxWidth: "78%", background: msg.role === "user" ? `linear-gradient(135deg, ${COLORS.goldDim}, #5A4520)` : COLORS.surface, border: `1px solid ${msg.role === "user" ? COLORS.goldDim : COLORS.border}`, borderRadius: 14, borderBottomRightRadius: msg.role === "user" ? 4 : 14, borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14, padding: "11px 14px" }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: COLORS.text, whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>M</div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, borderBottomLeftRadius: 4, padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(d => <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.gold, animation: `pulse 1.2s ease-in-out ${d*0.2}s infinite`, opacity: 0.6 }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 16px 14px", borderTop: `1px solid ${COLORS.border}`, background: "#0A0A0A", display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0, paddingBottom: 80 }}>
        <textarea value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Talk to Coach Marcus..." rows={1} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "11px 14px", color: COLORS.text, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
        <button onClick={() => sendMessage()} disabled={isLoading || !inputText.trim()} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: inputText.trim() && !isLoading ? `linear-gradient(135deg, ${COLORS.goldDim}, ${COLORS.gold})` : COLORS.border, cursor: inputText.trim() && !isLoading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#000", flexShrink: 0 }}>➤</button>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

function HomeTab({ quote, habitList, growthScore, doneCount, setActiveTab }) {
  return (
    <div>
      <div style={{ margin: "16px 16px 0", background: `linear-gradient(135deg, ${COLORS.burgundy}CC, #1A0D12)`, border: `1px solid ${COLORS.burgundyLight}44`, borderRadius: 16, padding: "20px 20px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, opacity: 0.06, lineHeight: 1 }}>"</div>
        <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Today's Mindset</div>
        <p style={{ fontSize: 15, lineHeight: 1.6, fontStyle: "italic", margin: "0 0 10px", color: COLORS.text }}>{quote.text}</p>
        <div style={{ fontSize: 11, color: COLORS.muted }}>— {quote.author}</div>
      </div>
      <div style={{ display: "flex", gap: 10, margin: "12px 16px 0" }}>
        <StatCard label="Today's Score" value={`${growthScore}%`} accent={COLORS.gold} />
        <StatCard label="Habits Done" value={`${doneCount}/${habitList.length}`} accent={COLORS.goldDim} />
        <StatCard label="Top Streak" value={`${Math.max(...habitList.map(h => h.streak))}d`} accent={COLORS.burgundyLight} />
      </div>
      <div style={{ margin: "16px 16px 0" }}>
        <SectionLabel>Today's Focus</SectionLabel>
        <div style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.goldDim}, ${COLORS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌱</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Module 6: Owning Your Identity</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>Becoming a Better You · 18 min read</div>
          </div>
          <div style={{ marginLeft: "auto", color: COLORS.gold, fontSize: 18 }}>›</div>
        </div>
      </div>
      <div style={{ margin: "12px 16px 0" }}>
        <button onClick={() => setActiveTab("coach")} style={{ width: "100%", padding: "14px", background: `linear-gradient(90deg, #1A0D12, #1A1208)`, border: `1px solid ${COLORS.goldDim}`, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.burgundy}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: COLORS.text, flexShrink: 0 }}>M</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Talk to Coach Marcus</div>
            <div style={{ fontSize: 11, color: COLORS.gold }}>Your AI coach is ready →</div>
          </div>
        </button>
      </div>
      <div style={{ margin: "16px 16px 0" }}>
        <SectionLabel>Habit Check-in</SectionLabel>
        {habitList.slice(0, 3).map(h => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${COLORS.border}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: h.done ? COLORS.gold : "transparent", border: `2px solid ${h.done ? COLORS.gold : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>{h.done ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: h.done ? COLORS.muted : COLORS.text, textDecoration: h.done ? "line-through" : "none" }}>{h.name}</span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.gold }}>🔥 {h.streak}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgramsTab({ programs, selected, setSelected }) {
  if (selected) {
    const p = programs.find(x => x.id === selected);
    return (
      <div>
        <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.gold, fontSize: 20, cursor: "pointer", padding: 0 }}>‹</button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</div>
        </div>
        <div style={{ margin: "16px", background: `${p.color}33`, border: `1px solid ${p.color}55`, borderRadius: 14, padding: "20px" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>{p.subtitle} · {p.modules} modules</div>
          <ProgressBar value={p.progress} />
          <div style={{ fontSize: 11, color: COLORS.gold, marginTop: 8 }}>{p.progress}% complete</div>
        </div>
        {["Module 1: Know Yourself First","Module 2: Breaking Old Patterns","Module 3: Building Your Foundation","Module 4: Emotional Mastery","Module 5: The Discipline Code","Module 6: Owning Your Identity"].map((m, i) => (
          <div key={i} style={{ margin: "0 16px", padding: "14px 0", borderBottom: `1px solid ${COLORS.border}33`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: i < Math.round(p.progress / 100 * 6) ? COLORS.gold : COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: i < Math.round(p.progress / 100 * 6) ? "#000" : COLORS.muted, fontWeight: 700 }}>{i < Math.round(p.progress / 100 * 6) ? "✓" : i + 1}</div>
            <span style={{ fontSize: 13 }}>{m}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <div style={{ padding: "16px 16px 4px" }}><SectionLabel>Your Programs</SectionLabel></div>
      {programs.map(p => (
        <div key={p.id} onClick={() => setSelected(p.id)} style={{ margin: "0 16px 10px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{p.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>{p.subtitle} · {p.modules} modules</div>
            <ProgressBar value={p.progress} />
          </div>
          <div style={{ color: COLORS.gold, fontSize: 18, flexShrink: 0 }}>›</div>
        </div>
      ))}
    </div>
  );
}

function HabitsTab({ habitList, toggleHabit, doneCount }) {
  return (
    <div>
      <div style={{ padding: "16px 16px 0" }}>
        <SectionLabel>Daily Habits</SectionLabel>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>Today's Completion</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.gold }}>{doneCount}/{habitList.length}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>Best Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>🔥 21d</div>
          </div>
        </div>
        {habitList.map(h => (
          <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ background: COLORS.surface, border: `1px solid ${h.done ? COLORS.goldDim : COLORS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: h.done ? COLORS.gold : "transparent", border: `2px solid ${h.done ? COLORS.gold : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#000", fontWeight: 700 }}>{h.done ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: h.done ? COLORS.muted : COLORS.text, textDecoration: h.done ? "line-through" : "none" }}>{h.name}</div>
            </div>
            <div style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>🔥 {h.streak}d</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalTab({ prompt, entry, setEntry, onSave, entries }) {
  return (
    <div>
      <div style={{ padding: "16px 16px 0" }}>
        <SectionLabel>Daily Reflection</SectionLabel>
        <div style={{ background: `linear-gradient(135deg, #1A1208, #110D04)`, border: `1px solid ${COLORS.goldDim}`, borderRadius: 14, padding: "18px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Today's Prompt</div>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>{prompt}</div>
          <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="Write your honest answer here..." style={{ width: "100%", minHeight: 120, background: "#0F0B04", border: `1px solid ${COLORS.goldDim}44`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <button onClick={onSave} style={{ marginTop: 12, width: "100%", padding: "13px", background: `linear-gradient(90deg, ${COLORS.goldDim}, ${COLORS.gold})`, border: "none", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>Save Entry →</button>
        </div>
        {entries.length > 0 && (
          <div>
            <SectionLabel>Past Entries</SectionLabel>
            {entries.map((e, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.gold, marginBottom: 4 }}>{e.date}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6, fontStyle: "italic" }}>{e.prompt}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{e.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: accent, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, color: COLORS.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>{children}</div>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ background: COLORS.border, borderRadius: 99, height: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 99, width: `${value}%`, background: value > 0 ? `linear-gradient(90deg, ${COLORS.goldDim}, ${COLORS.gold})` : "transparent", transition: "width 0.5s" }} />
    </div>
  );
}
