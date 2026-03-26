import React, { useState, useEffect, useRef, useCallback } from "react";

// ==============================
// 1. 基础配置与核心数据 (全成就回归 + 动态语料)
// ==============================
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

const BOT_POOL = [
  { id: 1, name: "老K",     avatar: "🎩", chips: 15000, desc: "手指常敲击桌面掩饰波动" },
  { id: 2, name: "花蝴蝶", avatar: "💃", chips: 12000, desc: "常用抛媚眼干扰，大牌时呼吸急促" },
  { id: 3, name: "独眼龙", avatar: "🏴‍☠️", chips: 25000, desc: "输牌猛拍桌子，死盯对手筹码" },
  { id: 4, name: "胖财神", avatar: "🍺", chips: 18000, desc: "喝酒掩饰紧张，笑呵呵地诈唬" },
  { id: 5, name: "西装暴徒",avatar: "🕶️", chips: 30000, desc: "面无表情，推筹码极具侵略性" },
  { id: 6, name: "千手观音",avatar: "🪭", chips: 22000, desc: "折扇遮面，眼神总在寻找发牌破绽" },
  { id: 7, name: "算盘精", avatar: "🧮", chips: 16000, desc: "嘴里念念有词，算赔率时微皱眉头" },
  { id: 8, name: "小野猫", avatar: "😼", chips: 14000, desc: "慵懒把玩筹码，拿到对A才会坐直" },
];

const BOT_ACTIONS = {
  fold: ["摇了摇头，把牌一扔", "叹了口气，无奈盖牌", "看了一眼底牌，果断弃牌", "皱了皱眉，停止跟注"],
  check: ["敲了敲桌子，选择过牌", "面无表情，手指轻点桌面", "冷眼旁观，过牌", "犹豫片刻，敲桌过牌"],
  bet: ["自信地扔出筹码", "眼神犀利，果断下注", "死死盯着你，推下筹码", "微微一笑，加注跟上", "呼吸变得急促，重注压上"]
};

const SHOP_ITEMS = [
  { id: "watch", name: "劳力士",   icon: "⌚", price: 100000,    desc: "尽显从容" },
  { id: "car",   name: "保时捷",   icon: "🏎️", price: 1000000,   desc: "震撼全场" },
  { id: "villa", name: "半山别墅", icon: "🏡", price: 10000000,  desc: "终极象征" },
  { id: "yacht", name: "私人游艇", icon: "🛥️", price: 50000000,  desc: "避风港"   },
];

