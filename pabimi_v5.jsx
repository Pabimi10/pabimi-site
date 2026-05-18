const { useState, useMemo, useRef, useEffect, useCallback } = React;

// ═══════════════════════════════════════════════════════════════════
// MATERIAIS
// ═══════════════════════════════════════════════════════════════════
const MAT = {
  mdfBranco:   { n:"Chapa MDF Branco",           u:"cm²", qty:49500, c:220   },
  mdfPreto:    { n:"Chapa MDF Preto",            u:"cm²", qty:49500, c:310   },
  mdfCores:    { n:"Chapa MDF Cores/Amadeirado", u:"cm²", qty:49500, c:450   },
  mdfCru:      { n:"Chapa MDF Crú",              u:"cm²", qty:49500, c:120   },
  bordaBranca: { n:"Fita Borda Branca",          u:"m",   qty:600,   c:228   },
  bordaPreta:  { n:"Fita Borda Preta",           u:"m",   qty:300,   c:380   },
  bordaColor:  { n:"Fita Borda Colorida",        u:"m",   qty:300,   c:970   },
  cola:        { n:"Cola Alma Super",            u:"un",  qty:80,    c:65    },
  bucha6:      { n:"Bucha M6",                   u:"un",  qty:1,     c:0.04  },
  bucha8:      { n:"Bucha M8",                   u:"un",  qty:100,   c:2.20  },
  paraf16:     { n:"Parafuso 4×16",              u:"un",  qty:2000,  c:52    },
  paraf40:     { n:"Parafuso 4×40",              u:"un",  qty:500,   c:23.50 },
  paraf50:     { n:"Parafuso 4×50",              u:"un",  qty:1000,  c:64    },
  paraf4560:   { n:"Parafuso 4.5×60",            u:"un",  qty:500,   c:55    },
  pinoF40:   { n:"Pino Pinador Pneumático F40",  u:"un", qty:5000, c:52.0 },
  rodVerm:    { n:"Rodinha Vermelha",               u:"un", qty:4,    c:22.00 },
  rodSil:   { n:"Rodinha de Silicone",  u:"un", qty:12, c:68.0 },
  supInv:      { n:"Suporte Invisível",          u:"un",  qty:1,     c:0.75  },
  supCadBco:   { n:"Cantoneira Cadeirinha Zamac 2F",  u:"un", qty:500, c:72.0 },
  supCadeirao:   { n:"Cantoneira Reforçada Aérea c/Capa",  u:"un", qty:50, c:52.0 },
  supTubo:     { n:"Supt. Tubo Cabideiro",       u:"un",  qty:100,   c:78    },
  tuboCab:     { n:"Tubo Cabideiro Oval",        u:"m",   qty:3,     c:8.94  },
  maoFrancesa:   { n:"Mão Francesa Safira 10cm",  u:"un", qty:10, c:47.0 },
  tapaFuro:   { n:"Adesivos Tapa Furo Branco 13mm",  u:"un", qty:10000, c:240.0 },
  tapaFuroPT:  { n:"Adesivos Tapa Furo Preto 13mm",   u:"un", qty:10000, c:283 },
  tapaFuroAMD: { n:"Adesivos Tapa Furo Amadeirado",  u:"un", qty:40,    c:10.00 },
  cxOvo:       { n:"Caixa de OVO",               u:"un",  qty:1,     c:2.00  },
  cxPeq:       { n:"Caixinha Papelão Peq.",      u:"un",  qty:1,     c:3.00  },
  cxGde:       { n:"Caixinha Papelão Gde.",      u:"un",  qty:1,     c:7.00  },
  embalRecicl: { n:"Embalagem Reciclada",        u:"m",   qty:1,     c:0.28  }, // 20g/m × R$14/kg
  peMadeira:   { n:"Madeira Maciça Angelim 20cm",  u:"un", qty:1, c:8.5 },
  pePlastico:  { n:"Pé de Plástico",             u:"un",  qty:1,     c:28.00 },
  peFerro:   { n:"Hairpin Leg Triplo Industrial",  u:"un", qty:1, c:78.0 },
  kitRodinha:  { n:"Kit de Rodinha",             u:"un",  qty:1,     c:33.00 },
};

// Preços customizáveis — atualizados via tela de Ajuste
let _matPrecos = {}; // { key: {c, qty} }
const uc      = (k) => { if(k==="__skip"||k==="_revenda"||k==="_emb_fogao") return 0; const m=_matPrecos[k]; return m ? m.c/m.qty : (MAT[k]?.c||0)/(MAT[k]?.qty||1); };
const ucBorda = (k) => uc(k) + uc("cola")/50; // cola: ~50m por unidade

// Grupos de matéria-prima para edição
const MAT_GRUPOS = [
  { label:"🪵 Chapa de MDF",          keys:["mdfBranco","mdfPreto","mdfCru","mdfCores"] },
  { label:"🎀 Fita de Borda",          keys:["bordaBranca","bordaPreta","bordaColor"] },
  { label:"🫙 Cola",                   keys:["cola"] },
  { label:"🔩 Parafusos e Pinos",      keys:["paraf16","paraf40","paraf50","paraf4560","pinoF40"] },
  { label:"⚓ Buchas e Suportes",      keys:["bucha6","bucha8","supInv","supCadBco","supCadeirao","maoFrancesa","supTubo","tapaFuro","tapaFuroPT","tapaFuroAMD"] },
  { label:"🦵 Pés e Rodinhas",         keys:["peMadeira","pePlastico","peFerro","kitRodinha","rodSil","rodVerm"] },
  { label:"📦 Embalagens e Outros",    keys:["tuboCab","embalRecicl","cxOvo","cxPeq","cxGde","cxLP"] },
];

const MDF_K   = { branco:"mdfBranco", preto:"mdfPreto", cru:"mdfCru", amadeirado:"mdfCores", amadeiradoE:"mdfCores", colorido:"mdfCores" };
const BRD_K   = { branco:"bordaBranca", preto:"bordaPreta", cru:null, amadeirado:"bordaColor", amadeiradoE:"bordaColor", colorido:"bordaColor" };
const PERDA_K = { branco:1.15, preto:1.25, cru:1.12, amadeirado:1.18, amadeiradoE:1.20, colorido:1.28 };

// Tapa furo correto por cor do MDF
function tapFuroKey(cor) {
  if (cor === "preto")                          return "tapaFuroPT";
  if (cor === "amadeirado" || cor === "amadeiradoE") return "tapaFuroAMD";
  return "tapaFuro";
}
// Cadeirinha correta por cor do MDF
function cadeirinhaKey(cor) {
  if (cor === "preto") return "supCadBco"; // preta (mesmo código, etiqueta diferente)
  return "supCadBco"; // branca
}
const LARGURAS_PADRAO = [30, 40, 50, 60];
const isStd = (L) => LARGURAS_PADRAO.includes(Number(L));

const R$ = (v) => `R$ ${Number(v).toFixed(2).replace(".",",")}`;

// Modal de cópia manual (fallback universal)
function CopyModal({ text, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) { ref.current.select(); ref.current.focus(); }
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{background:"#fff",borderRadius:12,padding:16,width:"100%",maxWidth:480,boxShadow:"0 8px 32px rgba(0,0,0,.3)"}}>
        <div style={{fontWeight:"bold",fontSize:14,color:"#2c1810",marginBottom:8}}>
          📋 Selecione tudo e copie (Ctrl+C)
        </div>
        <textarea ref={ref} readOnly
          style={{width:"100%",height:200,fontSize:12,fontFamily:"monospace",borderRadius:7,border:"2px solid #8b5e3c",padding:8,boxSizing:"border-box",resize:"none",background:"#f5f0e8",color:"#2c1810"}}
          value={text}
          onClick={e=>e.target.select()}
        />
        <div style={{fontSize:11,color:"#9a7a65",margin:"6px 0 10px"}}>
          Toque no texto → Selecionar tudo → Copiar
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"10px",background:"#8b5e3c",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:"bold",fontSize:13}}>
          Fechar
        </button>
      </div>
    </div>
  );
}

// setCopyModal is used as React state in each component — see CopyModal component below

function fmtQty(k, q) {
  if (!MAT[k]) return "";
  const u = MAT[k].u;
  if (u==="cm²") return `${Math.round(q).toLocaleString("pt-BR")} cm²`;
  if (u==="m")   return `${q.toFixed(2).replace(".",",")} m`;
  return `${Math.round(q)} un`;
}
function arredondar(price) {
  const decade = Math.floor(price / 10) * 10;
  const opt = decade + 9.90;
  return opt >= price ? opt : decade + 19.90;
}

// ═══════════════════════════════════════════════════════════════════
// FIXAÇÃO (atualizada com parafusos corretos)
// ═══════════════════════════════════════════════════════════════════
const FIXACAO = {
  nenhuma:    { n:"Sem fixação inclusa",          cap:null,        emoji:"🚫", items:[] },
  bucha6:     { n:"Parafuso 4×50 + Bucha M6",     cap:"15–20 kg",  emoji:"🔩", items:[{k:"bucha6",q:2,cat:"fix"},{k:"paraf50",q:2,cat:"fix"},{k:"tapaFuro",q:2,cat:"fix"}] },
  bucha8:     { n:"Parafuso 4.5×50 + Bucha M8",   cap:"25–35 kg",  emoji:"🔩", items:[{k:"bucha8",q:2,cat:"fix"},{k:"paraf50",q:2,cat:"fix"},{k:"tapaFuro",q:2,cat:"fix"}] },
  bucha8_60:  { n:"Parafuso 4.5×60 + Bucha M8",   cap:"30–40 kg",  emoji:"🔩", items:[{k:"bucha8",q:2,cat:"fix"},{k:"paraf4560",q:2,cat:"fix"},{k:"tapaFuro",q:2,cat:"fix"}] },
  cadeirinha: { n:"Cadeirinha + Bucha M6",         cap:"25–35 kg",  emoji:"🪑", items:[{k:"supCadBco",q:2,cat:"fix"},{k:"bucha6",q:2,cat:"fix"},{k:"paraf40",q:2,cat:"fix"},{k:"paraf16",q:4,cat:"fix"},{k:"tapaFuro",q:4,cat:"fix"}] },
  supInv:     { n:"Suporte Invisível + Bucha M8",  cap:"10–15 kg",  emoji:"🪄", items:[{k:"supInv",q:2,cat:"fix"},{k:"bucha8",q:2,cat:"fix"},{k:"paraf50",q:2,cat:"fix"}] },
  cadeirao:   { n:"Cadeirão + Bucha M8",           cap:"30–45 kg",  emoji:"🦾", items:[{k:"supCadeirao",q:2,cat:"fix"},{k:"bucha8",q:2,cat:"fix"},{k:"paraf4560",q:2,cat:"fix"},{k:"tapaFuro",q:2,cat:"fix"}] },
  maoFrancesa:{ n:"Mão Francesa + Bucha M6",       cap:"15–25 kg",  emoji:"🔨", items:[{k:"maoFrancesa",q:2,cat:"fix"},{k:"bucha6",q:2,cat:"fix"}] },
  bicoPapagaio:{ n:"Bico de Papagaio + Bucha M6",  cap:"15–25 kg",  emoji:"🦅", items:[{k:"maoFrancesa",q:2,cat:"fix"},{k:"bucha6",q:2,cat:"fix"}] },
  peMadeira:  { n:"Pé de Madeira",                 cap:"—",         emoji:"🪵", items:[{k:"peMadeira",q:4,cat:"fix"}] },
  pePlastico: { n:"Pé de Plástico",                cap:"—",         emoji:"⬜", items:[{k:"pePlastico",q:4,cat:"fix"}] },
  peFerro:    { n:"Pé de Ferro",                   cap:"—",         emoji:"🔧", items:[{k:"peFerro",q:4,cat:"fix"}] },
  kitRodinha: { n:"Kit de Rodinha",                cap:"—",         emoji:"⚙️", items:[{k:"kitRodinha",q:4,cat:"fix"}] },
};

function autoFixacaoNicho(L, peso, fundo) {
  const pesado = peso > 6 || L > 80;
  const medio  = peso > 3 || L > 60;
  if (fundo) {
    if (pesado) return "bucha8_60";
    return "bucha6";
  } else {
    if (pesado || medio) return "cadeirao";
    return "cadeirinha";
  }
}

// ═══════════════════════════════════════════════════════════════════
// TABELA FRETE ML
// ═══════════════════════════════════════════════════════════════════
const ML_TABLE = [
  [0.3,[5.65,6.55,7.75,12.35,14.35,16.45,18.45,20.95]],
  [0.5,[5.95,6.65,7.85,13.25,15.45,17.65,19.85,22.55]],
  [1,[6.05,6.75,7.95,13.85,16.15,18.45,20.75,23.65]],
  [1.5,[6.15,6.85,8.05,14.15,16.45,18.85,21.15,24.65]],
  [2,[6.25,6.95,8.15,14.45,16.85,19.25,21.65,24.65]],
  [3,[6.35,7.95,8.55,15.75,18.35,21.05,23.65,26.25]],
  [4,[6.45,8.15,8.95,17.05,19.85,22.65,25.55,28.35]],
  [5,[6.55,8.35,9.75,18.45,21.55,24.65,27.75,30.75]],
  [6,[6.65,8.55,9.95,25.45,28.55,32.65,35.75,39.75]],
  [7,[6.75,8.75,10.15,27.05,31.05,36.05,40.05,44.05]],
  [8,[6.85,8.95,10.35,28.85,33.65,38.45,43.25,48.05]],
  [9,[6.95,9.15,10.55,29.65,34.55,39.55,44.45,49.35]],
  [11,[7.05,9.55,10.95,41.25,48.05,54.95,61.75,68.65]],
  [13,[7.15,9.95,11.35,42.15,49.25,56.25,63.25,70.25]],
  [15,[7.25,10.15,11.55,45.05,52.45,59.95,67.45,74.95]],
  [17,[7.35,10.35,11.75,48.55,56.05,63.55,70.75,78.65]],
  [20,[7.45,10.55,11.95,54.75,63.85,72.95,82.05,91.15]],
  [25,[7.65,10.95,12.15,64.05,75.05,84.75,95.35,105.95]],
  [30,[7.75,11.15,12.35,65.95,75.45,85.55,96.25,106.95]],
  [40,[7.85,11.35,12.55,67.75,78.95,88.95,99.15,107.05]],
  [50,[7.95,11.55,12.75,70.25,81.05,92.05,102.55,110.75]],
  [60,[8.05,11.75,12.95,74.95,86.45,98.15,109.35,118.15]],
  [70,[8.15,11.95,13.15,80.25,92.95,105.05,117.15,126.55]],
  [80,[8.25,12.15,13.35,83.95,97.05,109.85,122.45,132.25]],
  [90,[8.35,12.35,13.55,93.25,107.45,122.05,136.05,146.95]],
  [100,[8.45,12.55,13.75,106.55,123.95,139.55,155.55,167.95]],
  [125,[8.55,12.75,13.95,119.25,138.05,156.05,173.95,187.95]],
  [150,[8.65,12.75,14.15,126.55,146.15,165.65,184.65,199.45]],
  [Infinity,[8.75,12.95,14.35,166.15,192.45,217.55,242.55,261.95]],
];
const PRICE_BREAKS = [18.99,48.99,78.99,99.99,119.99,149.99,199.99,Infinity];
function calcFreteML(pesoKg, L, A, P, precoRef) {
  const pCub = (L*A*P)/6000, pF = Math.max(pesoKg,pCub);
  const col = Math.max(0, PRICE_BREAKS.findIndex(b=>precoRef<=b));
  for (const [mx,pr] of ML_TABLE) if (pF<=mx) return {valor:pr[col],pesoFinal:pF,cubico:pCub>pesoKg};
  const l=ML_TABLE[ML_TABLE.length-1]; return {valor:l[1][col],pesoFinal:pF,cubico:pCub>pesoKg};
}

// ═══════════════════════════════════════════════════════════════════
// CAPACIDADE VINIL
// ═══════════════════════════════════════════════════════════════════
function calcCapacidadeVinil(L, P, A, prat, div) {
  const profMinLP = 33; // profundidade mínima para LP (sleeve 32cm + folga)
  const profOk = P >= profMinLP;
  const lStorage = Math.max(0, L - 1); // 1cm de folga nas laterais

  // Capacidade por prateleira
  const maxPorPrat    = Math.floor(lStorage * 10 / 6);  // 6mm por disco (apertado)
  const comfPorPrat   = Math.floor(lStorage * 10 / 10); // 10mm por disco (confortável)
  const ótimoPorPrat  = Math.floor(lStorage * 10 / 8);  // 8mm por disco (recomendado)

  // Número de áreas de armazenamento
  const nAreas = 1 + (prat||0) + (div||0); // base + prateleiras + divisórias criam compartimentos

  return {
    profOk,
    profMinLP,
    maxTotal:   maxPorPrat   * nAreas,
    comfTotal:  comfPorPrat  * nAreas,
    ótimoTotal: ótimoPorPrat * nAreas,
    maxPorPrat, comfPorPrat, ótimoPorPrat,
    nAreas,
  };
}

