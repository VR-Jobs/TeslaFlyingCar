(() => {
  const dialog = document.createElement("dialog");
  dialog.id = "standalone-info";
  dialog.className = "drive-hub";
  dialog.style.maxWidth = "680px";
  const header = document.createElement("div");
  header.className = "drive-dialog-top";
  const title = document.createElement("h2");
  const close = document.createElement("button");
  close.className = "drive-close";
  close.type = "button";
  close.textContent = "×";
  close.onclick = () => dialog.close();
  header.append(title, close);
  const about = document.createElement("p");
  const controls = document.createElement("p");
  const saving = document.createElement("p");
  const exportButton = document.createElement("button");
  const importButton = document.createElement("button");
  exportButton.type = importButton.type = "button";
  exportButton.className = importButton.className = "drive-launcher";
  exportButton.onclick = () => window.roadster.exportSave();
  const file = document.createElement("input");
  file.type = "file";
  file.accept = ".json,application/json";
  file.hidden = true;
  importButton.onclick = () => file.click();
  file.onchange = async () => {
    if (!file.files[0]) return;
    try {
      const data = JSON.parse(await file.files[0].text());
      window.roadster.backend.importSave(data);
      location.reload();
    } catch (error) {
      saving.textContent = (document.documentElement.lang === "zh" ? "导入失败：" : "Import failed: ") + String(error.message || error);
    }
  };
  const credit = document.createElement("a");
  credit.href = "https://roadsterdash.com/legal";
  credit.target = "_blank";
  credit.rel = "noopener";
  const licenses = document.createElement("details");
  const summary = document.createElement("summary");
  const notice = document.createElement("pre");
  notice.textContent = __THIRD_PARTY_NOTICES__;
  notice.style.cssText = "white-space:pre-wrap;max-height:250px;overflow:auto;font:12px/1.5 monospace";
  licenses.append(summary, notice);
  dialog.append(header, about, controls, saving, exportButton, importButton, file, document.createElement("p"), credit, licenses);
  document.body.append(dialog);
  const launcher = document.createElement("button");
  launcher.id = "standalone-info-button";
  launcher.type = "button";
  launcher.style.cssText = "display:block;margin:6px auto 0;border:0;background:transparent;color:inherit;opacity:.7;font:inherit;font-size:12px;cursor:pointer";
  const saveSlot=document.getElementById("space-save-slot");
  if(saveSlot)saveSlot.replaceChildren(launcher);
  else document.getElementById("driving-hub-button").nextElementSibling?.after(launcher);
  launcher.onclick = () => dialog.showModal();
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-policy-link]");
    if (!link) return;
    event.preventDefault();
    dialog.showModal();
  });
  const translate = () => {
    const zh = document.documentElement.lang === "zh";
    launcher.textContent = zh ? "作品来源与许可" : "Sources and licenses";
    title.textContent = zh ? "作品来源、许可与本地存档" : "Sources, licenses and local saves";
    close.setAttribute("aria-label", zh ? "关闭" : "Close");
    about.textContent = zh ? "游戏原作：Taejoo Um / morpii。本地恢复与玩法增强版；脚本、字体和图片均包含在此 HTML 中，双击即可离线游玩。" : "Original game by Taejoo Um / morpii. Local recovery with gameplay enhancements. Scripts, fonts and images are embedded in this HTML for offline play.";
    controls.textContent = zh ? "左右键变道；空格/上键跳跃，按住飞行；空中再次按下翻转；空中左右键桶滚；下键俯冲；Shift 加速；Z 道具；P 暂停。" : "Left/right: change lanes; Space/Up: jump, hold to fly; press again in the air to flip; left/right in the air: barrel roll; Down: dive; Shift: boost; Z: item; P: pause.";
    saving.textContent = zh ? "成绩和进度保存在当前浏览器。建议移动文件、更换浏览器或清理浏览器数据前先导出存档。导入会替换当前本地进度。云端排名、登录和真实付款在本地版不可用。" : "Progress is saved in this browser. Export your save before moving the HTML, changing browsers or clearing browser data. Import replaces local progress. Cloud rankings, sign-in and real payments are unavailable locally.";
    exportButton.textContent = zh ? "导出存档" : "Export save";
    importButton.textContent = zh ? "导入存档" : "Import save";
    credit.textContent = zh ? "原作者与官网说明（联网打开）" : "Original author and official site (online)";
    summary.textContent = zh ? "第三方依赖声明" : "Third-party notices";
  };
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  translate();
})();
