const MAX_PITY = 98;
const MAX_PULLS = 600;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  bannerType: $("#bannerType"),
  currentPity: $("#currentPity"),
  plannedPulls: $("#plannedPulls"),
  expectedNextSix: $("#expectedNextSix"),
  chanceNextSix: $("#chanceNextSix"),
  guaranteedNextSix: $("#guaranteedNextSix"),
  p90NextSix: $("#p90NextSix"),
  nextSixChart: $("#nextSixChart"),
  nextSixTable: $("#nextSixTable"),
  bannerRuleNote: $("#bannerRuleNote"),
  targetPreset: $("#targetPreset"),
  targetShare: $("#targetShare"),
  bannerPullsDone: $("#bannerPullsDone"),
  useHardCap: $("#useHardCap"),
  hardCapPulls: $("#hardCapPulls"),
  useDirectional: $("#useDirectional"),
  directionalPulls: $("#directionalPulls"),
  noTargetPulls: $("#noTargetPulls"),
  expectedTarget: $("#expectedTarget"),
  chanceTarget: $("#chanceTarget"),
  p50Target: $("#p50Target"),
  p90Target: $("#p90Target"),
  targetCdfChart: $("#targetCdfChart"),
  targetTable: $("#targetTable"),
  expectedSixCount: $("#expectedSixCount"),
  chanceAtLeastTwo: $("#chanceAtLeastTwo"),
  chanceZeroSix: $("#chanceZeroSix"),
  countChart: $("#countChart"),
  multiSubtitle: $("#multiSubtitle"),
  noticeModal: $("#noticeModal"),
  openNotice: $("#openNotice"),
  closeNotice: $("#closeNotice"),
  acceptNotice: $("#acceptNotice"),
  dontShowNotice: $("#dontShowNotice"),
};

const targetPresets = {
  any: { share: 100, hardCap: false, cap: 300, directional: false, directionalAt: 150 },
  eventSingle: { share: 50, hardCap: false, cap: 300, directional: true, directionalAt: 150 },
  standardEither: { share: 50, hardCap: false, cap: 300, directional: true, directionalAt: 150 },
  standardOne: { share: 25, hardCap: false, cap: 300, directional: false, directionalAt: 300 },
  jointOne: { share: 25, hardCap: false, cap: 300, directional: false, directionalAt: 150 },
  directSelectOne: { share: 33.3333, hardCap: false, cap: 300, directional: false, directionalAt: 150 },
  limitedOne: { share: 35, hardCap: true, cap: 300, directional: false, directionalAt: 150 },
  limitedEither: { share: 70, hardCap: true, cap: 300, directional: false, directionalAt: 150 },
  collabSix: { share: 50, hardCap: true, cap: 120, directional: false, directionalAt: 150 },
  custom: null,
};

const bannerNotes = {
  standard:
    "标准寻访使用标准 6★概率累计。限时单 UP 对应“定向选调”；常驻双 UP 对应“标准选调”，只关心任一 UP 时可用 50% 目标占比 + 150 抽目标保底。",
  kernel:
    "中坚寻访使用独立的中坚 6★概率累计，并适用中坚信物与通用凭证规则。常驻中坚双 UP 对应“中坚选调”。",
  limited:
    "限定寻访的 6★累计次数不跨不同限定寻访继承。当期双 UP 合计通常占 6★出率 70%，可把 300 次额外领取作为硬上限。",
  collab:
    "联动类寻访以当期公告命名。若公告写明前 120 次寻访必得联动 6★，可使用 120 抽硬保底；6★累计次数不应用到其他寻访。",
  special:
    "跨年欢庆、新年特别十连、归航和新人特惠都有额外规则。本页只能用自定义占比、目标保底和硬上限做局部计算，请按当期公告调整。",
};

function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function formatPercent(value, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 0.99995) return "100%";
  if (value <= 0.00005) return "0%";
  return `${(value * 100).toFixed(digits)}%`;
}

function formatPulls(value, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value - Math.round(value)) < 0.00001) return `${Math.round(value)}`;
  return value.toFixed(digits);
}

