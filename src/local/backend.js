import { LOCAL_SETTINGS } from "../config/local.js";
import { LESSONS, LESSON_COUNT } from "../features/lessons.js";
import {
  normalizeOptions,
  dailySeed,
  UTC_DAY,
  evaluateMode,
  classifyRun,
  selectBoard,
} from "../features/rules.js";

const copy = (value) => structuredClone(value);
const dayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const iso = () => new Date().toISOString();
const uid = () => globalThis.crypto.randomUUID();

/** Replacement for the unpublished service. Never contacts the original host. */
export class LocalBackend {
  constructor(catalogs, storage = globalThis.localStorage) {
    this.catalogs = catalogs;
    this.storage = storage;
    this.isOnline = false;
    this.friendsOnline = false;
    this.region = null;
    this.sessionVersion = 0;
    let saved;
    try {
      saved = JSON.parse(storage.getItem(LOCAL_SETTINGS.saveKey));
    } catch {}
    this.state = this.validSave(saved) ? saved : this.freshState();
    this.state.driving ||= { lesson: 0, trainingClaims: [], preferences: null };
    this.runOptions = normalizeOptions();
    this.rollDay();
    this.shopClient = {
      functions: {
        invoke: async (_name, { body }) => {
          try {
            if (body.action === "claim-visit")
              return { data: await this.claimStoreVisit(), error: null };
            if (["visit-status", "status", "catalog"].includes(body.action))
              return { data: this.storeState(), error: null };
            throw Error("payments_unavailable");
          } catch (error) {
            return { data: null, error };
          }
        },
      },
    };
    this.persist();
  }
  validSave(s) {
    return (
      s?.version === 1 &&
      typeof s.player?.id === "string" &&
      typeof s.player.nickname === "string" &&
      Number.isSafeInteger(s.coins) &&
      s.coins >= 0 &&
      Array.isArray(s.runs) &&
      Array.isArray(s.achievements) &&
      Array.isArray(s.owned) &&
      s.items &&
      typeof s.items === "object" &&
      s.loadout &&
      s.totals &&
      s.activeRuns &&
      s.daily
    );
  }
  freshState() {
    return {
      version: 1,
      player: {
        id: uid(),
        nickname: LOCAL_SETTINGS.defaultNickname,
        tag: "0001",
      },
      coins: LOCAL_SETTINGS.startingCoins,
      runs: [],
      coinHistory: [],
      achievements: [],
      items: Object.fromEntries(this.catalogs.items.map((i) => [i.id, 0])),
      owned: [...this.catalogs.defaultOwned],
      loadout: { ...this.catalogs.defaults },
      totals: { runs: 0, distance: 0, score: 0 },
      activeRuns: {},
      welcomeClaimed: false,
      daily: {
        day: "",
        attendance: {
          available: true,
          streak: 1,
          bonus: 50,
          bonusClaimed: false,
        },
        quests: [],
        visitClaimed: false,
      },
    };
  }
  persist() {
    this.storage.setItem(LOCAL_SETTINGS.saveKey, JSON.stringify(this.state));
  }
  rollDay() {
    if (this.state.daily.day === dayKey()) return;
    const last = this.state.daily;
    this.state.daily = {
      day: dayKey(),
      attendance: {
        available: true,
        streak: Math.min(7, (last.attendance?.streak || 0) + 1),
        bonus: LOCAL_SETTINGS.attendanceCoins,
        bonusClaimed: false,
      },
      quests: LOCAL_SETTINGS.dailyQuestIds
        .map((id) => this.catalogs.quests.find((q) => q.id === id))
        .filter(Boolean)
        .map((q) => ({ ...q, progress: 0, claimed: false, reward: 50 })),
      visitClaimed: false,
    };
  }
  getPlayer() {
    return { ...this.state.player };
  }
  async ready() {
    return this.getPlayer();
  }
  invalidateRankings() {}
  invalidateMenu() {}
  async retryPending() {}
  resetSession() {
    this.sessionVersion++;
  }
  async setNickname(value) {
    const name = String(value).trim();
    if (name.length < 2 || name.length > 12) throw Error("nick.err.length");
    if (!/^[\p{L}\p{N}_\-. ]+$/u.test(name)) throw Error("nick.err.chars");
    this.state.player.nickname = name;
    this.persist();
    return this.getPlayer();
  }
  cosmetics() {
    return {
      slots: ["paint", "boost", "neon", "plate"],
      owned: [...this.state.owned],
      loadout: { ...this.state.loadout },
    };
  }
  async getWallet() {
    return {
      coins: this.state.coins,
      account: true,
      bonusClaimed: true,
      bonus: 0,
      totals: { ...this.state.totals },
      achievements: copy(this.state.achievements),
      items: { ...this.state.items },
      shop: this.catalogs.items.map((i) => i.id),
      welcomeGift: { claimed: this.state.welcomeClaimed },
      cosmetics: this.cosmetics(),
    };
  }
  async getDaily() {
    this.rollDay();
    return { ...copy(this.state.daily), coins: this.state.coins, granted: 0 };
  }
  storeState() {
    this.rollDay();
    return {
      allowed: true,
      started: true,
      checkoutEnabled: false,
      mode: "local",
      remainingMs: 0,
      dailyVisit: {
        day: this.state.daily.day,
        claimed: this.state.daily.visitClaimed,
        reward: LOCAL_SETTINGS.visitCoins,
      },
      serverNow: iso(),
    };
  }
  async getMenuState() {
    return {
      wallet: await this.getWallet(),
      daily: await this.getDaily(),
      store: this.storeState(),
    };
  }
  async startRun() {
    const options = normalizeOptions(this.runOptions);
    const courseDay = options.mode === "daily" ? UTC_DAY() : null;
    const run = {
      runId: uid(),
      seed: courseDay
        ? dailySeed(courseDay)
        : globalThis.crypto.getRandomValues(new Uint32Array(1))[0],
      replayVersion: 4,
      revivesUsed: 0,
      startItems: [],
      createdAt: Date.now(),
      ...options,
      courseDay,
    };
    this.state.activeRuns[run.runId] = run;
    this.lastStartedRunId = run.runId;
    const ids = Object.keys(this.state.activeRuns);
    for (const id of ids.slice(0, Math.max(0, ids.length - 20))) delete this.state.activeRuns[id];
    this.persist();
    return copy(run);
  }
  async resumeRun(id) {
    const run = this.state.activeRuns[id];
    if (!run) throw Error("run_closed");
    return copy(run);
  }
  entries(scope = "all", metric = "score") {
    const cutoff = Date.now() - 7 * 86400000;
    return this.state.runs
      .filter((r) => r.mode !== "academy")
      .filter((r) => scope !== "weekly" || Date.parse(r.date) >= cutoff)
      .sort((a, b) => b[metric] - a[metric])
      .map((r, i) => ({
        ...r,
        rank: i + 1,
        name: this.state.player.nickname,
        tag: this.state.player.tag,
        me: true,
        loadout: r.loadout || this.state.loadout,
      }));
  }
  async getTop(scope = "all", limit = 100, _area = "global", metric = "score") {
    return copy(this.entries(scope, metric).slice(0, limit));
  }
  async getMyBest(metric = "score") {
    return copy(this.entries("all", metric)[0] || null);
  }
  async getMyPosition(scope = "all", _area = "global", metric = "score") {
    return copy(this.entries(scope, metric)[0] || null);
  }
  async position(scope = "all", area = "global", metric = "score") {
    return this.getMyPosition(scope, area, metric);
  }
  credit(amount, reason, extra = {}) {
    if (!Number.isSafeInteger(amount) || this.state.coins + amount < 0)
      throw Error("insufficient_coins");
    this.state.coins += amount;
    this.state.coinHistory.unshift({
      id: uid(),
      date: iso(),
      amount,
      reason,
      ...extra,
    });
    this.state.coinHistory = this.state.coinHistory.slice(0, 500);
  }
  async submit(result) {
    const duplicate = this.state.runs.find((r) => r.runId === result.runId);
    if (duplicate) return copy(duplicate.settlement);
    if (!this.state.activeRuns[result.runId]) throw Error("run_closed");
    const active = this.state.activeRuns[result.runId];
    for (const key of ["score", "distance", "duration"])
      if (!Number.isFinite(result[key]) || result[key] < 0) throw Error("invalid_run");
    this.rollDay();
    const prevBest = (await this.getMyBest())?.score || 0;
    const doubled = this.state.activeRuns[result.runId].startItems.includes("coin_double");
    const earned =
      active.mode === "academy" &&
      active.lesson >= 3 &&
      LESSONS[active.lesson]?.id !== "coin_double"
        ? 0
        : Math.floor(result.distance / LOCAL_SETTINGS.metresPerCoin) * (doubled ? 2 : 1);
    this.credit(earned, "run");
    const metrics = {
      ...(active.drivingMetrics || {}),
      distance: result.distance,
      duration: result.duration,
      maxCombo: result.maxCombo,
    };
    const evaluation = evaluateMode(active.mode, metrics, active.lesson);
    let trainingReward = 0;
    if (
      active.mode === "academy" &&
      evaluation.success &&
      !this.state.driving.trainingClaims.includes(active.lesson)
    ) {
      trainingReward = LESSONS[active.lesson].reward;
      this.state.driving.trainingClaims.push(active.lesson);
      while (
        this.state.driving.trainingClaims.includes(this.state.driving.lesson) &&
        this.state.driving.lesson < LESSON_COUNT
      )
        this.state.driving.lesson++;
      this.credit(trainingReward, "achievement");
    }
    this.state.totals.runs++;
    this.state.totals.distance += result.distance;
    this.state.totals.score += result.score;
    const unlocked = [];
    const ids = new Set(result.achievements || []);
    // The original client evaluates the run achievements. Cumulative thresholds use its catalog.
    for (const a of this.catalogs.achievements) {
      if (a.retired) continue;
      const cumulative = a.total && this.state.totals[a.total.metric] >= a.total.target;
      if ((ids.has(a.id) || cumulative) && !this.state.achievements.some((s) => s.id === a.id)) {
        this.state.achievements.push({
          id: a.id,
          unlockedAt: iso(),
          claimedAt: null,
        });
        unlocked.push(a.id);
      }
    }
    const values = {
      ...result.stats,
      ...result,
      combo: result.maxCombo,
      time: result.duration,
      runs: 1,
    };
    for (const quest of this.state.daily.quests) {
      const value = Number(values[quest.metric] || 0);
      quest.progress =
        quest.mode === "day" ? quest.progress + value : Math.max(quest.progress, value);
    }
    const row = {
      runId: result.runId,
      score: Math.round(result.score),
      distance: Math.round(result.distance),
      duration: result.duration,
      maxCombo: result.maxCombo,
      date: iso(),
      loadout: { ...this.state.loadout },
      mode: active.mode,
      ruleset: active.ruleset,
      courseDay: active.courseDay,
      seed: active.seed,
      lesson: active.lesson,
      startItems: [...active.startItems],
      revives: Math.max(active.revivesUsed, Number(result.revives) || 0),
      drivingMetrics: metrics,
      challengeSuccess: evaluation.success,
    };
    row.category = classifyRun(row);
    const settlement = {
      rank: 1,
      total: this.state.runs.length + 1,
      percentile: 100,
      isBest: result.score > prevBest,
      prevBest,
      best: Math.max(prevBest, result.score),
      above: null,
      gap: 0,
      rewards: {
        coins: this.state.coins,
        earned: earned + trainingReward,
        run: earned,
        base: earned,
        unlocked,
        achievements: unlocked,
      },
      daily: await this.getDaily(),
      driving: { mode: active.mode, success: evaluation.success, trainingReward, metrics },
    };
    row.settlement = copy(settlement);
    this.state.runs.unshift(row);
    this.state.runs = this.state.runs.slice(0, LOCAL_SETTINGS.maxSavedRuns);
    delete this.state.activeRuns[result.runId];
    this.persist();
    return settlement;
  }
  setRunOptions(options) {
    this.runOptions = normalizeOptions(options);
    return copy(this.runOptions);
  }
  recordDrivingMetrics(id, metrics) {
    const run = this.state.activeRuns[id];
    if (run) run.drivingMetrics = copy(metrics);
  }
  drivingBoard(options) {
    return copy(selectBoard(this.state.runs, options));
  }
  drivingProfile() {
    return copy(this.state.driving);
  }
  saveDrivingPreferences(preferences) {
    this.state.driving.preferences = copy(preferences);
    this.persist();
  }
  async getHistory(kind, cursor = null) {
    const offset = Number(cursor) || 0;
    const rows = kind === "coins" ? this.state.coinHistory : this.state.runs;
    return {
      entries: copy(rows.slice(offset, offset + 25)),
      nextCursor: offset + 25 < rows.length ? String(offset + 25) : null,
    };
  }
  async buyItem(id) {
    const item = this.catalogs.items.find((i) => i.id === id);
    if (!item) throw Error("item_unavailable");
    if (this.state.items[id] >= item.max) throw Error("item_max");
    this.credit(-item.price, "item", { item: id });
    this.state.items[id]++;
    this.persist();
    return { coins: this.state.coins, items: { ...this.state.items } };
  }
  async useStartItem(id, item) {
    const run = this.state.activeRuns[id];
    if (!run) throw Error("run_closed");
    if (["academy", "precision", "stunt", "escape", "daily"].includes(run.mode))
      throw Error("item_unavailable");
    if (!this.catalogs.items.some((i) => i.id === item && i.start)) throw Error("item_unavailable");
    if (!run.startItems.includes(item)) {
      if (!this.state.items[item]) throw Error("item_empty");
      this.state.items[item]--;
      run.startItems.push(item);
      this.persist();
    }
    return { used: [...run.startItems], items: { ...this.state.items } };
  }
  async useRevive(id, index) {
    const run = this.state.activeRuns[id];
    if (!run) throw Error("run_closed");
    if (["academy", "precision", "stunt", "escape", "daily"].includes(run.mode))
      throw Error("revive_unavailable");
    if (run.revivesUsed >= index) return { used: run.revivesUsed, items: { ...this.state.items } };
    if (index !== 1 || !this.state.items.revive) throw Error("revive_unavailable");
    this.state.items.revive--;
    run.revivesUsed = 1;
    this.persist();
    return { used: 1, items: { ...this.state.items } };
  }
  async claimWelcomeGift() {
    const granted = +!this.state.welcomeClaimed;
    if (granted) {
      for (const i of this.catalogs.items) this.state.items[i.id]++;
      this.state.welcomeClaimed = true;
      this.persist();
    }
    return {
      granted,
      coins: this.state.coins,
      items: { ...this.state.items },
      welcomeGift: { claimed: true },
    };
  }
  async claimAchievements(ids) {
    const claimed = [];
    let reward = 0;
    for (const id of new Set(ids)) {
      const record = this.state.achievements.find((a) => a.id === id),
        rule = this.catalogs.achievements.find((a) => a.id === id);
      if (record && !record.claimedAt && rule) {
        record.claimedAt = iso();
        reward += rule.reward;
        claimed.push(id);
      }
    }
    if (reward) this.credit(reward, "achievement");
    this.persist();
    return { coins: this.state.coins, claimed, reward };
  }
  async claimDaily(kind, id) {
    this.rollDay();
    let reward = 0;
    if (kind === "attendance" || kind === "bonus" || kind === "streak") {
      if (!this.state.daily.attendance.bonusClaimed) {
        this.state.daily.attendance.bonusClaimed = true;
        reward = this.state.daily.attendance.bonus;
      }
    } else {
      const q = this.state.daily.quests.find((q) => q.id === id);
      if (!q || q.progress < q.target) throw Error("quest_not_ready");
      if (!q.claimed) {
        q.claimed = true;
        reward = q.reward;
      }
    }
    if (reward) this.credit(reward, "quest");
    this.persist();
    return { ...(await this.getDaily()), granted: reward, reward };
  }
  async buyCosmetic(id) {
    const item = this.catalogs.cosmetics.find((i) => i.id === id);
    if (!item) throw Error("cosmetic_unavailable");
    if (!this.state.owned.includes(id)) {
      this.credit(-item.price, "cosmetic", { cosmetic: id });
      this.state.owned.push(id);
    }
    this.state.loadout[item.slot] = id;
    this.persist();
    return { coins: this.state.coins, cosmetics: this.cosmetics() };
  }
  async equipCosmetic(id) {
    const item = this.catalogs.cosmetics.find((i) => i.id === id);
    if (!item || !this.state.owned.includes(id)) throw Error("cosmetic_not_owned");
    this.state.loadout[item.slot] = id;
    this.persist();
    return { coins: this.state.coins, cosmetics: this.cosmetics() };
  }
  async setPlate(text) {
    text = String(text).toUpperCase();
    if (!/^[A-Z0-9]{1,7}$/.test(text)) throw Error("plate_invalid");
    this.credit(-500, "plate");
    this.state.loadout.plate = text;
    this.persist();
    return { coins: this.state.coins, cosmetics: this.cosmetics() };
  }
  async claimStoreVisit() {
    this.rollDay();
    const granted = this.state.daily.visitClaimed ? 0 : LOCAL_SETTINGS.visitCoins;
    if (granted) {
      this.credit(granted, "store_visit");
      this.state.daily.visitClaimed = true;
      this.persist();
    }
    return { ...this.storeState(), coins: this.state.coins, granted };
  }
  async getFriends() {
    return { friends: [], incoming: [], outgoing: [], code: null };
  }
  async accountCheckpoint() {
    return { checkpoint: null };
  }
  grantDeveloperCoins(amount = 10000) {
    this.credit(amount, "developer");
    this.persist();
    return this.state.coins;
  }
  exportSave() {
    return copy(this.state);
  }
  importSave(save) {
    if (!this.validSave(save)) throw Error("invalid_save");
    this.state = copy(save);
    this.rollDay();
    this.persist();
  }
}

/** A local profile unlocks local inventory; it is not a Google identity. */
export class LocalAccount {
  constructor({ leaderboard, onUpdate = () => {}, onChange = () => {} }) {
    this.lb = leaderboard;
    this.onUpdate = onUpdate;
    this.onChange = onChange;
    this.enabled = false;
    this.busy = false;
    this.checked = true;
    this.error = "";
    this.signedIn = true;
    this.userId = leaderboard.getPlayer().id;
    this.needsMerge = false;
    this.oneTap = { start() {}, cancel() {} };
  }
  emit() {
    this.onUpdate(this);
  }
  async start() {
    await this.lb.ready();
    this.emit();
  }
  async sync() {
    this.emit();
  }
  cancelPrompt() {}
  takeSettlement() {
    return null;
  }
  async login() {
    this.emit();
  }
  async logout() {
    this.emit();
  }
  async retryMerge() {
    this.emit();
  }
}