const ACHIEVEMENT_LIST = [
  { id: "win_1",        name: "初出茅庐",   icon: "🥉", desc: "赢得第1次牌局",             condition: s => s.totalWins >= 1 },
  { id: "win_10",       name: "小试牛刀",   icon: "🃏", desc: "赢得10次牌局",              condition: s => s.totalWins >= 10 },
  { id: "win_100",      name: "经验老到",   icon: "🎯", desc: "赢得100次牌局",             condition: s => s.totalWins >= 100 },
  { id: "win_1000",     name: "赌鬼",       icon: "🎰", desc: "赢得1000次牌局",            condition: s => s.totalWins >= 1000 },
  { id: "win_10000",    name: "死都要赌",   icon: "💀", desc: "赢得10000次牌局",           condition: s => s.totalWins >= 10000 },
  { id: "win_100000",   name: "神",         icon: "✨", desc: "赢得100000次牌局",          condition: s => s.totalWins >= 100000 },{ id: "escape_1",     name: "经验使然",   icon: "🚪", desc: "从老千局中主动离场1次",     condition: s => s.escapeCheats >= 1 },
  { id: "escape_10",    name: "火眼金睛",   icon: "👀", desc: "从老千局中主动离场10次",    condition: s => s.escapeCheats >= 10 },
  { id: "escape_100",   name: "杀意感知",   icon: "🌀", desc: "从老千局中主动离场100次",   condition: s => s.escapeCheats >= 100 },
  { id: "escape_1000",  name: "老千克星",   icon: "🛡️", desc: "从老千局中主动离场1000次",  condition: s => s.escapeCheats >= 1000 },
  { id: "chips_10k",    name: "万元户",     icon: "💵", desc: "拥有10,000筹码",            condition: s => s.maxChips >= 10000 },
  { id: "chips_100k",   name: "职业赌徒",   icon: "💰", desc: "拥有100,000筹码",           condition: s => s.maxChips >= 100000 },
  { id: "chips_1m",     name: "职业赌鬼",   icon: "💎", desc: "拥有1,000,000筹码",         condition: s => s.maxChips >= 1000000 },
  { id: "chips_10m",    name: "赌神继承人", icon: "👑", desc: "拥有10,000,000筹码",        condition: s => s.maxChips >= 10000000 },
  { id: "high_1",       name: "牛刀染血",   icon: "🗡️", desc: "在高级场赢1次牌局",         condition: s => s.highWins >= 1 },
  { id: "high_10",      name: "大杀四方",   icon: "🔥", desc: "在高级场赢10次牌局",        condition: s => s.highWins >= 10 },
  { id: "high_100",     name: "君临天下",   icon: "🏆", desc: "在高级场赢100次牌局",       condition: s => s.highWins >= 100 },
  { id: "high_1000",    name: "赌徒克星",   icon: "⚔️", desc: "在高级场赢1000次牌局",      condition: s => s.highWins >= 1000 },
  { id: "high_10000",   name: "赌神转世",   icon: "🌟", desc: "在高级场赢10000次牌局",     condition: s => s.highWins >= 10000 },
  { id: "catch_1",      name: "运气爆棚",   icon: "🎲", desc: "成功抓千1次",               condition: s => s.catchCheats >= 1 },
  { id: "catch_10",     name: "言出法随",   icon: "🚨", desc: "成功抓千10次",              condition: s => s.catchCheats >= 10 },
  { id: "catch_100",    name: "熟门熟路",   icon: "🔍", desc: "成功抓千100次",             condition: s => s.catchCheats >= 100 },
  { id: "catch_1000",   name: "人性摄像头", icon: "📷", desc: "成功抓千1000次",            condition: s => s.catchCheats >= 1000 },
  { id: "catch_10000",  name: "看破一切",   icon: "🔮", desc: "成功抓千10000次",           condition: s => s.catchCheats >= 10000 },
  { id: "god",          name: "赌神",       icon: "🃏", desc: "解锁所有其他成就",          condition: () => false },
];
const NON_GOD_IDS = ACHIEVEMENT_LIST.filter(a => a.id !== "god").map(a => a.id);

// ==============================
// 2. 工具函数 & 动画声效引擎
// ==============================
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const v = window.localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : defaultValue;
    } catch (e) { return defaultValue; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }, [key, value]);
  return [value, setValue];
}

let audioCtx = null;
const playSound = (type) => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === "deal") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === "chip") {
      osc.type = "square";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
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
  const all = [...hand, ...comm]; const counts = {};
  let maxRank = 0; let pairRank = 0;
  all.forEach(c => {
    const val = RANKS.indexOf(c.rank) + 2;
    counts[val] = (counts[val] || 0) + 1;
    if (val > maxRank) maxRank = val;
    if (counts[val] >= 2 && val > pairRank) pairRank = val;
  });
  return pairRank > 0 ? pairRank * 100 + maxRank : maxRank;
}

const PHASE_NAMES = { preflop: "翻牌前", flop: "翻牌", turn: "转牌", river: "河牌", showdown: "摊牌" };

const CSS_ANIMATIONS = `
  @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .animate-slide { animation: slideDown 0.3s ease-out forwards; }
  .animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .chip-transition { transition: all 0.3s ease; }
`;