function sixRateForPity(pity) {
  if (pity < 50) return 0.02;
  return Math.min(1, 0.02 + (pity - 49) * 0.02);
}

function nextSixDistribution(startPity, maxPulls = 99) {
  const dist = [];
  let survival = 1;

  for (let pull = 1; pull <= maxPulls; pull += 1) {
    const rate = sixRateForPity(startPity + pull - 1);
    const probability = survival * rate;
    dist.push({ pull, probability, cumulative: 1 - survival * (1 - rate), rate });
    survival *= 1 - rate;
    if (rate >= 1) break;
  }

  return dist;
}

function quantileFromDistribution(dist, threshold) {
  const hit = dist.find((entry) => entry.cumulative >= threshold);
  return hit ? hit.pull : null;
}

function expectedFromDistribution(dist) {
  return dist.reduce((sum, entry) => sum + entry.pull * entry.probability, 0);
}

function sixCountDistribution(startPity, pulls) {
  let states = new Map([[startPity, { prob: 1, counts: [1] }]]);
  const maxCount = pulls;

  for (let step = 0; step < pulls; step += 1) {
    const next = new Map();

    for (const [pityKey, state] of states.entries()) {
      const pity = Number(pityKey);
      const rate = sixRateForPity(pity);

      if (!next.has(0)) next.set(0, { prob: 0, counts: Array(maxCount + 1).fill(0) });
      const hitState = next.get(0);

      const missPity = Math.min(MAX_PITY, pity + 1);
      if (!next.has(missPity)) next.set(missPity, { prob: 0, counts: Array(maxCount + 1).fill(0) });
      const missState = next.get(missPity);

      state.counts.forEach((countProb, count) => {
        if (!countProb) return;
        hitState.counts[count + 1] += countProb * rate;
        missState.counts[count] += countProb * (1 - rate);
      });
    }

    states = next;
  }

  const counts = Array(maxCount + 1).fill(0);
  for (const state of states.values()) {
    state.counts.forEach((prob, count) => {
      counts[count] += prob;
    });
  }
  return counts;
}

function targetDistribution(options) {
  const {
    startPity,
    pulls,
    targetShare,
    useHardCap,
    capRemaining,
    useDirectional,
    directionalPulls,
    noTargetPulls,
  } = options;
  const share = clampNumber(targetShare, 0, 1);
  const cap = useHardCap ? clampNumber(capRemaining, 1, MAX_PULLS) : Infinity;
  const directionalRemaining = useDirectional ? Math.max(0, directionalPulls - noTargetPulls) : Infinity;
  const dist = [];
  let states = new Map([[`${startPity}|${directionalRemaining}`, 1]]);
  let survival = 1;

  for (let pull = 1; pull <= pulls && survival > 1e-14; pull += 1) {
    if (pull >= cap) {
      dist.push({ pull, probability: survival, cumulative: 1 });
      survival = 0;
      break;
    }

    const next = new Map();
    let targetProbThisPull = 0;

    for (const [key, prob] of states.entries()) {
      const [pityText, directionText] = key.split("|");
      const pity = Number(pityText);
      const remainingUntilDirectional = Number(directionText);
      const sixRate = sixRateForPity(pity);
      const forceTargetOnSix = useDirectional && remainingUntilDirectional <= 0;
      const effectiveShare = forceTargetOnSix ? 1 : share;
      const targetHit = sixRate * effectiveShare;
      const nonTargetSix = sixRate * (1 - effectiveShare);
      const noSix = 1 - sixRate;

      targetProbThisPull += prob * targetHit;

      if (nonTargetSix > 0) {
        const nextRemaining = useDirectional ? Math.max(0, remainingUntilDirectional - 1) : Infinity;
        addState(next, 0, nextRemaining, prob * nonTargetSix);
      }

      if (noSix > 0) {
        const nextPity = Math.min(MAX_PITY, pity + 1);
        const nextRemaining = useDirectional ? Math.max(0, remainingUntilDirectional - 1) : Infinity;
        addState(next, nextPity, nextRemaining, prob * noSix);
      }
    }

    survival -= targetProbThisPull;
    dist.push({ pull, probability: targetProbThisPull, cumulative: 1 - survival });
    states = next;
  }

  return dist;
}

