export const minimalHomeStyles = `
#menu.minimal-home:not(.hidden){display:block!important}
#menu.minimal-home{padding:0!important;background:linear-gradient(90deg,#000000ed 0%,#000000b8 30%,#00000016 69%,#00000022 100%);color:#fff;overflow:auto;pointer-events:auto;touch-action:pan-y}
#menu.minimal-home,#menu.minimal-home.car-hover{cursor:default}
.minimal-shell{min-height:100dvh;width:100%;max-width:1600px;margin:auto;display:flex;align-items:center;padding:42px clamp(28px,5vw,80px);box-sizing:border-box}
.minimal-panel{width:min(360px,42vw);pointer-events:auto;padding:24px 0}
.minimal-title{font:750 clamp(42px,4.8vw,68px)/1.22 "Noto Sans SC","Microsoft YaHei",system-ui,sans-serif;letter-spacing:.045em;margin:0;color:#fff;text-shadow:none}
.minimal-title span,.minimal-title strong{display:block;font-weight:inherit}.minimal-title strong{color:#e31937;margin-top:6px}
.minimal-tagline{font:13px/1.9 "Noto Sans SC",system-ui,sans-serif;letter-spacing:.04em;color:#ffffffa6;margin:21px 0 30px}
.minimal-actions{display:grid;grid-template-columns:1fr;gap:12px;width:100%}
.minimal-actions button{box-sizing:border-box;width:100%!important;min-width:0!important;height:54px!important;padding:0 24px!important;margin:0!important;border:1px solid #ffffff45!important;border-radius:7px!important;background:#080808b8!important;color:#fff!important;font:600 17px/1 "Noto Sans SC",system-ui,sans-serif!important;letter-spacing:.14em!important;box-shadow:none!important;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
.minimal-actions #play-btn{background:#e31937!important;border-color:#e31937!important}.minimal-actions button:hover{border-color:#e31937!important;background:#e319371f!important;transform:translateY(-1px)}.minimal-actions #play-btn:hover{background:#f02544!important}
.minimal-actions button:focus-visible{outline:2px solid #fff;outline-offset:4px}.minimal-actions button:disabled{opacity:.5;cursor:wait}
.minimal-info-slot{margin:12px 0}.minimal-info-slot button{border:1px solid #ffffff35!important;background:#111!important;color:#fff!important;padding:9px 14px!important;font:13px system-ui!important;border-radius:5px!important;width:auto!important;position:static!important}
#menu.minimal-home #language-toggle{display:block!important;position:fixed;top:calc(22px + env(safe-area-inset-top,0px))!important;right:calc(26px + env(safe-area-inset-right,0px))!important;bottom:auto!important;min-width:84px;min-height:40px;padding:8px 16px!important;border:1px solid #ffffff70!important;border-radius:7px!important;background:#080808cc!important;color:#fff!important;font:600 14px/1.4 system-ui,sans-serif!important;letter-spacing:.02em;z-index:90}
#menu.minimal-home #language-toggle:hover{border-color:#e31937!important;background:#e3193726!important}
#menu.minimal-home #language-toggle:focus-visible{outline:2px solid #fff;outline-offset:4px}
html[lang=en] .minimal-title{letter-spacing:.01em}
@media(max-width:760px){html[lang=en] .minimal-title{display:block;font-size:38px}html[lang=en] .minimal-title strong{margin-top:3px}#menu.minimal-home #language-toggle{top:calc(14px + env(safe-area-inset-top,0px))!important;right:calc(16px + env(safe-area-inset-right,0px))!important}}
@media(max-width:760px){#menu.minimal-home{background:linear-gradient(0deg,#000000fa 0%,#000000e8 46%,#00000022 83%,#00000066 100%)}.minimal-shell{align-items:flex-end;padding:200px 25px 30px}.minimal-panel{width:100%;max-width:420px;margin:auto;padding:14px 0 0}.minimal-title{font-size:43px;display:flex;align-items:baseline;gap:11px;letter-spacing:.01em}.minimal-title strong{margin:0}.minimal-tagline{font-size:12px;margin:13px 0 20px}.minimal-actions{gap:10px}.minimal-actions button{height:49px!important;font-size:16px!important}}
@media(max-width:390px){.minimal-title{font-size:36px;gap:8px}.minimal-shell{padding-left:20px;padding-right:20px}.minimal-tagline{font-size:11px}}
@media(max-height:600px) and (min-width:761px){.minimal-shell{padding-top:20px;padding-bottom:20px}.minimal-title{font-size:42px}.minimal-tagline{margin:12px 0 19px}.minimal-actions{gap:9px}.minimal-actions button{height:45px!important;font-size:15px!important}}
`;
