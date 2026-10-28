export const scenePickerStyles = `
.scene-picker{box-sizing:border-box;width:min(740px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;padding:30px;border:1px solid #ffffff38;border-radius:16px;background:#0b0b0d;color:#fff;font:14px/1.6 "Noto Sans SC",system-ui,sans-serif;box-shadow:0 24px 100px #0009;touch-action:pan-y}
.scene-picker::backdrop{background:#000b;backdrop-filter:blur(9px)}
.scene-picker h2{margin:0;font-size:27px;letter-spacing:.04em}.scene-picker-description{color:#aaa;margin:8px 0 23px}
.scene-picker{width:min(1000px,calc(100vw - 32px))}.scene-picker-choices{border:0;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;min-width:0}
.scene-option-card{height:100%;box-sizing:border-box}.scene-art-starRing::after{content:"新玩法 · E 吸附";position:absolute;bottom:7px;right:7px;background:#080c17cc;color:#bfeef4;border:1px solid #7ca1b855;border-radius:4px;padding:3px 6px;font-size:10px}
.scene-picker-choices legend{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.scene-option{position:relative;cursor:pointer;min-width:0}.scene-option>input{position:absolute;width:1px;height:1px;opacity:0;left:16px;top:16px}
.scene-option-card{position:relative;display:block;overflow:hidden;border:1px solid #ffffff32;border-radius:10px;background:#141416;transition:border-color .15s,box-shadow .15s}
.scene-option-card::after{content:"";position:absolute;top:13px;left:13px;width:17px;height:17px;border:1px solid #ffffff80;border-radius:50%;background:#0008;box-sizing:border-box}
.scene-option input:checked+.scene-option-card{border-color:#e31937;box-shadow:0 0 0 1px #e31937}
.scene-option input:checked+.scene-option-card::after{border:5px solid #e31937;background:#fff}
.scene-option input:focus-visible+.scene-option-card{outline:2px solid #fff;outline-offset:4px}
.scene-option:hover .scene-option-card{border-color:#fff9}.scene-option input:checked+.scene-option-card:hover{border-color:#e31937}
.scene-art{display:block;position:relative;aspect-ratio:16/9;overflow:hidden;background:#090b0d}
.scene-art img{display:block;width:100%;height:100%;object-fit:cover;object-position:center;pointer-events:none}
.scene-option-text{display:block;padding:17px 18px 19px}.scene-option-text strong{display:block;font-size:19px;font-weight:650}.scene-option-text>span{display:block;margin-top:5px;color:#aaa;font-size:12px}
.scene-picker-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:25px}.scene-picker-actions button{border:1px solid #ffffff45;border-radius:6px;padding:11px 24px;background:#161618;color:#fff;font:inherit;font-size:15px;font-weight:600;line-height:1.4;cursor:pointer;min-height:45px}
.scene-picker-actions .scene-picker-launch{background:#e31937;border-color:#e31937;min-width:160px}.scene-picker-actions button:hover{filter:brightness(1.15)}.scene-picker-actions button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.scene-picker button:disabled,.scene-picker fieldset:disabled{opacity:.55;cursor:wait}.scene-picker-error{color:#ff8b96;font-size:13px;margin:15px 0 0}
@media(max-width:520px){.scene-picker{padding:22px 18px}.scene-picker h2{font-size:23px}.scene-picker-description{font-size:12px;margin-bottom:18px}.scene-picker-choices{gap:12px}.scene-option-text{padding:12px 10px 14px}.scene-option-text strong{font-size:16px}.scene-option-text>span{font-size:11px;line-height:1.7}.scene-picker-actions{margin-top:20px;gap:10px}.scene-picker-actions button{padding:10px 17px}.scene-picker-actions .scene-picker-launch{flex:1;min-width:0}}
@media(max-width:700px){.scene-picker-choices{grid-template-columns:1fr}.scene-option-card{display:grid;grid-template-columns:40% 60%;align-items:center;min-height:95px}.scene-art{height:100%;min-height:95px;aspect-ratio:auto}.scene-option-text{padding:13px}.scene-option-text strong{font-size:17px}.scene-picker{max-width:520px}.scene-art-starRing::after{font-size:8px;padding:2px 3px}.scene-picker-choices{gap:10px}}
@media(max-height:480px){.scene-picker{padding:18px 22px}.scene-picker-description{margin:5px 0 12px}.scene-option-text{padding:9px 13px}.scene-picker-actions{margin-top:15px}}

.scene-planet-options{padding:13px 16px;margin:16px 0 4px;background:#ffffff06;border:1px solid #ffffff20;border-radius:8px}
.scene-planet-options[hidden]{display:none}.scene-planet-options label{display:flex;gap:18px;align-items:center;color:#fff;font-size:13px}
.scene-planet-options select{flex:1;max-width:260px;padding:8px 12px;border:1px solid #ffffff45;background:#101114;color:#fff;border-radius:4px;font:inherit}
.scene-planet-options small{display:block;color:#aaa;margin-top:7px;font-size:11px}
`;
