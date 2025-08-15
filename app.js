// View switching
const sections = {
  home: document.getElementById("view-home"),
  blackjack: document.getElementById("view-blackjack"),
  roulette: document.getElementById("view-roulette"),
  slots: document.getElementById("view-slots"),
};
function show(view){
  Object.values(sections).forEach(s => s.classList.add("hidden"));
  sections[view].classList.remove("hidden");
}
document.querySelectorAll("[data-view]").forEach(btn=>{
  btn.addEventListener("click",()=>show(btn.getAttribute("data-view")));
});

// ========== Blackjack ==========
const bjPlayerCardsEl = document.getElementById("bj-player-cards");
const bjDealerCardsEl = document.getElementById("bj-dealer-cards");
const bjMsgEl = document.getElementById("bj-msg");
const bjPlayerTotalEl = document.getElementById("bj-player-total");
const bjDealerTotalEl = document.getElementById("bj-dealer-total");
const bjHit = document.getElementById("bj-hit");
const bjStand = document.getElementById("bj-stand");
const bjNew = document.getElementById("bj-new");

const BJ_RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const BJ_SUITS = ["♠","♥","♦","♣"];
let bjDeck = [];
let bjPlayer = [];
let bjDealer = [];
let bjActive = false;

function bjMakeDeck(){
  const d=[];
  for(const s of BJ_SUITS){
    for(const r of BJ_RANKS){
      const v = r==="A" ? 11 : (["J","Q","K"].includes(r)?10:Number(r));
      d.push({rank:r,suit:s,val:v});
    }
  }
  for(let i=d.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [d[i],d[j]]=[d[j],d[i]];
  }
  return d;
}
function bjTotal(cards){
  let t=cards.reduce((s,c)=>s+c.val,0);
  let aces=cards.filter(c=>c.rank==="A").length;
  while(t>21 && aces>0){ t-=10; aces--; }
  return t;
}
function bjRender(){
  bjPlayerCardsEl.innerHTML = bjPlayer.map(c=>`<div class="card">${c.rank}${c.suit}</div>`).join("");
  bjDealerCardsEl.innerHTML = bjDealer.map((c,i)=> bjActive && i===1 ? `<div class="card">🂠</div>` : `<div class="card">${c.rank}${c.suit}</div>`).join("");
  bjPlayerTotalEl.textContent = `(${bjTotal(bjPlayer)})`;
  bjDealerTotalEl.textContent = bjActive ? "" : `(${bjTotal(bjDealer)})`;
}
function bjStart(){
  bjDeck = bjMakeDeck();
  bjPlayer = [bjDeck.pop(), bjDeck.pop()];
  bjDealer = [bjDeck.pop(), bjDeck.pop()];
  bjActive = true;
  bjMsgEl.textContent = "Your move: Hit or Stand.";
  bjRender();
}
function bjHitAction(){
  if(!bjActive) return;
  bjPlayer.push(bjDeck.pop());
  bjRender();
  if(bjTotal(bjPlayer)>21){
    bjMsgEl.textContent = "Bust! Dealer wins.";
    bjActive=false; bjRender();
  }
}
function bjStandAction(){
  if(!bjActive) return;
  while(bjTotal(bjDealer)<17 && bjDeck.length){ bjDealer.push(bjDeck.pop()); }
  const pt=bjTotal(bjPlayer), dt=bjTotal(bjDealer);
  bjActive=false; bjRender();
  if(dt>21) bjMsgEl.textContent="Dealer busts! You win.";
  else if(pt>dt) bjMsgEl.textContent="You win!";
  else if(pt<dt) bjMsgEl.textContent="Dealer wins.";
  else bjMsgEl.textContent="Push (tie).";
}
bjNew.addEventListener("click", bjStart);
bjHit.addEventListener("click", bjHitAction);
bjStand.addEventListener("click", bjStandAction);
bjStart();

// ========== Roulette ==========
const ruBankEl = document.getElementById("ru-bank");
const ruAmtEl = document.getElementById("ru-amt");
const ruMsgEl = document.getElementById("ru-msg");
const ruResEl = document.getElementById("ru-result");
const ruSpinBtn = document.getElementById("ru-spin");
let ruBank = 100;
let ruBet = { kind:"color", color:"red" };