function addState(map, pity, remaining, probability) {
  const key = `${pity}|${remaining}`;
  map.set(key, (map.get(key) || 0) + probability);
}

function expectedWithTail(dist) {
  return dist.reduce((sum, entry) => sum + entry.pull * entry.probability, 0);
}

function readInputs() {
  const startPity = clampNumber(els.currentPity.value, 0, MAX_PITY);
  const pulls = clampNumber(els.plannedPulls.value, 1, MAX_PULLS);
  const targetShare = clampNumber(els.targetShare.value, 0, 100) / 100;
  const done = clampNumber(els.bannerPullsDone.value, 0, MAX_PULLS);
  const hardCap = clampNumber(els.hardCapPulls.value, 1, MAX_PULLS);
  const capRemaining = Math.max(1, hardCap - done);
  const directionalPulls = clampNumber(els.directionalPulls.value, 1, MAX_PULLS);
  const noTargetPulls = clampNumber(els.noTargetPulls.value, 0, MAX_PULLS);

  if (Number(els.currentPity.value) !== startPity) els.currentPity.value = startPity;
  if (Number(els.plannedPulls.value) !== pulls) els.plannedPulls.value = pulls;
  if (Number(els.targetShare.value) / 100 !== targetShare) els.targetShare.value = targetShare * 100;
  if (Number(els.bannerPullsDone.value) !== done) els.bannerPullsDone.value = done;
  if (Number(els.hardCapPulls.value) !== hardCap) els.hardCapPulls.value = hardCap;
  if (Number(els.directionalPulls.value) !== directionalPulls) els.directionalPulls.value = directionalPulls;
  if (Number(els.noTargetPulls.value) !== noTargetPulls) els.noTargetPulls.value = noTargetPulls;

  return {
    startPity,
    pulls,
    targetShare,
    done,
    hardCap,
    capRemaining,
    directionalPulls,
    noTargetPulls,
  };
}

function render() {
  const input = readInputs();
  renderBannerNote();
  renderNextSix(input);
  renderTarget(input);
  renderMulti(input);
}

function renderBannerNote() {
  if (!els.bannerRuleNote) return;
  els.bannerRuleNote.textContent = bannerNotes[els.bannerType.value] || "";
}

function renderNextSix({ startPity, pulls }) {
  const dist = nextSixDistribution(startPity, 120);
  const expected = expectedFromDistribution(dist);
  const chance = cumulativeAt(dist, pulls);
  const guaranteed = dist[dist.length - 1]?.pull || "--";
  const p90 = quantileFromDistribution(dist, 0.9);

  els.expectedNextSix.textContent = formatPulls(expected);
  els.chanceNextSix.textContent = formatPercent(chance);
  els.guaranteedNextSix.textContent = `${guaranteed}`;
  els.p90NextSix.textContent = `${p90 || "--"}`;

  renderBarChart(els.nextSixChart, compressDistribution(dist, 30));
  renderRows(els.nextSixTable, [
    ["10 抽内", formatPercent(cumulativeAt(dist, 10))],
    ["30 抽内", formatPercent(cumulativeAt(dist, 30))],
    ["50 抽内", formatPercent(cumulativeAt(dist, 50))],
    ["70 抽内", formatPercent(cumulativeAt(dist, 70))],
    [`${pulls} 抽内`, formatPercent(chance)],
    ["期望抽数", `${formatPulls(expected)} 抽`],
  ]);
}

function cumulativeAt(dist, pullCount) {
  if (pullCount <= 0) return 0;
  const entry = dist.findLast((item) => item.pull <= pullCount);
  return entry ? entry.cumulative : 0;
}

function compressDistribution(dist, bars) {
  if (dist.length <= bars) return dist.map((entry) => ({ label: entry.pull, value: entry.probability }));
  const bucketSize = Math.ceil(dist.length / bars);
  const result = [];

  for (let i = 0; i < dist.length; i += bucketSize) {
    const bucket = dist.slice(i, i + bucketSize);
    const label = bucket.length === 1 ? `${bucket[0].pull}` : `${bucket[0].pull}-${bucket[bucket.length - 1].pull}`;
    const value = bucket.reduce((sum, entry) => sum + entry.probability, 0);
    result.push({ label, value });
  }

  return result;
}

