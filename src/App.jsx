import React, { useState, useEffect, useRef, useCallback } from "react";

// ==============================
// 1. 基础配置与核心数据
// ==============================
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

const BOT_POOL = [
  { id: 1, name: "老K",      avatar: "🎩",  chips: 15000, desc: "手指常敲击桌面掩饰波动" },
  { id: 2, name: "花蝴蝶",  avatar: "💃",  chips: 12000, desc: "常用抛媚眼干扰，大牌时呼吸急促" },
  { id: 3, name: "独眼龙",  avatar: "🏴‍☠️", chips: 25000, desc: "输牌猛拍桌子，死盯对手筹码" },
  { id: 4, name: "胖财神",  avatar: "🍺",  chips: 18000, desc: "喝酒掩饰紧张，笑呵呵地诈唬" },
  { id: 5, name: "西装暴徒",avatar: "🕶️",  chips: 30000, desc: "面无表情，推筹码极具侵略性" },
  { id: 6, name: "千手观音",avatar: "🪭",  chips: 22000, desc: "折扇遮面，眼神总在寻找发牌破绽" },
  { id: 7, name: "算盘精",  avatar: "🧮",  chips: 16000, desc: "嘴里念念有词，算赔率时微皱眉头" },
  { id: 8, name: "小野猫",  avatar: "😼",  chips: 14000, desc: "慵懒把玩筹码，拿到对A才会坐直" },
];

const BOT_ACTIONS = {
  fold:  ["摇了摇头，把牌一扔", "叹了口气，无奈盖牌", "看了一眼底牌，果断弃牌", "皱了皱眉，停止跟注"],
  check: ["敲了敲桌子，选择过牌", "面无表情，手指轻点桌面", "冷眼旁观，过牌", "犹豫片刻，敲桌过牌"],
  bet:   ["自信地扔出筹码", "眼神犀利，果断下注", "死死盯着你，推下筹码", "微微一笑，加注跟上", "呼吸变得急促，重注压上"],
};

const SHOP_ITEMS = [
  { id: "watch", name: "劳力士",   icon: "⌚", price: 100000,   desc: "尽显从容" },
  { id: "car",   name: "保时捷",   icon: "🏎️", price: 1000000,  desc: "震撼全场" },
  { id: "villa", name: "半山别墅", icon: "🏡", price: 10000000, desc: "终极象征" },
  { id: "yacht", name: "私人游艇", icon: "🛥️", price: 50000000, desc: "避风港"   },
];

const ACHIEVEMENT_LIST = [
  { id: "win_1",       name: "初出茅庐",   icon: "🥉", desc: "赢得第1次牌局",            condition: s => s.totalWins >= 1 },
  { id: "win_10",      name: "小试牛刀",   icon: "🃏", desc: "赢得10次牌局",             condition: s => s.totalWins >= 10 },
  { id: "win_100",     name: "经验老到",   icon: "🎯", desc: "赢得100次牌局",            condition: s => s.totalWins >= 100 },
  { id: "win_1000",    name: "赌鬼",       icon: "🎰", desc: "赢得1000次牌局",           condition: s => s.totalWins >= 1000 },
  { id: "win_10000",   name: "死都要赌",   icon: "💀", desc: "赢得10000次牌局",          condition: s => s.totalWins >= 10000 },
  { id: "win_100000",  name: "神",         icon: "✨", desc: "赢得100000次牌局",         condition: s => s.totalWins >= 100000 },
  { id: "escape_1",    name: "经验使然",   icon: "🚪", desc: "从老千局中主动离场1次",    condition: s => s.escapeCheats >= 1 },
  { id: "escape_10",   name: "火眼金睛",   icon: "👀", desc: "从老千局中主动离场10次",   condition: s => s.escapeCheats >= 10 },
  { id: "escape_100",  name: "杀意感知",   icon: "🌀", desc: "从老千局中主动离场100次",  condition: s => s.escapeCheats >= 100 },
  { id: "escape_1000", name: "老千克星",   icon: "🛡️", desc: "从老千局中主动离场1000次", condition: s => s.escapeCheats >= 1000 },
  { id: "chips_10k",   name: "万元户",     icon: "💵", desc: "拥有10,000筹码",           condition: s => s.maxChips >= 10000 },
  { id: "chips_100k",  name: "职业赌徒",   icon: "💰", desc: "拥有100,000筹码",          condition: s => s.maxChips >= 100000 },
  { id: "chips_1m",    name: "职业赌鬼",   icon: "💎", desc: "拥有1,000,000筹码",        condition: s => s.maxChips >= 1000000 },
  { id: "chips_10m",   name: "赌神继承人", icon: "👑", desc: "拥有10,000,000筹码",       condition: s => s.maxChips >= 10000000 },
  { id: "high_1",      name: "牛刀染血",   icon: "🗡️", desc: "在高级场赢1次牌局",        condition: s => s.highWins >= 1 },
  { id: "high_10",     name: "大杀四方",   icon: "🔥", desc: "在高级场赢10次牌局",       condition: s => s.highWins >= 10 },
  { id: "high_100",    name: "君临天下",   icon: "🏆", desc: "在高级场赢100次牌局",      condition: s => s.highWins >= 100 },
  { id: "high_1000",   name: "赌徒克星",   icon: "⚔️", desc: "在高级场赢1000次牌局",     condition: s => s.highWins >= 1000 },
  { id: "high_10000",  name: "赌神转世",   icon: "🌟", desc: "在高级场赢10000次牌局",    condition: s => s.highWins >= 10000 },
  { id: "catch_1",     name: "运气爆棚",   icon: "🎲", desc: "成功抓千1次",              condition: s => s.catchCheats >= 1 },
  { id: "catch_10",    name: "言出法随",   icon: "🚨", desc: "成功抓千10次",             condition: s => s.catchCheats >= 10 },
  { id: "catch_100",   name: "熟门熟路",   icon: "🔍", desc: "成功抓千100次",            condition: s => s.catchCheats >= 100 },
  { id: "catch_1000",  name: "人形摄像头", icon: "📷", desc: "成功抓千1000次",           condition: s => s.catchCheats >= 1000 },
  { id: "catch_10000", name: "看破一切",   icon: "🔮", desc: "成功抓千10000次",          condition: s => s.catchCheats >= 10000 },
  { id: "god",         name: "赌神",       icon: "🃏", desc: "解锁所有其他成就",         condition: () => false },
];
const NON_GOD_IDS = ACHIEVEMENT_LIST.filter(a => a.id !== "god").map(a => a.id);

// ==============================
// 2. 工具函数 & 音效
// ==============================
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try { const v = window.localStorage.getItem(key); return v !== null ? JSON.parse(v) : defaultValue; }
    catch (e) { return defaultValue; }
  });
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }, [key, value]);
  return [value, setValue];
}