// ═══════════════════════════════════════════════════════════════════
// EMBALAGEM
// ═══════════════════════════════════════════════════════════════════
function calcEmb(L, A, P, montado, numPecas, calcId, qty, prodId) {
  if (calcId === "revisteiro") {
    if (qty === 1) return { Lemb:L+1, Aemb:13, Pemb:11, pesoEmb:0.25 };
    if (qty === 2) return { Lemb:L+4, Aemb:16, Pemb:16, pesoEmb:0.40 };
    return           { Lemb:L+4, Aemb:26, Pemb:16, pesoEmb:0.50 };
  }
  if (calcId === "tuboSolto") {
    return { Lemb:L+2, Aemb:8, Pemb:8, pesoEmb: L/100 * 0.020 };
  }
  if (calcId === "portaQ") {
    return { Lemb:L+6, Aemb:A+6, Pemb:P+6, pesoEmb:0.3 };
  }
  if (calcId === "prateleira") {
    const nCaixas = Math.ceil((qty||1) / 6);
    const embL = L + 2;
    const embA = nCaixas <= 1 ? 6 : nCaixas * 2 + 4;
    return { Lemb: embL, Aemb: embA, Pemb: P + 2, pesoEmb: 0.15 * (qty||1) };
  }
  // Nicho / estante montado
  if (montado) {
    return {
      Lemb: Math.round(L + 6),
      Aemb: Math.round(A + 6),
      Pemb: Math.round(P + 6),
      pesoEmb: Math.max(0.3, (L*A*P/1e6) * 30),
    };
  }
  // Desmontado: peças empilhadas
  // Para vinil/estante grandes: calcula caixas de ovo necessárias
  // Caixa de ovo comporta peças de até ~35×35cm
  // Peças maiores precisam de papelão avulso ou mais caixas
  const maiorPeca = Math.max(L, A); // maior dimensão de uma peça plana
  let nCaixasOvo;
  if (maiorPeca > 70) {
    // Peças grandes: 1 caixa por peça (proteção individual)
    nCaixasOvo = numPecas;
  } else if (maiorPeca > 40) {
    // Peças médias: máx 2 por caixa
    nCaixasOvo = Math.ceil(numPecas / 2);
  } else {
    // Peças pequenas: até 6 por caixa
    nCaixasOvo = Math.ceil(numPecas / 6);
  }

  const embL = Math.max(L, A);
  const altPilha = numPecas * 1.5 + 4;
  return {
    Lemb:  Math.round(embL + 2),
    Aemb:  Math.round(altPilha),
    Pemb:  Math.round(P + 2),
    pesoEmb: 0.3 + numPecas * 0.05,
    nCaixasOvo,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES BOM
// ═══════════════════════════════════════════════════════════════════

function nichoBOM(L, A, P, cfg, cor, fixacao) {
  const { fundo=true, prat=0, div=0, bdDupla=false } = cfg;
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = cfg._bordaKey !== undefined ? cfg._bordaKey : BRD_K[cor];
  const std  = isStd(L);
  const perda= std ? Math.min(PERDA_K[cor]||1.15, 1.08) : (PERDA_K[cor]||1.15);
  const extra= L > 60 ? 2 : 0; // mais parafusos em nichos largos

  // Área
  let area = 2*A*P + 2*L*P;
  if (fundo) area += L*A;
  area += prat*L*P + div*A*P*0.85;
  const aW = area * perda;

  // Borda
  let bordaM = 0;
  if (brd) {
    bordaM = (2*A + 2*L) / 100;
    bordaM += prat * L / 100;
    if (bdDupla) bordaM *= 2;
    if (std) bordaM = Math.max(0, bordaM - (2+prat)*2*L/100);
    bordaM *= 1.08;
  }

  // Parafusos 4×40 (montagem)
  const nP40_asm  = 8 + extra;                       // caixa
  const nP40_prat = prat * 4;                         // prateleiras
  const nP40_div  = div * 4;                          // divisórias
  const nP40_fund = fundo ? (4 + extra) : 0;          // fundo
  const nP40 = nP40_asm + nP40_prat + nP40_div + nP40_fund;

  // Tapa furos = parafusos visíveis (asm + prat + fundo; div são internos)
  const nTapa = nP40_asm + nP40_prat + nP40_fund;

  // Embalagem (caixa ovo = até 6 peças, mas nichos usam papelão próprio)
  const embK = L*A*P/1e6 < 0.01 ? "cxPeq" : L*A*P/1e6 < 0.08 ? "cxOvo" : "cxGde";

  const numPecas = 4 + (fundo?1:0) + prat + div;
  const peso = (area/10000)*0.015*750;
  const fixItems = (FIXACAO[fixacao]?.items||[]).map(i=>{ const k2=i.k==="tapaFuro"?tapFuroKey(cor):i.k; return {...i,k:k2,label:MAT[k2]?.n||i.k}; });
  const economiaMDF = std ? area*(PERDA_K[cor]-perda)*uc(mdf) : 0;
  const economiaBrd = (std&&brd) ? (2+prat)*2*(L/100)*ucBorda(brd) : 0;

  return {
    items:[
      {k:mdf, q:aW, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      {k:"paraf40", q:nP40, label:"Parafuso 4×40", cat:"mat"},
      {k:tapFuroKey(cor), q:nTapa, label:"Tapa Furo", cat:"mat"},
      ...fixItems,
      {k:embK, q:1, label:"Embalagem", cat:"emb"},
    ],
    peso, numPecas, std, economiaTotal:economiaMDF+economiaBrd, perda,
  };
}

function prateleiraBOM(L, P, cor, fixacao, bordaKey) {
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = bordaKey !== undefined ? bordaKey : BRD_K[cor];
  const perda= PERDA_K[cor]||1.15;
  const area = L * P * perda;
  const peso = (L*P/10000)*0.015*750;
  const bordaM = brd ? ((2*L + 2*P)/100) * 1.08 : 0;
  const fixItems = (FIXACAO[fixacao]?.items||[]).map(i=>{ const k2=i.k==="tapaFuro"?tapFuroKey(cor):i.k; return {...i,k:k2,label:MAT[k2]?.n||i.k}; });
  return {
    items:[
      {k:mdf, q:area, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      {k:tapFuroKey(cor), q:2, label:"Tapa Furo", cat:"mat"},
      ...fixItems,
      {k:"cxOvo", q:1/6, label:"Embalagem (caixa ovo ÷ 6)", cat:"emb"},
    ],
    peso, numPecas:1, std:false, economiaTotal:0, perda,
  };
}

function revisteiroBOM(L, A, P, cfg, cor, qty) {
  const { barraProtecao=false, barraAntiQueda=false } = cfg;
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = cfg._bordaKey !== undefined ? cfg._bordaKey : BRD_K[cor];
  const perda= PERDA_K[cor]||1.15;

  // ── Área MDF ──────────────────────────────────────────────────
  // Base (L×P) + traseira/lateral (L×A)
  let area = (L*P + L*A) * perda;

  // ── Fita de Borda ─────────────────────────────────────────────
  // Base: frente (L) + lateral (P) → 2 cortes × 3cm desperdício
  // 2 Laterais: cada uma tem frente (A) + comprimento (P) → 2 cortes × 3cm cada
  // Total base: L + P + 6
  // Total 2 laterais: 2(A + P) + 12
  // Total base = (L + P + 6) + (2A + 2P + 12) = L + 2A + 3P + 18
  let bordaM = brd ? (L + 2*A + 3*P + 18) / 100 : 0;

  let nPino = 4, nTapa = 2, nParaf40 = 2;

  // Barras opcionais
  const lBarra = L - 3; // comprimento real da barra (descontando borda dos dois lados)
  if (barraProtecao) {
    area += 2 * lBarra * 3 * perda;
    // 2 barras com borda nos 2 lados longos: cada barra = 2 × (lBarra + 3cm) = 2L
    if (brd) bordaM += 2 * (2 * (lBarra + 3)) / 100;
    nPino += 4; nTapa += 4;
  }
  if (barraAntiQueda) {
    area += lBarra * 3 * perda;
    // 1 barra com borda em 1 lado: (lBarra + 3cm) = L
    if (brd) bordaM += (lBarra + 3) / 100;
    nPino += 2; nTapa += 2;
  }

  const peso = (area/perda/10000)*0.015*750;
  const numPecas = 2 + (barraProtecao?2:0) + (barraAntiQueda?1:0);

  // Cadeirinha: 4 unidades se altura > 18cm, senão 2
  const nCadeirinha = A > 18 ? 4 : 2;
  const nParaf16 = nCadeirinha * 2; // 2 parafusos por cadeirinha

  // Embalagem: 1 caixa ovo embala até 6 revisteiros
  const nCaixas = Math.ceil((qty||1) / 6);
  const qCaixaPorUn = nCaixas / (qty||1);
  const nCaixasLabel = nCaixas === 1
    ? `1 caixa ÷ ${qty||1} un`
    : `${nCaixas} caixas ÷ ${qty||1} un`;

  return {
    items:[
      {k:mdf, q:area, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      {k:"paraf40", q:nParaf40, label:"Parafuso 4×40", cat:"mat"},
      {k:"pinoF40",  q:nPino,   label:"Pino F40", cat:"mat"},
      {k:tapFuroKey(cor), q:nTapa, label:"Tapa Furo", cat:"mat"},
      {k:"supCadBco",q:nCadeirinha, label:`Supt. Cadeirinha Branca (${nCadeirinha > 2 ? "A>18cm" : "padrão"})`, cat:"fix"},
      {k:"bucha6",   q:2,       label:"Bucha M6 (parede)", cat:"fix"},
      {k:"paraf40",  q:2,       label:"Parafuso 4×40 (parede)", cat:"fix"},
      {k:"paraf16",  q:nParaf16, label:`Parafuso 4×16 (${nCadeirinha} cadeirinhas)`, cat:"fix"},
      {k:"cxOvo",   q:qCaixaPorUn, label:`Embalagem (${nCaixasLabel})`, cat:"emb"},
    ],
    peso, numPecas, std:false, economiaTotal:0, perda,
  };
}

function portaQuadrosBOM(L, b, c, d, cor, fixacao, bordaKey) {
  // b=barra frontal (0=sem), c=profundidade base, d=parte de trás (0=sem)
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = bordaKey !== undefined ? bordaKey : BRD_K[cor];
  const perda= PERDA_K[cor]||1.15;

  let area  = L * c;                        // base (B)
  if (d > 0) area += L * d;                // parte de trás (D)
  if (b > 0) area += L * b;                // barra frontal (C)
  area *= perda;

  let bordaM = 0;
  if (brd) {
    if (b === 0) {
      // sem barra frontal: borda na frente da base + 2 laterais
      bordaM = (L + 2*c) / 100;
    } else {
      // com barra frontal: borda na frente da barra
      bordaM = L / 100;
    }
    if (d > 0) bordaM += 2*d / 100; // laterais da traseira
    bordaM *= 1.08;
  }

  let nPino = 0, nTapa = 0;
  if (d > 0) nPino += 4;            // traseira pinada na base
  if (b > 0) { nPino += 4; nTapa += 4; } // barra frontal pinada + tapa furo

  const peso = (area/perda/10000)*0.015*750;
  const fixItems = (FIXACAO[fixacao]?.items||[]).map(i=>{ const k2=i.k==="tapaFuro"?tapFuroKey(cor):i.k; return {...i,k:k2,label:MAT[k2]?.n||i.k}; });

  return {
    items:[
      {k:mdf, q:area, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      ...(nPino>0?[{k:"pinoF40",q:nPino,label:"Pino F40",cat:"mat"}]:[]),
      ...(nTapa>0?[{k:tapFuroKey(cor),q:nTapa,label:"Tapa Furo",cat:"mat"}]:[]),
      ...fixItems,
      {k:"cxOvo",q:1,label:"Embalagem",cat:"emb"},
    ],
    peso, numPecas:1+(d>0?1:0)+(b>0?1:0), std:false, economiaTotal:0, perda,
  };
}

function tipoUBOM(L, A, P, cfg, cor, fixacao) {
  const { fundo=false } = cfg;
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = cfg._bordaKey !== undefined ? cfg._bordaKey : BRD_K[cor];
  const perda= PERDA_K[cor]||1.15;
  let area = (L*P + 2*A*P) * perda;
  if (fundo) area += L*A*perda;

  // Edges: base front (L) + base 2 ends (A each) + 2 lateral fronts (A each) + 2 lateral tops (P each)
  // = L + 4A + 2P, plus 3cm waste per cut (7 cuts)
  const bordaM = brd ? (L + 4*A + 2*P + 7*3) / 100 : 0;

  const nP40 = 6 + (fundo?4:0);
  const nTapa = nP40;
  const peso = (area/perda/10000)*0.015*750;
  const fixItems = (FIXACAO[fixacao]?.items||[]).map(i=>{ const k2=i.k==="tapaFuro"?tapFuroKey(cor):i.k; return {...i,k:k2,label:MAT[k2]?.n||i.k}; });
  return {
    items:[
      {k:mdf, q:area, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      {k:"paraf40",q:nP40,label:"Parafuso 4×40",cat:"mat"},
      {k:tapFuroKey(cor),q:nTapa,label:"Tapa Furo",cat:"mat"},
      ...fixItems,
      {k:"cxPeq",q:1,label:"Embalagem",cat:"emb"},
    ],
    peso, numPecas:3+(fundo?1:0), std:false, economiaTotal:0, perda,
  };
}

function cabideiroBOM(L, A, P, cfg, cor, fixacao) {
  const { bdDupla=false, tubo=true } = cfg;
  const mdf  = MDF_K[cor]||"mdfBranco";
  const brd  = cfg._bordaKey !== undefined ? cfg._bordaKey : BRD_K[cor];
  const perda= PERDA_K[cor]||1.15;
  const area = (2*A*P + 2*L*P) * perda;
  const bordaM = brd ? ((2*A+2*L)/100*(bdDupla?2:1)*1.08) : 0;
  const peso = (area/perda/10000)*0.015*750 + (tubo?L/100*0.3:0);
  const fixItems = (FIXACAO[fixacao]?.items||[]).map(i=>{ const k2=i.k==="tapaFuro"?tapFuroKey(cor):i.k; return {...i,k:k2,label:MAT[k2]?.n||i.k}; });
  return {
    items:[
      {k:mdf, q:area, label:MAT[mdf].n, cat:"mat"},
      ...(brd?[{k:brd, q:bordaM, label:`${MAT[brd].n} (+ cola)`, cat:"mat", useBordaUc:true}]:[]),
      {k:"paraf40",q:8,label:"Parafuso 4×40",cat:"mat"},
      {k:tapFuroKey(cor),q:8,label:"Tapa Furo",cat:"mat"},
      ...(tubo?[{k:"supTubo",q:2,label:"Supt. Tubo",cat:"fix"},{k:"tuboCab",q:L/100,label:"Tubo Cabideiro",cat:"fix"}]:[]),
      ...fixItems,
      {k:"cxGde",q:1,label:"Embalagem",cat:"emb"},
    ],
    peso, numPecas:4, std:false, economiaTotal:0, perda,
  };
}

function tuboBOM(L, tipoTubo) {
  // L em cm, embalagem reciclada
  const comprM = L / 100;
  const pesoTubo = comprM * 0.3; // ~300g/m para tubo oval
  const pesoEmbal = comprM * 0.020;
  return {
    items:[
      {k:"tuboCab",   q:comprM, label:`Tubo Cabideiro ${tipoTubo==="oval"?"Oval":"Redondo"}`, cat:"mat"},
      {k:"supTubo",   q:2,      label:"Supt. Tubo Cabideiro", cat:"mat"},
      {k:"paraf16",   q:4,      label:"Parafuso 4×16 (suporte→parede)", cat:"mat"},
      {k:"embalRecicl",q:comprM*2, label:"Embalagem reciclada", cat:"emb"},
    ],
    peso: pesoTubo + pesoEmbal, numPecas:1, std:false, economiaTotal:0, perda:1,
  };
}

function chapaBOM(L, A, cor) {
  const mdf = MDF_K[cor]||"mdfBranco";
  const perda = PERDA_K[cor]||1.15;
  return { items:[{k:mdf,q:L*A*perda,label:MAT[mdf].n,cat:"mat"}], peso:(L*A/10000)*0.015*750, numPecas:1, std:false, economiaTotal:0, perda };
}

// Embalagens de fogão (dimensões em cm, peso em kg)
const EMB_FOGAO = {
  saquinho: { label:"Saquinho 10×15cm",      L:10, A:15, P:1,  pesoEmb:0.01, custo:0.30 },
  cxP:      { label:"Caixinha P 16×11×6cm",  L:16, A:11, P:6,  pesoEmb:0.08, custo:1.50 },
  cxG:      { label:"Caixa G 19×12×12cm",    L:19, A:12, P:12, pesoEmb:0.15, custo:3.00 },
};

function revendaBOM(itens, pesoKg, tipoEmb) {
  const emb = EMB_FOGAO[tipoEmb] || EMB_FOGAO.saquinho;
  const custoTotal = itens.reduce((s, i) => s + (parseFloat(i.qty)||0) * (parseFloat(i.custo)||0), 0);
  return {
    items:[
      ...itens.filter(i=>i.nome&&i.qty>0&&i.custo>0).map((i,idx) => ({
        k:"_revenda", q:1,
        label:`${i.nome} × ${i.qty}`,
        cat:"mat",
        _valor: (parseFloat(i.qty)||0) * (parseFloat(i.custo)||0),
        _id: idx,
      })),
      { k:"_emb_fogao", q:1, label:emb.label, cat:"emb", _valor: emb.custo },
    ],
    peso: pesoKg,
    numPecas: 1,
    std: false,
    economiaTotal: 0,
    perda: 1,
    _embDims: { Lemb: emb.L, Aemb: emb.A, Pemb: emb.P, pesoEmb: emb.pesoEmb },
  };
}

function calcBOM(prod, dims, cfg, cor, fixacao, qty) {
  switch(prod.calcId) {
    case "nicho":      return nichoBOM(dims.L, dims.A, dims.P, cfg, cor, fixacao);
    case "prateleira": return prateleiraBOM(dims.L, dims.P, cor, fixacao, cfg._bordaKey);
    case "revisteiro": return revisteiroBOM(dims.L, dims.A, dims.P, cfg, cor, qty||1);
    case "portaQ":     return portaQuadrosBOM(dims.L, dims.b||0, dims.c||8, dims.d||7, cor, fixacao, cfg._bordaKey);
    case "tipoU":      return tipoUBOM(dims.L, dims.A, dims.P, cfg, cor, fixacao);
    case "cabideiro":  return cabideiroBOM(dims.L, dims.A, dims.P, cfg, cor, fixacao);
    case "tuboSolto":  return tuboBOM(dims.L, cfg.tipoTubo||"oval");
    case "revenda":    return revendaBOM(cfg.revendaItens||[], cfg.pesoKg||0.3, cfg.tipoEmb||"saquinho");
    case "chapa":      return chapaBOM(dims.L, dims.A, cor);
    default:           return { items:[], peso:0, numPecas:0, std:false, economiaTotal:0, perda:1 };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MARKETPLACES + PRODUTOS
// ═══════════════════════════════════════════════════════════════════
const MKTS = {
  ml_clas: {n:"ML Clássico",  taxa:0.11, freteMKT:true,  taxaFixa:0},
  ml_prem: {n:"ML Premium",   taxa:0.16, freteMKT:true,  taxaFixa:0},
  shopee:  {n:"Shopee",       taxa:"shopee", freteMKT:false, taxaFixa:"shopee"},
  amazon:  {n:"Amazon",       taxa:"amazon", freteMKT:false, taxaFixa:1},
  elo7:    {n:"Elo7",         taxa:0.12, freteMKT:false, taxaFixa:0},
  site:    {n:"Site Próprio", taxa:0.03, freteMKT:false, taxaFixa:0},
  direto:  {n:"Venda Direta", taxa:0.00, freteMKT:false, taxaFixa:0},
};

// Shopee 2026 — frete grátis obrigatório, comissão escalonada por faixa
// Retorna { pct, fixo, descricao }
function shopeeComissao(preco) {
  if (preco < 8)   return { pct:0.50, fixo:0,  desc:"50% (até R$7,99)" };
  if (preco < 80)  return { pct:0.20, fixo:4,  desc:"20% + R$4 (R$8–79,99)" };
  if (preco < 100) return { pct:0.14, fixo:16, desc:"14% + R$16 (R$80–99,99)" };
  if (preco < 200) return { pct:0.14, fixo:20, desc:"14% + R$20 (R$100–199,99)" };
  return             { pct:0.14, fixo:26, desc:"14% + R$26 (acima de R$200)" };
}
function taxaEfetivaShopee(preco) {
  const c = shopeeComissao(preco);
  return preco * c.pct + c.fixo;
}
// Amazon BR — categoria Móveis: 15% até R$200, 10% acima. Mínimo R$1.
function amazonComissao(preco) {
  if (preco <= 200) return { pct:0.15, fixo:1, desc:"15% + R$1 (Móveis até R$200)" };
  const comissao = 200*0.15 + (preco-200)*0.10;
  const pctEf = comissao / preco;
  return { pct:pctEf, fixo:1, desc:`15% até R$200 + 10% acima (${(pctEf*100).toFixed(1)}% efetivo)` };
}

const PRODS = [
  { id:"nicho",      name:"Nicho MDF",          emoji:"🪵", desc:"Com/sem prateleiras e divisórias", dims:{L:35,A:66,P:50},  cores:true,  calcId:"nicho",      fixacao:true,  opts:["fundo","prat","div","bdDupla"] },
  { id:"prateleira", name:"Prateleira",          emoji:"📐", desc:"Prateleira simples, fixação inclusa",dims:{L:60,A:1.5,P:15},cores:true, calcId:"prateleira", fixacao:true,  opts:[] },
  { id:"revisteiro", name:"Revisteiro",          emoji:"📰", desc:"Porta revistas em MDF",            dims:{L:50,A:10,P:10},  cores:true,  calcId:"revisteiro", fixacao:false, opts:["barraProtecao","barraAntiQueda"] },
  { id:"portaQ",     name:"Porta Quadros",       emoji:"🖼️", desc:"Prateleira mural p/ quadros",     dims:{L:60,b:0,c:8,d:7},cores:true,  calcId:"portaQ",     fixacao:true,  opts:[] },
  { id:"cabideiro",  name:"Cabideiro",           emoji:"👔", desc:"Com tubo oval e suportes",         dims:{L:80,A:40,P:25},  cores:true,  calcId:"cabideiro",  fixacao:true,  opts:["tubo","bdDupla"] },
  { id:"tipoU",      name:"Tipo U",              emoji:"🔡", desc:"Prateleira em formato U",          dims:{L:60,A:10,P:15},  cores:true,  calcId:"tipoU",      fixacao:true,  opts:["fundo"] },
  { id:"vinil",      name:"Estante Vinil",       emoji:"🎵", desc:"Nichos 31×31 para LPs",           dims:{L:65,A:66,P:35},  cores:true,  calcId:"nicho",      fixacao:true,  opts:["fundo","prat","div","bdDupla"] },
  { id:"esmalte",    name:"Prat. Esmaltes",      emoji:"💅", desc:"Prateleira para esmaltes e frascos",dims:{L:50,b:3,c:5,d:5},cores:true,  calcId:"portaQ",     fixacao:true,  opts:[], fixDefault:"bucha6" },
  { id:"pecaFogao",  name:"Peças de Fogão",      emoji:"🔥", desc:"Revenda — calcula preço de venda",  dims:{L:1,A:1,P:1},   cores:false, fixCor:"branco", calcId:"revenda", fixacao:false, opts:[] },
  { id:"nicho-vinil",name:"Nicho Cubo Vinil",    emoji:"💿", desc:"31×31×31 para disco de vinil",    dims:{L:31,A:31,P:31},  cores:true,  calcId:"nicho",      fixacao:true,  opts:["fundo","bdDupla"] },
  { id:"chapa",      name:"Chapa de MDF",        emoji:"⬜", desc:"Chapa pura, sem montagem",         dims:{L:275,A:180,P:1.5},cores:true, calcId:"chapa",      fixacao:false, opts:[] },
  { id:"tubo",       name:"Tubo Cabideiro",      emoji:"🔧", desc:"Tubo + suportes avulso",           dims:{L:80,A:1,P:1},   cores:false, fixCor:"branco", calcId:"tuboSolto", fixacao:false, opts:[] },
];

const CORES = [
  {id:"branco",       label:"Branco",       sku:"BC",  bg:"#f5f0eb", border:"#b8a890"},
  {id:"preto",        label:"Preto",        sku:"PT",  bg:"#1c1c1c", border:"#000", text:"#fff"},
  {id:"cru",          label:"MDF Crú",      sku:"CRU", bg:"#d4a96a", border:"#b8884a"},
  {id:"amadeirado",   label:"Louro Freijó", sku:"AMC", bg:"#c4973a", border:"#a07830"},
  {id:"amadeiradoE",  label:"Tabaco",       sku:"AME", bg:"#6b3a1f", border:"#4a2510", text:"#fff"},
  {id:"customCor",    label:"Outro",        sku:"COR", bg:"#7c3aed", border:"#5b21b6", text:"#fff"},
];

// Borda colorida (usada sobre MDF branco)
const BORDA_CORES = [
  {id:"BRANCO",   label:"Branco",   bg:"#f5f0eb", border:"#c4b8a8"},
  {id:"PRETO",    label:"Preto",    bg:"#1c1c1c", text:"#fff"},
  {id:"AMARELO",  label:"Amarelo",  bg:"#fbbf24"},
  {id:"AZUL",     label:"Azul",     bg:"#60a5fa"},
  {id:"ROSA",     label:"Rosa",     bg:"#f472b6"},
];
// Default borda by MDF color
function bordaDefault(cor) {
  if (cor === "preto") return "PRETO";
  if (cor === "cru")   return "";
  if (cor === "branco") return "BRANCO";
  return ""; // amadeirado/tabaco: sem borda padrão, deixa o cliente escolher
}
// Which borda key to use for cost
function bordaCusto(bordaId) {
  if (!bordaId || bordaId === "BRANCO") return "bordaBranca";
  if (bordaId === "PRETO") return "bordaPreta";
  return "bordaColor";
}

// ─── SKU Generator ───────────────────────────────────────────────
function getCadeirinhaCor(cor) {
  if (cor === "branco") return "branca";
  if (cor === "preto")  return "preta";
  return "cromada"; // AMC, AME, CRU
}

function basepadrao(L) {
  if (L >= 120) return 10;
  if (L >= 90)  return 7;
  return 5;
}

function gerarSKU(prod, dims, cfg, cor, fixacao, qty, bordaCor) {
  const c = CORES.find(x=>x.id===cor);
  const skuCor = c?.sku || cor.toUpperCase();
  const q = qty || 1;
  // Borda só aparece no SKU se for diferente do padrão do MDF
  const defBorda = bordaDefault(cor); // "BRANCO", "PRETO" ou ""
  const bordaStr = (bordaCor && bordaCor !== defBorda) ? `-${bordaCor}` : "";
  switch(prod.calcId) {
    case "nicho": {
      const pratStr = (cfg.prat > 0) ? `-${cfg.prat}P` : "";
      const divStr  = (cfg.div  > 0) ? `-${cfg.div}D`  : "";
      return `${q}N${dims.L}-${dims.A}-${dims.P}${skuCor}${cfg.fundo?"-FD":""}${pratStr}${divStr}${bordaStr}`;
    }
    case "tipoU": {
      return `${q}U${dims.L}x${dims.P}${skuCor}${fixacao==="supInv"?"-SI":""}${bordaStr}`;
    }
    case "portaQ":
    case "prateleira": {
      // Esmalte tem SKU próprio: SMT
      if (prod.id === "esmalte") {
        return `${q}SMT${dims.L}${skuCor}${bordaStr}`;
      }
      const L = dims.L || 60;
      const P = dims.P || dims.c || 15;
      const padrao = basepadrao(L);
      const modelo = (dims.b && dims.b > 0) ? "XP" : "NL";
      const fixStr = fixacao === "supInv" ? "-SI" : "-KD";
      const baseStr = P !== padrao ? `-${P}` : "";
      return `${q}${modelo}${L}${baseStr}${skuCor}${fixStr}${bordaStr}`;
    }
    case "revisteiro": {
      const isBarbie = dims.A === 20 && (dims.L === 40 || dims.L === 60) && dims.P === 7;
      return `${q}RV${dims.L}${isBarbie?"B-":""}${skuCor}${bordaStr}`;
    }
    case "tuboSolto": return `${q}TB${dims.L}CM`;
    case "cabideiro":  return `${q}CAB${dims.L}${skuCor}`;
    case "chapa":      return `${q}CHAPA${skuCor}`;
    default:           return "";
  }
}


const FIXOS_DEFAULT = {
  items:[
    {id:1,label:"Aluguel / IPTU",valor:800},
    {id:2,label:"Energia elétrica",valor:350},
    {id:3,label:"Salário / Pró-labore",valor:3000},
    {id:4,label:"Depreciação de máquinas",valor:200},
    {id:5,label:"Contador / Impostos",valor:150},
    {id:6,label:"Internet / Telefone",valor:100},
    {id:7,label:"Outros",valor:0},
  ],
  faturamentoBruto:20000, // R$ faturamento bruto mensal estimado
};

const QUICK_MSGS = [
  "Consigo enviar hoje mesmo! Produto em estoque e pronto para envio. 🚀",
  "Fabricado artesanalmente aqui na nossa marcenaria com MDF de alta qualidade. Ficará incrível! 🪵",
  "Esse modelo tem alta procura! Aproveite que ainda temos em estoque nessa medida. 📦",
  "Produto com ótimas avaliações dos nossos clientes. Qualidade e acabamento garantidos! ⭐",
];

// ═══════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════
const S = {
  wrap:{fontFamily:"Georgia,serif",background:"#f7f3ee",minHeight:"100vh",color:"#2c1810"},
  hdr:{background:"#3d2b1f",color:"#f7e8d4",padding:"13px 18px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,.4)"},
  hT:{fontSize:19,fontWeight:"bold",letterSpacing:".5px"},
  hS:{fontSize:11,color:"#c8a882",letterSpacing:1.5,textTransform:"uppercase"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10,padding:13},
  card:{background:"#fff",borderRadius:12,padding:"13px 10px",cursor:"pointer",border:"2px solid #e8dcd0",transition:"all .2s",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.06)"},
  cardH:{borderColor:"#8b5e3c",boxShadow:"0 4px 14px rgba(139,94,60,.22)",transform:"translateY(-2px)"},
  sec:{background:"#fff",borderRadius:12,margin:"10px 13px",padding:"13px 14px",border:"1px solid #e8dcd0",boxShadow:"0 1px 3px rgba(0,0,0,.05)"},
  secT:{fontSize:12,fontWeight:"bold",textTransform:"uppercase",letterSpacing:1.2,color:"#8b5e3c",marginBottom:11,paddingBottom:5,borderBottom:"1px solid #f0e8e0"},
  lbl:{fontSize:12,color:"#6b5344",marginBottom:3,display:"block",fontWeight:"bold"},
  inp:{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #d4c5b8",fontSize:14,background:"#faf7f4",color:"#2c1810",boxSizing:"border-box"},
  inpBlue:{background:"#e8f4fd",borderColor:"#90caf9"},
  inpSm:{padding:"5px 8px",borderRadius:6,border:"1px solid #d4c5b8",fontSize:13,background:"#faf7f4",color:"#2c1810",width:"100%",boxSizing:"border-box"},
  row:{display:"flex",gap:8,marginBottom:10},
  col:{flex:1},
  tog:{display:"flex",alignItems:"center",gap:8,marginBottom:7,cursor:"pointer",userSelect:"none"},
  tBox:{width:17,height:17,borderRadius:4,border:"2px solid #c4a882",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0},
  tBoxOn:{background:"#8b5e3c",borderColor:"#8b5e3c"},
  cRow:{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"0 10px",padding:"4px 0",borderBottom:"1px solid #f5efe9",fontSize:12,alignItems:"center"},
  cDiv:{margin:"7px 0 3px",padding:"3px 7px",background:"#f5f0e8",borderRadius:4,fontSize:10,fontWeight:"bold",textTransform:"uppercase",letterSpacing:.8,color:"#8b5e3c"},
  cRowB:{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:14,fontWeight:"bold"},
  bigP:{background:"#3d2b1f",color:"#f7e8d4",borderRadius:12,padding:"15px 18px",textAlign:"center",margin:"10px 13px"},
  btn:{padding:"10px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",transition:"all .15s"},
  btnP:{background:"#8b5e3c",color:"#fff"},
  btnS:{background:"#f0e8e0",color:"#3d2b1f"},
  btnC:{background:"#2d6a4f",color:"#fff"},
  btnArr:{background:"#1565c0",color:"#fff"},
  btnSm:{padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold"},
  ta:{width:"100%",minHeight:76,padding:"8px 10px",borderRadius:7,border:"1px solid #d4c5b8",fontSize:13,background:"#faf7f4",color:"#2c1810",resize:"vertical",boxSizing:"border-box"},
  warn:{background:"#fff3cd",border:"1px solid #f0c040",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#7a5800",marginBottom:7},
  info:{background:"#e8f4fd",border:"1px solid #90caf9",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#0d47a1",marginBottom:7},
  ok:{background:"#e8f5e9",border:"1px solid #81c784",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#1b5e20",marginBottom:7},
  std:{background:"#fff8e1",border:"1px solid #ffd54f",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#5d4037",marginBottom:7},
  mkt:{padding:"5px 9px",borderRadius:6,border:"2px solid #d4c5b8",cursor:"pointer",fontSize:11,fontWeight:"bold",background:"transparent",transition:"all .15s",color:"#2c1810"},
  mktS:{borderColor:"#8b5e3c",background:"#8b5e3c",color:"#fff"},
  fix:{padding:"6px 10px",borderRadius:8,border:"2px solid #d4c5b8",cursor:"pointer",fontSize:11,background:"transparent",transition:"all .15s",color:"#2c1810",textAlign:"left",lineHeight:1.4},
  fixS:{borderColor:"#8b5e3c",background:"#fff8f4",color:"#5a2d0c"},
  chip:{padding:"5px 12px",borderRadius:20,border:"2px solid #d4c5b8",cursor:"pointer",fontSize:12,fontWeight:"bold",background:"transparent",transition:"all .15s"},
  emb:{background:"#f5f0e8",borderRadius:7,padding:"9px 11px",fontSize:12,marginBottom:8},
  rBox:{background:"#3d2b1f",color:"#f7e8d4",borderRadius:10,padding:"12px 16px",margin:"10px 0 4px"},
  fRow:{display:"grid",gridTemplateColumns:"1fr 120px 32px",gap:6,alignItems:"center",marginBottom:6},
  qBtn:{padding:"6px 10px",borderRadius:6,border:"1px solid #d4c5b8",cursor:"pointer",fontSize:11,background:"#f0fdf4",color:"#1b5e20",textAlign:"left",lineHeight:1.4,transition:"all .15s"},
  cartBadge:{position:"absolute",top:-5,right:-5,background:"#c0392b",color:"#fff",borderRadius:10,fontSize:10,fontWeight:"bold",padding:"1px 5px",minWidth:16,textAlign:"center"},
};

// ═══════════════════════════════════════════════════════════════════
// COST TABLE
// ═══════════════════════════════════════════════════════════════════
function CostTable({ items, qty }) {
  const cats = [{key:"mat",label:"Materiais e Produção"},{key:"fix",label:"Fixação / Acessórios"},{key:"emb",label:"Embalagem"}];
  return (
    <>
      {cats.map(({key,label}) => {
        const g = items.filter(i=>i.cat===key&&i.q>0.0001);
        if (!g.length) return null;
        return (
          <div key={key}>
            <div style={S.cDiv}>{label}</div>
            {g.map((item,idx) => {
              const c = item._valor !== undefined ? item._valor * qty : (item.useBordaUc?ucBorda(item.k):uc(item.k))*item.q*qty;
              if (c<0.001) return null;
              return (
                <div key={idx} style={S.cRow}>
                  <span style={{color:"#5a4434"}}>{item.label}</span>
                  <span style={{color:"#7a6555",textAlign:"right",fontSize:11}}>{fmtQty(item.k,item.q*qty)}</span>
                  <span style={{fontWeight:"500",textAlign:"right"}}>{R$(c)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TELA CUSTOS FIXOS + MATÉRIA PRIMA
// ═══════════════════════════════════════════════════════════════════
function FixosScreen({ config, matPrecos, onSave, onBack }) {
  const [tab, setTab]     = useState("fixos");
  const [items, setItems] = useState(config.items.map(i=>({...i})));
  const [fat, setFat]     = useState(config.faturamentoBruto||20000);
  const [saved, setSaved] = useState(false);
  const [localMat, setLocalMat] = useState(() => {
    const r={};
    Object.keys(MAT).forEach(k=>{r[k]={c:matPrecos[k]?.c??MAT[k].c,qty:matPrecos[k]?.qty??MAT[k].qty};});
    return r;
  });
  const total       = items.reduce((s,i)=>s+(parseFloat(i.valor)||0),0);
  const overheadPct = fat>0 ? (total/parseFloat(fat))*100 : 0;
  const alertaAlto     = overheadPct > 35;
  const alertaSaudavel = overheadPct > 0 && overheadPct <= 25;
  const upd    = (id,f,v) => setItems(its=>its.map(i=>i.id===id?{...i,[f]:v}:i));
  const updMat = (k,f,v)  => setLocalMat(m=>({...m,[k]:{...m[k],[f]:parseFloat(v)||0}}));
  const save = () => {
    onSave(
      {items:items.map(i=>({...i,valor:parseFloat(i.valor)||0})),faturamentoBruto:parseFloat(fat)||1},
      localMat
    );
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  const tabStyle = (t) => ({
    flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontWeight:"bold",fontSize:13,
    borderBottom:tab===t?"3px solid #8b5e3c":"3px solid transparent",
    background:tab===t?"#fff8f4":"#f0e8e0",color:tab===t?"#8b5e3c":"#7a6555",transition:"all .15s",
  });

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#f7e8d4",cursor:"pointer",fontSize:22,padding:0}}>←</button>
        <span style={{fontSize:22}}>⚙️</span>
        <div><div style={S.hT}>Configurações</div><div style={S.hS}>Fixos e Matéria Prima</div></div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",margin:"10px 13px 0",borderRadius:"10px 10px 0 0",overflow:"hidden",border:"1px solid #e8dcd0"}}>
        <button style={tabStyle("fixos")} onClick={()=>setTab("fixos")}>💰 Custos Fixos</button>
        <button style={tabStyle("materiais")} onClick={()=>setTab("materiais")}>🪵 Matéria Prima</button>
      </div>

      {tab==="fixos" && (
        <>
          <div style={{...S.sec,borderRadius:"0 0 12px 12px",marginTop:0}}>
            <div style={S.secT}>📋 Gastos Mensais Fixos</div>
            {items.map(item=>(
              <div key={item.id} style={S.fRow}>
                <input style={S.inpSm} placeholder="Item" value={item.label} onChange={e=>upd(item.id,"label",e.target.value)}/>
                <input style={{...S.inpSm,textAlign:"right"}} type="number" min="0" step="10" value={item.valor} onChange={e=>upd(item.id,"valor",e.target.value)}/>
                <button onClick={()=>setItems(its=>its.filter(i=>i.id!==item.id))} style={{...S.btnSm,background:"#fde8e8",color:"#c0392b",padding:"5px 8px"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>setItems(its=>[...its,{id:Date.now(),label:"",valor:0}])} style={{...S.btnSm,background:"#f0e8e0",color:"#3d2b1f",width:"100%",marginTop:4,padding:"7px"}}>+ Adicionar item</button>
            <div style={{borderTop:"2px solid #d4c5b8",marginTop:12,paddingTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:"bold",marginBottom:12}}>
                <span>Total fixos mensais</span><span>{R$(total)}</span>
              </div>
              <label style={S.lbl}>Faturamento Bruto Mensal (R$)</label>
              <input style={S.inp} type="number" min="1" step="500" value={fat} onChange={e=>setFat(e.target.value)}/>
              <div style={{fontSize:11,color:"#9a7a65",marginTop:3}}>Média dos últimos 3 meses (todos produtos e canais).</div>
            </div>
          </div>
          <div style={{margin:"0 13px 10px"}}>
            <div style={S.rBox}>
              <div style={{fontSize:11,color:"#c8a882",marginBottom:4,letterSpacing:1.5,textTransform:"uppercase"}}>Overhead sobre cada venda</div>
              <div style={{fontSize:42,fontWeight:"bold",letterSpacing:"-1px"}}>{overheadPct.toFixed(1)}%</div>
              <div style={{fontSize:13,color:"#c8a882",marginTop:4}}>{R$(total)} fixos ÷ {R$(parseFloat(fat)||0)} faturamento</div>
              <div style={{fontSize:12,color:"#a88a6a",marginTop:4}}>Ex: produto de R$100 → {R$(total/(parseFloat(fat)||1)*100)} cobertos pelos fixos</div>
            </div>
            {alertaSaudavel && <div style={{...S.ok,marginTop:0}}>✅ Overhead saudável (abaixo de 25%).</div>}
            {alertaAlto && <div style={{...S.warn,marginTop:0}}>⚠️ Acima de 35% — fixos pesados em relação ao faturamento.</div>}
            <div style={{...S.info,marginTop:8}}>💡 Esse % entra direto na fórmula do preço junto com a taxa do marketplace e a margem de lucro.</div>
          </div>
        </>
      )}

      {tab==="materiais" && (
        <div style={{...S.sec,borderRadius:"0 0 12px 12px",marginTop:0}}>
          <div style={S.secT}>🪵 Preços de Matéria Prima</div>
          <div style={{...S.info,marginBottom:10}}>Atualize conforme suas compras. Itens alterados ficam marcados com ✏️.</div>
          {MAT_GRUPOS.map(grupo=>(
            <div key={grupo.label} style={{marginBottom:14}}>
              <div style={S.cDiv}>{grupo.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 65px 32px 88px 70px",gap:"0 5px",padding:"2px 0 5px",borderBottom:"1px solid #e8dcd0",marginBottom:3}}>
                {["Item","Qtd/Emb","Un","R$ Embal.","Custo/un"].map((h,i)=>(
                  <span key={i} style={{fontSize:10,fontWeight:"bold",color:"#8b5e3c",textAlign:i>0?"right":"left"}}>{h}</span>
                ))}
              </div>
              {grupo.keys.map(k=>{
                const lm = localMat[k]||{c:MAT[k]?.c||0,qty:MAT[k]?.qty||1};
                if (!MAT[k]) return null;
                const custUn = lm.c/(lm.qty||1);
                const changed = lm.c!==(MAT[k]?.c||0) || lm.qty!==(MAT[k]?.qty||1);
                return (
                  <div key={k} style={{display:"grid",gridTemplateColumns:"1fr 65px 32px 88px 70px",gap:"0 5px",padding:"3px 0",borderBottom:"1px solid #f5efe9",alignItems:"center"}}>
                    <span style={{fontSize:11,color:changed?"#8b5e3c":"#5a4434",fontWeight:changed?"bold":"normal"}}>{MAT[k].n}{changed?" ✏️":""}</span>
                    <input style={{...S.inpSm,textAlign:"right",padding:"3px 4px",fontSize:11}} type="number" min="0.001" step="any" value={lm.qty} onChange={e=>updMat(k,"qty",e.target.value)}/>
                    <span style={{fontSize:10,color:"#9a7a65",textAlign:"right"}}>{MAT[k].u}</span>
                    <input style={{...S.inpSm,textAlign:"right",padding:"3px 4px",fontSize:11,background:changed?"#fff8e1":"#faf7f4"}} type="number" min="0" step="0.01" value={lm.c} onChange={e=>updMat(k,"c",e.target.value)}/>
                    <span style={{fontSize:11,fontWeight:"bold",color:"#2d6a4f",textAlign:"right"}}>{R$(custUn)}</span>
                  </div>
                );
              })}
            </div>
          ))}
          <button onClick={()=>setLocalMat(()=>{const r={};Object.keys(MAT).forEach(k=>{r[k]={c:MAT[k].c,qty:MAT[k].qty}});return r;})} style={{...S.btnSm,background:"#fde8e8",color:"#c0392b",width:"100%",padding:"7px",marginTop:6}}>↺ Restaurar preços padrão</button>
        </div>
      )}

      <div style={{padding:"10px 13px 28px"}}>
        <button style={{...S.btn,...S.btnP,width:"100%"}} onClick={save}>{saved?"✅ Salvo!":"💾 Salvar Configuração"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════
function HomeScreen({ onSelect, onFixos, overheadPct, cartCount, onCart }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <span style={{fontSize:26}}>🪵</span>
        <div style={{flex:1}}><div style={S.hT}>Pabimi · Orçamentos</div><div style={S.hS}>Marcenaria · Capela do Alto-SP</div></div>
        <button onClick={onCart} style={{position:"relative",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#f7e8d4",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,marginRight:6}}>
          🛒{cartCount>0&&<span style={S.cartBadge}>{cartCount}</span>}
        </button>
        <button onClick={onFixos} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#f7e8d4",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13}}>⚙️ Fixos</button>
      </div>
      <div style={{margin:"10px 13px 0",background:"#fff",borderRadius:10,padding:"10px 14px",border:"1px solid #e8dcd0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"#8b5e3c",fontWeight:"bold",textTransform:"uppercase",letterSpacing:1}}>Overhead sobre cada venda</div>
          <div style={{fontSize:22,fontWeight:"bold",color:"#3d2b1f"}}>{overheadPct.toFixed(1)}%</div>
          <div style={{fontSize:11,color:"#7a6555"}}>do faturamento bruto cobre os fixos</div>
        </div>
        <button onClick={onFixos} style={{fontSize:11,color:"#8b5e3c",background:"#f5f0e8",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontWeight:"bold"}}>Ajustar →</button>
      </div>
      <div style={{padding:"11px 13px 5px",fontSize:13,color:"#7a6555"}}>Selecione o produto:</div>
      <div style={S.grid}>
        {PRODS.map(p=>(
          <div key={p.id} style={{...S.card,...(hov===p.id?S.cardH:{})}} onClick={()=>onSelect(p)} onMouseEnter={()=>setHov(p.id)} onMouseLeave={()=>setHov(null)}>
            <div style={{fontSize:33,marginBottom:6}}>{p.emoji}</div>
            <div style={{fontWeight:"bold",fontSize:13,color:"#2c1810",marginBottom:3}}>{p.name}</div>
            <div style={{fontSize:11,color:"#7a6555"}}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUOTE SCREEN
// ═══════════════════════════════════════════════════════════════════
function QuoteScreen({ prod, overheadPct, onBack, onAnuncio, onAddToCart, cartCount, cartTotal, onPlanoCorteTubo }) {
  const isPortaQ  = prod.calcId === "portaQ";
  const isTubo    = prod.calcId === "tuboSolto";
  const isRevist  = prod.calcId === "revisteiro";
  const isPrat    = prod.calcId === "prateleira";
  const isNicho   = prod.calcId === "nicho";
  const isRevenda = prod.calcId === "revenda";
  const isTipoU   = prod.calcId === "tipoU";

  const [dims, setDims]   = useState({...prod.dims});
  const [cor, setCor]     = useState(prod.fixCor||"branco");
  const [cfg, setCfg]     = useState({fundo:false,prat:0,div:0,bdDupla:false,tubo:true,barraProtecao:false,barraAntiQueda:false,tipoTubo:"oval",pesoKg:0.3,tipoEmb:"saquinho",revendaItens:[{id:1,nome:"",qty:1,custo:0}]});
  const [qty, setQty]     = useState(1);
  const [montado, setMon] = useState(!isTubo && !isRevist && !isPrat && !isTipoU);
  const [fixacao, setFix] = useState(isPrat ? "supInv" : "bucha6");
  const [dific, setDific] = useState(0);
  const [margemPerda,setMP] = useState(3);
  const [margemLucro,setML] = useState(20);
  const [bordaCor, setBordaCor] = useState(() => bordaDefault(prod.fixCor||"branco"));
  const [bordaCustom, setBordaCustom] = useState("");
  const mkt_init = "ml_clas";
  const [mkt,setMkt]      = useState(mkt_init);
  const [inclFrete,setIF] = useState(true);
  const [copyModal, setCopyModal] = useState(null);
  const [precoArr,setArr] = useState(null);
  const [precoSim,setPrecoSim] = useState(null); // null = usa calculado
  const [aiMsg,setAiMsg]  = useState("");
  const [aiResp,setAiR]   = useState("");
  const [aiLoad,setAiL]   = useState(false);
  const [copied,setCopied]= useState(false);
  const aiRef = useRef(null);

  const D = f => setDims(d=>({...d,...f}));
  const C = f => setCfg(c=>({...c,...f}));
  const corAtiva = prod.fixCor || cor;
  const hasOpt = o => prod.opts.includes(o);

  // Auto-fixação para nichos
  const bom = useMemo(() => {
    const bordaEfetiva = bordaCustom ? "bordaColor" : bordaCusto(bordaCor);
    return calcBOM(prod, dims, {...cfg, _bordaKey: bordaEfetiva}, corAtiva, fixacao, qty);
  }, [prod, dims, cfg, corAtiva, fixacao, qty, bordaCor, bordaCustom]);
  useEffect(() => {
    if (!isNicho) return;
    const sug = autoFixacaoNicho(dims.L, bom.peso, cfg.fundo);
    setFix(sug);
  }, [dims.L, dims.A, dims.P, cfg.fundo, isNicho]); // eslint-disable-line

  // Auto montado/desmontado para nichos: com fundo → montado, sem fundo → desmontado
  // Guarda se o usuário alterou manualmente para não sobrescrever
  const [montadoManual, setMontadoManual] = useState(false);
  useEffect(() => {
    if (!isNicho || montadoManual) return;
    setMon(!!cfg.fundo);
  }, [cfg.fundo, isNicho]); // eslint-disable-line

  // Sync borda default when cor changes
  useEffect(() => { setBordaCor(bordaDefault(corAtiva)); setBordaCustom(""); }, [corAtiva]);

  const embDims = useMemo(() => bom._embDims || calcEmb(dims.L, dims.A||1, dims.P||1, montado, bom.numPecas, prod.calcId, qty, prod.id), [bom, dims, montado, bom.numPecas, prod.calcId, qty, prod.id]);
  const pesoTotal = (bom.peso + embDims.pesoEmb) * qty;

  const costs = useMemo(() => {
    const oh    = overheadPct / 100;
    const lucro = margemLucro / 100;
    const perda = margemPerda / 100;
    const dificFator = 1 + dific / 100;
    const isShopee = mkt === "shopee";
    const isAmazon = mkt === "amazon";
    const taxaPct = (isShopee || isAmazon) ? 0 : (MKTS[mkt].taxa || 0);

    const matCost = bom.items.reduce((s,i)=> {
      if (i._valor !== undefined) return s + i._valor * qty * dificFator;
      return s + (i.useBordaUc?ucBorda(i.k):uc(i.k))*i.q*qty*dificFator;
    }, 0);

    const denom = 1 - perda - oh - taxaPct - lucro;
    if (denom <= 0) return { matCost, ohVal:0, total:matCost, preco:0, frete:0, frInfo:null, taxaVal:0, taxaFixaVal:0, lucroV:0, perdaV:0, margBruta:"0", denom, shopeeDesc:"" };

    const frInfo = (inclFrete&&MKTS[mkt].freteMKT) ? calcFreteML(pesoTotal,embDims.Lemb,embDims.Aemb,embDims.Pemb,matCost/denom) : null;
    const frete  = frInfo?.valor || 0;

    let preco, taxaVal, taxaFixaVal, shopeeDesc = "";

    if (isShopee) {
      let p = (matCost + frete) / denom;
      for (let i = 0; i < 10; i++) {
        const c = shopeeComissao(p);
        const d = 1 - oh - c.pct - perda - lucro;
        if (d <= 0) break;
        const pNovo = (matCost + frete + c.fixo) / d;
        if (Math.abs(pNovo - p) < 0.001) { p = pNovo; break; }
        p = pNovo;
      }
      preco = p;
      const c = shopeeComissao(preco);
      taxaFixaVal = c.fixo;
      taxaVal = preco * c.pct + c.fixo;
      shopeeDesc = c.desc;
    } else if (isAmazon) {
      let p = (matCost + frete) / denom;
      for (let i = 0; i < 10; i++) {
        const c = amazonComissao(p);
        const d = 1 - oh - c.pct - perda - lucro;
        if (d <= 0) break;
        const pNovo = (matCost + frete + c.fixo) / d;
        if (Math.abs(pNovo - p) < 0.001) { p = pNovo; break; }
        p = pNovo;
      }
      preco = p;
      const c = amazonComissao(preco);
      taxaFixaVal = c.fixo;
      taxaVal = preco * c.pct + c.fixo;
      shopeeDesc = c.desc;
    } else {
      preco = (matCost + frete + (MKTS[mkt].taxaFixa||0)) / denom;
      taxaFixaVal = MKTS[mkt].taxaFixa || 0;
      taxaVal = preco * taxaPct + taxaFixaVal;
    }

    const ohVal   = preco * oh;
    const lucroV  = preco * lucro;
    const perdaV  = preco * perda;
    const margBruta = ((preco - matCost) / preco * 100).toFixed(1);

    return { matCost, ohVal, total:matCost+ohVal, preco, frete, frInfo, taxaVal, taxaFixaVal, lucroV, perdaV, margBruta, denom, shopeeDesc };
  },[bom,qty,overheadPct,dific,margemPerda,margemLucro,mkt,inclFrete,pesoTotal,embDims]);

  const fixAtiva = FIXACAO[fixacao];
  const pesadoAlert = pesoTotal > 10;
  const grandeAlert = Math.max(dims.L||0, dims.A||0, dims.P||0) > 90;

  async function genAI() {
    if (!aiMsg.trim()) return;
    setAiL(true); setAiR("");
    const fx  = FIXACAO[fixacao];
    const medidas = isRevenda ? (cfg.descricao||prod.name) : `${dims.L}×${dims.A||"—"}×${dims.P||"—"}cm (L×A×P)`;
    const fundoStr = hasOpt("fundo") ? (cfg.fundo?"com fundo":"sem fundo") : "";
    const ctx = `Produto: ${prod.name} | ${medidas}${fundoStr?" | "+fundoStr:""} | Cor: ${corAtiva} | Preço: ${R$(precoFinal)} | Peso total: ${pesoTotal.toFixed(1)}kg${fx?.cap?" | Suporta: "+fx.cap:""}`;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
          system:`Você é um vendedor experiente e persuasivo da Pabimi, marcenaria artesanal em MDF de Capela do Alto-SP.

Seu objetivo é FECHAR A VENDA. Responda a pergunta do cliente de forma calorosa, direta e convincente para ML, Shopee ou WhatsApp.

Siga este modelo:
"Olá! [resposta à pergunta com entusiasmo]. [produto] nessa medida [medidas], [com/sem fundo se aplicável], na cor [cor] fica apenas [preço] 😍
[Uma frase de urgência ou benefício: ex: 'Tenho em estoque e consigo enviar hoje!' / 'É feito artesanalmente com MDF de alta qualidade, vai ficar incrível na sua casa!' / 'Esse modelo é um dos mais pedidos aqui!']
Se quiser que eu já gere o link, é só confirmar 👊"

Regras:
- Máximo 5 linhas
- Sempre mencione medidas, cor e preço
- Use 1-2 emojis estratégicos (não exagere)
- Adicione urgência ou benefício real (não invente)
- Tom: amigável, confiante, como quem conhece bem o produto

Contexto do produto: ${ctx}`,
          messages:[{role:"user",content:aiMsg}]})});
      const d = await r.json();
      setAiR(d.content?.map(b=>b.text||"").join("")||"Erro.");
    } catch { setAiR("Erro de conexão."); }
    setAiL(false);
  }

  const precoFinal = precoSim ?? precoArr ?? costs.preco;


  // Helper to render dimension inputs (avoids chained ternaries in JSX)
  const renderDims = () => {
    if (isPortaQ) return (
      <>
        <div style={S.row}>
          <div style={S.col}>
            <label style={S.lbl}>(a) Largura (cm)</label>
            <input style={S.inp} type="number" min="1" value={dims.L} onChange={e=>D({L:parseFloat(e.target.value)||1})}/>
          </div>
          <div style={S.col}>
            <label style={S.lbl}>(b) Barra frontal (cm)</label>
            <input style={S.inp} type="number" min="0" value={dims.b||0} onChange={e=>D({b:parseFloat(e.target.value)||0})} placeholder="0 = sem barra"/>
          </div>
        </div>
        <div style={S.row}>
          <div style={S.col}>
            <label style={S.lbl}>(c) Base profund. (cm)</label>
            <input style={S.inp} type="number" min="1" value={dims.c||8} onChange={e=>D({c:parseFloat(e.target.value)||8})}/>
          </div>
          <div style={S.col}>
            <label style={S.lbl}>(d) Parte de trás (cm)</label>
            <input style={S.inp} type="number" min="0" value={dims.d||0} onChange={e=>D({d:parseFloat(e.target.value)||0})} placeholder="0 = sem trás"/>
          </div>
          <div style={S.col}>
            <label style={S.lbl}>Qtde</label>
            <input style={S.inp} type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)}/>
          </div>
        </div>
        {!dims.b && <div style={{...S.info,marginBottom:7}}>Sem barra frontal: fita de borda na frente e laterais.</div>}
      </>
    );
    if (isTubo) return (
      <>
        <div style={S.row}>
          <div style={S.col}>
            <label style={S.lbl}>Comprimento (cm)</label>
            <input style={S.inp} type="number" min="1" value={dims.L} onChange={e=>D({L:parseFloat(e.target.value)||1})}/>
          </div>
          <div style={S.col}>
            <label style={S.lbl}>Qtde</label>
            <input style={S.inp} type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)}/>
          </div>
        </div>
        <div style={{marginBottom:10}}>
          <label style={S.lbl}>Tipo de tubo</label>
          <div style={{display:"flex",gap:8}}>
            {[["oval","Oval"],["redondo","Redondo"]].map(([v,l])=>(
              <button key={v} onClick={()=>C({tipoTubo:v})} style={{...S.chip,background:cfg.tipoTubo===v?"#8b5e3c":"transparent",color:cfg.tipoTubo===v?"#fff":"#2c1810",borderColor:cfg.tipoTubo===v?"#8b5e3c":"#d4c5b8"}}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={onPlanoCorteTubo} style={{...S.btn,background:"#1565c0",color:"#fff",width:"100%",fontSize:13}}>
          ✂️ Plano de Corte de Tubos
        </button>
      </>
    );
    return (
      <>
        <div style={S.row}>
          {isPrat ? (
            <>
              <div style={S.col}><label style={S.lbl}>Largura (cm)</label><input style={S.inp} type="number" min="1" value={dims.L} onChange={e=>D({L:parseFloat(e.target.value)||1})}/></div>
              <div style={S.col}><label style={S.lbl}>Profund. (cm)</label><input style={S.inp} type="number" min="1" value={dims.P} onChange={e=>D({P:parseFloat(e.target.value)||1})}/></div>
            </>
          ) : (
            <>
              <div style={S.col}>
                <label style={S.lbl}>Largura (cm)</label>
                {isRevist && (
                  <div style={{display:"flex",gap:4,marginBottom:4}}>
                    {[40,50,60].map(v=>(
                      <button key={v} onClick={()=>D({L:v})} style={{...S.btnSm,padding:"2px 8px",fontSize:11,
                        background:dims.L===v?"#8b5e3c":"#f0e8e0",color:dims.L===v?"#fff":"#2c1810"}}>{v}cm</button>
                    ))}
                  </div>
                )}
                <input style={S.inp} type="number" min="1" value={dims.L} onChange={e=>D({L:parseFloat(e.target.value)||1})}/>
              </div>
              <div style={S.col}>
                <label style={S.lbl}>Altura (cm)</label>
                <input style={{...S.inp,...((isRevist||isTipoU)&&dims.A===10?S.inpBlue:{})}} type="number" min="1" value={dims.A} onChange={e=>D({A:parseFloat(e.target.value)||1})}/>
              </div>
              <div style={S.col}>
                <label style={S.lbl}>Profund. (cm)</label>
                <input style={{...S.inp,...(isRevist&&dims.P===10?S.inpBlue:{})}} type="number" min="1" value={dims.P} onChange={e=>D({P:parseFloat(e.target.value)||1})}/>
              </div>
            </>
          )}
          <div style={S.col}><label style={S.lbl}>Qtde</label><input style={S.inp} type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)}/></div>
        </div>
        {bom.std && (
          <div style={S.std}>Largura padrão ({dims.L}cm) — tiras prontas com borda.{bom.economiaTotal>0.01?` Economia: ${R$(bom.economiaTotal*qty)} vs personalizado.`:""}</div>
        )}
      </>
    );
  };

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#f7e8d4",cursor:"pointer",fontSize:22,padding:0,lineHeight:1}}>←</button>
        <span style={{fontSize:22}}>{prod.emoji}</span>
        <div style={{flex:1}}><div style={S.hT}>{prod.name}</div><div style={S.hS}>{prod.desc}</div></div>
        <button onClick={()=>{
          const sku = gerarSKU(prod,dims,cfg,corAtiva,fixacao,qty,bordaCustom||bordaCor);
          onAddToCart({
            nome: prod.name, sku, preco: precoFinal,
            desc: `${dims.L}×${dims.A||"—"}×${dims.P||"—"}cm · ${corAtiva}${cfg.fundo?" · c/fundo":""}`,
            pesoTotal, embL:embDims.Lemb, embA:embDims.Aemb, embP:embDims.Pemb,
          });
        }} style={{position:"relative",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#f7e8d4",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13}}>
          🛒 +{cartCount>0&&<span style={S.cartBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* CONFIGURAÇÃO */}
      <div style={S.sec}>
        <div style={S.secT}>⚙️ Configuração</div>

        {/* REVENDA: painel especial */}
        {isRevenda ? (
          <>
            <div style={{...S.info, marginBottom:12}}>
              🔥 Informe as peças e quantidades. O app calcula o preço de venda para cada canal.
            </div>

            {/* Lista de itens */}
            <div style={{marginBottom:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 56px 80px 28px",gap:"0 5px",padding:"3px 0 5px",borderBottom:"1px solid #e8dcd0",marginBottom:4}}>
                {["Descrição da peça","Qtd","R$ unit.",""].map((h,i)=>(
                  <span key={i} style={{fontSize:10,fontWeight:"bold",color:"#8b5e3c",textAlign:i>0?"right":"left"}}>{h}</span>
                ))}
              </div>
              {(cfg.revendaItens||[]).map((item)=>(
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 56px 80px 28px",gap:"0 5px",marginBottom:5,alignItems:"center"}}>
                  <input style={S.inpSm} placeholder="Ex: Grelha 4 bocas" value={item.nome}
                    onChange={e=>C({revendaItens:cfg.revendaItens.map(x=>x.id===item.id?{...x,nome:e.target.value}:x)})}/>
                  <input style={{...S.inpSm,textAlign:"right"}} type="number" min="1" value={item.qty}
                    onChange={e=>C({revendaItens:cfg.revendaItens.map(x=>x.id===item.id?{...x,qty:parseFloat(e.target.value)||0}:x)})}/>
                  <input style={{...S.inpSm,textAlign:"right"}} type="number" min="0" step="0.01" placeholder="0,00" value={item.custo||""}
                    onChange={e=>C({revendaItens:cfg.revendaItens.map(x=>x.id===item.id?{...x,custo:parseFloat(e.target.value)||0}:x)})}/>
                  <button onClick={()=>C({revendaItens:cfg.revendaItens.filter(x=>x.id!==item.id)})}
                    style={{...S.btnSm,background:"#fde8e8",color:"#c0392b",padding:"4px 6px",fontSize:11}}>✕</button>
                </div>
              ))}
              <button
                onClick={()=>C({revendaItens:[...(cfg.revendaItens||[]),{id:Date.now(),nome:"",qty:1,custo:0}]})}
                style={{...S.btnSm,background:"#f0e8e0",color:"#3d2b1f",width:"100%",padding:"6px",marginTop:2}}>
                + Adicionar peça
              </button>
            </div>

            {/* Custo total das peças */}
            {(cfg.revendaItens||[]).some(i=>i.custo>0) && (
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 8px",background:"#f5f0e8",borderRadius:6,marginBottom:10,fontSize:13,fontWeight:"bold"}}>
                <span>Total das peças</span>
                <span>{R$((cfg.revendaItens||[]).reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.custo)||0),0))}</span>
              </div>
            )}

            {/* Peso e embalagem */}
            <div style={S.row}>
              <div style={{...S.col, maxWidth:120}}>
                <label style={S.lbl}>Peso total (g)</label>
                <input style={S.inp} type="number" min="1" step="10"
                  value={Math.round((cfg.pesoKg||0.3)*1000)}
                  onChange={e=>C({pesoKg:(parseFloat(e.target.value)||300)/1000})}/>
              </div>
              <div style={S.col}>
                <label style={S.lbl}>Embalagem</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {Object.entries(EMB_FOGAO).map(([k,v])=>(
                    <button key={k} onClick={()=>C({tipoEmb:k})} style={{...S.chip,fontSize:11,padding:"4px 10px",
                      background:(cfg.tipoEmb||"saquinho")===k?"#8b5e3c":"transparent",
                      color:(cfg.tipoEmb||"saquinho")===k?"#fff":"#2c1810",
                      borderColor:(cfg.tipoEmb||"saquinho")===k?"#8b5e3c":"#d4c5b8"}}>{v.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Qtde */}
            <div style={{...S.col, maxWidth:120}}>
              <label style={S.lbl}>Qtde de pedidos</label>
              <input style={S.inp} type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)}/>
            </div>
          </>
        ) : (
          <>
            {renderDims()}
          </>
        )}

        {/* Cor */}
        {prod.cores && (
          <div style={{marginBottom:12}}>
            <label style={S.lbl}>Cor / Material</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {CORES.filter(c=>c.id!=="customCor").map(c=>(
                <button key={c.id} onClick={()=>setCor(c.id)} style={{...S.chip,background:cor===c.id?c.bg:"transparent",color:cor===c.id?(c.text||"#1a1a1a"):"#2c1810",borderColor:cor===c.id?(c.border||c.bg):"#d4c5b8"}}>{c.label}</button>
              ))}
              {/* Cor customizada */}
              <input
                style={{...S.inp,width:90,padding:"4px 8px",fontSize:12,borderColor:cor==="customCor"?"#8b5e3c":"#d4c5b8",background:cor==="customCor"?"#fff8f4":"#faf7f4"}}
                placeholder="Outra cor..."
                value={cor==="customCor" ? (cfg.corCustomLabel||"") : ""}
                onFocus={()=>setCor("customCor")}
                onChange={e=>{ setCor("customCor"); C({corCustomLabel:e.target.value}); }}
              />
            </div>
            {(corAtiva==="amadeirado"||corAtiva==="amadeiradoE") && <div style={{...S.warn,marginTop:7}}>⚠️ Cor amadeirada — perda +{Math.round((PERDA_K[corAtiva]||1.18)*100-100)}% (sobras difíceis de reaproveitar).</div>}
            {/* Fita de Borda — sempre visível */}
            {corAtiva !== "cru" && (
              <div style={{marginTop:8}}>
                <label style={S.lbl}>Fita de Borda</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  {BORDA_CORES.map(bc=>(
                    <button key={bc.id} onClick={()=>{setBordaCor(bc.id);setBordaCustom("");}} style={{
                      ...S.chip, fontSize:11, padding:"4px 10px",
                      background: bordaCor===bc.id && !bordaCustom ? (bc.bg||"#8b5e3c") : "transparent",
                      color: bordaCor===bc.id && !bordaCustom ? (bc.text||"#1a1a1a") : "#2c1810",
                      borderColor: bordaCor===bc.id && !bordaCustom ? (bc.bg||"#8b5e3c") : "#d4c5b8",
                    }}>{bc.label}</button>
                  ))}
                  <input
                    style={{...S.inp,width:90,padding:"4px 8px",fontSize:12,borderColor:bordaCustom?"#8b5e3c":"#d4c5b8",background:bordaCustom?"#fff8f4":"#faf7f4"}}
                    placeholder="Outra..."
                    value={bordaCustom}
                    onChange={e=>{ setBordaCustom(e.target.value.toUpperCase()); setBordaCor(""); }}
                  />
                </div>
                {bordaCustom && <div style={{fontSize:11,color:"#8b5e3c",marginTop:3}}>Cor personalizada: <strong>{bordaCustom}</strong> — custo de fita colorida aplicado.</div>}
              </div>
            )}
            {corAtiva==="cru" && <div style={{...S.info,marginTop:7}}>ℹ️ MDF Crú — sem fita de borda por padrão.</div>}
          </div>
        )}

        {/* Opções toggle */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 16px",marginBottom:6}}>
          {hasOpt("fundo")&&<label style={S.tog} onClick={()=>C({fundo:!cfg.fundo})}><div style={{...S.tBox,...(cfg.fundo?S.tBoxOn:{})}}>{cfg.fundo&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div><span style={{fontSize:13}}>Com fundo (MDF 15mm)</span></label>}
          {hasOpt("bdDupla")&&<label style={S.tog} onClick={()=>C({bdDupla:!cfg.bdDupla})}><div style={{...S.tBox,...(cfg.bdDupla?S.tBoxOn:{})}}>{cfg.bdDupla&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div><span style={{fontSize:13}}>Borda dos 2 lados</span></label>}
          {hasOpt("tubo")&&<label style={S.tog} onClick={()=>C({tubo:!cfg.tubo})}><div style={{...S.tBox,...(cfg.tubo?S.tBoxOn:{})}}>{cfg.tubo&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div><span style={{fontSize:13}}>Tubo cabideiro</span></label>}
          {hasOpt("barraProtecao")&&<label style={S.tog} onClick={()=>C({barraProtecao:!cfg.barraProtecao})}><div style={{...S.tBox,...(cfg.barraProtecao?S.tBoxOn:{})}}>{cfg.barraProtecao&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div><span style={{fontSize:13}}>2 barras de proteção</span></label>}
          {hasOpt("barraAntiQueda")&&<label style={S.tog} onClick={()=>C({barraAntiQueda:!cfg.barraAntiQueda})}><div style={{...S.tBox,...(cfg.barraAntiQueda?S.tBoxOn:{})}}>{cfg.barraAntiQueda&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div><span style={{fontSize:13}}>Barra anti-queda</span></label>}
        </div>
        <div style={S.row}>
          {hasOpt("prat")&&<div style={S.col}><label style={S.lbl}>Prateleiras</label><input style={S.inp} type="number" min="0" max="10" value={cfg.prat} onChange={e=>C({prat:parseInt(e.target.value)||0})}/></div>}
          {hasOpt("div")&&<div style={S.col}><label style={S.lbl}>Divisórias</label><input style={S.inp} type="number" min="0" max="10" value={cfg.div} onChange={e=>C({div:parseInt(e.target.value)||0})}/></div>}
        </div>

        {/* Envio montado/desmontado (exceto tubo, revisteiro, portaQ, prateleira) */}
        {!isTubo && !isRevist && !isPortaQ && !isPrat && !isRevenda && (
          <div style={{marginBottom:6}}>
            <label style={S.lbl}>Envio {isNicho && !montadoManual ? <span style={{fontSize:10,color:"#8b5e3c"}}> (auto)</span> : isNicho ? <span style={{fontSize:10,color:"#9a7a65"}}> (manual)</span> : null}</label>
            <div style={{display:"flex",gap:8}}>
              {[["false","📦 Desmontado"],["true","🛋️ Montado"]].map(([v,l])=>(
                <button key={v} onClick={()=>{setMon(v==="true");if(isNicho)setMontadoManual(true);}} style={{...S.chip,background:String(montado)===v?"#8b5e3c":"transparent",color:String(montado)===v?"#fff":"#2c1810",borderColor:String(montado)===v?"#8b5e3c":"#d4c5b8"}}>{l}</button>
              ))}
              {isNicho && montadoManual && (
                <button onClick={()=>{ setMontadoManual(false); setMon(!!cfg.fundo); }} style={{...S.btnSm,background:"#f0e8e0",color:"#8b5e3c",fontSize:11,padding:"4px 8px"}}>↺ auto</button>
              )}
            </div>
          </div>
        )}

        {/* Info embalagem + alertas — só para produtos não-revenda */}
        {!isRevenda && (<>
          <div style={S.emb}>
            <strong>📐 Embalagem:</strong> {embDims.Lemb}×{embDims.Aemb}×{embDims.Pemb} cm
            · {bom.numPecas} peça(s) · ≈ {(bom.peso+embDims.pesoEmb).toFixed(2)} kg
            {embDims.nCaixasOvo > 1 && <span style={{color:"#8b4513"}}> · 📦 {embDims.nCaixasOvo} caixas de ovo</span>}
            {costs.frInfo?.cubico && <span style={{color:"#8b4513"}}> · ⚖️ Peso cubado</span>}
          </div>

          {/* Bloco capacidade vinil */}
          {(prod.id==="vinil"||prod.id==="nicho-vinil") && (() => {
            const cv = calcCapacidadeVinil(dims.L, dims.P, dims.A, cfg.prat, cfg.div);
            return (
              <div style={{background:"#f0f7ff",border:"1px solid #90caf9",borderRadius:8,padding:"10px 12px",marginBottom:8,fontSize:12}}>
                <div style={{fontWeight:"bold",color:"#0d47a1",marginBottom:6}}>🎵 Capacidade de Discos LP (32cm × 32cm)</div>
                {!cv.profOk && (
                  <div style={{...S.warn,marginBottom:6}}>⚠️ Profundidade {dims.P}cm abaixo do mínimo recomendado ({cv.profMinLP}cm) para LP com sleeve. Aumente para P ≥ 33cm.</div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:6}}>
                  <div style={{textAlign:"center",background:"#fff",borderRadius:6,padding:"6px 4px"}}>
                    <div style={{fontSize:18,fontWeight:"bold",color:"#2d6a4f"}}>{cv.comfTotal}</div>
                    <div style={{fontSize:10,color:"#5a4434"}}>💚 Confortável</div>
                    <div style={{fontSize:9,color:"#9a7a65"}}>10mm/disco</div>
                  </div>
                  <div style={{textAlign:"center",background:"#fff",borderRadius:6,padding:"6px 4px",border:"2px solid #ffd54f"}}>
                    <div style={{fontSize:18,fontWeight:"bold",color:"#f57f17"}}>{cv.ótimoTotal}</div>
                    <div style={{fontSize:10,color:"#5a4434"}}>⭐ Recomendado</div>
                    <div style={{fontSize:9,color:"#9a7a65"}}>8mm/disco</div>
                  </div>
                  <div style={{textAlign:"center",background:"#fff",borderRadius:6,padding:"6px 4px"}}>
                    <div style={{fontSize:18,fontWeight:"bold",color:"#c0392b"}}>{cv.maxTotal}</div>
                    <div style={{fontSize:10,color:"#5a4434"}}>🔴 Máxima</div>
                    <div style={{fontSize:9,color:"#9a7a65"}}>6mm/disco</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#5a6e8f"}}>
                  {cv.nAreas > 1 ? `${cv.nAreas} compartimentos × ${cv.comfPorPrat} discos (confort.) = ${cv.comfTotal}` : `${dims.L}cm ÷ 10mm/disco = ${cv.comfTotal} LPs confortáveis`}
                </div>
              </div>
            );
          })()}

          {pesadoAlert && <div style={S.warn}>⚠️ Produto pesado ({pesoTotal.toFixed(1)} kg) — verifique limite da transportadora.</div>}
          {grandeAlert && <div style={S.warn}>⚠️ Peça grande — considere agravante de dificuldade abaixo.</div>}
          {isNicho && <div style={{...S.info,marginBottom:0}}>🔩 Fixação auto-sugerida: <strong>{fixAtiva?.n}</strong> baseada no peso e configuração. Ajuste abaixo se necessário.</div>}
        </>)}
      </div>

      {/* FIXAÇÃO */}
      {prod.fixacao && (
        <div style={S.sec}>
          <div style={S.secT}>🔩 Fixação na Parede</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
            {Object.entries(FIXACAO).filter(([k])=> {
              if (prod.id==="esmalte") return k==="bucha6";
              if (isPrat || isPortaQ) return ["nenhuma","bucha6","bucha8","supInv","cadeirinha","maoFrancesa","bicoPapagaio"].includes(k);
              return true;
            }).map(([k,f])=>(
              <button key={k} onClick={()=>setFix(k)} style={{...S.fix,...(fixacao===k?S.fixS:{}),borderColor:fixacao===k?"#8b5e3c":"#d4c5b8"}}>
                <div>{f.emoji} {f.n}</div>
                {f.cap&&<div style={{color:"#2d6a4f",fontSize:11,marginTop:2}}>🏋️ {f.cap}</div>}
              </button>
            ))}
          </div>
          {fixAtiva?.cap && <div style={{...S.ok,marginTop:9}}>✅ <strong>Capacidade:</strong> {fixAtiva.cap} com {fixAtiva.n}. Depende do tipo de parede.</div>}
          {fixacao==="supInv" && (dims.P||dims.c||15) < 7 && (
            <div style={{...S.warn,marginTop:8}}>⚠️ <strong>Base insuficiente para Suporte Invisível!</strong> Mínimo é 7cm (≥ 7cm). Atual: {dims.P||dims.c||15}cm — aumente a profundidade ou troque a fixação.</div>
          )}
        </div>
      )}

      {/* CUSTO DE PRODUÇÃO */}
      <div style={S.sec}>
        <div style={S.secT}>🔩 Custo de Produção — {qty} un.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"0 10px",padding:"3px 0 5px",borderBottom:"2px solid #e8dcd0",marginBottom:2}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"#8b5e3c"}}>ITEM</span>
          <span style={{fontSize:11,fontWeight:"bold",color:"#8b5e3c",textAlign:"right"}}>QUANT.</span>
          <span style={{fontSize:11,fontWeight:"bold",color:"#8b5e3c",textAlign:"right"}}>CUSTO</span>
        </div>
        <CostTable items={bom.items} qty={qty} />
        <div style={{marginTop:8,borderTop:"2px solid #d4c5b8",paddingTop:7}}>
          <div style={S.cRowB}><span>Subtotal Materiais{dific>0?` + agrav. ${dific}%`:""}</span><span>{R$(costs.matCost)}</span></div>
          <div style={{fontSize:11,color:"#9a7a65",marginTop:4}}>💡 Cola inclusa na fita (1 un = 50 m · +{R$(uc("cola")/50)}/m) | Overhead {overheadPct.toFixed(1)}% entra na precificação</div>
        </div>
        <div style={{...S.row,marginTop:10}}>
          <div style={S.col}>
            <label style={S.lbl}>% Margem de Perda</label>
            <input style={S.inp} type="number" min="0" max="30" step=".5" value={margemPerda} onChange={e=>{setMP(parseFloat(e.target.value)||0);setArr(null);setPrecoSim(null);}}/>
          </div>
          <div style={S.col}>
            <label style={S.lbl}>% Agravante dificuldade</label>
            <input style={S.inp} type="number" min="0" max="50" step="5" value={dific} onChange={e=>setDific(parseFloat(e.target.value)||0)}/>
          </div>
        </div>
      </div>

      {/* PRECIFICAÇÃO */}
      <div style={S.sec}>
        <div style={S.secT}>💰 Precificação</div>
        <div style={{marginBottom:11}}>
          <label style={S.lbl}>Canal de Venda</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {Object.entries(MKTS).map(([k,m])=>(
              <button key={k} style={{...S.mkt,...(mkt===k?S.mktS:{})}} onClick={()=>setMkt(k)}>{m.n}</button>
            ))}
          </div>
        </div>

        {MKTS[mkt].freteMKT && (
          <label style={{...S.tog,marginBottom:9}} onClick={()=>{setIF(f=>!f);setArr(null);}}>
            <div style={{...S.tBox,...(inclFrete?S.tBoxOn:{})}}>{inclFrete&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
            <span style={{fontSize:13}}>Frete grátis ML (absorver custo)</span>
          </label>
        )}
        {costs.denom <= 0 && <div style={{...S.warn,marginBottom:8}}>⚠️ A soma de overhead + taxas + lucro + perda ultrapassou 100%. Revise os percentuais.</div>}
        {[
          ["Custo materiais" + (dific>0?` (+ ${dific}% dific.)`:""), R$(costs.matCost), ""],
          [`Overhead fixos (${overheadPct.toFixed(1)}% do preço)`, R$(costs.ohVal), "oh"],
          ...(costs.frete>0?[[`+ Frete ML (${embDims.Lemb}×${embDims.Aemb}×${embDims.Pemb}cm · ${costs.frInfo?.pesoFinal.toFixed(2)}kg${costs.frInfo?.cubico?" cub.":""})`,R$(costs.frete),"frete"]]:[]),
          [`Taxa ${MKTS[mkt].n} (${mkt==="shopee" ? costs.shopeeDesc : (MKTS[mkt].taxa*100).toFixed(0)+"%"+(costs.taxaFixaVal>0?" + R$"+costs.taxaFixaVal.toFixed(0)+" fixo":"")})`,R$(costs.taxaVal),"taxa"],
          [`Margem de perda (${margemPerda}%)`,R$(costs.perdaV||0),"perda"],
          [`Lucro líquido (${margemLucro}%)`,R$(costs.lucroV),"lucro"],
        ].map(([l,v,t],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #f5efe9",fontSize:13,
            color:t==="frete"?"#c0392b":t==="lucro"?"#2d6a4f":t==="oh"?"#1565c0":"inherit"}}>
            <span>{l}</span><span style={{fontWeight:t==="lucro"?"bold":"normal"}}>{v}</span>
          </div>
        ))}
        {costs.frete>0 && <div style={{...S.info,marginTop:7}}>ℹ️ Tabela ML oficial (reputação verde). Faixa de preço calculada automaticamente.</div>}

        {/* Alerta limiar R$79 — compensa subir? */}
        {MKTS[mkt].freteMKT && costs.preco >= 70 && costs.preco < 79 && (
          <div style={{...S.warn,marginTop:8}}>
            💡 <strong>Próximo de R$79!</strong> Acima disso frete grátis rápido — mas você passa a pagar o frete ({R$(calcFreteML(pesoTotal,embDims.Lemb,embDims.Aemb,embDims.Pemb,79).valor)}).
            Avalie se vale subir ou manter abaixo.
          </div>
        )}

        {/* Alerta R$79-95 — compensa BAIXAR para R$78,99? */}
        {MKTS[mkt].freteMKT && (() => {
          const precoCalc = costs.preco;
          if (precoCalc <= 79 || precoCalc > 95) return null;

          // Cenário A: preço atual (acima de R$79, paga frete)
          const freteA = calcFreteML(pesoTotal, embDims.Lemb, embDims.Aemb, embDims.Pemb, precoCalc);
          const sobraA = precoCalc - costs.matCost - costs.ohVal - costs.perdaV - costs.taxaVal - freteA.valor;

          // Cenário B: R$78,99 (abaixo de R$79, frete grátis = R$0)
          const precoB = 78.99;
          const taxaB  = mkt==="shopee" ? taxaEfetivaShopee(precoB) : precoB * (MKTS[mkt].taxa||0) + (MKTS[mkt].taxaFixa||0);
          const perdaB = precoB * (margemPerda/100);
          const sobraB = precoB - costs.matCost - costs.ohVal - perdaB - taxaB;

          const melhor = sobraB > sobraA ? "B" : "A";

          return (
            <div style={{background:"#fff8e1",border:"2px solid #ffd54f",borderRadius:8,padding:"10px 12px",marginTop:8,fontSize:12}}>
              <div style={{fontWeight:"bold",color:"#5d4037",marginBottom:8}}>
                ⚖️ Seu preço está entre R$79–95 — vale baixar para R$78,99?
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background: melhor==="A"?"#e8f5e9":"#fff",borderRadius:6,padding:"8px 10px",border:melhor==="A"?"2px solid #4caf50":"1px solid #e0e0e0"}}>
                  <div style={{fontSize:11,fontWeight:"bold",color:"#2d6a4f",marginBottom:3}}>
                    {melhor==="A"?"✅ ":""}Opção A — {R$(precoCalc)}
                  </div>
                  <div style={{color:"#5a4434",fontSize:11}}>Frete grátis rápido (você paga {R$(freteA.valor)})</div>
                  <div style={{fontSize:13,fontWeight:"bold",color:"#2c1810",marginTop:4}}>Sobra: {R$(sobraA)}</div>
                </div>
                <div style={{background: melhor==="B"?"#e8f5e9":"#fff",borderRadius:6,padding:"8px 10px",border:melhor==="B"?"2px solid #4caf50":"1px solid #e0e0e0"}}>
                  <div style={{fontSize:11,fontWeight:"bold",color:"#2d6a4f",marginBottom:3}}>
                    {melhor==="B"?"✅ ":""}Opção B — R$78,99
                  </div>
                  <div style={{color:"#5a4434",fontSize:11}}>Frete padrão grátis (você paga R$0)</div>
                  <div style={{fontSize:13,fontWeight:"bold",color:"#2c1810",marginTop:4}}>Sobra: {R$(sobraB)}</div>
                </div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:"#7a5800"}}>
                {melhor==="B"
                  ? `💰 Abaixar para R$78,99 rende ${R$(sobraB-sobraA)} a mais por unidade. Compensa!`
                  : `📦 Manter ${R$(precoCalc)} é melhor — o frete rápido vale a pena nesse preço.`}
              </div>
              {melhor==="B" && (
                <button
                  onClick={()=>{ setPrecoSim(78.99); setArr(null); }}
                  style={{...S.btn,background:"#f57f17",color:"#fff",width:"100%",marginTop:8,fontSize:12,padding:"7px"}}>
                  Simular R$78,99
                </button>
              )}
            </div>
          );
        })()}

        {MKTS[mkt].freteMKT && costs.preco >= 15 && costs.preco < 19 && (
          <div style={{...S.warn,marginTop:8}}>
            💡 Acima de R$19 o comprador já tem frete grátis padrão. Considere subir para R$19+.
          </div>
        )}
      </div>

      {/* SKU */}
      {gerarSKU(prod, dims, cfg, corAtiva, fixacao, qty, bordaCustom||bordaCor) && (() => {
        const sku = gerarSKU(prod, dims, cfg, corAtiva, fixacao, qty, bordaCustom||bordaCor);
        const cadCor = getCadeirinhaCor(corAtiva);
        return (
          <div style={{margin:"0 13px 0",background:"#fff",borderRadius:12,padding:"12px 14px",border:"2px solid #e8dcd0",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:11,fontWeight:"bold",textTransform:"uppercase",letterSpacing:1.2,color:"#8b5e3c",marginBottom:8}}>🏷️ SKU do Produto</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,fontFamily:"monospace",fontSize:18,fontWeight:"bold",color:"#2c1810",background:"#f5f0e8",borderRadius:7,padding:"8px 12px",letterSpacing:"1px"}}>
                {sku}
              </div>
              <button onClick={()=>setCopyModal(sku)} style={{...S.btn,...S.btnP,padding:"8px 14px",fontSize:12,flexShrink:0}}>📋 Copiar</button>
            </div>
            {(prod.calcId==="revisteiro"||prod.calcId==="tipoU"||prod.calcId==="portaQ"||prod.calcId==="prateleira") && (
              <div style={{fontSize:11,color:"#7a6555",marginTop:6}}>
                Cadeirinha: <strong>{cadCor}</strong>
                {prod.calcId==="portaQ"||prod.calcId==="prateleira" ? ` · Base: ${dims.P||dims.c||15}cm (padrão ${basepadrao(dims.L||60)}cm)` : ""}
                {bordaCor ? ` · Borda: ${bordaCor}` : ""}
              </div>
            )}
            {fixacao==="supInv" && (dims.P||dims.c||15) < 7 && (
              <div style={{...S.warn,marginTop:6}}>⚠️ SI exige base ≥ 7cm. Atual: {dims.P||dims.c||15}cm.</div>
            )}
          </div>
        );
      })()}

      {/* PREÇO FINAL — compacto com simulação ao lado */}
      <div style={{margin:"10px 13px",display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"stretch"}}>
        {/* Preço calculado */}
        <div style={{background:"#3d2b1f",color:"#f7e8d4",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#c8a882",marginBottom:3}}>
            {precoSim?"SIMULAÇÃO":precoArr?"ARREDONDADO":"CALCULADO"}{qty>1?` · ${qty} UN`:""}
          </div>
          <div style={{fontSize:34,fontWeight:"bold",letterSpacing:"-1px",lineHeight:1}}>{R$(precoFinal)}</div>
          {qty>1 && <div style={{fontSize:13,color:"#c8a882",marginTop:2}}>{R$(precoFinal/qty)}/un</div>}
          <div style={{fontSize:11,color:"#a88a6a",marginTop:7,display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>🏷️ {costs.margBruta}% bruto</span>
            <span>💚 {R$(costs.lucroV)}</span>
          </div>
          {fixAtiva?.cap && prod.fixacao && <div style={{fontSize:11,color:"#c8a882",marginTop:4}}>🏋️ {fixAtiva.cap}</div>}
          {/* Total do carrinho — sempre visível */}
          <div style={{marginTop:10,background:"rgba(255,255,255,.08)",borderRadius:8,padding:"8px 10px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
            <div style={{fontSize:10,color:"#c8a882",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>
              🛒 Total do pedido
            </div>
            {cartCount > 0 ? (
              <>
                <div style={{fontSize:11,color:"#a88a6a",marginBottom:2}}>
                  Carrinho: {R$(cartTotal)} + agora: {R$(precoFinal)}
                </div>
                <div style={{fontSize:20,fontWeight:"bold",color:"#f7e8d4"}}>
                  = {R$(cartTotal + precoFinal)}
                </div>
                <div style={{fontSize:10,color:"#a88a6a",marginTop:2}}>{cartCount} iten{cartCount!==1?"s":""} no carrinho + este</div>
              </>
            ) : (
              <div style={{fontSize:20,fontWeight:"bold",color:"#f7e8d4"}}>
                {R$(precoFinal)}
                {qty > 1 && <span style={{fontSize:11,color:"#a88a6a",marginLeft:6}}>{qty}× {R$(precoFinal/qty)}</span>}
              </div>
            )}
          </div>
          <button
            style={{...S.btn,...S.btnArr,fontSize:11,padding:"6px 12px",marginTop:10,width:"100%"}}
            onClick={()=>{setArr(prev=>prev?null:arredondar(costs.preco));setPrecoSim(null);}}>
            {precoArr ? `↩ Calculado (${R$(costs.preco)})` : `🎯 ${R$(arredondar(costs.preco))}`}
          </button>
        </div>
          {/* Simulação + embalagem */}
          <div style={{background:"#f5f0e8",border:"1px solid #e8dcd0",borderRadius:12,padding:"12px 12px",minWidth:130,display:"flex",flexDirection:"column",gap:8}}>
            {/* Campo simulação: % e valor linkados */}
            <div>
              <div style={{fontSize:10,fontWeight:"bold",color:"#8b5e3c",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>
                🧮 {precoSim?"SIMULAÇÃO":"Lucro"}
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:3}}>
                {/* % Lucro — controla margemLucro diretamente */}
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"#9a7a65",marginBottom:2}}>% Lucro</div>
                  <input
                    style={{...S.inp,fontSize:13,fontWeight:"bold",padding:"5px 6px"}}
                    type="number" min="0" max="99" step="0.5"
                    value={margemLucro}
                    onChange={e=>{ setML(parseFloat(e.target.value)||0); setPrecoSim(null); setArr(null); }}
                  />
                </div>
                <div style={{color:"#9a7a65",fontSize:12,paddingTop:14}}>|</div>
                {/* R$ venda — simula preço fixo */}
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"#9a7a65",marginBottom:2}}>R$ venda</div>
                  <input
                    style={{...S.inp,fontSize:13,fontWeight:"bold",padding:"5px 6px",
                      borderColor:precoSim?"#8b5e3c":"#d4c5b8",
                      background:precoSim?"#fff8f4":"#faf7f4",
                      color:precoSim?"#8b5e3c":"#2c1810"}}
                    type="number" min="0" step="0.10"
                    placeholder={(costs.preco||0).toFixed(2)}
                    value={precoSim!==null?precoSim:""}
                    onChange={e=>{ const v=parseFloat(e.target.value); setPrecoSim(isNaN(v)?null:v); setArr(null); }}
                  />
                </div>
              </div>
              {precoSim && (
                <button onClick={()=>setPrecoSim(null)}
                  style={{...S.btnSm,background:"#f0e8e0",color:"#8b5e3c",width:"100%",padding:"3px",fontSize:10}}>
                  ↩ limpar
                </button>
              )}
            </div>
            {/* Embalagem */}
            <div style={{borderTop:"1px solid #d4c5b8",paddingTop:6}}>
              <div style={{fontSize:10,fontWeight:"bold",color:"#8b5e3c",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>📦 Envio</div>
              <div style={{fontSize:11,color:"#5a4434",lineHeight:1.7}}>
                <div><strong>{embDims.Lemb}</strong> L</div>
                <div><strong>{embDims.Aemb}</strong> A</div>
                <div><strong>{embDims.Pemb}</strong> P</div>
              </div>
              <div style={{borderTop:"1px solid #d4c5b8",paddingTop:4,marginTop:2}}>
                <div style={{fontSize:13,fontWeight:"bold",color:"#2c1810"}}>{pesoTotal.toFixed(2)} kg</div>
                {costs.frInfo?.cubico && <div style={{fontSize:10,color:"#8b4513"}}>⚖️ cubado</div>}
              </div>
            </div>
          </div>
      </div>

      {/* Total do carrinho logo abaixo do preço */}
      {cartCount > 0 && (() => {
        // cartTotal precisa vir do App — passamos via prop onAddToCart mas não temos acesso aqui
        // Usamos cartCount como indicador visual
        return (
          <div style={{margin:"-4px 13px 4px",background:"#2d6a4f",borderRadius:"0 0 10px 10px",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#b7e4c7",fontSize:12}}>🛒 {cartCount} iten{cartCount!==1?"s":""}no carrinho</span>
            <button onClick={()=>{
              const sku = gerarSKU(prod,dims,cfg,corAtiva,fixacao,qty,bordaCustom||bordaCor);
              onAddToCart({
                nome:prod.name, sku, preco:precoFinal,
                desc:`${dims.L}×${dims.A||"—"}×${dims.P||"—"}cm · ${corAtiva}${cfg.fundo?" · c/fundo":""}`,
                pesoTotal, embL:embDims.Lemb, embA:embDims.Aemb, embP:embDims.Pemb,
              });
            }} style={{...S.btnSm,background:"#fff",color:"#2d6a4f",fontSize:12,padding:"4px 10px"}}>
              + Adicionar este item
            </button>
          </div>
        );
      })()}

      {/* IA */}
      <div style={S.sec} ref={aiRef}>
        <div style={S.secT}>🪄 Ferramentas de Venda</div>
        <button style={{...S.btn,background:"#7c3aed",color:"#fff",width:"100%"}} onClick={()=>onAnuncio({prod,dims,cfg,corAtiva,fixacao,precoFinal})}>
          🪄 Criação Mágica de Anúncio
        </button>
      </div>
      <div style={{height:28}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ALGORITMO PLANO DE CORTE (First Fit Decreasing)
// ═══════════════════════════════════════════════════════════════════
const TUBO_CM  = 300;  // tubo padrão 3m
const KERF_MM  = 3.1;  // disco Bosch 3,1mm
const KERF_CM  = KERF_MM / 10;

function otimizarCortes(pedidos) {
  // Best Fit Decreasing — coloca cada peça no tubo onde ela deixa MENOS sobra
  const cortes = [];
  for (const p of pedidos) {
    for (let i = 0; i < p.qtd; i++) cortes.push(p.tamanho);
  }
  cortes.sort((a, b) => b - a);

  const tubos = [];
  for (const corte of cortes) {
    // Encontra o tubo onde a peça encaixa com menor sobra (melhor fit)
    let melhorIdx = -1;
    let melhorSobra = Infinity;
    for (let i = 0; i < tubos.length; i++) {
      const sobra = tubos[i].sobra - corte - KERF_CM;
      if (sobra >= 0 && sobra < melhorSobra) {
        melhorSobra = sobra;
        melhorIdx = i;
      }
    }
    if (melhorIdx !== -1) {
      tubos[melhorIdx].cortes.push(corte);
      tubos[melhorIdx].sobra = melhorSobra;
    } else {
      tubos.push({ cortes:[corte], sobra: TUBO_CM - corte - KERF_CM });
    }
  }
  return tubos;
}

// ═══════════════════════════════════════════════════════════════════
// TELA: PLANO DE CORTE DE TUBOS
// ═══════════════════════════════════════════════════════════════════
function TuboScreen({ onBack, historico, onSalvarHistorico }) {
  const [pedidos, setPedidos] = useState([
    { id:1, tamanho:35, qtd:0 },{ id:2, tamanho:40, qtd:0 },{ id:3, tamanho:45, qtd:0 },
    { id:4, tamanho:50, qtd:0 },{ id:5, tamanho:55, qtd:0 },{ id:6, tamanho:60, qtd:0 },
    { id:7, tamanho:65, qtd:0 },{ id:8, tamanho:70, qtd:0 },{ id:9, tamanho:75, qtd:0 },
    { id:10,tamanho:80, qtd:0 },{ id:11,tamanho:90, qtd:0 },{ id:12,tamanho:95, qtd:0 },
    { id:13,tamanho:100,qtd:0 },{ id:14,tamanho:105,qtd:0 },{ id:15,tamanho:110,qtd:0 },
    { id:16,tamanho:115,qtd:0 },{ id:17,tamanho:120,qtd:0 },
  ]);
  const [customTam, setCustomTam] = useState("");
  const [customQtd, setCustomQtd] = useState(1);
  const [showHist, setShowHist]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [copyModal, setCopyModal] = useState(null);
  const [menorCorte, setMenorCorte] = useState(35); // menor peça usada — sobra abaixo disso é descarte

  const ativos = pedidos.filter(p => p.qtd > 0);

  // Plano de corte
  const tubos = useMemo(() => ativos.length ? otimizarCortes(ativos) : [], [ativos]);
  const totalTubos     = tubos.length;
  const totalCortes    = ativos.reduce((s, p) => s + p.qtd, 0);
  const totalPerda     = tubos.reduce((s, t) => s + t.sobra, 0);
  const perdaDescarte  = tubos.reduce((s, t) => s + (t.sobra < menorCorte ? t.sobra : 0), 0);
  const perdaRetalho   = tubos.reduce((s, t) => s + (t.sobra >= menorCorte ? t.sobra : 0), 0);
  const nRetalhos      = tubos.filter(t => t.sobra >= menorCorte).length;
  const aproveitamento = totalTubos ? ((TUBO_CM * totalTubos - totalPerda) / (TUBO_CM * totalTubos) * 100).toFixed(1) : "0";

  // Materiais
  const nSuportes = totalCortes * 2;
  const nParaf16  = totalCortes * 4;
  const embRecicl = tubos.reduce((s, _) => s + TUBO_CM * 2 * 0.020, 0); // 2 voltas de embalagem/tubo

  // Ranking (últimos 30 dias)
  const rank = useMemo(() => {
    const map = {};
    const limite = Date.now() - 30*24*3600*1000;
    for (const h of historico) {
      if (h.ts < limite) continue;
      for (const p of h.pedidos) {
        map[p.tamanho] = (map[p.tamanho]||0) + p.qtd;
      }
    }
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8);
  }, [historico]);

  function updQtd(id, val) {
    setPedidos(ps => ps.map(p => p.id===id ? {...p, qtd:Math.max(0,parseInt(val)||0)} : p));
  }
  function addCustom() {
    const t = parseFloat(customTam);
    if (!t || t <= 0 || t > 300) return;
    if (pedidos.find(p => p.tamanho===t)) {
      setPedidos(ps => ps.map(p => p.tamanho===t ? {...p, qtd:p.qtd+(parseInt(customQtd)||1)} : p));
    } else {
      setPedidos(ps => [...ps, {id:Date.now(), tamanho:t, qtd:parseInt(customQtd)||1}]);
    }
    setCustomTam(""); setCustomQtd(1);
  }
  function gerarWhatsApp() {
    const linhas = [
      `✂️ *PLANO DE CORTE — ${new Date().toLocaleDateString("pt-BR")}*`,
      `📦 ${totalTubos} tubo${totalTubos>1?"s":""} de 300cm | ${totalCortes} cortes | aproveitamento ${aproveitamento}%`,
      "",
      ...tubos.map((t, i) => {
        const sobra = t.sobra.toFixed(1);
        return `*Tubo ${i+1}/${totalTubos}*\n${t.cortes.map(c=>`${c}cm`).join(" + ")}${parseFloat(sobra)>0 ? ` + ${sobra}cm (sobra)` : ""}`
      }),
      "",
      `🔩 *Materiais:*`,
      `• ${totalTubos}x Tubo Oval 300cm`,
      `• ${nSuportes}x Suporte`,
      `• ${nParaf16}x Parafuso 4×16`,
    ].join("\n");
    setCopyModal(linhas);
  }

  function salvar() {
    if (!ativos.length) return;
    onSalvarHistorico({ ts:Date.now(), pedidos:ativos, totalTubos, totalCortes, totalPerda });
  }

  function copiarLista() {
    const linhas = [
      `✂️ PLANO DE CORTE — ${new Date().toLocaleDateString("pt-BR")}`,
      `Tubos necessários: ${totalTubos} × 300cm`,
      `Cortes: ${totalCortes} peças | Perda: ${totalPerda.toFixed(1)}cm | Aproveitamento: ${aproveitamento}%`,
      "",
      "📐 CORTES POR TUBO:",
      ...tubos.map((t, i) => `Tubo ${i+1}: ${t.cortes.map(c=>`${c}cm`).join(" + ")} (sobra ${t.sobra.toFixed(1)}cm)`),
      "",
      "🔩 MATERIAIS:",
      `Tubos 300cm: ${totalTubos}`,
      `Suportes de tubo: ${nSuportes}`,
      `Parafusos 4×16: ${nParaf16}`,
    ].join("\n");
    setCopyModal(linhas);
  }

  function salvar() {
    if (!ativos.length) return;
    onSalvarHistorico({ ts:Date.now(), pedidos:ativos, totalTubos, totalCortes, totalPerda });
  }

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#f7e8d4",cursor:"pointer",fontSize:22,padding:0}}>←</button>
        <span style={{fontSize:22}}>✂️</span>
        <div style={{flex:1}}><div style={S.hT}>Plano de Corte — Tubo Oval</div><div style={S.hS}>Tubo 300cm · Disco Bosch 3,1mm</div></div>
        <button onClick={()=>setShowHist(h=>!h)} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#f7e8d4",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:12}}>
          📋 Histórico ({historico.length})
        </button>
      </div>

      {/* Ranking 30 dias */}
      {rank.length > 0 && (
        <div style={{...S.sec,marginBottom:6}}>
          <div style={S.secT}>🏆 Mais Vendidos — Últimos 30 dias</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {rank.map(([tam,qtd],i)=>(
              <button key={tam} onClick={()=>setPedidos(ps=>ps.map(p=>p.tamanho===parseFloat(tam)?{...p,qtd:p.qtd+1}:p))}
                style={{background:i===0?"#3d2b1f":i<3?"#8b5e3c":"#f5f0e8",color:i<3?"#fff":"#2c1810",borderRadius:8,padding:"6px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":""} {tam}cm <span style={{opacity:.7}}>×{qtd}</span>
              </button>
            ))}
          </div>
          <div style={{fontSize:10,color:"#9a7a65",marginTop:4}}>Clique para adicionar +1 ao pedido atual</div>
        </div>
      )}

      {/* Histórico */}
      {showHist && historico.length > 0 && (
        <div style={{...S.sec,maxHeight:200,overflowY:"auto",marginBottom:6}}>
          <div style={S.secT}>📋 Histórico de Planos</div>
          {[...historico].reverse().map((h,i)=>(
            <div key={i} style={{borderBottom:"1px solid #f5efe9",padding:"6px 0",fontSize:12}}>
              <span style={{color:"#7a6555"}}>{new Date(h.ts).toLocaleDateString("pt-BR")}</span>
              {" · "}{h.totalCortes} peças · {h.totalTubos} tubos · perda {h.totalPerda.toFixed(1)}cm
              <span style={{color:"#9a7a65",fontSize:11,marginLeft:6}}>
                {h.pedidos.map(p=>`${p.qtd}×${p.tamanho}`).join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Entrada de pedidos */}
      <div style={S.sec}>
        <div style={S.secT}>📋 Pedidos de Corte</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6,marginBottom:10}}>
          {pedidos.sort((a,b)=>a.tamanho-b.tamanho).map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:4,background:p.qtd>0?"#fff8f4":"#faf7f4",borderRadius:7,border:p.qtd>0?"1px solid #8b5e3c":"1px solid #e8dcd0",padding:"4px 8px"}}>
              <span style={{fontSize:13,fontWeight:"bold",color:"#2c1810",minWidth:35}}>{p.tamanho}cm</span>
              <button onClick={()=>updQtd(p.id,p.qtd-1)} style={{...S.btnSm,padding:"2px 7px",background:"#f0e8e0",color:"#3d2b1f",fontSize:14}}>−</button>
              <input style={{...S.inp,width:36,padding:"3px 4px",textAlign:"center",fontSize:13,fontWeight:"bold"}}
                type="number" min="0" value={p.qtd} onChange={e=>updQtd(p.id,e.target.value)}/>
              <button onClick={()=>updQtd(p.id,p.qtd+1)} style={{...S.btnSm,padding:"2px 7px",background:"#8b5e3c",color:"#fff",fontSize:14}}>+</button>
            </div>
          ))}
        </div>
        {/* Tamanho customizado */}
        <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
          <div style={S.col}>
            <label style={S.lbl}>Outro tamanho (cm)</label>
            <input style={S.inp} type="number" min="1" max="299" value={customTam}
              onChange={e=>setCustomTam(e.target.value)} placeholder="Ex: 130"
              onKeyDown={e=>e.key==="Enter"&&addCustom()}/>
          </div>
          <div style={{width:60}}>
            <label style={S.lbl}>Qtd</label>
            <input style={S.inp} type="number" min="1" value={customQtd} onChange={e=>setCustomQtd(e.target.value)}/>
          </div>
          <button onClick={addCustom} style={{...S.btn,...S.btnP,padding:"7px 12px",fontSize:13,marginBottom:0}}>+ Add</button>
        </div>
      </div>

      {/* Resultado */}
      {tubos.length > 0 && (
        <>
          {/* Menor corte configurável */}
          <div style={{...S.sec,marginBottom:6,padding:"10px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={{...S.lbl,marginBottom:0,whiteSpace:"nowrap"}}>Menor peça que uso (cm):</label>
              <input style={{...S.inp,width:70,padding:"5px 8px"}} type="number" min="1" max="299"
                value={menorCorte} onChange={e=>setMenorCorte(parseFloat(e.target.value)||35)}/>
              <span style={{fontSize:11,color:"#9a7a65"}}>Sobras ≥ {menorCorte}cm = retalho aproveitável · Abaixo = descarte</span>
            </div>
          </div>

          {/* Resumo */}
          <div style={{margin:"0 13px 10px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            {[
              ["Tubos 3m",totalTubos,"#3d2b1f","#f7e8d4"],
              ["Cortes",totalCortes,"#2d6a4f","#e8f5e9"],
              ["🔄 Retalho",`${nRetalhos}× (${perdaRetalho.toFixed(0)}cm)`,"#f57f17","#fff8e1"],
              ["🗑️ Descarte",`${perdaDescarte.toFixed(0)}cm`,"#c0392b","#fde8e8"],
            ].map(([l,v,bg,fg])=>(
              <div key={l} style={{background:bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:l.length>6?14:18,fontWeight:"bold",color:fg,lineHeight:1.2}}>{v}</div>
                <div style={{fontSize:10,color:fg,opacity:.8,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Materiais */}
          <div style={S.sec}>
            <div style={S.secT}>🔩 Lista de Materiais</div>
            {[
              [`Tubo Cabideiro Oval 300cm`,totalTubos,"un"],
              [`Suporte de Tubo Oval`,nSuportes,"un"],
              [`Parafuso 4×16`,nParaf16,"un"],
              [`Embalagem reciclada`,`≈ ${(embRecicl*100).toFixed(0)}cm`,""],
            ].map(([item,qtd,un])=>(
              <div key={item} style={S.cRow}>
                <span style={{color:"#5a4434"}}>{item}</span>
                <span></span>
                <span style={{fontWeight:"bold",textAlign:"right"}}>{qtd} {un}</span>
              </div>
            ))}
          </div>

          {/* Plano por tubo */}
          <div style={S.sec}>
            <div style={S.secT}>✂️ Plano de Corte por Tubo</div>
            {tubos.map((tubo,i)=>(
              <div key={i} style={{marginBottom:8,padding:"8px 10px",background:"#faf7f4",borderRadius:8,border:"1px solid #e8dcd0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontWeight:"bold",fontSize:13,color:"#2c1810"}}>Tubo {i+1} / {totalTubos}</span>
                  <span style={{fontSize:11,fontWeight:"bold",
                    color: tubo.sobra >= menorCorte ? "#f57f17" : tubo.sobra > 0 ? "#c0392b" : "#2d6a4f",
                    background: tubo.sobra >= menorCorte ? "#fff8e1" : tubo.sobra > 0 ? "#fde8e8" : "#e8f5e9",
                    padding:"2px 7px",borderRadius:6}}>
                    {tubo.sobra > 0
                      ? tubo.sobra >= menorCorte
                        ? `🔄 retalho ${tubo.sobra.toFixed(0)}cm`
                        : `🗑️ descarte ${tubo.sobra.toFixed(0)}cm`
                      : "✅ sem sobra"}
                  </span>
                </div>
                {/* Barra visual */}
                <div style={{display:"flex",height:18,borderRadius:4,overflow:"hidden",gap:1,marginBottom:4}}>
                  {tubo.cortes.map((c,j)=>(
                    <div key={j} style={{
                      flex:c,background:`hsl(${(j*47)%360},55%,55%)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:9,color:"#fff",fontWeight:"bold",overflow:"hidden",
                    }}>{c}</div>
                  ))}
                  {tubo.sobra > 0 && <div style={{flex:tubo.sobra,background:"#e8dcd0"}}/>}
                </div>
                <div style={{fontSize:11,color:"#5a4434"}}>
                  {tubo.cortes.map((c,j)=>`${c}cm`).join(" + ")} {tubo.cortes.length > 1 ? `= ${tubo.cortes.reduce((s,c)=>s+c,0)}cm` : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div style={{padding:"0 13px 24px",display:"flex",gap:8}}>
            <button onClick={copiarLista} style={{...S.btn,...S.btnC,flex:1,fontSize:12}}>
              📋 Copiar Lista
            </button>
            <button onClick={gerarWhatsApp} style={{...S.btn,background:"#25d366",color:"#fff",flex:1,fontSize:12}}>
              💬 Lista WhatsApp
            </button>
            <button onClick={salvar} style={{...S.btn,...S.btnP,flex:1,fontSize:12}}>
              💾 Salvar
            </button>
          </div>
        </>
      )}
      {tubos.length === 0 && (
        <div style={{padding:"30px 0",textAlign:"center",color:"#9a7a65",fontSize:13}}>
          Adicione os pedidos de corte acima para gerar o plano.
        </div>
      )}
      {copyModal && <CopyModal text={copyModal} onClose={()=>setCopyModal(null)}/>}
    </div>
  );
}


function AnuncioScreen({ prod, dims, cfg, corAtiva, fixacao, precoFinal, onBack }) {
  const [copyModal, setCopyModal] = useState(null);
  const [palavras, setPalavras] = useState("");
  const [canal, setCanal]       = useState("ml");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState("");
  const fixAtiva = FIXACAO[fixacao];
  const skuLabel = gerarSKU(prod, dims, cfg, corAtiva, fixacao, 1, "");

  async function gerar() {
    setLoading(true); setResult(null);
    const ctx = [
      `Produto: ${prod.name}`,
      `SKU: ${skuLabel}`,
      `Dimensões: ${dims.L}×${dims.A||"—"}×${dims.P||"—"} cm (L×A×P)`,
      `Cor: ${corAtiva}`,
      `Fixação: ${fixAtiva?.n||"—"} (capacidade: ${fixAtiva?.cap||"—"})`,
      `Preço: ${R$(precoFinal)}`,
      cfg.fundo ? "Com fundo." : "",
      palavras ? `Uso/palavras-chave fornecidas: ${palavras}` : "",
    ].filter(Boolean).join(" | ");

    const canalNome = canal === "ml" ? "Mercado Livre" : canal === "shopee" ? "Shopee" : "Elo7";

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1200,
          system:`Você é especialista em criação de anúncios para marketplaces brasileiros, especialmente para produtos de marcenaria em MDF da Pabimi (marcenaria artesanal de Capela do Alto-SP).
Responda APENAS em JSON válido com esta estrutura:
{
  "titulo": "título do anúncio (máx 60 caracteres, com palavras-chave de busca)",
  "subtitulo": "frase de destaque (máx 80 chars)",
  "descricao": "descrição completa do anúncio com bullet points, dimensões, material, instalação e dica de uso (300-500 palavras)",
  "capacidade": "ex: cabe X unidades de Y",
  "categoria": "categoria sugerida no ${canalNome}",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"]
}
Calcule capacidades reais quando possível (DVD=14mm, Barbie=30cm altura, LP vinyl=32cm, livro infantil=20mm).`,
          messages:[{ role:"user", content:`Crie o anúncio para ${canalNome}. Contexto: ${ctx}` }]
        })
      });
      const d = await r.json();
      const txt = d.content?.map(b=>b.text||"").join("") || "{}";
      const clean = txt.replace(/```json|```/g,"").trim();
      setResult(JSON.parse(clean));
    } catch(e) { setResult({erro:"Erro ao gerar. Tente novamente."}); }
    setLoading(false);
  }

  function copy(text, key) {
    setCopyModal(text); setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#f7e8d4",cursor:"pointer",fontSize:22,padding:0,lineHeight:1}}>←</button>
        <span style={{fontSize:22}}>🪄</span>
        <div>
          <div style={S.hT}>Criação de Anúncio</div>
          <div style={S.hS}>{prod.name} · {dims.L}cm · {corAtiva}</div>
        </div>
      </div>

      <div style={S.sec}>
        <div style={S.secT}>🎯 Configure o Anúncio</div>

        {/* Resumo do produto */}
        <div style={{...S.emb, marginBottom:12}}>
          <strong>Produto:</strong> {prod.name} · {dims.L}×{dims.A||"—"}×{dims.P||"—"}cm · {corAtiva}
          {cfg.fundo?" · com fundo":""} · {R$(precoFinal)}
          {fixAtiva?.cap?` · suporta ${fixAtiva.cap}`:""}
        </div>

        {/* Canal */}
        <div style={{marginBottom:12}}>
          <label style={S.lbl}>Canal de venda</label>
          <div style={{display:"flex",gap:8}}>
            {[["ml","🛒 Mercado Livre"],["shopee","🧡 Shopee"],["elo7","💛 Elo7"]].map(([v,l])=>(
              <button key={v} onClick={()=>setCanal(v)} style={{...S.chip,
                background:canal===v?"#8b5e3c":"transparent",
                color:canal===v?"#fff":"#2c1810",
                borderColor:canal===v?"#8b5e3c":"#d4c5b8"}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Palavras-chave */}
        <div style={{marginBottom:12}}>
          <label style={S.lbl}>Para que serve / palavras-chave <span style={{fontSize:10,color:"#9a7a65"}}>(opcional)</span></label>
          <input style={S.inp}
            placeholder="Ex: DVD, Barbie, vinil, livros infantis, banheiro, cozinha, action figures..."
            value={palavras} onChange={e=>setPalavras(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&gerar()}
          />
          <div style={{fontSize:11,color:"#9a7a65",marginTop:3}}>Quanto mais específico, melhor o anúncio. Pode digitar vários usos separados por vírgula.</div>
        </div>

        <button style={{...S.btn,background:"#7c3aed",color:"#fff",width:"100%",fontSize:14,opacity:loading?0.7:1}}
          onClick={gerar} disabled={loading}>
          {loading?"⏳ Gerando anúncio...":"🪄 Gerar Anúncio Completo"}
        </button>
      </div>

      {/* Resultado */}
      {result && !result.erro && (
        <>
          {/* Título */}
          <div style={S.sec}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.secT}>📝 Título</div>
              <button style={{...S.btnSm,...S.btnC,fontSize:11}} onClick={()=>copy(result.titulo,"titulo")}>
                {copied==="titulo"?"✅":"📋"} Copiar
              </button>
            </div>
            <div style={{fontFamily:"monospace",fontSize:15,fontWeight:"bold",color:"#2c1810",background:"#f5f0e8",borderRadius:7,padding:"8px 12px"}}>
              {result.titulo}
            </div>
            <div style={{fontSize:11,color: result.titulo?.length>60?"#c0392b":"#2d6a4f",marginTop:4}}>
              {result.titulo?.length}/60 caracteres {result.titulo?.length>60?"⚠️ muito longo":"✅"}
            </div>
            {result.subtitulo && (
              <div style={{fontSize:13,color:"#5a4434",marginTop:6,fontStyle:"italic"}}>"{result.subtitulo}"</div>
            )}
          </div>

          {/* Descrição */}
          <div style={S.sec}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.secT}>📄 Descrição Completa</div>
              <button style={{...S.btnSm,...S.btnC,fontSize:11}} onClick={()=>copy(result.descricao,"desc")}>
                {copied==="desc"?"✅":"📋"} Copiar
              </button>
            </div>
            {result.capacidade && (
              <div style={{...S.ok,marginBottom:8}}>📦 {result.capacidade}</div>
            )}
            <div style={{background:"#faf7f4",border:"1px solid #e8dcd0",borderRadius:8,padding:12,fontSize:13,lineHeight:1.7,color:"#2c1810",whiteSpace:"pre-wrap",maxHeight:300,overflowY:"auto"}}>
              {result.descricao}
            </div>
          </div>

          {/* Categoria + Tags */}
          <div style={S.sec}>
            <div style={S.secT}>🏷️ Categoria e Tags</div>
            {result.categoria && (
              <div style={{marginBottom:10}}>
                <div style={S.lbl}>Categoria sugerida</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,background:"#f5f0e8",borderRadius:6,padding:"6px 10px",fontSize:13,color:"#2c1810"}}>{result.categoria}</div>
                  <button style={{...S.btnSm,...S.btnC,fontSize:11}} onClick={()=>copy(result.categoria,"cat")}>
                    {copied==="cat"?"✅":"📋"}
                  </button>
                </div>
              </div>
            )}
            {result.tags?.length > 0 && (
              <div>
                <div style={S.lbl}>Tags / Palavras-chave</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {result.tags.map((t,i)=>(
                    <span key={i} style={{background:"#e8f4fd",border:"1px solid #90caf9",borderRadius:12,padding:"3px 10px",fontSize:12,color:"#0d47a1"}}>{t}</span>
                  ))}
                </div>
                <button style={{...S.btnSm,background:"#f0e8e0",color:"#3d2b1f",width:"100%",padding:"6px"}}
                  onClick={()=>copy(result.tags.join(", "),"tags")}>
                  {copied==="tags"?"✅ Copiado!":"📋 Copiar todas as tags"}
                </button>
              </div>
            )}
          </div>

          {/* Copiar tudo */}
          <div style={{margin:"0 13px 24px"}}>
            <button style={{...S.btn,background:"#7c3aed",color:"#fff",width:"100%"}}
              onClick={()=>copy(`${result.titulo}\n\n${result.descricao}\n\nTags: ${result.tags?.join(", ")}`, "tudo")}>
              {copied==="tudo"?"✅ Tudo Copiado!":"📋 Copiar Título + Descrição + Tags"}
            </button>
          </div>
        </>
      )}
      {result?.erro && <div style={{...S.warn,margin:"10px 13px"}}>{result.erro}</div>}
      {!result && !loading && <div style={{height:28}}/>}
      {copyModal && <CopyModal text={copyModal} onClose={()=>setCopyModal(null)}/>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// TELA CARRINHO
// ═══════════════════════════════════════════════════════════════════
function CartScreen({ items, onRemove, onBack, mkt }) {
  const [copyModal, setCopyModal] = useState(null);
  const total = items.reduce((s, i) => s + i.preco, 0);
  const pesoMax = Math.max(...items.map(i => i.pesoTotal), 0);
  const pesoTot = items.reduce((s, i) => s + i.pesoTotal, 0);
  // Frete: usa o maior volume/peso entre os itens (único envio)
  const embL = Math.max(...items.map(i => i.embL), 0);
  const embA = Math.max(...items.map(i => i.embA), 0);
  const embP = Math.max(...items.map(i => i.embP), 0);
  const mktInfo = MKTS[mkt] || MKTS.ml_clas;
  const frInfo = mktInfo.freteMKT ? calcFreteML(pesoTot, embL, embA, embP, total) : null;

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#f7e8d4",cursor:"pointer",fontSize:22,padding:0}}>←</button>
        <span style={{fontSize:22}}>🛒</span>
        <div><div style={S.hT}>Carrinho ({items.length} iten{items.length!==1?"s":""})</div><div style={S.hS}>Resumo do pedido</div></div>
      </div>

      {items.length === 0 ? (
        <div style={{padding:40,textAlign:"center",color:"#9a7a65",fontSize:14}}>
          Carrinho vazio.<br/>Adicione produtos nos orçamentos.
        </div>
      ) : (
        <>
          {items.map((item, idx) => (
            <div key={idx} style={{...S.sec,marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"bold",fontSize:14,color:"#2c1810"}}>{item.sku || item.nome}</div>
                  <div style={{fontSize:12,color:"#7a6555",marginTop:2}}>{item.desc}</div>
                  <div style={{fontSize:11,color:"#9a7a65",marginTop:2}}>📦 {item.embL}×{item.embA}×{item.embP}cm · {item.pesoTotal.toFixed(2)}kg</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:"bold",color:"#2c1810"}}>{R$(item.preco)}</div>
                  <button onClick={()=>onRemove(idx)}
                    style={{...S.btnSm,background:"#fde8e8",color:"#c0392b",fontSize:11,marginTop:4,padding:"3px 8px"}}>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div style={S.sec}>
            <div style={S.secT}>📊 Resumo</div>
            {items.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0",borderBottom:"1px solid #f5efe9"}}>
                <span style={{color:"#5a4434"}}>{item.sku||item.nome}</span>
                <span>{R$(item.preco)}</span>
              </div>
            ))}
            {frInfo && (
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",color:"#c0392b",borderBottom:"1px solid #f5efe9"}}>
                <span>Frete estimado ML ({pesoTot.toFixed(2)}kg)</span>
                <span>{R$(frInfo.valor)}</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:"bold",padding:"8px 0 0"}}>
              <span>Total do pedido</span>
              <span>{R$(total + (frInfo?.valor||0))}</span>
            </div>
          </div>

          <div style={{margin:"0 13px 24px"}}>
            <button
              style={{...S.btn,background:"#2d6a4f",color:"#fff",width:"100%",fontSize:14}}
              onClick={()=>{ const txt = items.map(i=>`${i.sku||i.nome}: ${R$(i.preco)}`).join("\n")+`\nTotal: ${R$(total)}`; setCopyModal(txt); }}>
              📋 Copiar lista de itens
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
    const [screen,setScreen]   = useState("home");
  const [prod,setProd]       = useState(null);
  const [fixosConfig,setFCfg]= useState(FIXOS_DEFAULT);
  const [matPrecos,setMatP]  = useState({});
  const [loaded,setLoaded]   = useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const r=await window.storage.get("pabimi-fixos");
        if(r?.value) setFCfg(JSON.parse(r.value));
      } catch{}
      try {
        const r=await window.storage.get("pabimi-materiais");
        if(r?.value) {
          const m = JSON.parse(r.value);
          setMatP(m);
          // Aplica preços customizados globalmente
          Object.assign(_matPrecos, m);
        }
      } catch{}
      setLoaded(true);
    })();
  },[]);

  const saveFixos = useCallback(async(cfg, mat)=>{
    setFCfg(cfg);
    try { await window.storage.set("pabimi-fixos",JSON.stringify(cfg)); } catch{}
    if (mat) {
      setMatP(mat);
      Object.assign(_matPrecos, mat);
      try { await window.storage.set("pabimi-materiais",JSON.stringify(mat)); } catch{}
    }
  },[]);

  const totalFixos  = fixosConfig.items.reduce((s,i)=>s+(parseFloat(i.valor)||0),0);
  const overheadPct = fixosConfig.faturamentoBruto>0 ? (totalFixos/fixosConfig.faturamentoBruto)*100 : 0;
  const [quoteCtx,setQuoteCtx] = useState(null);
  const [cart, setCart]         = useState([]);
  const [cartMkt, setCartMkt]   = useState("ml_clas");
  const [tuboHist, setTuboHist] = useState([]);

  const addToCart = (item) => setCart(c => [...c, item]);
  const removeFromCart = (idx) => setCart(c => c.filter((_,i)=>i!==idx));
  const salvarTuboHist = (h) => setTuboHist(prev => [...prev, h]);

  if (!loaded) return <div style={{padding:40,textAlign:"center",color:"#8b5e3c"}}>Carregando...</div>;
  if (screen==="fixos") return <FixosScreen config={fixosConfig} matPrecos={matPrecos} onSave={(c,m)=>{saveFixos(c,m);setScreen("home");}} onBack={()=>setScreen("home")}/>;
  if (screen==="tubo") return <TuboScreen onBack={()=>setScreen("quote")} historico={tuboHist} onSalvarHistorico={h=>{salvarTuboHist(h);}} />;
  if (screen==="anuncio"&&quoteCtx) return <AnuncioScreen {...quoteCtx} onBack={()=>setScreen("quote")}/>;
  if (screen==="cart") return <CartScreen items={cart} onRemove={removeFromCart} onBack={()=>setScreen("home")} mkt={cartMkt}/>;
  if (screen==="quote"&&prod) return <QuoteScreen prod={prod} overheadPct={overheadPct} onBack={()=>setScreen("home")}
    onAnuncio={(ctx)=>{ setQuoteCtx(ctx); setScreen("anuncio"); }}
    onAddToCart={addToCart}
    cartCount={cart.length}
    cartTotal={cart.reduce((s,i)=>s+i.preco,0)}
    onPlanoCorteTubo={()=>setScreen("tubo")}/>;
  return <HomeScreen onSelect={p=>{setProd(p);setScreen("quote");}} onFixos={()=>setScreen("fixos")} overheadPct={overheadPct}
    cartCount={cart.length} onCart={()=>setScreen("cart")}/>;
}