function renderBarChart(container, values) {
  const max = Math.max(...values.map((item) => item.value), 0.001);
  container.innerHTML = values
    .map((item) => {
      const height = Math.max(2, (item.value / max) * 100);
      return `<div class="bar" style="height:${height}%" data-label="${item.label}" title="第 ${item.label} 抽：${formatPercent(item.value)}"></div>`;
    })
    .join("");
}

function renderTarget({ startPity, pulls, targetShare, capRemaining, directionalPulls, noTargetPulls }) {
  const targetOptions = {
    startPity,
    targetShare,
    useHardCap: els.useHardCap.checked,
    capRemaining,
    useDirectional: els.useDirectional.checked,
    directionalPulls,
    noTargetPulls,
  };
  const dist = targetDistribution({
    ...targetOptions,
    pulls,
  });
  const expectation = targetExpectation(targetOptions);

  const chance = cumulativeAt(dist, pulls);
  const p50 = quantileFromDistribution(dist, 0.5);
  const p90 = quantileFromDistribution(dist, 0.9);

  els.expectedTarget.textContent = Number.isFinite(expectation) ? formatPulls(expectation) : "无法获得";
  els.chanceTarget.textContent = formatPercent(chance);
  els.p50Target.textContent = p50 ? `${p50}` : "--";
  els.p90Target.textContent = p90 ? `${p90}` : "--";

  const chartPoints = buildTargetChartPoints(dist, pulls);
  renderCdfChart(els.targetCdfChart, chartPoints);

  renderRows(els.targetTable, [
    ["30 抽内", formatPercent(cumulativeAt(dist, 30))],
    ["60 抽内", formatPercent(cumulativeAt(dist, 60))],
    ["100 抽内", formatPercent(cumulativeAt(dist, 100))],
    ["150 抽内", formatPercent(cumulativeAt(dist, 150))],
    ["300 抽内", formatPercent(cumulativeAt(dist, 300))],
    [`${pulls} 抽内`, formatPercent(chance)],
  ]);
}

function targetExpectation(options) {
  const {
    startPity,
    targetShare,
    useHardCap,
    capRemaining,
    useDirectional,
    directionalPulls,
    noTargetPulls,
  } = options;

  if (targetShare <= 0 && !useHardCap && !useDirectional) return Infinity;

  if (useHardCap || useDirectional) {
    const remainingUntilTargetGuarantee = Math.max(0, directionalPulls - noTargetPulls);
    const guaranteeHorizon = remainingUntilTargetGuarantee + 120;
    const horizon = useHardCap ? capRemaining : Math.max(MAX_PULLS, guaranteeHorizon);
    return expectedWithTail(
      targetDistribution({
        ...options,
        pulls: horizon,
      }),
    );
  }

  const firstSix = expectedFromDistribution(nextSixDistribution(startPity, 120));
  const freshSix = expectedFromDistribution(nextSixDistribution(0, 120));
  return firstSix + ((1 - targetShare) / targetShare) * freshSix;
}

function buildTargetChartPoints(dist, pulls) {
  const checkpoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 240, 300, pulls]
    .filter((value, index, arr) => value <= pulls && arr.indexOf(value) === index)
    .sort((a, b) => a - b);
  return checkpoints.map((pull) => ({ label: `${pull}`, value: cumulativeAt(dist, pull) }));
}