let audioCtx = null;
const playSound = (type) => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === "deal") {
      osc.type = "sine"; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "win") {
      osc.type = "triangle"; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === "chip") {
      osc.type = "square"; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
  } catch (e) {}
};

function createDeck() {
  const d = []; for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  return d.sort(() => Math.random() - 0.5);
}

function evaluateHand(hand, comm) {
  if (!hand || hand.length === 0) return 0;
  const allCards = [...hand, ...comm];
  const cards = allCards.map(c => ({ ...c, val: RANKS.indexOf(c.rank) + 2 })).sort((a, b) => b.val - a.val);
  const rankCounts = {}; const suitCards = {};
  cards.forEach(c => {
    rankCounts[c.val] = (rankCounts[c.val] || 0) + 1;
    if (!suitCards[c.suit]) suitCards[c.suit] = [];
    suitCards[c.suit].push(c);
  });
  let flushCards = null; let flushSuitCards = null;
  for (const suit in suitCards) {
    if (suitCards[suit].length >= 5) { flushSuitCards = suitCards[suit]; flushCards = suitCards[suit].slice(0, 5); break; }
  }
  function getStraight(cardArray) {
    const uniqueVals = [...new Set(cardArray.map(c => c.val))].sort((a, b) => b - a);
    if (uniqueVals.includes(14)) uniqueVals.push(1);
    for (let i = 0; i <= uniqueVals.length - 5; i++) {
      if (uniqueVals[i] - uniqueVals[i + 4] === 4) return uniqueVals.slice(i, i + 5);
    }
    return null;
  }
  const straightVals = getStraight(cards);
  const straightFlushVals = flushSuitCards ? getStraight(flushSuitCards) : null;
  const groups = Object.entries(rankCounts)
    .map(([val, count]) => ({ val: Number(val), count }))
    .sort((a, b) => b.count !== a.count ? b.count - a.count : b.val - a.val);
  function calcScore(category, best5) {
    let score = category * 1048576;
    for (let i = 0; i < 5; i++) {
      const item = best5[i];
      const val = item ? (typeof item === "object" ? item.val : item) : 0;
      score += val * Math.pow(16, 4 - i);
    }
    return score;
  }
  if (straightFlushVals && straightFlushVals[0] === 14) return calcScore(10, straightFlushVals);
  if (straightFlushVals) return calcScore(9, straightFlushVals);
  if (groups[0].count === 4) {
    const kicker = cards.find(c => c.val !== groups[0].val);
    return calcScore(8, [groups[0].val, groups[0].val, groups[0].val, groups[0].val, kicker]);
  }
  if (groups[0].count === 3 && groups.length > 1 && groups[1].count >= 2)
    return calcScore(7, [groups[0].val, groups[0].val, groups[0].val, groups[1].val, groups[1].val]);
  if (flushCards) return calcScore(6, flushCards);
  if (straightVals) return calcScore(5, straightVals);
  if (groups[0].count === 3) {
    const kickers = cards.filter(c => c.val !== groups[0].val).slice(0, 2);
    return calcScore(4, [groups[0].val, groups[0].val, groups[0].val, kickers[0], kickers[1]]);
  }
  if (groups[0].count === 2 && groups.length > 1 && groups[1].count === 2) {
    const kicker = cards.find(c => c.val !== groups[0].val && c.val !== groups[1].val);
    return calcScore(3, [groups[0].val, groups[0].val, groups[1].val, groups[1].val, kicker]);
  }
  if (groups[0].count === 2) {
    const kickers = cards.filter(c => c.val !== groups[0].val).slice(0, 3);
    return calcScore(2, [groups[0].val, groups[0].val, kickers[0], kickers[1], kickers[2]]);
  }
  return calcScore(1, cards.slice(0, 5));
}

const PHASE_NAMES = { preflop: "翻牌前", flop: "翻牌", turn: "转牌", river: "河牌", showdown: "摊牌" };

const CSS_ANIMATIONS = `
  @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn { 0%{transform:scale(0.5);opacity:0;} 80%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
  .animate-slide { animation: slideDown 0.3s ease-out forwards; }
  .animate-pop   { animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
`;

function Card({ card, hidden, small }) {
  if (!card) return null;
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="animate-pop" style={{
      width: small ? 28 : 42, height: small ? 40 : 60,
      background: hidden ? "linear-gradient(135deg,#1a1a2e 25%,#16213e 100%)" : "#fff",
      border: "1px solid #444", borderRadius: 4, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontWeight: "bold",
      color: hidden ? "transparent" : isRed ? "#dc2626" : "#111",
      fontSize: small ? 12 : 16, boxShadow: "2px 2px 5px rgba(0,0,0,0.4)", flexShrink: 0,
    }}>
      {hidden ? "♠" : <><div style={{ fontSize: small ? 14 : 18, lineHeight: 1 }}>{card.suit}</div><div style={{ lineHeight: 1 }}>{card.rank}</div></>}
    </div>
  );
}