document.querySelectorAll("[data-ru-bet]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const [k,v] = btn.getAttribute("data-ru-bet").split(":");
    if(k==="color") ruBet = {kind:"color", color:v};
    if(k==="parity") ruBet = {kind:"parity", parity:v};
    if(k==="dozen") ruBet = {kind:"dozen", dozen:Number(v)};
    if(k==="straight") ruBet = {kind:"straight", number:Number(v)};
    ruMsgEl.textContent = `Selected bet: ${btn.textContent}`;
  });
});

const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function ruSpin(){
  let amt = Math.floor(Number(ruAmtEl.value)||0);
  if(amt<1 || amt>ruBank){ ruMsgEl.textContent="Enter valid bet amount."; return; }
  const result = Math.floor(Math.random()*37);
  ruResEl.textContent = `Result: ${result}`;
  let mult = 0;
  if(ruBet.kind==="straight"){ mult = (result===ruBet.number)?35:0; }
  else if(ruBet.kind==="color"){
    if(result!==0){
      const isRed = REDS.has(result);
      mult = (isRed && ruBet.color==="red") || (!isRed && ruBet.color==="black") ? 1 : 0;
    }
  } else if(ruBet.kind==="parity"){
    if(result!==0){
      const isEven = result%2===0;
      mult = (isEven && ruBet.parity==="even") || (!isEven && ruBet.parity==="odd") ? 1 : 0;
    }
  } else if(ruBet.kind==="dozen"){
    if(result!==0){
      const dz = result<=12?1:(result<=24?2:3);
      mult = (dz===ruBet.dozen)?2:0;
    }
  }
  const win = Math.floor(amt*mult);
  ruBank = ruBank - amt + win;
  ruBankEl.textContent = `₹${ruBank}`;
  ruMsgEl.textContent = mult>0 ? `You win ₹${win}.` : `No win.`;
}
ruSpinBtn.addEventListener("click", ruSpin);

// ========== Slots ==========
const slBankEl = document.getElementById("sl-bank");
const slBetEl = document.getElementById("sl-bet");
const slSpinBtn = document.getElementById("sl-spin");
const slMsgEl = document.getElementById("sl-msg");
const r1 = document.getElementById("sl-r1");
const r2 = document.getElementById("sl-r2");
const r3 = document.getElementById("sl-r3");
let slBank = 100;

const SYMBOLS = ["🍒","🍋","🍇","⭐","💎"];
const WEIGHTS = {"🍒":40,"🍋":30,"🍇":20,"⭐":8,"💎":2};
const PAYOUTS = {"🍒":3,"🍋":5,"🍇":10,"⭐":25,"💎":100};
const TWO_MATCH_PAYOUT = 1.5;

function pickWeighted(){
  const total = Object.values(WEIGHTS).reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(const s of SYMBOLS){ r-=WEIGHTS[s]; if(r<=0) return s; }
  return SYMBOLS[0];
}
function evaluate(reel, bet){
  const [a,b,c]=reel;
  if(a===b && b===c){ const mult=PAYOUTS[a]; return {win:Math.floor(bet*mult), reason:`3x ${a} pays ${mult}x`}; }
  if(a===b || b===c || a===c){ return {win:Math.floor(bet*TWO_MATCH_PAYOUT), reason:"2-match consolation"}; }
  return {win:0, reason:"No match"};
}
async function spin(){
  let bet = Math.floor(Number(slBetEl.value)||0);
  if(bet<1 || bet>slBank){ slMsgEl.textContent="Enter valid bet amount."; return; }
  slBank -= bet; slBankEl.textContent = `₹${slBank}`;

  [r1,r2,r3].forEach(el=>el.classList.add("spinning"));
  await new Promise(res=>setTimeout(res, 1400));
  [r1,r2,r3].forEach(el=>el.classList.remove("spinning"));

  const reel = [pickWeighted(), pickWeighted(), pickWeighted()];
  r1.textContent = reel[0];
  r2.textContent = reel[1];
  r3.textContent = reel;

  const {win, reason} = evaluate(reel, bet);
  if(win>0){ slBank += win; slMsgEl.innerHTML = `${formatReel(reel)} ${reason}. <span class="win">You win ₹${win}!</span>`; }
  else { slMsgEl.innerHTML = `${formatReel(reel)} ${reason}. <span class="lose">No win.</span>`; }
  slBankEl.textContent = `₹${slBank}`;
}
function formatReel([a,b,c]){ return `| ${a} | ${b} | ${c} |`; }
slSpinBtn.addEventListener("click", spin);

show("home");