function Card({ card, hidden, small }) {
  if (!card) return null;
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="animate-pop" style={{
      width: small ? 28 : 42, height: small ? 40 : 60,
      background: hidden ? "linear-gradient(135deg, #1a1a2e 25%, #16213e 100%)" : "#fff",
      border: "1px solid #444", borderRadius: 4,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontWeight: "bold", color: hidden ? "transparent" : isRed ? "#dc2626" : "#111",
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
  const [view, setView] = useState("lobby");
  const [roomType, setRoomType] = useState("low");

  const [money, setMoney] = useStickyState(1000000, "qw_money_v72");
  const [userChips, setUserChips] = useStickyState(2000, "qw_userChips_v72");
  const [eyePoints, setEyePoints] = useStickyState(0, "qw_eyePoints_v72");
  const [assets, setAssets] = useStickyState({}, "qw_assets_v72");
  const [stats, setStats] = useStickyState({ totalWins: 0, highWins: 0, escapeCheats: 0, catchCheats: 0, maxChips: 2000 }, "qw_stats_v72");
  const [unlockedAchievements, setUnlockedAchievements] = useStickyState([], "qw_achieves_v72");

  const [currentTable, setCurrentTable] = useState([]);
  const [playerChips, setPlayerChips] = useState({});
  const [allHands, setAllHands] = useState({});
  const [communityCards, setCommunityCards] = useState([]);
  const [pot, setPot] = useState(0);
  const [phase, setPhase] = useState("preflop");
  const [folded, setFolded] = useState({});
  const [winner, setWinner] = useState(null);
  const [cheaters, setCheaters] = useState([]);
  const [isExposed, setIsExposed] = useState(false);
  const [log, setLog] = useState([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [raiseInput, setRaiseInput] = useState("");

  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = useCallback((icon, text) => { setLog(prev => [...prev, { icon, text, id: Date.now() + Math.random() }]); }, []);

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
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
    const names = newIds.map(id => ACHIEVEMENT_LIST.find(a => a.id === id)?.name).filter(Boolean).join("、");
    if (inGame) {
      playSound("win");
      addLog("🏆", `成就解锁：${names}`);
    } else {
      setTimeout(() => alert(`🏆 解锁成就：${names}`), 100);
    }
  }, [addLog, setStats, setUnlockedAchievements]);

  useEffect(() => {
    const chips = view === "game" ? (playerChips[0] || 0) : userChips;
    if (chips > stats.maxChips) {
      const newStats = { ...stats, maxChips: chips };
      setStats(newStats);
      triggerAchievementCheck(newStats, unlockedAchievements, assets, chips, view === "game");
    }
  }, [playerChips, userChips]);

  const buyAsset = (item) => {
    if (money >= item.price) {
      playSound("chip");
      setMoney(m => m - item.price);
      const newAssets = { ...assets, [item.id]: (assets[item.id] || 0) + 1 };
      setAssets(newAssets);
      triggerAchievementCheck(stats, unlockedAchievements, newAssets, view === "game" ? (playerChips[0] || 0) : userChips, false);
    } else alert("存款不足！");
  };

  const pawnAsset = (item) => {
    if ((assets[item.id] || 0) > 0) {
      playSound("chip");
      const chipValue = (item.price / 10) * 0.7;
      setAssets(a => ({ ...a, [item.id]: a[item.id] - 1 }));
      setUserChips(c => c + chipValue);
      alert(`获得筹码：${chipValue}`);
    }
  };

  const entertain = () => {
    playSound("deal");
    const cost = 100;
    if (view === "lobby" && userChips >= cost) {
      setUserChips(c => c - cost); setEyePoints(e => Math.min(200, e + 20));
    } else if (view === "game" && (playerChips[0] || 0) >= cost) {
      setPlayerChips(p => ({ ...p, 0: p[0] - cost })); setEyePoints(e => Math.min(200, e + 20));
addLog("🍷", "饮酒：赌神之眼 +20");
    } else alert("筹码不足！");
  };

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
      setWinner(0); setPhase("showdown");
      addLog("🚨", `抓千成功！缴获 ${share}`);
    } else {
      setPlayerChips(p => ({ ...p, 0: 0 })); setUserChips(0); setView("lobby");
      alert("误抓清白人！被安保丢出赌场！");
    }
  };

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
    setPlayerChips(initialPC); setView("game");
    startNewGame(initialPC, table, type);
  };

  const startNewGame = (chips = playerChips, table = currentTable, type = roomType) => {
    playSound("deal");
    const isHigh = type === "high"; const deck = createDeck(); const hands = {};
    const botIds = table.filter(p => !p.isUser).map(p => p.id);
    let gang = []; let rigged = false;
    if (isHigh && Math.random() < 0.4) { rigged = true; gang = [...botIds].sort(() => Math.random() - 0.5).slice(0, 2); }
    const newChips = { ...chips };
    botIds.forEach(id => { if ((newChips[id] || 0) <= 100) newChips[id] = isHigh ? 50000 : 10000; });
    setPlayerChips(newChips);
    table.forEach(p => { hands[p.id] = deck.splice(0, 2); });
    setAllHands(hands); setCommunityCards(deck.splice(0, 5)); setCheaters(gang); setIsExposed(false);
    const bb = isHigh ? 200 : 20;
    setPot(bb * 2); setCurrentBet(bb); setPhase("preflop"); setFolded({}); setWinner(null); setRaiseInput(""); setLog([]);
    addLog("🎰", `新局开始，大盲 ${bb}，请行动...`);

    // 修复的识破老千逻辑
    if (rigged && eyePoints >= 100) {
      setEyePoints(e => e - 100); setIsExposed(true);
      addLog("👁️", "【警告】检测到老千局！");
    }
  };

  const doShowdown = useCallback((finalPot, finalChips, finalFolded, allComm, table) => {
    const fd = finalFolded || {};
    const myScore = fd[0] ? -1 : evaluateHand(allHands[0], allComm);
    let maxOppScore = 0; let oppWinnerId = -1;
    (table || currentTable).forEach(pl => {
      if (pl.id === 0 || fd[pl.id]) return;
      const s = evaluateHand(allHands[pl.id], allComm);
      if (s > maxOppScore) { maxOppScore = s; oppWinnerId = pl.id; }
    });
    const isRigged = cheaters.length > 0;
    const userWin = myScore >= 0 && (!isRigged && myScore > maxOppScore);
    const newChips = { ...finalChips }; setPhase("showdown");

    if (userWin) {
      playSound("win");
      newChips[0] = (newChips[0] || 0) + finalPot; setPlayerChips(newChips);
      const updatedStats = { ...stats, totalWins: stats.totalWins + 1, highWins: roomType === "high" ? stats.highWins + 1 : stats.highWins };
      setStats(updatedStats);
      triggerAchievementCheck(updatedStats, unlockedAchievements, assets, newChips[0], true);
      setWinner(0); addLog("🎉", `牌技压制！狂揽 ${finalPot}`);
} else {
      playSound("deal");
      if (oppWinnerId >= 0) newChips[oppWinnerId] = (newChips[oppWinnerId] || 0) + finalPot;
      setPlayerChips(newChips);
      setWinner(oppWinnerId >= 0 ? oppWinnerId : ((table || currentTable).find(p => !p.isUser)?.id || -1));
      addLog(fd[0] ? "😞" : "☠️", fd[0] ? "你已弃牌，出局" : "败北，血本无归");
    }
  }, [allHands, cheaters, currentTable, roomType, stats, unlockedAchievements, assets, triggerAchievementCheck, addLog]);

  const advancePhase = useCallback((curPot, curChips, curPhase, curFolded, comm, table) => {
    const bb = roomType === "high" ? 200 : 20;
    const nextPhase = curPhase === "preflop" ? "flop" : curPhase === "flop" ? "turn" : curPhase === "turn" ? "river" : "showdown";
    let aiBets = 0; const newChips = { ...curChips };
    const activeBots = (table || currentTable).filter(p => !p.isUser && !curFolded[p.id]);

    activeBots.forEach(bot => {
      const score = evaluateHand(allHands[bot.id], comm);
      if (Math.random() < 0.2) {
        addLog(bot.avatar, `${bot.name} ${BOT_ACTIONS.fold[Math.floor(Math.random() * BOT_ACTIONS.fold.length)]}`);
        curFolded[bot.id] = true;
      } else {
        const strength = Math.min(score / 1500, 1);
        const betAmt = Math.min(bb * (1 + Math.floor(strength * 5 + Math.random() * 3)), newChips[bot.id] || 0);
        if (betAmt > 0) {
          playSound("chip"); newChips[bot.id] -= betAmt; aiBets += betAmt;
          addLog(bot.avatar, `${bot.name} ${BOT_ACTIONS.bet[Math.floor(Math.random() * BOT_ACTIONS.bet.length)]} ${betAmt}`);
        } else {
          addLog(bot.avatar, `${bot.name} ${BOT_ACTIONS.check[Math.floor(Math.random() * BOT_ACTIONS.check.length)]}`);
        }
      }
    });

    const finalPot = curPot + aiBets;
    const newBet = activeBots.length > 0 && aiBets > 0 ? Math.floor(aiBets / activeBots.length) : 0;
    if (nextPhase === "showdown") {
      setPot(finalPot); setPlayerChips(newChips); doShowdown(finalPot, newChips, curFolded, comm, table);
    } else {
      playSound("deal"); setPot(finalPot); setPlayerChips(newChips); setCurrentBet(newBet); setPhase(nextPhase);
      addLog("🃏", `--- ${PHASE_NAMES[nextPhase]} ---${newBet > 0 ? ` 需跟注: ${newBet}` : ""}`);
    }
  }, [roomType, currentTable, allHands, addLog, doShowdown]);

  const handleAction = (type) => {
    if (phase === "showdown" || winner !== null) return;
    const bb = roomType === "high" ? 200 : 20;
    let newPot = pot; let newChips = { ...playerChips }; const newFolded = { ...folded };
    playSound("chip");

    if (type === "fold") {
      newFolded[0] = true; setFolded(newFolded); addLog("😞", "弃牌保平安");
      doShowdown(newPot, newChips, newFolded, communityCards, currentTable); return;
    }
    if (type === "check") {
      if (currentBet > 0) return addLog("⚠️", "有下注，不能过牌");
      addLog("👋", "过牌"); advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
    if (type === "call") {
      const callAmt = Math.min(currentBet, newChips[0] || 0);
      newPot += callAmt; newChips[0] = (newChips[0] || 0) - callAmt;
      addLog("📞", `跟注 ${callAmt}`); advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
    if (type === "raise") {
      const amt = parseInt(raiseInput, 10);
      if (!amt || amt <= 0 || amt > (newChips[0]||0) || amt < bb) return addLog("⚠️", "金额无效或筹码不足");
      newPot += amt; newChips[0] = (newChips[0] || 0) - amt; setRaiseInput("");
      addLog("📈", `加注 ${amt}`); advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
    if (type === "allin") {
      const allAmt = newChips[0] || 0;
      if (allAmt <= 0) return addLog("⚠️", "已无筹码");
      newPot += allAmt; newChips[0] = 0;
      addLog("💥", `全压！${allAmt}`); advancePhase(newPot, newChips, phase, newFolded, communityCards, currentTable); return;
    }
  };

  if (view === "lobby") {
    const totalAchieves = ACHIEVEMENT_LIST.length;
    const unlockedCount = unlockedAchievements.length;
    return (
      <div className="animate-slide" style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "15px 10px", fontFamily: "sans-serif", paddingBottom: 50 }}>
        <style>{CSS_ANIMATIONS}</style>
        <h2 style={{ textAlign: "center", color: "#fbbf24", margin: "0 0 15px 0" }}>至尊千王 V7.2 完整版</h2>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#1e293b", padding: 12, borderRadius: 8, marginBottom: 15 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 12, color: "#94a3b8" }}>存款</div><div style={{ color: "#4ade80", fontSize: 16, fontWeight: "bold" }}>${(money / 1000).toFixed(0)}k</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 12, color: "#94a3b8" }}>筹码</div><div style={{ color: "#fbbf24", fontSize: 16, fontWeight: "bold" }}>{Math.floor(userChips)}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 12, color: "#94a3b8" }}>神眼</div><div style={{ color: eyePoints === 200 ? "#ef4444" : "#a855f7", fontSize: 16, fontWeight: "bold" }}>{eyePoints}/200</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <button onClick={() => enterGame("low")} style={{ padding: "14px", borderRadius: 8, background: "#047857", color: "#fff", border: "none", fontSize: 16, fontWeight: "bold" }}>🟢 初级场</button>
<button onClick={() => enterGame("high")} style={{ padding: "14px", borderRadius: 8, background: "#b91c1c", color: "#fff", border: "none", fontSize: 16, fontWeight: "bold" }}>🔥 高级场</button>
          <button onClick={() => { if (money >= 1000) { playSound("chip"); setMoney(m => m - 1000); setUserChips(c => c + 100); } else alert("存款不足！"); }} style={{ padding: "12px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none" }}>兑筹码($1k→100)</button>
          <button onClick={entertain} style={{ padding: "12px", borderRadius: 8, background: "#7e22ce", color: "#fff", border: "none" }}>🍷 消遣(神眼+20)</button>
        </div>
        
        {/* 恢复荣誉墙 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: 5, marginTop: 20, marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, margin: 0 }}>🏅 荣誉墙</h3>
          <span style={{ fontSize: 12, color: unlockedCount === totalAchieves ? "#fbbf24" : "#94a3b8" }}>{unlockedCount} / {totalAchieves}</span>
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
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{group.label}</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {group.ids.map(id => {
                const a = ACHIEVEMENT_LIST.find(x => x.id === id);
                if (!a) return null; const unlocked = unlockedAchievements.includes(a.id);
                return (
                  <div key={a.id} style={{ minWidth: 76, maxWidth: 76, background: "#1e293b", border: `1px solid ${unlocked ? "#fbbf24" : "#334155"}`, padding: "8px 4px", borderRadius: 8, textAlign: "center", opacity: unlocked ? 1 : 0.45, flexShrink: 0 }}>
                    <div style={{ fontSize: 22, marginBottom: 3 }}>{unlocked ? a.icon : "🔒"}</div>
                    <div style={{ fontSize: 10, fontWeight: "bold", color: unlocked ? "#fbbf24" : "#94a3b8", lineHeight: 1.2 }}>{a.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 恢复典当行 */}
        <h3 style={{ fontSize: 16, borderBottom: "1px solid #334155", paddingBottom: 5, marginTop: 10 }}>💎 典当行</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} style={{ background: "#1e293b", border: "1px solid #334155", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{item.name}</div>
                  {(assets[item.id] || 0) > 0 ? <div style={{ fontSize: 12, color: "#4ade80" }}>拥有: {assets[item.id]}</div> : <div style={{ fontSize: 12, color: "#94a3b8" }}>${(item.price / 1000).toLocaleString()}k</div>}
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

  const currentComm = phase === "preflop" ? [] : phase === "flop" ? communityCards.slice(0, 3) : phase === "turn" ? communityCards.slice(0, 4) : communityCards;
  const myChips = playerChips[0] || 0; const callAmt = Math.min(currentBet, myChips);

  return (
    <div className="animate-slide" style={{ height: "100vh", background: "#0a0f0a", color: "#e8d5b0", display: "flex", flexDirection: "column", fontFamily: "sans-serif", overflow: "hidden" }}>
      <style>{CSS_ANIMATIONS}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#111", borderBottom: "1px solid #333" }}>
        <button onClick={handleEscape} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #475569", padding: "6px 12px", borderRadius: 6, fontSize: 14 }}>← 离场</button>
        <div style={{ textAlign: "center" }}><div className="chip-transition" style={{ color: "#fbbf24", fontWeight: "bold", fontSize: 14 }}>底池: {pot}</div><div style={{ color: "#64748b", fontSize: 11 }}>{PHASE_NAMES[phase]}</div></div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={entertain} style={{ background: "#7e22ce", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>🍷</button>
          <button onClick={handleCatchCheater} style={{ background: eyePoints >= 200 && winner === null ? "#dc2626" : "#444", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>🚨 抓</button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {currentTable.filter(p => !p.isUser).map(p => {
            const isCheat = isExposed && cheaters.includes(p.id); const isFolded = folded[p.id];
            return (
              <div key={p.id} className="chip-transition" style={{ padding: 8, border: `1px solid ${winner == p.id ? "#fbbf24" : isCheat ? "#ef4444" : isFolded ? "#1f2937" : "#334155"}`, borderRadius: 8, background: isFolded ? "#0f172a" : "#1e293b", textAlign: "center", position: "relative", opacity: isFolded ? 0.4 : 1 }}>
                {isCheat && <div className="animate-pop" style={{ position: "absolute", top: -5, right: -5, background: "#ef4444", fontSize: 10, padding: "2px 4px", borderRadius: 4 }}>千</div>}
                <div style={{ fontSize: 20 }}>{p.avatar} <span style={{ fontSize: 12, color: "#cbd5e1" }}>{p.name}</span></div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, height: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.desc}</div>
                <div className="chip-transition" style={{ fontSize: 12, color: "#fbbf24", marginTop: 4 }}>🪙 {Math.floor(playerChips[p.id] || 0)}</div>
                {phase === "showdown" && allHands[p.id] && <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 6 }}>{allHands[p.id].map((c, i) => <Card key={i} card={c} small />)}</div>}
              </div>
            );
          })}
        </div>
        
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, minHeight: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, border: "1px dashed #334155" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
            {currentComm.length === 0 ? <span style={{ color: "#475569", fontSize: 13 }}>等待发牌...</span> : currentComm.map((c, i) => <Card key={i} card={c} />)}
          </div>
        </div>

        <div ref={logRef} style={{ height: 72, overflowY: "auto", background: "#000", padding: 8, fontSize: 12, borderRadius: 6, border: "1px solid #334155", color: "#94a3b8" }}>
          {log.map(l => <div key={l.id} className="animate-slide">{l.icon} {l.text}</div>)}
        </div>

        <div style={{ background: "#1e293b", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>你的手牌</div><div style={{ display: "flex", gap: 5 }}>{(allHands[0] || []).map((c, i) => <Card key={i} card={c} />)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#94a3b8" }}>持有筹码</div><div className="chip-transition" style={{ color: "#fbbf24", fontSize: 18, fontWeight: "bold" }}>🪙 {Math.floor(myChips)}</div></div>
        </div>
      </div>

      <div style={{ background: "#0f172a", borderTop: "1px solid #334155", padding: 10, paddingBottom: 15 }}>
        {winner !== null ? (
          <div className="animate-pop" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 8, color: winner === 0 ? "#fbbf24" : "#ef4444" }}>{winner === 0 ? "🎉 你赢了！" : winner === -1 ? "😞 已弃牌" : `☠️ ${currentTable.find(p => p.id === winner)?.name || "对手"} 获胜`}</div>
            <button onClick={() => startNewGame()} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "#047857", color: "#fff", border: "none", fontSize: 16, fontWeight: "bold" }}>🔄 继续下一局</button>
          </div>
        ) : (
          <div>
            {currentBet > 0 && <div style={{ fontSize: 12, color: "#fbbf24", textAlign: "center", marginBottom: 6 }}>当前需跟注: <strong>{callAmt}</strong></div>}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => handleAction("fold")} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#7f1d1d", color: "#fca5a5", border: "none", fontSize: 14, fontWeight: "bold" }}>✗ 弃牌</button>
              {currentBet === 0 ? <button onClick={() => handleAction("check")} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#1e3a5f", color: "#93c5fd", border: "none", fontSize: 14, fontWeight: "bold" }}>👋 过牌</button> : <button onClick={() => handleAction("call")} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "#1e3a5f", color: "#93c5fd", border: "none", fontSize: 14, fontWeight: "bold" }}>📞 跟注</button>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={raiseInput} onChange={e => setRaiseInput(e.target.value)} placeholder="金额..." style={{ flex: 1.5, padding: "10px", borderRadius: 8, background: "#1e293b", color: "#fff", border: "1px solid #475569", fontSize: 13 }} />
              <button onClick={() => handleAction("raise")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#b45309", color: "#fef3c7", border: "none", fontSize: 14, fontWeight: "bold" }}>📈 加注</button>
              <button onClick={() => handleAction("allin")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#4c1d95", color: "#ddd6fe", border: "none", fontSize: 14, fontWeight: "bold" }}>💥 全压</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}