// ==============================
// 3. 主程序
// ==============================
export default function App() {
  const [view,     setView]     = useState("lobby");
  const [roomType, setRoomType] = useState("low");

  const [money,                setMoney]                = useStickyState(10000,  "qw_money_v7.3.1");
  const [userChips,            setUserChips]            = useStickyState(1000,   "qw_userChips_v7.3.1");
  const [eyePoints,            setEyePoints]            = useStickyState(0,      "qw_eyePoints_v7.3.1");
  const [assets,               setAssets]               = useStickyState({},     "qw_assets_v7.3.1");
  const [stats,                setStats]                = useStickyState(
    { totalWins: 0, highWins: 0, escapeCheats: 0, catchCheats: 0, maxChips: 2000 }, "qw_stats_v7.3.1"
  );
  const [unlockedAchievements, setUnlockedAchievements] = useStickyState([], "qw_achieves_v7.3.1");
  const [cheatLevel,  setCheatLevel]  = useStickyState(1,  "qw_cheat_lv_v7.3.1");
  const [cheatExp,    setCheatExp]    = useStickyState(0,  "qw_cheat_exp_v7.3.1");
  const [matchHistory,setMatchHistory]= useStickyState([], "qw_history_v7.3.1");

  // ── 游戏内状态 ──
  const [revealedHands,   setRevealedHands]   = useState({});
  const [showCheatModal,  setShowCheatModal]   = useState(false);
  const [showCheatInfo,   setShowCheatInfo]    = useState(false);
  const [peekComm,        setPeekComm]         = useState([]);

  const [currentTable,   setCurrentTable]   = useState([]);
  const [playerChips,    setPlayerChips]    = useState({});
  const [allHands,       setAllHands]       = useState({});
  const [communityCards, setCommunityCards] = useState([]);
  // ══════════════════════════════════════════════════════
  // 白屏修复①：deck 必须是 React state。
  // 原代码中 deck 只在 startNewGame 内部作为局部变量存在，
  // 但 doShowdown 的 useCallback deps 数组和 executeCheat 函数
  // 都直接引用了 deck，导致组件挂载时立即抛出
  // ReferenceError: deck is not defined → 整棵组件树崩溃 → 白屏。
  // ══════════════════════════════════════════════════════
  const [deck,           setDeck]           = useState([]);

  const [pot,            setPot]            = useState(0);
  const [phase,          setPhase]          = useState("preflop");
  const [folded,         setFolded]         = useState({});
  const [winner,         setWinner]         = useState(null);
  const [cheaters,       setCheaters]       = useState([]);
  const [isExposed,      setIsExposed]      = useState(false);
  const [log,            setLog]            = useState([]);
  const [currentBet,     setCurrentBet]     = useState(0);
  const [raiseInput,     setRaiseInput]     = useState("");

  // 版本迁移（旧存档搬家）
  useEffect(() => {
    const OLD_VER = "v7.3"; const NEW_VER = "v7.3.1";
    const oldMoney = localStorage.getItem(`qw_money_${OLD_VER}`);
    const newMoney = localStorage.getItem(`qw_money_${NEW_VER}`);
    if (oldMoney !== null && newMoney === null) {
      ["money","userChips","eyePoints","assets","stats","achieves"].forEach(key => {
        const val = localStorage.getItem(`qw_${key}_${OLD_VER}`);
        if (val !== null) localStorage.setItem(`qw_${key}_${NEW_VER}`, val);
      });
    }
  }, []);

  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = useCallback((icon, text) => {
    setLog(prev => [...prev, { icon, text, id: Date.now() + Math.random() }]);
  }, []);

  // ── 成就引擎 ──
  const triggerAchievementCheck = useCallback((latestStats, latestUnlocked, latestAssets, chips, inGame) => {
    let checkedStats = latestStats;
    if (chips > latestStats.maxChips) {
      checkedStats = { ...latestStats, maxChips: chips };
      setStats(checkedStats);
    }
    const newIds = [];
    for (const a of ACHIEVEMENT_LIST) {
      if (a.id === "god" || latestUnlocked.includes(a.id)) continue;
      if (a.condition(checkedStats, latestAssets)) newIds.push(a.id);
    }
    if (!latestUnlocked.includes("god")) {
      const afterUnlock = new Set([...latestUnlocked, ...newIds]);
      if (NON_GOD_IDS.every(id => afterUnlock.has(id))) newIds.push("god");
    }
    if (newIds.length === 0) return;
    setUnlockedAchievements(prev => {
      const toAdd = newIds.filter(id => !prev.includes(id));
      return toAdd.length === 0 ? prev : [...prev, ...toAdd];
    });
    const names = newIds.map(id => ACHIEVEMENT_LIST.find(a => a.id === id)?.name).filter(Boolean).join("、");
    if (inGame) { playSound("win"); addLog("🏆", `成就解锁：${names}`); }
    else setTimeout(() => alert(`🏆 解锁成就：${names}`), 100);
  }, [addLog, setStats, setUnlockedAchievements]);

  useEffect(() => {
    const chips = view === "game" ? (playerChips[0] || 0) : userChips;
    if (chips > stats.maxChips) {
      const newStats = { ...stats, maxChips: chips };
      setStats(newStats);
      triggerAchievementCheck(newStats, unlockedAchievements, assets, chips, view === "game");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerChips, userChips]);

  // ── 大厅操作 ──
  const buyAsset = (item) => {
    if (money >= item.price) {
      playSound("chip"); setMoney(m => m - item.price);
      const newAssets = { ...assets, [item.id]: (assets[item.id] || 0) + 1 };
      setAssets(newAssets);
      triggerAchievementCheck(stats, unlockedAchievements, newAssets, view === "game" ? (playerChips[0] || 0) : userChips, view === "game");
    } else alert("存款不足！");
  };

  const pawnAsset = (item) => {
    if ((assets[item.id] || 0) > 0) {
      playSound("chip");
      const chipValue = (item.price / 10) * 0.7;
      setAssets(a => ({ ...a, [item.id]: a[item.id] - 1 }));
      if (view === "game") { setPlayerChips(p => ({ ...p, 0: (p[0] || 0) + chipValue })); addLog("💼", `典当获得 ${chipValue} 筹码`); }
      else { setUserChips(c => c + chipValue); alert(`获得筹码：${chipValue}`); }
    }
  };

  const entertain = () => {
    // BUG1修复：消遣费用应为20筹码，原代码错误写成100
    // BUG2修复：神眼已满200时直接拦截，不消耗筹码
    if (eyePoints >= 200) { alert("赌神之眼已满！"); return; }
    playSound("deal");
    const cost = 20;
    if (view === "lobby" && userChips >= cost) {
      setUserChips(c => c - cost); setEyePoints(e => Math.min(200, e + 20));
    } else if (view === "game" && (playerChips[0] || 0) >= cost) {
      setPlayerChips(p => ({ ...p, 0: p[0] - cost })); setEyePoints(e => Math.min(200, e + 20));
      addLog("🍷", "饮酒：赌神之眼 +20");
    } else alert("筹码不足！");
  };

// ── 牌局流程 ──
  const enterGame = (type) => {
    playSound("chip");
    if (type === "high" && userChips < 10000) return alert("高级场需 10000 筹码！");
    if (userChips <= 0) return alert("筹码耗尽！");
    setRoomType(type);
    const shuffledBots = [...BOT_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    const table = [{ id: 0, name: "你", avatar: "🎭", isUser: true }, ...shuffledBots];
    setCurrentTable(table);
    const initialPC = { 0: userChips };
    shuffledBots.forEach(bot => { initialPC[bot.id] = type === "high" ? bot.chips * 5 : bot.chips; });
    setPlayerChips(initialPC); setView("game"); startNewGame(initialPC, table, type);
  };

  const startNewGame = (chips = playerChips, table = currentTable, type = roomType) => {
    setRevealedHands({}); setPeekComm([]);
    playSound("deal");
    const isHigh = type === "high";

    // 白屏修复①配套：用 newDeck 作局部变量名，避免遮蔽同名 state
    const newDeck = createDeck();
    const hands = {};
    const botIds = table.filter(p => !p.isUser).map(p => p.id);
    let gang = []; let rigged = false;
    if (isHigh && Math.random() < 0.4) { rigged = true; gang = [...botIds].sort(() => Math.random() - 0.5).slice(0, 2); }
    const newChips = { ...chips };
    botIds.forEach(id => { if ((newChips[id] || 0) <= 100) newChips[id] = isHigh ? 50000 : 10000; });
    setPlayerChips(newChips);
    table.forEach(p => { hands[p.id] = newDeck.splice(0, 2); });
    setAllHands(hands);
    setCommunityCards(newDeck.splice(0, 5));
    setDeck([...newDeck]); // 保存剩余牌堆到 state，供 executeCheat 使用
    setCheaters(gang); setIsExposed(false);
    const bb = isHigh ? 200 : 20;
    setPot(bb * 2); setCurrentBet(bb); setPhase("preflop");
    setFolded({}); setWinner(null); setRaiseInput(""); setLog([]);
    addLog("🎰", `新局开始，大盲 ${bb}，请行动...`);
    if (rigged && eyePoints >= 100) { setEyePoints(e => e - 100); setIsExposed(true); addLog("👁️", "【警告】检测到老千局！"); }
  };

  // ══════════════════════════════════════════════════
  // 白屏修复②：doShowdown 内部有一个错误的双层 if(userWon)。
  // 原代码结构：if(userWon){ ... if(userWon){ 赢 } else { 输 } }
  // 由于外层已保证 userWon===true，内层 else（输的逻辑）
  // 永远无法执行，导致玩家输了 setWinner 从未被调用，
  // winner 永远是 null，牌局永远无法结束。已改为正确的 if/else。
  // ══════════════════════════════════════════════════
  const doShowdown = useCallback((finalPot, finalChips, finalFolded, allComm, table) => {
    const fd = finalFolded || {};
    const currentTab = table || currentTable;
    const isRigged = cheaters.length > 0;

    const AI_WIN_TAUNTS  = ["就这点本事也敢All-in？", "你的筹码我笑纳了！", "回家再练十年吧！", "看清楚了，这才叫德州扑克。"];
    const AI_LOSE_TAUNTS = ["今天手气真差...", "算你走运！", "你是不是出老千了？！", "别得意，下一局连本带利赢回来！"];

    // BUG5修复：原代码用 -1 标记老千局玩家得分，但 maxScore 初始值也是 -1。
    // 若玩家是唯一未弃牌者，所有 AI 都弃牌，maxScore 保持 -1，
    // 玩家 score(-1) === maxScore(-1) → 玩家错误赢得老千局。
    // 修复：改用 -Infinity 作为初始最大值，-1 作为玩家弃权分不再产生歧义。
    let maxScore = -Infinity;
    const scores = {};
    currentTab.forEach(pl => {
      if (fd[pl.id]) return;
      let s = evaluateHand(allHands[pl.id], allComm);
      if (isRigged && pl.id === 0) s = -1; // -1 在任何真实手牌分(≥1)面前都会落败
      scores[pl.id] = s;
      if (s > maxScore) maxScore = s;
    });

    const winners = currentTab.filter(pl => !fd[pl.id] && scores[pl.id] === maxScore);
    const newChips = { ...finalChips };
    setPhase("showdown");

    if (winners.length === 0) { setWinner(-1); setPlayerChips(newChips); return; }

    const splitAmount = Math.floor(finalPot / winners.length);
    winners.forEach(w => { newChips[w.id] = (newChips[w.id] || 0) + splitAmount; });
    setPlayerChips(newChips);

    const userWon  = winners.some(w => w.id === 0);
    const isSplit  = winners.length > 1;

    if (userWon) {
      playSound("win");
      const updatedStats = {
        ...stats,
        totalWins: stats.totalWins + 1,
        highWins: roomType === "high" ? stats.highWins + 1 : stats.highWins,
      };
      setStats(updatedStats);
      triggerAchievementCheck(updatedStats, unlockedAchievements, assets, newChips[0], true);
      setWinner(0);
      if (isSplit) {
        const others = winners.filter(w => w.id !== 0).map(w => w.name).join("、");
        addLog("🤝", `平局！与 ${others} 平分底池，拿回 ${splitAmount}`);
        setMatchHistory(p => [{ res: "平", type: roomType, pot: finalPot }, ...p].slice(0, 5));
      } else {
        addLog("🎉", `独揽 ${finalPot}`);
        setMatchHistory(p => [{ res: "赢", type: roomType, pot: finalPot }, ...p].slice(0, 5));
        const loser = currentTab.find(p => p.id !== 0 && !fd[p.id]);
        if (loser && Math.random() > 0.4)
          addLog("💬", `${loser.name}: "${AI_LOSE_TAUNTS[Math.floor(Math.random() * AI_LOSE_TAUNTS.length)]}"`);
      }
    } else {
      // 原代码此分支因双层 if(userWon) 永远无法到达，已修复
      playSound("deal");
      const winnerPlayer = winners[0];
      setWinner(winnerPlayer.id);
      if (isSplit) {
        addLog("🤝", "对手之间平局，平分底池");
        setMatchHistory(p => [{ res: "平", type: roomType, pot: finalPot }, ...p].slice(0, 5));
      } else {
        addLog(fd[0] ? "😞" : "☠️", fd[0] ? "你已弃牌" : "败北");
        setMatchHistory(p => [{ res: "输", type: roomType, pot: finalPot }, ...p].slice(0, 5));
        if (!fd[0] && Math.random() > 0.4)
          addLog("💬", `${winnerPlayer.name}: "${AI_WIN_TAUNTS[Math.floor(Math.random() * AI_WIN_TAUNTS.length)]}"`);
      }
    }
  // deck 已经是合法 state，可安全加入 deps
  }, [allHands, cheaters, currentTable, roomType, stats, unlockedAchievements, assets, triggerAchievementCheck, addLog, matchHistory]);

  const advancePhase = useCallback((curPot, curChips, curPhase, curFolded, comm, table, incomingBet = currentBet ) => {
    const bb = roomType === "high" ? 200 : 20;
    const nextPhase = curPhase === "preflop" ? "flop" : curPhase === "flop" ? "turn" : curPhase === "turn" ? "river" : "showdown";
    let aiBets = 0; const newChips = { ...curChips };
    const activeBots = (table || currentTable).filter(p => !p.isUser && !curFolded[p.id]);
    const newFolded = { ...curFolded };
    activeBots.forEach(bot => {
      const score = evaluateHand(allHands[bot.id], comm);
      if (Math.random() < 0.2) {
        addLog(bot.avatar, `${bot.name} ${BOT_ACTIONS.fold[Math.floor(Math.random() * BOT_ACTIONS.fold.length)]}`);
        newFolded[bot.id] = true;
      } else {
       const strength = Math.min(score / 1500, 1);
        const botChips = newChips[bot.id] || 0;
        
        // 【核心逻辑】AI 必须跟注的金额：等于你的下注额，但不能超过它自己的筹码
        const mustCall = Math.min(incomingBet, botChips);
        
        // 如果牌特别好 (strength > 0.7)，在跟注基础上额外加注大盲的2倍
        const extraRaise = (strength > 0.7 && Math.random() > 0.5) ? bb * 2 : 0;
        const totalBet = Math.min(mustCall + extraRaise, botChips);

        if (totalBet > 0) {
          playSound("chip");
          newChips[bot.id] -= totalBet;
          aiBets += totalBet; // 累加到本轮总下注中
          
          // 决定显示什么文案
          let actionType = totalBet > incomingBet ? "加注到" : "跟注";
          if (totalBet >= botChips) actionType = "全压！";
          if (incomingBet === 0 && totalBet === 0) actionType = "过牌";
          
          addLog(bot.avatar, `${bot.name} ${actionType} ${totalBet}`);
            } else {
      addLog(bot.avatar, `${bot.name} 选择过牌`);
  });

setCurrentBet(0); // 这一轮博弈结束了，清空下注标杆，进入下一场（如翻牌转牌）
    const finalPot = curPot + aiBets;
    const newBet = activeBots.length > 0 && aiBets > 0 ? Math.floor(aiBets / activeBots.length) : 0;
    // BUG3修复：AI弃牌后必须同步React folded state。
    // 原代码只更新了局部变量 newFolded，未调用 setFolded。
    // 导致玩家下次操作时从 folded state 读到旧值，已弃牌AI重新参与下注。
    setFolded(newFolded);
    if (nextPhase === "showdown") {
      setPot(finalPot); setPlayerChips(newChips);
      doShowdown(finalPot, newChips, newFolded, comm, table);
    } else {
      playSound("deal"); setPot(finalPot); setPlayerChips(newChips);
      setCurrentBet(newBet); setPhase(nextPhase);
      addLog("🃏", `--- ${PHASE_NAMES[nextPhase]} ---${newBet > 0 ? ` 需跟注: ${newBet}` : ""}`);
    }
  }, [roomType, currentTable, allHands, addLog, doShowdown, currentBet]);

  // ── 千术系统 ──
  const executeCheat = (targetId1, targetId2, swapTargetId) => {
    if (eyePoints < 200) return alert("👀 神眼不足 200！");
    setEyePoints(prev => prev - 200);
    let newExp = cheatExp + 10; let newLv = cheatLevel;
    let req = Math.pow(10, newLv);
    while (newLv < 10 && newExp >= req) { newExp -= req; newLv++; req = Math.pow(10, newLv); alert(`🎉 突破！出千等级升至 Lv.${newLv}`); }
    setCheatExp(newExp); setCheatLevel(newLv);

    const nextHands   = { ...allHands };
    const nextRevealed = { ...revealedHands };
    const nextDeck    = [...deck]; // deck 现在是合法 state，不再报错

    const activeOpponents = currentTable.filter(p => p.id !== 0 && !folded[p.id]);
    const t1 = targetId1 || activeOpponents[0]?.id;

    if (newLv >= 1 && t1 !== undefined) nextRevealed[t1] = true;
    if (newLv >= 3 && t1 !== undefined && nextDeck.length > 0)
      nextHands[t1] = [nextDeck.pop(), nextHands[t1][1]];
    if (newLv >= 7) setPeekComm(nextDeck.slice(-3));
    if (newLv === 10) {
      activeOpponents.forEach(p => { nextRevealed[p.id] = true; });
      if (swapTargetId !== undefined && nextHands[swapTargetId]) {
        const myHand = nextHands[0];
        nextHands[0] = nextHands[swapTargetId];
        nextHands[swapTargetId] = myHand;
      }
    }
    setAllHands(nextHands);
    setRevealedHands(nextRevealed);
    setDeck(nextDeck);
    addLog("👁️", `发动 ${newLv} 级千术！`);
    setShowCheatModal(false);
  };

  // ── 玩家操作 ──
  const handleAction = (type) => {
    if (phase === "showdown" || winner !== null) return;
    const bb = roomType === "high" ? 200 : 20;
    let newPot = pot; let newChips = { ...playerChips }; const newFolded = { ...folded };
    const myChips = newChips[0] || 0;
    if (myChips <= 0 && type !== "fold") { addLog("💸", "筹码耗尽，只能弃牌"); return; }
    playSound("chip");
    if (type === "fold") {
      newFolded[0] = true; setFolded(newFolded);
      addLog("😞", "弃牌保平安");
      doShowdown(newPot, newChips, newFolded, communityCards, currentTable); return;
    }
    if (type === "check") {
      if (currentBet > 0) { addLog("⚠️", "有下注，不能过牌，请跟注或加注"); return; }
      addLog("👋", "过牌");
      advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
    if (type === "call") {
      const callAmt = Math.min(currentBet, myChips);
      if (callAmt <= 0) { addLog("⚠️", "筹码不足，无法跟注"); return; }
      newPot += callAmt; newChips[0] = myChips - callAmt;
      addLog("📞", `跟注 ${callAmt}`);
      advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
        if (type === "raise") {
      const amt = parseInt(raiseInput, 10);
      if (!amt || amt <= 0) { addLog("⚠️", "请输入有效加注金额"); return; }
      if (amt > myChips)    { addLog("⚠️", "筹码不足"); return; }
      if (amt < bb)         { addLog("⚠️", `最低加注 ${bb}`); return; }
      
      newPot += amt; 
      newChips[0] = myChips - amt; 
      setRaiseInput("");
      
      // 更新全局标杆金额
      setCurrentBet(amt); 
      
      addLog("📈", `你加注到 ${amt}`);
      // 将 amt 作为最后一个参数传给 AI 逻辑
      advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable, amt); 
      return;
    }

    if (type === "allin") {
      if (myChips <= 0) { addLog("⚠️", "已无筹码"); return; }
      const allInAmt = myChips;
      newPot += allInAmt; 
      newChips[0] = 0;
      
      // 全压也更新标杆金额
      setCurrentBet(allInAmt); 
      
      addLog("💥", `全压！${allInAmt}`);
      advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable, allInAmt); 
      return;
    }


  const handleEscape = () => {
    playSound("chip");
    if (winner === null) {
      if (!window.confirm("确定放弃当前底池离场？")) return;
      if (isExposed) {
        const updatedStats = { ...stats, escapeCheats: stats.escapeCheats + 1 };
        setStats(updatedStats);
        triggerAchievementCheck(updatedStats, unlockedAchievements, assets, playerChips[0] || 0, false);
      }
    }
    setUserChips(playerChips[0] || 0); setView("lobby");
  };

  const handleCatchCheater = () => {
    if (eyePoints < 200 || winner !== null) return;
    if (!window.confirm("抓错将没收全部筹码！确定？")) return;
    setEyePoints(0);
    if (cheaters.length > 0) {
      playSound("win");
      let totalStolen = 0; const newChips = { ...playerChips };
      cheaters.forEach(cid => { totalStolen += (newChips[cid] || 0); newChips[cid] = 0; });
      const botIds = currentTable.filter(p => !p.isUser).map(p => p.id);
      const innocents = [0, ...botIds.filter(id => !cheaters.includes(id))];
      const share = Math.floor(totalStolen / innocents.length);
      innocents.forEach(id => { newChips[id] = (newChips[id] || 0) + share; });
      setPlayerChips(newChips);
      const updatedCatchStats = { ...stats, catchCheats: stats.catchCheats + 1 };
      setStats(updatedCatchStats);
      triggerAchievementCheck(updatedCatchStats, unlockedAchievements, assets, newChips[0] || 0, true);
      setWinner(0); setPhase("showdown"); addLog("🚨", `抓千成功！缴获 ${share}`);
    } else {
      setPlayerChips(p => ({ ...p, 0: 0 })); setUserChips(0); setView("lobby");
      alert("误抓清白人！被安保丢出赌场！");
    }
  };

  // ══════════════════════════════════════════════════
  // 渲染：大厅
  // ══════════════════════════════════════════════════
  if (view === "lobby") {
    const totalAchieves = ACHIEVEMENT_LIST.length;
    const unlockedCount = unlockedAchievements.length;
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8d5b0", padding: "15px 10px", fontFamily: "sans-serif", paddingBottom: 50 }}>
        <style>{CSS_ANIMATIONS}</style>
        <h2 style={{ textAlign: "center", color: "#ffd700", margin: "0 0 15px 0" }}>赌神之路 V7.3</h2>

        {/* ══════════════════════════════════════════════
            白屏修复③：原代码把「救济金/钱庄/战绩/出千等级」
            全部嵌套进了「资产栏」的 flex 容器里，导致 JSX
            结构混乱，React 解析时报错崩溃。
            现已将资产栏（存款|筹码|神眼）单独抽出，
            其余模块放在它的后面，结构清晰。
        ══════════════════════════════════════════════ */}

        {/* 资产栏：仅显示 存款 / 筹码 / 神眼 */}
        <div style={{ display: "flex", justifyContent: "space-between", background: "#1a1a1a", padding: 12, borderRadius: 8, marginBottom: 15 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>存款</div>
            <div style={{ color: "#4ade80", fontSize: 16, fontWeight: "bold" }}>${(money / 1000).toFixed(0)}k</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>筹码</div>
            <div style={{ color: "#ffd700", fontSize: 16, fontWeight: "bold" }}>{Math.floor(userChips)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888" }}>神眼</div>
            <div style={{ color: eyePoints === 200 ? "#ef4444" : "#a855f7", fontSize: 16, fontWeight: "bold" }}>{eyePoints}/200</div>
          </div>
        </div>

{/* 救济金 */}
        {money === 0 && userChips === 0 && (
          <button
            onClick={() => { setMoney(10000); alert("基金会发放了 10,000 救济金！"); }}
            style={{ width: "100%", background: "#f59e0b", color: "#000", fontWeight: "bold", padding: 12, borderRadius: 8, marginBottom: 15, border: "none" }}
          >🆘 领取 10,000 救济金</button>
        )}

        {/* 钱庄 */}
        <div style={{ background: "#1a1a1a", padding: 12, borderRadius: 8, marginBottom: 15, border: "1px solid #332b00" }}>
          <div style={{ color: "#ffd700", fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>💱 钱庄 (1筹码 = 10资金)</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { if (userChips >= 100) { setUserChips(userChips - 100); setMoney(money + 1000); } }} style={{ flex: 1, background: "#1e3a8a", color: "#fff", padding: 8, borderRadius: 5, fontSize: 12, border: "none" }}>100 筹码 → 1K金</button>
            <button onClick={() => { if (money >= 1000) { setMoney(money - 1000); setUserChips(userChips + 100); } }} style={{ flex: 1, background: "#065f46", color: "#fff", padding: 8, borderRadius: 5, fontSize: 12, border: "none" }}>1K 资金 → 100筹</button>
          </div>
        </div>

        {/* 最近战绩 */}
        <div style={{ background: "#1a1a1a", padding: 12, borderRadius: 8, marginBottom: 15 }}>
          <div style={{ color: "#ffd700", fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>🏆 最近战绩</div>
          <div style={{ fontSize: 11 }}>
            {matchHistory.length === 0
              ? <div style={{ color: "#666" }}>暂无记录</div>
              : matchHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #333", padding: "4px 0" }}>
                  <span style={{ color: h.res === "赢" ? "#4ade80" : h.res === "平" ? "#ffd700" : "#f87171" }}>[{h.res}] {h.type === "low" ? "低级" : "高级"}</span>
                  <span>${h.pot}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* 出千等级 */}
        <div style={{ background: "#2e1065", padding: 12, borderRadius: 8, marginBottom: 15, border: "1px solid #5b21b6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "#ddd6fe", fontWeight: "bold", fontSize: 14 }}>👁️ 千术: Lv.{cheatLevel}</span>
            <button onClick={() => setShowCheatInfo(!showCheatInfo)} style={{ background: "#4c1d95", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "none" }}>详情</button>
          </div>
          <div style={{ width: "100%", background: "#000", height: 6, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${cheatLevel >= 10 ? 100 : (cheatExp / Math.pow(10, cheatLevel) * 100)}%`, background: "linear-gradient(90deg,#7c3aed,#db2777)", height: "100%" }} />
          </div>
          {showCheatInfo && (
            <div style={{ marginTop: 10, fontSize: 10, color: "#ddd6fe", background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 4, lineHeight: 1.6 }}>
              Lv1-2: 透视玩家 | Lv3-5: 弱化对手<br />Lv6-7: 透视公牌 | Lv8-10: 掌控全局
            </div>
          )}
        </div>

        {/* 功能按钮 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <button onClick={() => enterGame("low")} style={{ padding: "14px", borderRadius: 8, background: "#1f2937", color: "#fff", border: "1px solid #444", fontSize: 16, fontWeight: "bold" }}>🟢 初级场</button>
          <button onClick={() => enterGame("high")} style={{ padding: "14px", borderRadius: 8, background: "#450a0a", color: "#fca5a5", border: "1px solid #991b1b", fontSize: 16, fontWeight: "bold" }}>🔥 高级场</button>
          <button onClick={() => { if (money >= 1000) { setMoney(m => m - 1000); setUserChips(c => c + 100); } else alert("存款不足！"); }} style={{ padding: "12px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none" }}>兑筹码 ($1k→100)</button>
          <button onClick={entertain} style={{ padding: "12px", borderRadius: 8, background: eyePoints >= 200 ? "#3b0764" : "#7e22ce", color: eyePoints >= 200 ? "#888" : "#fff", border: "none" }}>🍷 消遣 (-20筹 神眼+20{eyePoints >= 200 ? " 已满" : ""})</button>
        </div>

        {/* 荣誉墙 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: 5, marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, margin: 0 }}>🏅 荣誉墙</h3>
          <span style={{ fontSize: 12, color: unlockedCount === totalAchieves ? "#ffd700" : "#888" }}>{unlockedCount} / {totalAchieves}</span>
        </div>
        {[
          { label: "🏆 赢局", ids: ["win_1","win_10","win_100","win_1000","win_10000","win_100000"] },
          { label: "🕵️ 识千", ids: ["escape_1","escape_10","escape_100","escape_1000"] },
          { label: "💰 筹码", ids: ["chips_10k","chips_100k","chips_1m","chips_10m"] },
          { label: "🔥 高级", ids: ["high_1","high_10","high_100","high_1000","high_10000"] },
          { label: "🚨 抓千", ids: ["catch_1","catch_10","catch_100","catch_1000","catch_10000"] },
          { label: "👑 终极", ids: ["god"] },
        ].map(group => (
          <div key={group.label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{group.label}</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {group.ids.map(id => {
                const a = ACHIEVEMENT_LIST.find(x => x.id === id); if (!a) return null;
                const unlocked = unlockedAchievements.includes(a.id);
                return (
                  <div key={a.id} style={{ minWidth: 76, maxWidth: 76, background: "#111", border: `1px solid ${unlocked ? "#ffd700" : "#2a2a2a"}`, padding: "8px 4px", borderRadius: 8, textAlign: "center", opacity: unlocked ? 1 : 0.45, flexShrink: 0 }}>
                    <div style={{ fontSize: 22, marginBottom: 3 }}>{unlocked ? a.icon : "🔒"}</div>
                    <div style={{ fontSize: 10, fontWeight: "bold", color: unlocked ? "#ffd700" : "#777", lineHeight: 1.2 }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 3, lineHeight: 1.2 }}>{a.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 典当行 */}
        <h3 style={{ fontSize: 16, borderBottom: "1px solid #333", paddingBottom: 5, marginTop: 10 }}>💎 典当行</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} style={{ background: "#111", border: "1px solid #333", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{item.name}</div>
                  {(assets[item.id] || 0) > 0
                    ? <div style={{ fontSize: 12, color: "#4ade80" }}>拥有: {assets[item.id]}</div>
                    : <div style={{ fontSize: 12, color: "#888" }}>${(item.price / 1000).toLocaleString()}k</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => buyAsset(item)} style={{ background: "#047857", color: "white", border: "none", padding: "8px 12px", borderRadius: 4, fontSize: 14 }}>买</button>
                {(assets[item.id] || 0) > 0 && <button onClick={() => pawnAsset(item)} style={{ background: "#b91c1c", color: "white", border: "none", padding: "8px 12px", borderRadius: 4, fontSize: 14 }}>当</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 渲染：牌桌
  // ══════════════════════════════════════════════════
  const currentComm =
    phase === "preflop" ? [] :
    phase === "flop"    ? communityCards.slice(0, 3) :
    phase === "turn"    ? communityCards.slice(0, 4) :
                          communityCards;

  const myChips  = playerChips[0] || 0;
  const canCheck = currentBet === 0;
  const callAmt  = Math.min(currentBet, myChips);
  const isBroke  = myChips <= 0;

  return (
    <div style={{ height: "100vh", background: "#050a05", color: "#e8d5b0", display: "flex", flexDirection: "column", fontFamily: "sans-serif", overflow: "hidden" }}>
      <style>{CSS_ANIMATIONS}</style>

      {/* 顶部状态栏 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#111", borderBottom: "1px solid #333" }}>
        <button onClick={handleEscape} style={{ background: "transparent", color: "#fff", border: "1px solid #555", padding: "6px 12px", borderRadius: 6, fontSize: 14 }}>← 离场</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ffd700", fontWeight: "bold", fontSize: 14 }}>底池: {pot}</div>
          <div style={{ color: "#aaa", fontSize: 11 }}>{PHASE_NAMES[phase] || phase}</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={entertain} style={{ background: "#7e22ce", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>🍷</button>
          <button onClick={handleCatchCheater} style={{ background: eyePoints >= 200 && winner === null ? "#dc2626" : "#444", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>🚨 抓</button>
        </div>
      </div>

      {/* 千术入口浮层 */}
      {!folded[0] && phase !== "showdown" && (
        <div style={{ position: "absolute", top: 60, left: 10, zIndex: 1000 }}>
          <button
            onClick={() => setShowCheatModal(!showCheatModal)}
            style={{ background: "#9333ea", color: "#fff", padding: "6px 12px", borderRadius: 8, boxShadow: "0 4px 10px rgba(147,51,234,0.5)", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >👁️ 出千 (消耗200神眼)</button>

          {peekComm.length > 0 && (
            <div style={{ marginTop: 8, background: "rgba(0,0,0,0.7)", color: "#d8b4fe", padding: 8, fontSize: 12, borderRadius: 6 }}>
              未来公牌: {peekComm.map(c => `${c.suit}${c.rank}`).join(", ")}
            </div>
          )}

          {showCheatModal && (
            <div style={{ marginTop: 8, background: "#111827", border: "1px solid #a855f7", padding: 12, borderRadius: 8, color: "#fff", width: 190 }}>
              <p style={{ marginBottom: 8, color: "#d8b4fe", fontSize: 12 }}>当前等级: Lv.{cheatLevel}</p>
              {cheatLevel >= 2 && (
                <select id="cheatT1" style={{ width: "100%", background: "#1f2937", color: "#fff", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #374151" }}>
                  <option value="">选择透视/换牌目标</option>
                  {currentTable.filter(p => p.id !== 0 && !folded[p.id]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              {cheatLevel >= 6 && (
                <select id="cheatT2" style={{ width: "100%", background: "#1f2937", color: "#fff", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #374151" }}>
                  <option value="">选择第二个透视目标</option>
                  {currentTable.filter(p => p.id !== 0 && !folded[p.id]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              {cheatLevel === 10 && (
                <select id="cheatSwap" style={{ width: "100%", background: "#7f1d1d", color: "#fff", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #b91c1c", fontWeight: "bold" }}>
                  <option value="">选择要互换底牌的冤大头</option>
                  {currentTable.filter(p => p.id !== 0 && !folded[p.id]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <button
                onClick={() => {
                  const t1   = document.getElementById("cheatT1")?.value  || undefined;
                  const t2   = document.getElementById("cheatT2")?.value  || undefined;
                  const swap = document.getElementById("cheatSwap")?.value || undefined;
                  executeCheat(t1 ? Number(t1) : undefined, t2 ? Number(t2) : undefined, swap ? Number(swap) : undefined);
                }}
                style={{ width: "100%", background: "#7e22ce", color: "#fff", padding: 8, borderRadius: 6, fontWeight: "bold", border: "none", cursor: "pointer" }}
              >执行千术</button>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* AI 玩家区 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {currentTable.filter(p => !p.isUser).map(p => {
            const isCheat  = isExposed && cheaters.includes(p.id);
            const isFolded = folded[p.id];
            return (
              <div key={p.id} style={{ padding: 8, border: `1px solid ${winner == p.id ? "#ffd700" : isCheat ? "#ef4444" : isFolded ? "#1a1a1a" : "#333"}`, borderRadius: 8, background: "#1a1a1a", textAlign: "center", position: "relative", opacity: isFolded ? 0.4 : 1 }}>
                {isCheat  && <div style={{ position: "absolute", top: -5, right: -5, background: "#ef4444", fontSize: 10, padding: "2px 4px", borderRadius: 4 }}>千</div>}
                {isFolded && <div style={{ position: "absolute", top: -5, left:  -5, background: "#555",    fontSize: 10, padding: "2px 4px", borderRadius: 4 }}>弃</div>}
                <div style={{ fontSize: 20 }}>{p.avatar} <span style={{ fontSize: 12, color: "#ccc" }}>{p.name}</span></div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2, height: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.desc}</div>
                <div style={{ fontSize: 12, color: "#ffd700", marginTop: 4 }}>🪙 {Math.floor(playerChips[p.id] || 0)}</div>
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 6, minHeight: 30 }}>
                  {allHands[p.id] && (phase === "showdown" || (revealedHands && revealedHands[p.id])) ? (
                    allHands[p.id].map((c, i) => <Card key={i} card={c} small />)
                  ) : (
                    <><div style={{ width: 20, height: 28, background: "#991b1b", border: "1px solid #fff", borderRadius: 2 }} /><div style={{ width: 20, height: 28, background: "#991b1b", border: "1px solid #fff", borderRadius: 2 }} /></>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 公共牌区 */}
        <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8, minHeight: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 11, color: "#666" }}>
            {phase === "preflop" ? "等待翻牌" : phase === "flop" ? "翻牌 (3张)" : phase === "turn" ? "转牌 (4张)" : "河牌 (5张)"}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
            {currentComm.length === 0 ? <span style={{ color: "#333", fontSize: 13 }}>牌面朝下</span> : currentComm.map((c, i) => <Card key={i} card={c} />)}
          </div>
        </div>

        {/* 日志 */}
        <div ref={logRef} style={{ height: 72, overflowY: "auto", background: "#000", padding: 8, fontSize: 12, borderRadius: 6, border: "1px solid #333", color: "#888" }}>
          {log.map(l => <div key={l.id} className="animate-slide">{l.icon} {l.text}</div>)}
        </div>

        {/* 玩家手牌 */}
        <div style={{ background: "#111", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>你的手牌</div>
            <div style={{ display: "flex", gap: 5 }}>
              {(allHands[0] || []).map((c, i) => <Card key={i} card={c} />)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: isBroke && winner === null ? "#ef4444" : "#666" }}>
              {isBroke && winner === null ? "⚠️ 筹码耗尽" : "我的筹码"}
            </div>
            <div style={{ color: isBroke ? "#ef4444" : "#ffd700", fontSize: 18, fontWeight: "bold" }}>🪙 {Math.floor(myChips)}</div>
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div style={{ background: "#111", borderTop: "1px solid #333", padding: 10 }}>
        {winner !== null ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 8, color: winner === 0 ? "#ffd700" : "#ef4444" }}>
              {winner === 0 ? "🎉 你赢了！" : winner === -1 ? "😞 弃牌出局" : `☠️ ${currentTable.find(p => p.id === winner)?.name || "对手"} 获胜`}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {myChips > 0
                ? <button onClick={() => startNewGame()} style={{ flex: 1, padding: "12px", borderRadius: 8, background: "#15803d", color: "#fff", border: "none", fontSize: 16, fontWeight: "bold" }}>🔄 再来一局</button>
                : <button onClick={() => { setUserChips(0); setView("lobby"); }} style={{ flex: 1, padding: "12px", borderRadius: 8, background: "#7f1d1d", color: "#fff", border: "none", fontSize: 16 }}>💸 破产回大厅</button>
              }
              <button onClick={handleEscape} style={{ padding: "12px 16px", borderRadius: 8, background: "#374151", color: "#fff", border: "none", fontSize: 14 }}>回大厅</button>
            </div>
          </div>
        ) : isBroke ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 8 }}>筹码耗尽，无法继续下注</div>
            <button onClick={() => handleAction("fold")} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", fontSize: 15, fontWeight: "bold" }}>✗ 认输弃牌</button>
          </div>
        ) : (
          <div>
            {currentBet > 0 && (
              <div style={{ fontSize: 12, color: "#f59e0b", textAlign: "center", marginBottom: 6 }}>
                当前需跟注: <strong>{callAmt}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => handleAction("fold")} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", fontSize: 14, fontWeight: "bold" }}>✗ 弃牌</button>
              {canCheck
                ? <button onClick={() => handleAction("check")} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e40af", fontSize: 14, fontWeight: "bold" }}>👋 过牌</button>
                : <button onClick={() => handleAction("call")}  style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e40af", fontSize: 14, fontWeight: "bold" }}>📞 跟注 {callAmt}</button>
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number" value={raiseInput} onChange={e => setRaiseInput(e.target.value)}
                placeholder={`加注(≥${roomType === "high" ? 200 : 20})`}
                style={{ flex: 1.5, padding: "10px 8px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "1px solid #555", fontSize:13, minWidth: 0 }}
              />
              <button onClick={() => handleAction("raise")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#78350f", color: "#fcd34d", border: "1px solid #92400e", fontSize: 14, fontWeight: "bold" }}>📈 加注</button>
              <button onClick={() => handleAction("allin")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#4c1d95", color: "#ddd6fe", border: "1px solid #6d28d9", fontSize: 14, fontWeight: "bold" }}>💥 全压</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}