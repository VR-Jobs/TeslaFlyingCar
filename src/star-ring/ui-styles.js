// The result card, action buttons, air meter and rainbow meter use game.css,
// shared by the coast and dark-space scenes. Only star-ring layout lives here.
export const RING_UI_STYLES = `
body.star-ring-active #menu.minimal-home:not(.hidden),body.star-ring-active #menu,body.star-ring-active #hud,body.star-ring-active .drive-coach,body.star-ring-active .drive-feedback,body.star-ring-active .drive-warning,body.star-ring-active #quick-restart,body.star-ring-active #handling-indicator{display:none!important}
#star-ring-ui{position:fixed;inset:0;z-index:40;color:var(--white);font:13px/1.5 "Noto Sans SC",system-ui,sans-serif;pointer-events:none;outline:none;isolation:isolate;transition:background .15s}
#star-ring-ui[hidden],#star-ring-ui [hidden]{display:none!important}
#star-ring-ui.ring-recovering{background:#02050bb0}
#star-ring-ui button{pointer-events:auto;cursor:pointer}
#star-ring-ui button:focus-visible,#star-ring-ui summary:focus-visible{outline:2px solid #fff;outline-offset:3px}
.ring-top button,.ring-touch button{padding:8px 13px;border:1px solid var(--line);border-radius:2px;background:#08080acc;color:var(--white);font:inherit}
.ring-top button:hover,.ring-touch button:hover{border-color:#fff}
.ring-top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:18px 22px}
.ring-heading{position:relative;text-align:center;width:min(430px,50vw);padding:6px 15px;background:#08080acc;border:1px solid var(--line)}
.ring-heading strong{font-size:17px;letter-spacing:.15em}.ring-heading span{display:block;font-size:11px;color:var(--dim)}
.ring-heading progress{display:block;height:3px;width:100%;margin-top:7px;accent-color:#fff}
#star-ring-ui [data-ring=skip]{position:absolute;right:7px;top:5px;padding:3px 6px;font-size:10px}
.ring-teaching .ring-heading{padding-right:48px}.ring-teaching .ring-heading strong{font-size:14px;letter-spacing:.06em}
.ring-teaching .ring-readouts,.ring-teaching #ring-hint,.ring-teaching #ring-feedback,.ring-teaching #ring-critical-cue{display:none}
.ring-teaching [data-hold=suction]{border-color:#fff;box-shadow:0 0 12px #fff3}.ring-teaching [data-hold]:disabled{opacity:.35;cursor:default}
.ring-readouts{display:flex;justify-content:center;align-items:center;gap:17px;font-variant-numeric:tabular-nums;font-size:18px;text-shadow:0 2px 5px #000}
#ring-combo{color:#a4e5ef;font-size:14px}#ring-rhythm,#ring-ghost-status{font-size:10px;color:#b1e6ed}
.ring-status-meters.meters{width:min(340px,76vw);margin:6px auto 0;position:relative;height:0}
.ring-rainbow-active .ring-status-meters{height:33px}
#ring-rainbow[data-paused],#ring-rainbow[data-paused] *{animation-play-state:paused!important}
#ring-critical-cue{position:absolute;top:120px;left:50%;transform:translateX(-50%);max-width:90vw;padding:3px 9px;border-radius:2px;background:#08080acc;color:#bfefff;font-size:10px;text-align:center;pointer-events:none}
.ring-rainbow-active #ring-critical-cue{top:178px}
#ring-critical-cue:empty,#ring-hint:empty{display:none}
#ring-hint{position:absolute;top:125px;left:50%;transform:translateX(-50%);font-size:11px;background:#08080acc;padding:4px 10px;text-align:center;max-width:85vw}
.ring-rainbow-active #ring-hint{top:178px}
#ring-feedback{position:absolute;top:165px;right:22px;color:#bbebee;font-size:12px;text-shadow:0 2px 5px #000}
.ring-screen-fx{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}.ring-screen-fx *{pointer-events:none}
#ring-star-overlay[data-paused],#ring-star-overlay[data-paused]:before,#ring-score[data-paused]{animation-play-state:paused!important}
#ring-star-flash{transition:none;pointer-events:none}
.ring-bottom{position:absolute;bottom:max(15px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(640px,90vw)}
.ring-pressure.air{margin:0 auto 9px;text-shadow:0 2px 5px #000}
#ring-state{font-size:10px;letter-spacing:.04em;color:var(--dim);margin-left:8px}
.ring-pressure.grip-warning .air-bar{border-color:#f6a95f;box-shadow:0 0 18px #f29a4328}
.ring-semantic-progress{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.ring-voyage{display:flex;justify-content:space-between;gap:8px;letter-spacing:.02em}
#ring-escort{color:#f7dfab;white-space:nowrap}#ring-event{text-align:right}
.ring-keys{text-align:center;font-size:10px;color:var(--dim);text-shadow:0 2px 6px #000}
.ring-touch{display:none;justify-content:center;gap:7px;margin-top:9px}
.ring-touch button{touch-action:none;user-select:none}.ring-touch button.is-held{background:#ffffff30;border-color:#fff}
#ring-overlay{position:absolute;inset:0;pointer-events:auto;box-sizing:border-box;padding:20px;overflow:auto}
.ring-modal.go-card{box-sizing:border-box;width:min(460px,100%);max-height:calc(100dvh - 40px);overflow:auto;overscroll-behavior:contain}
.ring-modal .modal-title{margin:0 0 10px}.ring-modal .modal-desc{margin:8px 0 14px;letter-spacing:.02em}
.ring-modal-actions{display:flex;align-items:center;width:100%;margin-top:18px}.ring-modal-actions .go-buttons{width:100%}
.ring-modal-actions button{white-space:nowrap}
.ring-assist{display:block;font-size:11px;color:var(--dim);margin-top:18px}.ring-assist input{accent-color:#e31937;vertical-align:middle}
.ring-result-metrics{display:flex;justify-content:center;gap:20px;color:var(--dim);font-size:12px;margin-top:10px}.ring-result-metrics b{color:var(--white);font-weight:500;margin-left:4px}
.ring-record-line{font-size:11px;color:var(--dim);margin:10px 0}
.ring-more,.ring-result-details{color:var(--dim);font-size:11px;margin-top:16px}.ring-more summary,.ring-result-details summary{cursor:pointer;list-style-position:inside;pointer-events:auto}
.ring-more .go-buttons{margin-top:12px}.ring-more button{font-size:12px;padding:8px 12px}
.ring-result-details p{font-size:11px;margin:6px 0}.ring-result-details[open]{padding-bottom:8px;border-bottom:1px solid var(--line)}
.ring-dialog-open>.ring-top,.ring-dialog-open>.ring-readouts,.ring-dialog-open>.ring-status-meters,.ring-dialog-open>.ring-bottom,.ring-dialog-open>#ring-hint,.ring-dialog-open>#ring-feedback,.ring-dialog-open>#ring-critical-cue{visibility:hidden}
.ring-compact .ring-bottom{bottom:max(8px,env(safe-area-inset-bottom))}.ring-compact .ring-pressure{margin-bottom:0}
.ring-compact .ring-keys,.ring-compact #ring-hint,.ring-compact #ring-feedback{display:none}.ring-compact .ring-touch{margin-top:6px}
@media(any-pointer:coarse),(max-width:700px){
 .ring-touch{display:flex}.ring-keys{display:none}.ring-top{padding:12px;gap:8px}
 .ring-top button{font-size:11px;padding:7px 9px}.ring-heading{width:48vw;padding:5px 9px}.ring-heading strong{font-size:14px}
 .ring-readouts{font-size:15px;gap:10px}#ring-combo{font-size:11px}#ring-ghost-status{display:none}
 #ring-hint{top:112px;width:80vw;font-size:10px}#ring-feedback{top:147px;font-size:10px;right:12px}
 #ring-critical-cue{top:109px;font-size:9px}.ring-rainbow-active #ring-critical-cue,.ring-rainbow-active #ring-hint{top:151px}
 .ring-touch button{padding:10px 11px;font-size:11px}.ring-bottom{width:94vw}.ring-pressure.air{width:min(520px,90vw)}
 .ring-modal.go-card{padding:22px 16px}.ring-modal-actions .primary,.ring-modal-actions .ghost{padding:11px 14px}
 #ring-state{font-size:9px}.ring-voyage{font-size:9px}.ring-rainbow-active .ring-status-meters{height:29px}
}
@media(max-width:420px){.ring-readouts{gap:8px}#ring-rhythm{font-size:9px}.ring-modal-actions .primary{width:100%}.ring-modal-actions .ghost{flex:1}.ring-top{padding:8px}.ring-heading strong{font-size:12px}.ring-heading span{font-size:10px}}
@media(max-height:540px){#ring-overlay{padding:10px}.ring-modal.go-card{max-height:calc(100dvh - 20px);padding:16px}.ring-modal .go-score{font-size:48px}.ring-modal .go-stats{margin-bottom:6px}.ring-modal .modal-title{font-size:19px}.ring-modal-actions{margin-top:12px}.ring-more{margin-top:12px}}
@media(max-height:540px) and (min-width:700px){
 .ring-dialog-open[data-panel=finished] .ring-modal.go-card{width:min(720px,100%);display:grid;grid-template-columns:1fr 1.1fr;column-gap:24px;align-items:center;max-height:calc(100dvh - 20px)}
 .ring-dialog-open[data-panel=finished] .ring-modal-summary{grid-column:1;grid-row:1/4}
 .ring-dialog-open[data-panel=finished] #ring-result{grid-column:2;grid-row:1}
 .ring-dialog-open[data-panel=finished] .ring-modal-actions{grid-column:2;grid-row:2;margin-top:10px}
 .ring-dialog-open[data-panel=finished] .ring-more{grid-column:2;grid-row:3;margin-top:10px}
 .ring-dialog-open[data-panel=finished] .ring-result-metrics{gap:14px}
 .ring-dialog-open[data-panel=finished] .go-rewards{margin-top:10px;padding-top:10px}
}
@media(prefers-reduced-motion:reduce){#ring-star-overlay,#ring-star-overlay:before,#ring-score.star,#ring-rainbow *,#ring-air-fill,.ring-modal.go-card{animation:none!important;transition:none!important}#ring-star-flash{opacity:0!important}}
`;