function renderCdfChart(container, values) {
  container.innerHTML = values
    .map(
      (item) => `
        <div class="cdf-row">
          <span>${item.label} 抽</span>
          <div class="track"><div class="fill" style="width:${Math.max(0.8, item.value * 100)}%"></div></div>
          <strong>${formatPercent(item.value, 1)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderMulti({ startPity, pulls }) {
  const counts = sixCountDistribution(startPity, pulls);
  const expected = counts.reduce((sum, prob, count) => sum + prob * count, 0);
  const zero = counts[0] || 0;
  const one = counts[1] || 0;
  const atLeastTwo = 1 - zero - one;

  els.expectedSixCount.textContent = formatPulls(expected);
  els.chanceAtLeastTwo.textContent = formatPercent(atLeastTwo);
  els.chanceZeroSix.textContent = formatPercent(zero);
  els.multiSubtitle.textContent = `${pulls} 抽，从 ${startPity} 垫开始`;

  const rows = [];
  for (let count = 0; count <= Math.min(7, pulls); count += 1) {
    rows.push({ label: `${count} 位`, value: counts[count] || 0 });
  }
  const more = counts.slice(8).reduce((sum, prob) => sum + prob, 0);
  if (more > 0.0001) rows.push({ label: "8 位以上", value: more });

  renderCountChart(els.countChart, rows);
}

function renderCountChart(container, rows) {
  const max = Math.max(...rows.map((row) => row.value), 0.001);
  container.innerHTML = rows
    .map(
      (row) => `
        <div class="count-row">
          <span>${row.label}</span>
          <div class="track"><div class="fill" style="width:${Math.max(0.8, (row.value / max) * 100)}%"></div></div>
          <strong>${formatPercent(row.value, 2)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderRows(container, rows) {
  container.innerHTML = rows
    .map(
      ([label, value]) => `
        <div class="table-row">
          <span>${label}</span>
          <span>${value}</span>
        </div>
      `,
    )
    .join("");
}

function applyPreset(name) {
  if (name === "next") {
    els.currentPity.value = 0;
    els.plannedPulls.value = 99;
    activateTab("next-six");
  }

  if (name === "hundred") {
    els.currentPity.value = 0;
    els.plannedPulls.value = 100;
    activateTab("next-six");
  }

  if (name === "limited") {
    els.bannerType.value = "limited";
    els.targetPreset.value = "limitedOne";
    applyTargetPreset();
    els.currentPity.value = 0;
    els.plannedPulls.value = 300;
    els.bannerPullsDone.value = 0;
    activateTab("target");
  }

  if (name === "collab") {
    els.bannerType.value = "collab";
    els.targetPreset.value = "collabSix";
    applyTargetPreset();
    els.currentPity.value = 0;
    els.plannedPulls.value = 120;
    els.bannerPullsDone.value = 0;
    activateTab("target");
  }

  render();
}

function applyTargetPreset() {
  const preset = targetPresets[els.targetPreset.value];
  const isCustom = els.targetPreset.value === "custom";
  els.targetShare.disabled = !isCustom;

  if (!preset) return;
  els.targetShare.value = preset.share;
  els.useHardCap.checked = preset.hardCap;
  els.hardCapPulls.value = preset.cap;
  els.useDirectional.checked = preset.directional;
  els.directionalPulls.value = preset.directionalAt;
}

function activateTab(tabId) {
  $$(".nav-tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
}

function showNotice() {
  els.noticeModal.classList.add("show");
}

function hideNotice() {
  els.noticeModal.classList.remove("show");
}

function bindEvents() {
  $$(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  $$(".quick-questions button").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  [
    els.bannerType,
    els.currentPity,
    els.plannedPulls,
    els.targetShare,
    els.bannerPullsDone,
    els.useHardCap,
    els.hardCapPulls,
    els.useDirectional,
    els.directionalPulls,
    els.noTargetPulls,
  ].forEach((element) => element.addEventListener("input", render));

  els.targetPreset.addEventListener("change", () => {
    applyTargetPreset();
    render();
  });

  els.openNotice.addEventListener("click", showNotice);
  els.closeNotice.addEventListener("click", hideNotice);
  els.acceptNotice.addEventListener("click", () => {
    if (els.dontShowNotice.checked) {
      localStorage.setItem("arknights-probability-notice-read", "1");
    }
    hideNotice();
  });
  els.noticeModal.addEventListener("click", (event) => {
    if (event.target === els.noticeModal) hideNotice();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideNotice();
  });
}

function boot() {
  bindEvents();
  applyTargetPreset();
  render();

  if (localStorage.getItem("arknights-probability-notice-read") !== "1") {
    showNotice();
  }
}

boot();
