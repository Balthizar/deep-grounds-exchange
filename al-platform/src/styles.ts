// I extracted this from app.tsx — my app injects it via <style>{CSS}</style>. First module I ever split out.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
:root{
  --parch:#efe6cf; --parch2:#e7dcc0; --ink:#2b2118; --ink2:#5c4f3d;
  --maroon:#6e1423; --maroon2:#8a2436; --gold:#b3861f; --gold2:#caa53f;
  --line:#cbbd97; --green:#3f7d46; --danger:#8a1c2b;
}
*{box-sizing:border-box}
.dg-root{font-family:'EB Garamond',Georgia,serif;color:var(--ink);overflow-x:hidden;background:
  radial-gradient(1200px 600px at 20% -10%, #f6efda 0%, transparent 60%),
  var(--parch);min-height:100vh;font-size:17px;line-height:1.45}
.dg-top{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 20px;background:linear-gradient(180deg,#5c0f1d,var(--maroon));color:#f3e7c8;
  border-bottom:3px solid var(--gold);position:sticky;top:0;z-index:20}
.dg-brand{display:flex;align-items:center;gap:12px;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit}
.dg-brand:hover .dg-title{text-decoration:underline}
.dg-about-credit{margin:4px 0 4px}
.dg-crest{font-size:26px;color:var(--gold2)}
.dg-title{font-family:'Cinzel',serif;font-weight:700;letter-spacing:.5px;font-size:19px;line-height:1.1}
.dg-sub{font-size:12.5px;color:#e3c9a0;font-style:italic}
.dg-acct{display:flex;flex-direction:column;font-size:11px;color:#e3c9a0;text-align:right;gap:3px}
.dg-acct select{font-family:inherit;font-size:14px;background:#4a0c17;color:#f3e7c8;border:1px solid var(--gold);border-radius:6px;padding:5px 8px}

.dg-notices{padding:10px 16px 0;display:flex;flex-direction:column;gap:10px}
.dg-notices.flush{padding:0;margin-top:12px}
.dg-alertbanner{display:block;width:100%;text-align:left;background:#8f2f22;color:#f6e2c2;border:none;border-radius:9px;padding:11px 14px;font-size:14px;font-weight:600;margin-bottom:12px;cursor:pointer}
.dg-alertbanner:hover{background:#7a2114}
.dg-alerts .dg-notice{border-left:3px solid var(--maroon);background:#fbeee6}
.dg-notice .dg-btn{margin-top:8px}
.dg-notice{background:#fbf4de;border:1px solid var(--gold);border-left:5px solid var(--maroon);border-radius:8px;padding:12px 14px}
.dg-notice-h{font-family:'Cinzel',serif;font-weight:700;color:var(--maroon);font-size:13px;text-transform:uppercase;letter-spacing:1px}
.dg-notice p{margin:5px 0;font-size:15px}
.dg-recreated{color:var(--green);font-style:italic}

.dg-shell{display:flex;gap:0;max-width:1200px;margin:0 auto}
.dg-nav{display:flex;flex-direction:column;gap:4px;padding:18px 12px;width:190px;flex-shrink:0}
.dg-navbtn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:transparent;position:relative;
  font-family:'Cinzel',serif;font-size:14px;color:var(--ink2);border-radius:8px;cursor:pointer;text-align:left}
.dg-navbtn:hover{background:#0000000d}
.dg-navbtn.active{background:#fff7e4;color:var(--maroon);box-shadow:inset 3px 0 0 var(--gold)}
.dg-navdot{position:absolute;top:9px;right:12px;width:8px;height:8px;border-radius:50%;background:var(--maroon);box-shadow:0 0 0 3px #fff7e4a0}
.dg-navdot.rel{position:static;margin-left:auto;box-shadow:none}
.dg-navmore-wrap{display:none;position:relative}
.dg-navmore-menu{position:absolute;bottom:100%;right:0;margin-bottom:10px;background:#fff;border:1px solid var(--gold);border-radius:12px;box-shadow:0 8px 24px #0000003a;padding:6px;min-width:190px;z-index:40;display:flex;flex-direction:column;gap:2px}
.dg-navmore-backdrop{position:fixed;inset:0;z-index:39;background:transparent}
.dg-navmore-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border:none;background:transparent;font-family:'Cinzel',serif;font-size:13px;color:var(--ink2);border-radius:8px;cursor:pointer;text-align:left}
.dg-navmore-item.active{background:#fff7e4;color:var(--maroon)}
.dg-navmore-item:hover{background:#0000000d}
.dg-navicon{font-size:16px;width:18px;text-align:center}
.dg-main{flex:1;padding:20px;min-width:0}

.dg-stack{display:flex;flex-direction:column;gap:22px}
.dg-sechead{border-bottom:1px solid var(--line);padding-bottom:6px}
.dg-eyebrow{font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.dg-h2{font-family:'Cinzel',serif;font-weight:700;color:var(--maroon);margin:2px 0 0;font-size:23px}
.dg-note{margin:4px 0 0;color:var(--ink2);font-style:italic;font-size:14.5px}

.dg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.dg-chargrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:16px}
.dg-card{background:linear-gradient(180deg,#fbf5e2,#f4ead0);border:1px solid var(--line);
  border-radius:10px;padding:16px;box-shadow:0 1px 0 #fff8 inset, 0 2px 8px #0000000f}
.dg-card.item,.dg-card.char{position:relative;overflow:hidden}
.dg-card-h{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.dg-char-name{font-family:'Cinzel',serif;font-weight:700;font-size:19px;color:var(--ink)}
.dg-char-meta{font-size:13px;color:var(--ink2)}
.dg-logbtn{margin-top:6px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;background:#fff5df;border:1px solid var(--gold);color:var(--maroon);border-radius:20px;padding:3px 11px;cursor:pointer}
.dg-logbtn:hover{background:var(--maroon);color:#f3e7c8}
.dg-logbtn.on{background:var(--maroon);color:#f3e7c8}
.dg-logstats{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}
.dg-logstats>div{flex:1;min-width:62px;text-align:center;background:#fff2d4;border:1px solid var(--gold);border-radius:8px;padding:6px 4px}
.dg-logstats b{font-family:'Cinzel',serif;font-size:18px;color:var(--maroon);display:block;line-height:1}
.dg-logstats span{font-size:10px;letter-spacing:.5px;color:var(--ink2)}
.dg-logrows{display:flex;flex-direction:column;gap:8px;max-height:44vh;overflow-y:auto;margin:8px 0}
.dg-logrow{display:flex;justify-content:space-between;gap:10px;background:#fffaec;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:7px;padding:9px 11px}
.dg-logrow.spend{border-left-color:#a8865a;background:#f7f0e2}
.dg-logrow-title{font-weight:600;font-size:15px}
.dg-logdt{font-family:'Cinzel',serif;font-weight:700;color:var(--green);white-space:nowrap}
.dg-logdt.neg{color:#a4442a}
.dg-logsummary{font-size:14px;color:var(--ink2);font-style:italic;margin:2px 0}
.dg-logline{font-size:13.5px;margin-top:3px}
.dg-lognote{font-size:14px;color:var(--ink);background:#f2ead4;border-left:3px solid var(--gold);padding:5px 9px;margin-top:6px;border-radius:0 5px 5px 0}
.dg-logimg{display:block;max-width:100%;max-height:220px;border:1px solid var(--line);border-radius:7px;margin-top:8px}
.dg-dmnote{font-size:14px;color:var(--ink);background:#eef3e8;border-left:3px solid var(--green);padding:6px 10px;margin-top:6px;border-radius:0 5px 5px 0}
.dg-dmnote-h{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--green);display:block;margin-bottom:2px}
.dg-field2{display:flex;gap:10px}
.dg-field2 .dg-field{flex:1}
.dg-dt{display:flex;flex-direction:column;align-items:center;background:#fff2d4;border:1px solid var(--gold);border-radius:8px;padding:4px 10px;min-width:52px}
.dg-counters{display:flex;flex-direction:column;gap:6px}
.dg-gp{display:flex;flex-direction:column;align-items:center;background:#f3ead4;border:1px solid var(--gold);border-radius:8px;padding:4px 10px;min-width:52px;cursor:pointer}
.dg-gp b{font-family:'Cinzel',serif;font-size:18px;color:#8a6d1f;line-height:1}
.dg-gp span{font-size:10px;letter-spacing:1px;color:var(--ink2)}
button.dg-dt{cursor:pointer;font:inherit}
.dg-market .dg-admin-row{align-items:flex-start}
.dg-samplebadge{font-size:9px;letter-spacing:.4px;text-transform:uppercase;color:#8a6d1f;background:#f6efdc;border:1px solid var(--gold);border-radius:4px;padding:0 5px;margin-left:4px;white-space:nowrap}
.dg-cartline{border-top:1px dashed var(--line);padding:8px 0}
.dg-cartline-h{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.dg-qtyrow{display:flex;align-items:center;gap:6px;margin-left:auto}
.dg-cartnote{width:100%;margin-top:6px;font-size:12.5px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:#fffdf6}
.dg-carttotals{margin-top:10px;padding:8px 10px;background:#f6efdc;border:1px solid var(--gold);border-radius:8px;font-family:'Cinzel',serif;font-size:13px;color:var(--ink);display:flex;flex-direction:column;gap:3px}
.dg-carttotals .neg{color:var(--maroon)}
.dg-scrollpicker{padding:8px 10px;background:#f6efdc;border:1px solid var(--gold);border-radius:8px;display:flex;flex-direction:column;gap:8px;margin-top:6px}
.dg-selrow{display:flex;gap:12px;flex-wrap:wrap}
.dg-selrow label{display:flex;flex-direction:column;gap:3px;flex:1;min-width:120px}
.dg-selrow select{padding:5px 7px;border:1px solid var(--gold);border-radius:6px;background:#fff;font-size:13px;color:var(--ink)}
.dg-baststack{display:flex;flex-direction:column;gap:10px}
.dg-bastcard{display:block;width:100%;text-align:left;background:#fffaec;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:10px;padding:12px 14px}
.dg-bastcard.live{cursor:pointer;position:relative}
.dg-bastcard.live:hover{background:#fff5da;border-left-color:var(--maroon)}
.dg-bastcard.muted{opacity:.7;border-left-color:var(--line)}
.dg-bastcard-h{font-family:'Cinzel',serif;font-size:15px;color:var(--maroon);margin-bottom:2px}
.dg-bastnudge{font-size:12.5px;color:var(--ink2);margin:4px 0}
.dg-bastnudge.on{font-family:'Cinzel',serif;color:var(--green);font-weight:700}
.dg-bastcard-open{position:absolute;top:12px;right:14px;font-family:'Cinzel',serif;font-size:11px;color:var(--maroon)}
.dg-bastfac{border-top:1px dashed var(--line);padding:8px 0}
.dg-bastfac.working{opacity:.85}
.dg-bastworking{margin-top:4px;font-size:12.5px;color:#8a6d1f;background:#f6efdc;border:1px solid var(--gold);border-radius:6px;padding:5px 8px;display:inline-block}
.dg-bastorderrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}
.dg-bastorderrow select,.dg-bastorderrow input{padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:#fffdf6;font-size:13px;min-width:0;max-width:100%}
.dg-bastturnbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
.dg-bastturn{border-top:1px dashed var(--line);padding:8px 0}
.dg-charident{display:flex;gap:10px;align-items:flex-start;flex:1;min-width:0}
.dg-chartags{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.dg-chartags .dg-factiontag{margin:0}
.dg-chartags .dg-lifepill{margin:0}
.dg-portrait{position:relative;width:var(--pfs,80px);height:var(--pfs,80px);flex:0 0 var(--pfs,80px);border-radius:50%;overflow:hidden;display:block}
.dg-portrait img{width:var(--pfs,80px);height:var(--pfs,80px);border-radius:50%;object-fit:cover;display:block;border:1px solid var(--line);background:#e6dcc4}
.dg-portrait-empty{width:var(--pfs,80px);height:var(--pfs,80px);border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e6dcc4;color:#b0a179;border:1px solid var(--line)}
.dg-portrait.owner{cursor:pointer}
.dg-portrait-hint{position:absolute;left:0;right:0;bottom:0;height:22px;display:flex;align-items:center;justify-content:center;background:rgba(33,30,24,.62);color:#f4ecd8;font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.8px;text-transform:uppercase;opacity:0;transition:opacity .15s;pointer-events:none}
.dg-portrait.owner:hover .dg-portrait-hint,.dg-portrait.owner:focus-within .dg-portrait-hint{opacity:1}
@media (hover:none){.dg-portrait-hint{opacity:1}}
.dg-furnrow{border-bottom:1px dashed var(--line);padding:7px 0}
.dg-furnrow:last-child{border-bottom:none}
.dg-furnactions{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px}
.dg-furntier{font-family:'Cinzel',serif;font-size:9px;letter-spacing:.6px;text-transform:uppercase;padding:1px 6px;border-radius:999px;border:1px solid var(--line);color:var(--ink2);margin-left:6px}
.dg-furnrow.gone{opacity:.65}
.dg-furntier.t-gone{border-color:var(--maroon);color:var(--maroon);border-style:dashed}
.dg-furntier.t-fine{border-color:#7d8a5c;color:#5d6a3c}
.dg-furntier.t-rich{border-color:#2a5d9e;color:#2a5d9e}
.dg-furntier.t-superb{border-color:#7b3fa0;color:#7b3fa0}
.dg-furntier.t-master{border-color:var(--gold);color:#8a6a1e;background:#f7efd8}
.dg-furntier.t-keepsake{border-color:#9a7b5c;color:#7a5c3c;font-style:italic;text-transform:none;letter-spacing:.2px}
.dg-letter{font-family:'EB Garamond',Georgia,serif;font-size:13.5px;line-height:1.5;color:var(--ink);background:#fdf9ee;border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin-top:6px}
.dg-letter p{margin:0 0 7px}
.dg-letter p:last-of-type{margin-bottom:9px}
.dg-letter-sign{text-align:right;font-style:italic;font-size:12.5px;color:var(--ink2);border-top:1px dashed var(--line);padding-top:6px}
.dg-lostkeep{border-left:4px solid #8a8172;background:linear-gradient(180deg,#f6f2e6,#efe9d8)}
.dg-bastmap{border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fbf6e8;margin-bottom:8px}
.dg-bastmap img{display:block;width:100%;max-height:440px;object-fit:contain;background:#1a1a1a}
.dg-bastmap.empty{padding:30px 14px;text-align:center;color:var(--ink2);font-size:13px;border-style:dashed}
.dg-bastmap-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.dg-maplink{font-size:12.5px;color:var(--maroon);text-decoration:underline;margin-left:auto}
.dg-facdesc{width:100%;font-size:13px;padding:7px 9px;border:1px solid var(--line);border-radius:6px;background:#fffdf6;font-family:inherit;resize:vertical}
.dg-facname{background:none;border:none;padding:0;font:inherit;font-weight:700;color:var(--maroon);cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.dg-facname:hover{color:var(--ink)}
.dg-bastflavor{font-style:italic;color:var(--ink);opacity:.72;font-size:13px;margin:3px 0 5px}
.dg-housing{font-size:12px;color:var(--ink);opacity:.66;margin:0 0 8px;padding:4px 8px;border-radius:6px;background:#fbf7ec}
.dg-housing.short{opacity:.9;background:#fbeede;color:#7a4a12}
.dg-bastfac.disabled{opacity:.7;border-left:3px solid var(--maroon)}
.dg-bastneglect{background:#f7ecec;border:1px solid var(--maroon);color:var(--maroon);border-radius:8px;padding:9px 12px;font-size:13px}
.dg-batchlist{max-height:180px;overflow-y:auto;border:1px solid var(--line);border-radius:8px;padding:6px 8px;margin-top:6px;background:#fffdf6}
.dg-batchrow{display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-size:13px;cursor:pointer}
.dg-batchrow input{margin-top:3px}
.dg-dt b{font-family:'Cinzel',serif;font-size:18px;color:var(--maroon);line-height:1}
.dg-dt span{font-size:10px;letter-spacing:1px;color:var(--ink2)}

.dg-inv{display:flex;flex-direction:column;gap:8px;margin:14px 0}
.dg-pendingblock{margin:0 0 12px;padding:10px;background:#f6ecd6;border:1px dashed #c88b3a;border-radius:7px}
.dg-pending-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:1.5px;color:#a6641f;margin-bottom:6px}
.dg-pendingrow{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px;padding:3px 0}
.dg-pendingtag{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:#fff;background:#c88b3a;border-radius:5px;padding:2px 8px;white-space:nowrap}
.dg-pendingtag.inline{background:none;color:#a6641f;font-style:italic;padding:0;text-transform:none;letter-spacing:0}
.dg-pendingtag.fix{background:#b3541f}
.dg-pendingtag.inline.fix{background:none;color:#b3541f}
.dg-pendingrow-r{display:flex;align-items:center;gap:8px}
.dg-pencil{background:none;border:1px solid var(--line);color:var(--maroon);border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:14px;line-height:1;padding:0}
.dg-pencil:hover{background:#fff5df}
.dg-logright{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.dg-btn.full{width:100%;margin-top:8px}
.dg-rulewarn{background:#fbeee6;border:1px solid #c0553a;border-radius:8px;padding:10px 12px;margin:0 0 12px;font-size:14px;color:#7a2e1a}
.dg-rulecite{margin-top:6px;font-family:'Alegreya SC',serif;font-size:12px;font-style:italic;color:#9a5a44}
.dg-itemrow{display:flex;align-items:flex-start;flex-wrap:wrap;gap:10px;padding:9px 10px;background:#fffaec;
  border:1px solid var(--line);border-left:4px solid var(--rarity,#999);border-radius:7px}
.dg-itemrow-body{flex:1;min-width:0}
.dg-item-name{font-weight:600;font-size:15.5px}
.dg-variant,.dg-classpill{font-size:10px;background:#eadfbf;border:1px solid var(--line);border-radius:4px;padding:1px 5px;margin-left:6px;color:var(--ink2);font-family:'Cinzel',serif;letter-spacing:.5px}
.dg-item-sub{font-size:13px;color:var(--ink2);display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.dg-rarity{font-weight:600}
.dg-dot{opacity:.5}
.dg-escrow{color:var(--gold);font-style:italic}
.dg-clawback{margin-top:5px;font-size:12px;color:#7a3a12;background:#f6e2c2;border:1px dashed #c88b3a;border-radius:5px;padding:4px 7px}
.dg-clawback-full{flex-basis:100%;width:100%;box-sizing:border-box}
.dg-itemrow-actions{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.dg-locked{font-size:12px;color:var(--ink2);font-style:italic;white-space:nowrap}
.dg-carrytoggle{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.3px;border-radius:20px;padding:2px 10px;cursor:pointer;white-space:nowrap;background:#fff7e4;border:1px solid var(--line);color:var(--ink2)}
.dg-carrytoggle.on{background:#eef3e6;border-color:#9bb87a;color:#3f5a2a}
.dg-carrytoggle:hover{border-color:var(--maroon)}

.dg-seal{width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--maroon2),#4a0c17);
  color:#f3e7c8;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;
  border:2px solid var(--gold);flex-shrink:0;box-shadow:0 1px 3px #0004}
.dg-seal.admin{background:radial-gradient(circle at 35% 30%,var(--gold2),#8a6410)}
.dg-seal.pending{background:transparent;color:#a06a2c;border:2px dashed #c88b3a}

.dg-wish{margin:8px 0 12px;padding:10px;background:#f7efd8;border:1px solid var(--line);border-radius:7px}
.dg-wish-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.dg-wish-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold)}
.dg-addwish{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;background:#fff5df;border:1px solid var(--gold);color:var(--maroon);border-radius:20px;padding:3px 12px;cursor:pointer}
.dg-addwish:hover{background:var(--maroon);color:#f3e7c8}
.dg-wish-item{display:flex;align-items:center;gap:8px;font-size:14px;padding:3px 0}
.dg-wish-item.done{opacity:.6}
.dg-wish-item.done .dg-wish-txt{text-decoration:line-through}
.dg-wish-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0}
.dg-wish-txt{flex:1}
.dg-wish-x{background:none;border:none;color:var(--ink2);font-size:18px;line-height:1;cursor:pointer;padding:0 4px}
.dg-wish-x:hover{color:var(--danger)}
.dg-avail{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2);cursor:pointer;white-space:nowrap}
.dg-avail input{width:15px;height:15px;accent-color:var(--maroon);cursor:pointer}
.dg-avail.disabled{opacity:.45;cursor:not-allowed}
.dg-equip{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;background:#fff7e4;border:1px solid var(--line);color:var(--ink2);border-radius:20px;padding:2px 9px;cursor:pointer}
.dg-equip.on{background:var(--gold);color:#3a2a08;border-color:transparent}
.dg-equip:disabled{opacity:.4;cursor:not-allowed}
.dg-slotfull{font-size:10px;color:var(--ink2);font-style:italic;white-space:nowrap}
.dg-equipflag{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.3px;color:var(--maroon);background:#fbeee6;border:1px solid #e3c9bf;border-radius:20px;padding:2px 9px;white-space:nowrap;display:inline-block}
.dg-awaitflag{font-family:'Cinzel',serif;font-size:12px;letter-spacing:.3px;color:#7a5b12;background:#fbf1d6;border:1px solid #d9c48a;border-radius:20px;padding:4px 12px;display:inline-block;margin-right:auto}
.dg-awaitflag.sm{font-size:10.5px;padding:2px 9px;margin-right:0}
.dg-carryframe{background:#fbf6e9;border:1px solid var(--gold);border-radius:9px;padding:8px 10px;margin-bottom:11px}
.dg-carryframe-h{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.5px;color:var(--maroon);margin-bottom:6px}
.dg-carrypills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:5px}
.dg-carrypill{font-size:11px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:2px 9px;color:var(--ink2)}
.dg-carrypill.full{border-color:var(--gold);color:#7a5b12;background:#fbf1d6}
.dg-carrypill.over{border-color:var(--maroon);color:var(--maroon);background:#fbeee6;font-weight:600}
.dg-constack .dg-item-line{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dg-qty{font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:var(--maroon);background:#fbf1d6;border:1px solid #d9c48a;border-radius:20px;padding:1px 8px}
.dg-packstep{display:flex;align-items:center;gap:6px}
.dg-stepbtn{width:22px;height:22px;border-radius:50%;border:1px solid var(--gold);background:#fff7e4;color:var(--maroon);font-size:14px;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dg-stepbtn:disabled{opacity:.35;cursor:default}
.dg-gearhead{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.5px;color:var(--ink2);text-transform:uppercase;margin:10px 0 4px;border-top:1px dashed var(--line);padding-top:8px}
.dg-lifepill{display:inline-block;margin:6px 0 0 6px;padding:3px 10px;border-radius:999px;border:1px dashed var(--line);background:transparent;color:var(--ink2);font-size:11.5px;font-family:'EB Garamond',Georgia,serif;cursor:pointer;transition:all .15s}
.dg-lifepill:hover{border-color:var(--gold);color:var(--ink)}
.dg-lifepill.on{border-style:solid;border-color:var(--gold);background:#f7efd8;color:var(--maroon)}
.dg-grantbanner{background:linear-gradient(180deg,#f7efd8,#f2e6c6);border:1px solid var(--gold);border-left:4px solid var(--gold);border-radius:10px;padding:10px 12px;margin:10px 0}
.dg-grantbanner-h{font-family:'Cinzel',serif;font-size:12px;letter-spacing:.6px;color:var(--maroon);margin-bottom:4px}
.dg-grantbanner p{margin:0 0 8px;font-size:13px;line-height:1.45;color:var(--ink)}
.dg-draftbanner{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:#fbf1d6;border:1px solid #d9c48a;color:#7a5b12;border-radius:8px;padding:6px 10px;margin-bottom:8px;font-size:12px}
.dg-gearrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 10px}
.dg-rarityfilter{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}
.dg-catlabel{font-size:11px;color:var(--ink2);margin-top:12px;margin-bottom:2px}
.dg-rarpill{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;background:#fff7e4;border:1px solid var(--gold);color:var(--ink2);border-radius:20px;padding:6px 13px;cursor:pointer;white-space:nowrap;line-height:1}
.dg-rarpill:hover{border-color:var(--maroon)}
.dg-rarpill.on{background:var(--maroon);border-color:var(--maroon);color:#f6e2c2;font-weight:600}
.dg-authbtn{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;background:#f6e2c2;border:1px solid #c88b3a;color:#7a3a12;border-radius:20px;padding:2px 10px;cursor:pointer;white-space:nowrap}
.dg-authbtn:hover{background:#c88b3a;color:#fff}
.dg-authpending{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;color:#7a3a12;font-style:italic;white-space:nowrap}
.dg-ticket{padding:10px 0;border-top:1px dashed var(--line)}
.dg-ticketpanel{background:#f6efdc;border:1px solid var(--gold);border-radius:10px;padding:12px 14px;margin-bottom:10px}
.dg-sysnote{text-align:center;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5px;color:var(--maroon);background:#f2e8cf;border:1px solid var(--line);border-radius:20px;padding:4px 12px;margin:8px auto;display:inline-block}
.dg-ticket:first-of-type{border-top:none}
.dg-ticket-h{font-weight:600;font-size:15px}
.dg-availtag{margin-top:8px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--green);display:inline-block;background:#e4f0e5;border:1px solid #b6d3b8;border-radius:5px;padding:3px 9px}
.dg-matchbanner{display:block;width:100%;text-align:center;font-family:'Cinzel',serif;font-size:14px;letter-spacing:.3px;
  background:linear-gradient(180deg,#fff2d0,#f6e6bd);color:var(--maroon);border:none;border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);
  padding:11px 14px;cursor:pointer}
.dg-matchbanner:hover{background:linear-gradient(180deg,#ffeec2,#f2dfb0)}
.dg-matchbanner.soft{background:linear-gradient(180deg,#eef1e6,#e3e8d4);color:#4a5230;border-color:#b9c299}
.dg-matchbanner.soft:hover{background:linear-gradient(180deg,#e8ecdb,#dbe1c9)}
.dg-matchbanner.interest{background:linear-gradient(180deg,#eae6f0,#ddd6e6);color:#4a3a5a;border-color:#c3b3d6}
.dg-matchbanner.interest:hover{background:linear-gradient(180deg,#e4dfee,#d6cde2)}
.dg-interestband{background:#f1eef6;border:1px solid #c3b3d6;border-radius:10px;padding:14px}
.dg-interest-h{font-family:'Cinzel',serif;color:#5a4a6a;font-weight:700;margin-bottom:4px}
.dg-interest{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-top:1px dashed #c3b3d6;font-size:14px}
.dg-interest-actions{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.dg-softband{background:#f2f2e4;border:1px solid #c3c9a6;border-radius:10px;padding:14px}
.dg-soft-h{font-family:'Cinzel',serif;color:#5a6338;font-weight:700;margin-bottom:4px}
.dg-soft{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 0;border-top:1px dashed #c3c9a6;font-size:14px}
.dg-thread{display:block;width:100%;text-align:left;background:#fbf5e2;border:1px solid var(--line);border-radius:9px;padding:12px 14px;cursor:pointer}
.dg-thread:hover{background:#fff7e4}
.dg-thread-h{display:flex;align-items:center;gap:8px;font-family:'Cinzel',serif;color:var(--maroon)}
.dg-thread-last{font-size:14px;color:var(--ink2);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dg-chatbox{display:flex;flex-direction:column;gap:8px;padding:12px;background:#f7efd8;border:1px solid var(--line);border-radius:10px;max-height:52vh;overflow-y:auto}
.dg-bubble{max-width:82%;align-self:flex-start;background:#fffaec;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:15px;line-height:1.4}
.dg-bubble.mine{align-self:flex-end;background:#efe0c6;border-color:var(--gold)}
.dg-bubble-who{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--gold);margin-bottom:2px}
.dg-chatinput{display:flex;gap:8px}
.dg-chatinput input{flex:1;font-family:inherit;font-size:15px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fffaec}
.dg-textarea{width:100%;font-family:inherit;font-size:15px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fffaec;resize:vertical;margin:8px 0}
.dg-mine-tag{margin-top:8px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--ink2);text-align:center;font-style:italic}
.dg-msg{display:flex;flex-direction:column}
.dg-msg.mine{align-items:flex-end}
.dg-receipt{font-size:10px;color:var(--ink2);margin-top:2px;font-style:italic}
.dg-modetoggle{display:flex;margin:12px 16px 0;border-radius:8px;overflow:hidden;border:1px solid var(--maroon)}
.dg-modetoggle .dg-modebtn{flex:1;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5px;padding:9px;border:none;background:#fbf5e2;color:var(--maroon);cursor:pointer;border-right:1px solid var(--maroon)}
.dg-modetoggle .dg-modebtn:last-child{border-right:none}
.dg-modetoggle .dg-modebtn.on{background:var(--maroon);color:#f3e7c8}
.dg-dminfo{background:#f1eef6;border:1px solid #c3b3d6;border-radius:8px;padding:8px 12px;font-size:14px;color:#5a4a6a}
.dg-avatar{border-radius:50%;object-fit:cover;display:inline-flex;align-items:center;justify-content:center;background:#e6dcc4;color:#b0a179;border:1px solid var(--line);flex:0 0 auto;overflow:hidden}
.dg-acctwrap{display:flex;align-items:center;gap:10px}
.dg-suggest{border:1px solid var(--gold);border-radius:8px;background:#fffaec;margin:-4px 0 10px;overflow:hidden}
.dg-suggest-item{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid var(--line);padding:9px 12px;cursor:pointer}
.dg-suggest-item:last-child{border-bottom:none}
.dg-suggest-item:hover{background:#fff5df}
.dg-suggest-item.row{display:flex;align-items:center;gap:8px}
.dg-suggest-title{font-weight:600;font-size:14px}
.dg-suggest-sub{font-size:12.5px;color:var(--ink2);margin-top:2px}
.dg-suggest-empty{padding:9px 12px;font-size:13px;color:var(--ink2);font-style:italic}
.dg-advcard{background:#f2ead4;border-left:3px solid var(--gold);border-radius:0 6px 6px 0;padding:8px 11px;margin:0 0 10px}
.dg-advsummary{font-size:14px;color:var(--ink)}
.dg-advmeta{font-size:11px;color:var(--ink2);margin-top:3px;font-style:italic}
.dg-dmpicked{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:14px;color:var(--ink2)}
.dg-profilehead{display:flex;align-items:center;gap:14px;margin-bottom:6px}
.dg-profileopts-toggle{display:none;margin-top:8px;background:#fff7e4;border:1px solid var(--gold);color:var(--maroon);font-family:'Cinzel',serif;font-size:12px;border-radius:8px;padding:6px 12px;cursor:pointer}
.dg-profilename{font-family:'Cinzel',serif;font-size:18px;color:var(--maroon)}
.dg-photobtn{display:inline-block;margin-top:4px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;background:#fff5df;border:1px solid var(--gold);color:var(--maroon);border-radius:20px;padding:3px 11px;cursor:pointer}
.dg-photobtn:hover{background:var(--maroon);color:#f3e7c8}
.dg-seats{text-align:center;flex:0 0 auto}
.dg-seats b{font-family:'Cinzel',serif;font-size:16px;color:var(--maroon);display:block;line-height:1}
.dg-seats span{font-size:10px;color:var(--ink2)}
.dg-dmline{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink2);margin:8px 0}
.dg-roster{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.dg-aplline{margin-top:6px;font-size:13px;color:var(--maroon);background:#f7f0e2;border:1px solid var(--line);border-radius:8px;padding:6px 10px}
.dg-presetpick{border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:2px 0 8px;background:#fffdf6}
.dg-dmstats{display:flex;gap:10px;flex-wrap:wrap;background:linear-gradient(135deg,#fff7e4,#f5ecd6);border:1px solid var(--gold);border-radius:12px;padding:14px 16px}
.dg-authorcard{background:#fbf7ee;border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:14px}
.dg-authorcard.on{background:#f4efe0;border-color:var(--gold)}
.dg-authorcard-h{font-family:'Cinzel',serif;font-size:15px;color:var(--maroon);margin-bottom:6px}
.dg-authorbadge{font-size:10px;font-weight:600;color:#2e5e2e;background:#e2f0e2;border:1px solid #b6d6b6;border-radius:5px;padding:1px 7px;margin-left:6px;vertical-align:middle}
.dg-rescard{display:block;width:100%;text-align:left;background:#fbf7ee;border:1px solid var(--line);border-radius:12px;padding:16px;cursor:pointer;font-family:inherit;text-decoration:none;color:inherit}
.dg-rescard:hover{border-color:var(--gold);background:#fff7e4}
.dg-resicon{font-size:26px;margin-bottom:6px}
.dg-resname{font-family:'Cinzel',serif;font-size:15px;color:var(--maroon);margin-bottom:3px}
.dg-draft-title{font-family:'Cinzel',serif;font-size:16px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;width:100%;box-sizing:border-box}
.dg-draft-body{font-family:'EB Garamond',Georgia,serif;font-size:15px;line-height:1.5;padding:10px 12px;border:1px solid var(--line);border-radius:8px;width:100%;box-sizing:border-box;resize:vertical}
.dg-dmstats>div{flex:1;min-width:80px;text-align:center;display:flex;flex-direction:column;gap:2px}
.dg-dmstats>div>b{font-family:'Cinzel',serif;font-size:24px;color:var(--maroon);line-height:1}
.dg-dmstats>div>span{font-size:11px;color:var(--ink2);text-transform:uppercase;letter-spacing:.4px}
.dg-nexttable{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-left:4px solid var(--maroon);border-radius:10px;padding:12px 16px}
.dg-nexttable-eyebrow{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--maroon)}
.dg-nexttable-name{font-weight:600;font-size:15px;margin:2px 0}
.dg-nexttable-stats{display:flex;gap:16px;flex-shrink:0}
.dg-nexttable-stats>div{text-align:center;display:flex;flex-direction:column;gap:1px}
.dg-nexttable-stats>div>b{font-family:'Cinzel',serif;font-size:18px;color:var(--maroon);line-height:1}
.dg-nexttable-stats>div>span{font-size:10px;color:var(--ink2);text-transform:uppercase;letter-spacing:.3px}
.dg-cardhighlight{animation:dg-cardpulse 2.4s ease-out}
@keyframes dg-cardpulse{0%,22%{box-shadow:0 0 0 3px var(--gold),0 4px 18px #9a7b2e55}100%{box-shadow:0 0 0 0 #9a7b2e00}}
.dg-rosterchip{font-size:12.5px;background:#f2ead4;border:1px solid var(--line);border-radius:12px;padding:2px 9px}
.dg-signup{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.dg-signup select{font-family:inherit;font-size:14px;padding:6px;border:1px solid var(--line);border-radius:7px;background:#fffaec}
.dg-seriestag{margin-left:8px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:#4a5230;background:#e3e8d4;border:1px solid #b9c299;border-radius:5px;padding:1px 7px;vertical-align:middle}
.dg-presettag{margin-left:8px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:#7a3a12;background:#f6e2c2;border:1px solid #c88b3a;border-radius:5px;padding:1px 7px}
.dg-sessnote{font-size:13.5px;color:var(--ink2);background:#f7f0e2;border-left:3px solid var(--line);padding:5px 9px;border-radius:0 5px 5px 0;margin:2px 0 6px}
.dg-daygroup{margin-top:4px}
.dg-dayhead{display:flex;justify-content:space-between;align-items:baseline;font-family:'Cinzel',serif;color:var(--maroon);font-size:15px;border-bottom:1px solid var(--gold);padding-bottom:4px;margin:12px 0 8px}
.dg-daycount{font-family:'EB Garamond',serif;font-size:12px;color:var(--ink2);font-style:italic}
.dg-daygroup .dg-card{margin-bottom:8px}
.dg-subtoggle{display:flex;gap:4px;background:#efe6d0;border:1px solid var(--line);border-radius:9px;padding:3px;margin-bottom:12px}
.dg-subbtn{flex:1;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5px;padding:7px;border:none;background:none;border-radius:6px;color:var(--ink2);cursor:pointer}
.dg-subbtn.on{background:var(--maroon);color:#f3e7c8}
.dg-catsearch{width:100%;box-sizing:border-box;font-family:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fffaec;margin-bottom:8px}
.dg-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px}
.dg-chip{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;padding:4px 12px;border:1px solid var(--gold);background:#fff5df;color:var(--maroon);border-radius:20px;cursor:pointer}
.dg-chip.on{background:var(--maroon);color:#f3e7c8;border-color:var(--maroon)}
.dg-catrow{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)}
.dg-catmain{min-width:0;flex:1}
.dg-catrow .dg-item-name.link{text-align:left}
.dg-star{flex:0 0 auto;background:none;border:none;font-size:20px;line-height:1;color:#c9b78a;cursor:pointer;padding:0 2px}
.dg-star.on{color:var(--gold)}
.dg-demand{color:var(--gold);font-weight:600}
.dg-mostwanted{background:#fff7e4;border:1px solid var(--gold);border-radius:8px;padding:4px 8px 8px;margin-bottom:14px}
.dg-reportbtn{background:none;border:none;color:#9a3b2e;font-size:11.5px;cursor:pointer;padding:1px 0;margin-top:1px;align-self:flex-start}
.dg-reportbtn:hover{text-decoration:underline}
.dg-reported{font-size:11.5px;color:#7a6f5a;font-style:italic;margin-top:1px}
.dg-receipt.read{color:#3f7d4f}
.dg-reportcard{background:#fbecea;border:1px solid #d99;border-left:4px solid #b5432f;border-radius:8px;padding:9px 12px;margin-bottom:4px;max-width:90%}
.dg-report-h{font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5px;color:#8f2f22;text-transform:uppercase}
.dg-report-meta{font-size:12.5px;color:var(--ink2);margin:3px 0}
.dg-report-quote{font-size:14px;color:var(--ink);font-style:italic;background:#fff;border-radius:6px;padding:6px 9px;border:1px solid #eecfca}
.dg-tablepick{display:flex;gap:6px;margin-top:2px}
.dg-tablebtn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;font-family:'Cinzel',serif;font-size:12px;padding:8px 4px;border:1px solid var(--gold);background:#fff5df;color:var(--maroon);border-radius:8px;cursor:pointer}
.dg-tablebtn.on{background:var(--maroon);color:#f3e7c8;border-color:var(--maroon)}
.dg-tablebtn.taken{background:#e9e2d0;color:#9a927e;border-color:var(--line);cursor:not-allowed}
.dg-tablewho{font-family:'EB Garamond',serif;font-size:10px;font-style:italic;opacity:.85;text-transform:none;letter-spacing:0}
.dg-bounce{background:#fbecea;border:1px solid #d99;border-left:4px solid #b5432f;border-radius:8px;padding:8px 11px;max-width:90%}
.dg-bounce-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;color:#8f2f22;}
.dg-bounce-quote{font-size:13px;color:var(--ink2);font-style:italic;margin-top:4px}
.dg-blockrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.dg-blocknote{font-size:12.5px;color:#8f2f22}
.dg-banbanner{background:#8f2f22;color:#f6e2c2;border-radius:9px;padding:11px 14px;font-size:14px;margin-bottom:12px}
.dg-mgdhead{display:flex;align-items:center;gap:11px}
.dg-mgd-susp{border-left:4px solid #c88b3a}
.dg-mgd-deact{border-left:4px solid #8f2f22;opacity:.9}
.dg-modhint{font-size:11.5px;color:var(--ink2);font-style:italic;margin-top:6px}
.dg-reviewrep{background:#fbecea;border:1px solid #eecfca;border-radius:8px;padding:8px 10px;margin:6px 0}
.dg-reviewrep-q{font-size:13.5px;font-style:italic;color:var(--ink)}
.dg-reviewrep-m{font-size:11.5px;color:var(--ink2);margin:3px 0 6px}
.dg-seal.review{background:#f6e2c2;color:#8f2f22;border-color:#c88b3a}
.dg-factiontag{margin-left:8px;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase;color:#4a3a6a;background:#eae4f2;border:1px solid #c3b3d6;border-radius:5px;padding:1px 7px;vertical-align:middle;white-space:nowrap}
.dg-gifts{border-top:1px solid var(--line);margin-top:10px;padding-top:10px}
.dg-gifts-h{display:flex;justify-content:space-between;align-items:center;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.4px;text-transform:uppercase;color:var(--maroon);margin-bottom:6px}
.dg-giftgroup{margin-bottom:8px}
.dg-giftgroup-h{font-weight:600;font-size:13px}
.dg-giftrow{padding:7px 0;border-bottom:1px solid #ece4d0}
.dg-giftgroup .dg-giftrow:last-child{border-bottom:none}
.dg-giftline1{display:flex;align-items:center;gap:8px}
.dg-giftline1 .dg-giftname{flex:1}
.dg-giftcarry{flex:none;margin:0}
.dg-giftline2{display:flex;align-items:center;gap:8px;margin-top:3px}
.dg-giftsource{flex:1;color:#6a5a3a;font-size:12px}
.dg-giftdesc{margin-top:4px;font-size:12.5px;color:#3a3a3a;line-height:1.42}
.dg-giftfade{flex:none;background:#eae4f2;border:1px solid #c3b3d6;border-radius:6px;padding:1px 7px;cursor:pointer;font-size:13px;line-height:1.3}
.dg-giftgiveup{flex:none;background:#fff;border:1px solid var(--maroon);color:var(--maroon);border-radius:6px;padding:2px 12px;cursor:pointer;font-size:11px;font-family:'Cinzel',serif;letter-spacing:.4px;text-transform:uppercase}
.dg-giftgiveup:hover{background:var(--maroon);color:#fff}
.dg-giftname{font-size:13px}
.dg-giftbench{color:#8a7a5a;font-size:11px;font-style:italic}
.dg-retdivider{display:flex;align-items:center;gap:12px;margin:26px 0 6px;font-family:'Cinzel',serif;color:#6a5a3a;font-size:15px;white-space:nowrap}
.dg-retdivider:before,.dg-retdivider:after{content:"";flex:1;height:1px;background:var(--line)}
.dg-retbadge{margin-left:8px;font-size:10px;font-weight:600;color:#6a5a3a;background:#ece4d0;border:1px solid #d9c9a3;border-radius:5px;padding:1px 7px;vertical-align:middle}
.dg-retired{opacity:.85;background:#faf6ec}
.dg-diary{margin-top:12px;border-top:1px dashed var(--line);padding-top:10px}
.dg-diary-h{font-family:'Cinzel',serif;font-size:13px;color:#6a5a3a;margin-bottom:8px}
.dg-tale{background:#fffdf6;border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-bottom:6px}
.dg-tale.prompt{background:#fff7e4;border-color:var(--gold)}
.dg-summons{margin:0 0 10px;background:linear-gradient(180deg,#fbf1d8,#fff7e4);border:1px solid var(--gold);border-left:4px solid var(--maroon);border-radius:10px;padding:10px 12px}
.dg-summons-h{font-family:'Cinzel',serif;color:var(--maroon);font-size:14px;margin-bottom:4px}
.dg-summons-body{font-size:13px;line-height:1.45}
.dg-hallcard{display:block;width:100%;text-align:left;background:#fffdf6;border:1px solid var(--line);border-radius:10px;padding:12px;cursor:pointer;font-family:inherit}
.dg-hallcard:hover{border-color:var(--gold);background:#fff7e4}
.dg-hallname{font-family:'Cinzel',serif;font-size:15px;color:var(--maroon);margin-bottom:3px}
.dg-hallhero-name{font-family:'Cinzel',serif;font-size:20px;color:var(--maroon);margin-bottom:4px}
.dg-hallkeep{background:#fff7e4;border:1px solid var(--line);border-radius:8px;padding:10px;margin:12px 0}
.dg-hallkeep-h{font-family:'Cinzel',serif;font-size:14px;margin-bottom:2px}
.dg-halldiary-h{font-family:'Cinzel',serif;font-size:14px;color:#6a5a3a;margin:12px 0 8px}
.dg-confirm-title{font-family:'Cinzel',serif;font-size:18px;color:var(--maroon);margin-bottom:8px}
.dg-confirm-body{font-size:14px;line-height:1.5;color:var(--ink2)}
.dg-homebanner{background:linear-gradient(180deg,#eef3e6,#f4f7ee);border:1px solid #b8c99a;border-left:4px solid #6b8e3d;border-radius:8px;padding:8px 12px;font-size:13px;margin-bottom:8px;line-height:1.4}
.dg-defgrave-frame{background:#f3ede0;border:1px solid #c9c4b4;border-radius:8px;padding:10px 12px;margin:4px 0 10px}
.dg-relics{background:#fbf4e6;border:1px solid var(--gold);border-radius:8px;padding:10px 12px}
.dg-relics-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;color:var(--maroon);margin-bottom:6px}
.dg-relic-line{font-size:13px;padding:3px 0;border-bottom:1px dotted #e0d3ad}
.dg-relic-line:last-child{border-bottom:none}
.dg-epitaph{font-style:italic;color:var(--ink2);border-left:3px solid var(--gold);padding:4px 0 4px 10px;margin:8px 0}
.dg-ruinfac{padding:4px 0;border-bottom:1px dotted #e0d3ad}
.dg-ruinfac:last-child{border-bottom:none}
.dg-defgrave-h{font-family:'Cinzel',serif;font-size:12.5px;color:#6a5a3a;margin-bottom:6px}
.dg-defgrave-line{font-size:13px;line-height:1.55}
.dg-defgrave-rem{font-style:italic;opacity:.7}
.dg-samplewarn{background:#2a1416;color:#f0d8d8;border:1px solid var(--maroon);border-radius:8px;padding:10px 12px;font-size:12.5px;line-height:1.4;margin-bottom:12px}
.dg-licensemodal .dg-confirm-body p{margin:0 0 10px}
.dg-credit{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px}
.dg-credit:last-child{border-bottom:none}
.dg-grave{background:linear-gradient(180deg,#eceae2,#e4e1d6);border:1px solid #c9c4b4;border-radius:12px 12px 8px 8px;border-top:4px solid #9a958a;padding:14px}
.dg-grave-top{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.dg-grave-mark{font-size:26px;color:#8a857a;line-height:1}
.dg-grave-name{font-family:'Cinzel',serif;font-size:18px;color:#4a4640}
.dg-epitaph{font-style:italic;color:#5a564e;line-height:1.5;margin:8px 0;padding:8px 10px;background:#0000000a;border-left:2px solid #b8b2a4;border-radius:4px}
.dg-graveedit textarea{width:100%;box-sizing:border-box;font-family:inherit;font-size:13px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;resize:vertical}
.dg-ruin{margin-top:10px;background:#f3ede0;border:1px dashed #c2a86a;border-radius:8px;padding:10px;font-size:13px}
.dg-taleseed{font-size:11px;font-style:italic;color:#8a7a5a;margin-bottom:4px}
.dg-taletext{font-size:13px;line-height:1.45;white-space:pre-wrap}
.dg-talefoot{display:flex;justify-content:space-between;align-items:center;margin-top:4px}
.dg-diaryadd{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.dg-diaryadd textarea{font-family:inherit;font-size:13px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;resize:vertical}
.dg-tale textarea{width:100%;box-sizing:border-box;font-family:inherit;font-size:13px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;resize:vertical;margin-top:4px}
.dg-giftbadge{margin-left:6px;font-size:10px;font-weight:600;color:#7a5a1a;background:#f5ecd6;border:1px solid #d9c9a3;border-radius:5px;padding:1px 6px;white-space:nowrap}
.dg-giftbadge.realm{color:#4a3a6a;background:#eae4f2;border-color:#c3b3d6}
.dg-charbtns{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}
.dg-charbtns a.dg-logbtn{text-decoration:none}
.dg-rosterchip.link{cursor:pointer;font-family:inherit}
.dg-rosterchip.link:hover{background:#fff5df;border-color:var(--gold)}
.dg-delblock{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
.dg-pregentag{margin-left:8px;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase;color:#5a4a2a;background:#efe6d0;border:1px solid var(--gold);border-radius:5px;padding:1px 7px;vertical-align:middle}
.dg-limline{font-size:12px;color:var(--ink2);background:#f2ead4;border-radius:6px;padding:6px 9px;margin-bottom:8px}
.dg-limwarn{font-size:12.5px;color:#8f2f22;background:#fbecea;border:1px solid #eecfca;border-radius:6px;padding:7px 10px;margin-top:2px}
.dg-proposalcard{background:#fff6df;border:1px solid var(--gold);border-radius:10px;padding:12px;margin-top:4px;max-width:92%}
.dg-prop-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--maroon);margin-bottom:6px}
.dg-prop-line{font-size:14.5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dg-prop-status{margin-top:8px}
.dg-prop-done{color:var(--green);font-weight:600}
.dg-prop-declined{color:var(--ink2);font-style:italic}
.dg-propform{background:#f7efd8;border:1px solid var(--gold);border-radius:10px;padding:12px}
.dg-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;
  background:var(--gold);color:#3a2a08;border-radius:9px;font-family:'Cinzel',serif;font-size:11px;font-weight:700;vertical-align:middle}
.dg-attuned{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;color:#6a3f8a;background:#f0e6f2;border:1px solid #c9b3d6;border-radius:20px;padding:2px 9px;white-space:nowrap}
.dg-carriedtag{color:#8a7f66;font-style:italic}
.dg-attunecount{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;color:#6a3f8a;margin-bottom:6px}
.dg-doclinks{display:flex;flex-direction:column;gap:6px;margin-bottom:6px}
.dg-doclink{display:block;font-size:14px;color:var(--maroon);text-decoration:none;padding:8px 10px;background:#fff5df;border:1px solid var(--gold);border-radius:8px}
.dg-doclink:hover{background:var(--maroon);color:#f3e7c8}
.dg-reqlock{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;color:#8f2f22;background:#fbecea;border:1px solid #e3b8b0;border-radius:20px;padding:2px 10px;white-space:nowrap}
.dg-reqline{flex-basis:100%;width:100%;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:5px}
.dg-releasebtn{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;background:transparent;border:1px solid var(--line);color:var(--maroon);border-radius:20px;padding:2px 10px;cursor:pointer}
.dg-releasebtn:hover{background:var(--maroon);color:#f3e7c8}
.dg-pendingrelease{margin-top:5px;font-size:12px;color:#5a4a2a;background:#f3ead4;border:1px dashed var(--gold);border-radius:5px;padding:5px 8px}
.dg-reqbanner{margin:10px 0;padding:8px 12px;border-radius:8px;background:#f0e6f2;border:1px solid #c9b3d6;color:#5a3a6a;font-size:13px}
.dg-reqbanner.unmet{background:#fbecea;border-color:#e3b8b0;color:#8f2f22}
.dg-certfull{display:block;max-width:100%;border-radius:8px;border:1px solid var(--line);margin:6px 0}
.dg-certthumb{max-width:120px;border-radius:6px;border:1px solid var(--line);margin:4px 0}
.dg-photobtn2{display:inline-block;font-size:13px;color:var(--maroon);background:#fff5df;border:1px solid var(--gold);border-radius:8px;padding:7px 12px;cursor:pointer;margin-top:4px}
.dg-photobtn2:hover{background:var(--maroon);color:#f3e7c8}
.dg-exchange{background:#f6f1e2;border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:13.5px}
.dg-exchange-h{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.4px;color:var(--ink2);text-transform:uppercase;margin-bottom:3px}
.dg-authbtn.attn{background:#8f2f22;color:#f3e7c8;border-color:#8f2f22}
.dg-provbadge{font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase;border-radius:5px;padding:1px 7px;vertical-align:middle;white-space:nowrap;margin-left:6px}
.dg-provbadge.provisional-mentee{color:#5a4a2a;background:#efe6d0;border:1px solid var(--gold)}
.dg-provbadge.provisional-dm{color:#4a3a6a;background:#eae4f2;border:1px solid #c3b3d6}
.dg-provbadge.certified{color:#2f6a3f;background:#e2f0e6;border:1px solid #a9d0b6}
.dg-storefield{display:flex;flex-direction:column;gap:2px;margin-top:6px;font-size:11px;color:var(--ink2)}
.dg-storefield > span{font-family:'Cinzel',serif;letter-spacing:.4px;text-transform:uppercase}
.dg-storefield input{font-family:inherit;font-size:14px;padding:6px 9px;border:1px solid var(--line);border-radius:7px;background:#fffaec;max-width:220px}
.dg-storepick{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dg-storelist{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
.dg-storechipwrap{display:inline-flex;align-items:center;gap:2px}
.dg-chipx{background:none;border:none;color:var(--ink2);cursor:pointer;font-size:12px;padding:0 2px}
.dg-chipx:hover{color:#8f2f22}
.dg-storepicker{position:relative;max-width:280px}
.dg-storepicker input{width:100%;box-sizing:border-box;font-family:inherit;font-size:14px;padding:7px 10px;border:1px solid var(--line);border-radius:7px;background:#fffaec}
.dg-storepicker .dg-suggest{position:relative}
.dg-storechip{display:inline-flex;align-items:center;gap:6px;background:#fff5df;border:1px solid var(--gold);border-radius:20px;padding:3px 10px 3px 4px;cursor:pointer;font-family:inherit;font-size:12.5px;color:var(--maroon)}
.dg-storechip:hover{background:var(--maroon);color:#f3e7c8}
.dg-storelogo{display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;background:#efe6d0;border:1px solid var(--gold);color:var(--maroon)}
.dg-storelogo.glyph{background:#eee6d2}
.dg-storecardhead{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.dg-bizrow{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.dg-bizmain{min-width:0}
.dg-bizk{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--ink2);margin-bottom:2px}
.dg-bizlink{color:var(--maroon);font-size:13.5px}
.dg-flagbtn{background:none;border:none;color:#b08;cursor:pointer;font-size:14px;color:#9a3b2e;flex:0 0 auto}
.dg-flagbtn:hover{color:#8f2f22}
.dg-flagged{font-size:11px;color:#8f2f22;font-style:italic;flex:0 0 auto}
.dg-flagcount{font-size:12px;color:#8f2f22}
.dg-storeflags{margin-top:10px}
.dg-pollcard{background:#eef3e6;border:1px solid #b9cfa0;border-left:4px solid #6a8f3f;border-radius:9px;padding:11px 14px;margin-bottom:12px}
.dg-poll-h{font-family:'Cinzel',serif;font-size:13px;color:#3f5a22;margin-bottom:6px}
.dg-pollopts{display:flex;gap:8px;flex-wrap:wrap}
.dg-pollcard.mentor{background:#eae4f2;border-color:#c3b3d6;border-left-color:#6a3f8a}
.dg-pollcard.mentor .dg-poll-h{color:#4a2a6a}
.dg-shadowtag{display:inline-block;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase;color:#4a3a6a;background:#eae4f2;border:1px solid #c3b3d6;border-radius:5px;padding:1px 7px;margin-bottom:4px}
.dg-permadeath{margin-top:8px;background:#2a1416;color:#f0d8d8;border:1px solid var(--maroon);border-radius:8px;padding:8px 12px;font-size:12.5px;line-height:1.4}
.dg-permadeath b{color:#fff}
.dg-reflect{margin:5px 0;font-size:13.5px}
.dg-reflect-q{font-size:11.5px;color:var(--ink2);font-style:italic}
.dg-provbanner{background:#eae4f2;border:1px solid #c3b3d6;border-left:4px solid #6a3f8a;border-radius:9px;padding:11px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.dg-provbanner b{color:#4a2a6a}
.dg-suggestbanner{background:#eae4f2;border:1px solid #c3b3d6;border-radius:8px;padding:8px 11px;margin-bottom:10px;font-size:13px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dg-replaywarn{display:block;font-size:12px;color:#8f5a1a;background:#fbf1dd;border:1px solid #e6c98a;border-radius:6px;padding:5px 8px;margin:4px 0}
.dg-eventtag{display:inline-block;margin-top:5px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;color:#7a4a12;background:#fbf1dd;border:1px solid #e6c98a;border-radius:5px;padding:1px 8px}
.dg-openslot{align-items:center;gap:8px;flex-wrap:wrap}
.dg-openslot>span:first-child{font-weight:600;color:#7a4a12}
.dg-filterbar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px}
.dg-filterbar label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-family:'Cinzel',serif;letter-spacing:.3px;text-transform:uppercase;color:var(--ink2)}
.dg-filterbar select{font-family:inherit;font-size:13.5px;padding:5px 8px;border:1px solid var(--line);border-radius:7px;background:#fffaec;text-transform:none;letter-spacing:0}
.dg-sessactions{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}
.dg-checkedin{font-size:12.5px;color:#2f6b3a;font-weight:600;align-self:center}
.dg-completedtag{display:inline-block;margin-top:6px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3px;color:#2f6b3a;background:#e6f0e6;border:1px solid #b6d6bb;border-radius:5px;padding:2px 9px}
.dg-checkin{width:100%;font-size:13px}
.dg-checkin summary{cursor:pointer;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.3px;color:var(--ink2);padding:2px 0}
.dg-checkin .dg-check{margin:3px 0}
.dg-orgchip{display:inline-flex;align-items:center;gap:6px;background:#efe7d3;border:1px solid var(--line);border-radius:12px;padding:2px 9px 2px 3px;font-family:inherit;font-size:12.5px;cursor:pointer;color:var(--ink)}
.dg-orgchip:hover{background:#fff5df;border-color:var(--gold)}
.dg-orgmono{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:var(--maroon);color:#f3e6c8;font-family:'Cinzel',serif;font-size:10px;font-weight:700;flex:0 0 auto}
.dg-orgmono.lg{width:44px;height:44px;border-radius:10px;font-size:16px}
.dg-orgrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.dg-orggrid{display:flex;flex-direction:column;gap:8px;margin-bottom:6px}
.dg-orgcard{display:flex;gap:12px;align-items:center;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer;font-family:inherit;width:100%}
.dg-orgcard:hover{border-color:var(--gold);background:#fffaec}
.dg-orgcard-body{display:flex;flex-direction:column;gap:2px}
.dg-orgcard-name{font-family:'Cinzel',serif;font-size:15px;color:var(--maroon);font-weight:600}
.dg-orgcard-tag{font-style:italic;color:var(--ink2);font-size:12.5px}
.dg-orghead{display:flex;gap:12px;align-items:center;margin-bottom:8px}
.dg-orgtag{font-family:'Cinzel',serif;font-style:italic;color:var(--gold-d,#7a5c1e);margin-bottom:8px}
.dg-bio{font-size:13.5px;color:var(--ink);margin:2px 0;line-height:1.45}
.dg-bioblock{display:flex;flex-direction:column;gap:2px;align-items:flex-start}
.dg-bioedit textarea{width:100%;min-height:64px}
.dg-nameedit{background:none;border:none;padding:0 0 0 8px;color:var(--ink2);font-size:13px;line-height:1;cursor:pointer;opacity:.45;vertical-align:middle;transition:opacity .15s,color .15s}
.dg-nameedit:hover{opacity:1;color:var(--maroon)}
.dg-linkbtn{background:none;border:none;color:var(--maroon);font-family:inherit;font-size:12px;cursor:pointer;padding:0;text-decoration:underline}
.dg-fav{font-size:13px;color:var(--ink);margin-top:4px}
.dg-orghighlights{margin:2px 0 0;padding-left:18px;font-size:13.5px;color:var(--ink);line-height:1.5}
.dg-orghighlights li{margin:2px 0}
.dg-attunebtn{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;background:#fff7e4;border:1px solid var(--line);color:var(--ink2);border-radius:20px;padding:2px 9px;cursor:pointer}
.dg-attunebtn.on{background:#e9dcf0;color:#6a3f8a;border-color:#c9b3d6}
.dg-attune-banner{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0;padding:8px 12px;
  border:1px solid var(--gold);border-radius:7px;background:#f6ead0;font-size:13.5px;color:var(--ink2)}
.dg-attune-banner.on{border-color:#c9b3d6;background:#f0e6f2}
.dg-attune-state{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--maroon);white-space:nowrap}
.dg-attune-banner.on .dg-attune-state{color:#6a3f8a}
.dg-insp-desc{font-size:15px;line-height:1.5;margin:12px 0;color:var(--ink)}
.dg-insp-traits{margin:8px 0 0;padding-left:18px;font-size:14px;color:var(--ink2)}
.dg-insp-traits li{padding:2px 0}
.dg-srd{margin-top:14px;font-size:10.5px;letter-spacing:.5px;color:var(--ink2);opacity:.7;font-family:'Cinzel',serif;text-align:right}

.dg-modeswitch{display:flex;gap:0;border:1px solid var(--gold);border-radius:8px;overflow:hidden;margin:6px 0 4px}
.dg-modebtn{flex:1;font-family:'Cinzel',serif;font-size:12px;background:#fff7e4;border:none;padding:8px;cursor:pointer;color:var(--ink2)}
.dg-modebtn.on{background:var(--maroon);color:#f3e7c8}
.dg-check{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--ink2);margin:8px 0}
.dg-check input{width:16px;height:16px}
.dg-tagpick{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.dg-tag{font-family:inherit;font-size:13px;background:#fff7e4;border:1px solid var(--line);border-radius:20px;padding:4px 12px;cursor:pointer;color:var(--ink2)}
.dg-tag.on{background:var(--green);color:#fff;border-color:transparent}

.dg-lane{margin-top:12px;border-top:1px dashed var(--line);padding-top:10px}
.dg-lane-h{font-size:13px;color:var(--ink2);margin-bottom:7px;font-weight:600}
.dg-free{font-size:10px;background:#e4f0e5;color:var(--green);border:1px solid #b6d3b8;border-radius:4px;padding:1px 5px;margin-left:6px;font-family:'Cinzel',serif;letter-spacing:.5px}
.dg-chips{display:flex;gap:6px;flex-wrap:wrap}
.dg-chip{font-family:inherit;font-size:13px;background:#fff5df;border:1px solid var(--gold);color:var(--maroon);border-radius:20px;padding:4px 12px;cursor:pointer}
.dg-chip:hover{background:var(--maroon);color:#f3e7c8}

.dg-btn{font-family:'Cinzel',serif;font-size:13px;letter-spacing:.5px;background:linear-gradient(180deg,var(--maroon2),var(--maroon));
  color:#f3e7c8;border:1px solid #4a0c17;border-radius:7px;padding:8px 14px;cursor:pointer}
.dg-btn:hover{filter:brightness(1.08)}
.dg-btn:disabled{opacity:.4;cursor:not-allowed}
.dg-btn.ghost{background:transparent;color:var(--maroon);border:1px solid var(--gold)}
.dg-btn.ghost:hover{background:#fff5df;filter:none}
.dg-btn.danger{background:linear-gradient(180deg,#a83247,var(--danger))}
.dg-btn.sm{padding:5px 10px;font-size:12px}
.dg-btn.full{width:100%;margin-top:4px}

.dg-filters{display:flex;gap:8px;flex-wrap:wrap}
.dg-marketsearch{position:relative;margin-bottom:2px}
.dg-catsettingrow{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.dg-catsettinglbl{font-size:12px;color:var(--ink2);font-weight:600;font-family:var(--display,inherit)}
.dg-catsetting{font-family:inherit;font-size:14px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);cursor:pointer}
.dg-catsetting:focus{outline:none;border-color:var(--gold)}
.dg-searchbar{width:100%;box-sizing:border-box;font-family:inherit;font-size:14px;padding:10px 34px 10px 14px;border:1px solid var(--line);border-radius:10px;background:#fff}
.dg-searchbar:focus{outline:none;border-color:var(--gold)}
.dg-searchclear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;font-size:20px;color:var(--ink2);cursor:pointer;line-height:1;padding:2px 6px}
.dg-tagrow{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 2px}
.dg-tag{font-size:11px;color:#5a4a2a;background:#f2ead6;border:1px solid #d9cba6;border-radius:6px;padding:2px 8px;cursor:pointer;font-family:inherit;text-transform:capitalize}
.dg-tag:hover{background:#e9dbba;border-color:var(--gold)}
.dg-tag.attune{background:#eef0f6;border-color:#c3c9de;color:#4a5578;cursor:default;text-transform:none}
.dg-tag.on{background:var(--maroon);border-color:var(--maroon);color:#fff}
.dg-inlineadd{display:flex;gap:6px;margin-top:6px}
.dg-inlineadd input{flex:1;font-family:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff}
.dg-checklist{display:flex;flex-direction:column;gap:5px;margin-top:5px;max-height:170px;overflow:auto}
.dg-checkrow{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}
.dg-listcard-off{opacity:.55}
.dg-legalcheck{margin-top:10px;border:1px solid var(--line);border-radius:8px;background:#fbf7ec;overflow:hidden}
.dg-legaltoggle{width:100%;text-align:left;border:none;background:none;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--maroon);padding:8px 10px;cursor:pointer}
.dg-legalbody{padding:0 10px 10px;display:flex;flex-direction:column;gap:5px}
.dg-legalrow{font-size:12.5px;line-height:1.35;border-top:1px solid #ece3cf;padding-top:5px}
.dg-legalname{font-weight:600;color:var(--ink)}
.dg-legalexc{color:#4a5578;font-size:11.5px}
.dg-legalfoot{border-top:1px solid #ece3cf;padding-top:6px;margin-top:2px}
.dg-favorrow{padding:6px 0;border-top:1px solid var(--line)}
.dg-favorrow.faded{opacity:.5}
.dg-favorline{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.dg-favorkind{font-size:11px;font-weight:600;color:#5a4a2a;background:#f2ead6;border:1px solid #d9cba6;border-radius:6px;padding:1px 7px;white-space:nowrap}
.dg-favordesc{font-size:13.5px;color:var(--ink)}
.dg-favoractions{display:flex;gap:10px;margin-top:3px}
.dg-favoradd{display:flex;flex-direction:column;gap:6px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}
.dg-favoradd input,.dg-favoradd select{font-family:inherit;font-size:13px;padding:7px 9px;border:1px solid var(--line);border-radius:7px;background:#fff}
.dg-l5pack{margin:2px 0 8px;padding:9px 11px;border:1px solid var(--gold);border-radius:8px;background:#faf5e6}
.dg-l5pack-h{font-weight:600;color:var(--maroon);font-size:13px;margin-bottom:3px}
.dg-l5pack select{font-family:inherit;font-size:13px;padding:7px 9px;border:1px solid var(--line);border-radius:7px;background:#fff;box-sizing:border-box}
.dg-filter{font-family:'Cinzel',serif;font-size:12px;background:#fff7e4;border:1px solid var(--line);
  border-radius:20px;padding:5px 13px;cursor:pointer;color:var(--ink2)}
.dg-filter.on{background:var(--rarity,var(--maroon));color:#fff;border-color:transparent}

.dg-matchband{background:linear-gradient(180deg,#fff6df,#f6ead0);border:1px solid var(--gold);border-radius:10px;padding:14px}
.dg-match-h{font-family:'Cinzel',serif;color:var(--maroon);font-weight:700;margin-bottom:8px}
.dg-match{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-top:1px dashed var(--line);font-size:15px}
.dg-match:first-of-type{border-top:none}
.dg-swap{color:var(--gold);font-size:18px;font-weight:700}
.dg-match .dg-btn{margin-left:auto}


.dg-steps{display:flex;gap:6px;margin-bottom:10px}
.dg-step{flex:1;text-align:center;font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;
  padding:5px 4px;border-radius:5px;background:#eadfbf;color:var(--ink2);opacity:.5}
.dg-step.on{opacity:1;background:var(--green);color:#fff}
.dg-trade-line{font-size:15px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dg-trade-note{font-size:13px;color:var(--ink2);font-style:italic;margin:6px 0}

.dg-row-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}
.dg-earned{margin:10px 0;display:flex;flex-direction:column;gap:6px}
.dg-earned-row{display:flex;justify-content:space-between;align-items:center;background:#fffaec;border:1px solid var(--line);border-radius:6px;padding:7px 10px;font-size:15px}

.dg-panel{background:#fbf5e2;border:1px solid var(--line);border-radius:10px;padding:14px}
.dg-panel.warn{border-color:#c88b3a;background:#fbf0da}
.dg-panel-h{font-family:'Cinzel',serif;font-weight:700;color:var(--maroon);margin-bottom:8px}
.dg-admin-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-top:1px dashed var(--line);font-size:15px}

.dg-fcp{margin-top:28px;padding:10px 14px;font-size:11px;line-height:1.5;color:#8a8378;border-top:1px solid #2c2822;text-align:center}
.dg-muted{color:var(--ink2)}
.sm{font-size:13px}
.dg-empty{text-align:center;padding:30px;background:#f7efd8;border:1px dashed var(--line);border-radius:10px}
.dg-empty-t{font-family:'Cinzel',serif;color:var(--maroon);font-size:16px}
.dg-empty-b{color:var(--ink2);font-size:14px;margin-top:4px}

.dg-overlay{position:fixed;inset:0;background:#2b211899;display:flex;align-items:center;justify-content:center;padding:16px;z-index:40}
.dg-modal{background:linear-gradient(180deg,#fbf5e2,#f4ead0);border:2px solid var(--gold);border-radius:12px;padding:22px;max-width:480px;width:100%;max-height:88vh;overflow-y:auto;position:relative;box-shadow:0 12px 40px #0006}
.dg-modal-x{position:absolute;top:8px;right:10px;width:30px;height:30px;border-radius:50%;background:#0000000d;border:none;font-size:22px;line-height:1;color:var(--ink2);cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center}
.dg-modal-x:hover{background:#00000018;color:var(--maroon)}
.dg-modal-h{font-family:'Cinzel',serif;color:var(--maroon);margin:0 0 6px;font-size:20px}
.dg-field{display:flex;flex-direction:column;gap:4px;margin:12px 0;font-size:13px;color:var(--ink2)}
.dg-field select,.dg-field input{font-family:inherit;font-size:15px;color:var(--ink);background:#fffaec;border:1px solid var(--line);border-radius:7px;padding:8px}
.dg-swapbox{display:flex;align-items:center;gap:10px;margin:14px 0}
.dg-swapcol{flex:1}
.dg-swaplabel{font-size:11px;font-family:'Cinzel',serif;letter-spacing:1px;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
.dg-swapitem{background:#fffaec;border:1px solid var(--line);border-left:4px solid var(--rarity,#999);border-radius:7px;padding:9px;display:flex;flex-direction:column;font-weight:600}
.dg-swapcol select{width:100%;font-family:inherit;font-size:15px;padding:9px;border:1px solid var(--line);border-radius:7px;background:#fffaec}

.dg-item-name.link{background:none;border:none;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left}
.dg-item-name.link:hover{color:var(--maroon);text-decoration:underline}

.dg-inspect{--rarity:#999}
.dg-insp-head{border-top:4px solid var(--rarity);margin:-22px -22px 14px;padding:16px 44px 12px 22px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--rarity) 16%,#fbf5e2),#fbf5e2);border-radius:11px 11px 0 0}
.dg-insp-name{font-family:'Cinzel',serif;font-weight:700;font-size:22px;line-height:1.12}
.dg-insp-name .dg-variant{vertical-align:middle}
.dg-insp-type{font-size:13.5px;color:var(--ink2);font-style:italic;margin-top:3px}
.dg-insp-stats{display:flex;flex-direction:column;margin:4px 0}
.dg-statrow{display:flex;justify-content:space-between;gap:14px;padding:6px 0;border-bottom:1px dotted var(--line);font-size:14.5px;align-items:baseline}
.dg-statk{color:var(--ink2);font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap}
.dg-statv{text-align:right;font-weight:600}
.dg-insp-sec{font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin:16px 0 6px}
/* AN EYEBROW'S OWN WORDS ARE THE LABEL; ANYTHING NESTED INSIDE IT IS PROSE.
   text-transform and letter-spacing both INHERIT, so a <span className="dg-muted"> tucked inside a
   section header was silently getting 2px-tracked capitals. The Furnishings note was three lines of
   it: "THE ROOM CAME WITH THESE (DMG). GOLD ONLY MAKES THEM FINER; NOTHING WORKS BETTER FOR BEING
   BEAUTIFUL." Nobody wrote that rule — the span caught it from its parent. Applied to every class
   that uppercases, not only the one currently guilty of it, so the next eyebrow to wrap a sentence
   cannot do this again. Label shouts; sentence doesn't. */
.3 .dg-muted,.3 em,.3 i,.35 .dg-muted,.35 em,.35 i,.5px .dg-muted,.5px em,.5px i,.dg-attune-state .dg-muted,.dg-attune-state em,.dg-attune-state i,.dg-attunecount .dg-muted,.dg-attunecount em,.dg-attunecount i,.dg-availtag .dg-muted,.dg-availtag em,.dg-availtag i,.dg-bizk .dg-muted,.dg-bizk em,.dg-bizk i,.dg-bubble-who .dg-muted,.dg-bubble-who em,.dg-bubble-who i,.dg-dmnote-h .dg-muted,.dg-dmnote-h em,.dg-dmnote-h i,.dg-dmstats .dg-muted,.dg-dmstats em,.dg-dmstats i,.dg-eyebrow .dg-muted,.dg-eyebrow em,.dg-eyebrow i,.dg-factiontag .dg-muted,.dg-factiontag em,.dg-factiontag i,.dg-filterbar .dg-muted,.dg-filterbar em,.dg-filterbar i,.dg-furntier .dg-muted,.dg-furntier em,.dg-furntier i,.dg-gifts-h .dg-muted,.dg-gifts-h em,.dg-gifts-h i,.dg-insp-sec .dg-muted,.dg-insp-sec em,.dg-insp-sec i,.dg-mine-tag .dg-muted,.dg-mine-tag em,.dg-mine-tag i,.dg-nexttable-eyebrow .dg-muted,.dg-nexttable-eyebrow em,.dg-nexttable-eyebrow i,.dg-nexttable-stats .dg-muted,.dg-nexttable-stats em,.dg-nexttable-stats i,.dg-notice-h .dg-muted,.dg-notice-h em,.dg-notice-h i,.dg-pendingtag .dg-muted,.dg-pendingtag em,.dg-pendingtag i,.dg-portrait-hint .dg-muted,.dg-portrait-hint em,.dg-portrait-hint i,.dg-pregentag .dg-muted,.dg-pregentag em,.dg-pregentag i,.dg-presettag .dg-muted,.dg-presettag em,.dg-presettag i,.dg-prop-h .dg-muted,.dg-prop-h em,.dg-prop-h i,.dg-provbadge .dg-muted,.dg-provbadge em,.dg-provbadge i,.dg-report-h .dg-muted,.dg-report-h em,.dg-report-h i,.dg-samplebadge .dg-muted,.dg-samplebadge em,.dg-samplebadge i,.dg-seriestag .dg-muted,.dg-seriestag em,.dg-seriestag i,.dg-shadowtag .dg-muted,.dg-shadowtag em,.dg-shadowtag i,.dg-step .dg-muted,.dg-step em,.dg-step i,.dg-storefield .dg-muted,.dg-storefield em,.dg-storefield i,.dg-swaplabel .dg-muted,.dg-swaplabel em,.dg-swaplabel i,.dg-wish-h .dg-muted,.dg-wish-h em,.dg-wish-h i{text-transform:none;letter-spacing:normal;font-family:'EB Garamond',serif;font-weight:400;font-size:12.5px}

.dg-subhead{font-weight:700;color:var(--ink);font-size:13px;margin:2px 0}
.dg-lineage{list-style:none;margin:0;padding:0;font-size:14px}
.dg-lineage li{position:relative;padding:6px 0 6px 16px;border-left:2px solid var(--line);margin-left:4px}
.dg-lineage li:last-child{border-left-color:transparent}
.dg-lineage li:before{content:"";position:absolute;left:-5px;top:12px;width:8px;height:8px;border-radius:50%;background:var(--gold);border:1px solid #fff}

@media (max-width:720px){
  .dg-profileopts-toggle{display:inline-flex;align-items:center;gap:6px}
  .dg-profileopts{display:none}
  .dg-profileopts.open{display:block;margin-top:8px}
  .dg-shell{flex-direction:column}
  .dg-top{flex-wrap:wrap;padding:10px 14px;gap:8px}
  .dg-top select{max-width:52vw}
  .dg-nav{flex-direction:row;width:100%;position:fixed;left:0;right:0;bottom:0;order:2;background:#fff7e4;border-top:2px solid var(--gold);padding:8px 8px calc(8px + env(safe-area-inset-bottom));justify-content:space-around;z-index:50}
  .dg-nav > .dg-navbtn:nth-child(n+5){display:none}
  .dg-navmore-wrap{display:flex}
  .dg-navmore-wrap.dg-navmore-empty{display:none}
  .dg-navbtn{flex-direction:column;gap:2px;font-size:11px;padding:6px 8px}
  .dg-navbtn.active{box-shadow:inset 0 3px 0 var(--gold)}
  .dg-navdot{top:3px;right:calc(50% - 16px);box-shadow:0 0 0 3px #fff7e4}
  .dg-navlabel{font-size:10px}
  .dg-main{order:1;padding:14px 14px calc(84px + env(safe-area-inset-bottom))}
  .dg-title{font-size:16px}
  .dg-sub{display:none}
  .dg-grid,.dg-chargrid{grid-template-columns:1fr}
  .dg-root{font-size:16px}
}
`;
