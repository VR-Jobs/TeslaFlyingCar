var e = {
  en: [
    `English`,
    `Language`,
    `Page navigation`,
    `Policies`,
    `Updated`,
    `Coin purchases`,
    `Refund policy`,
    `Terms of Use`,
    `Privacy Policy`,
    `About & contact`,
  ],
  ko: [
    `한국어`,
    `언어`,
    `페이지 탐색`,
    `정책`,
    `최종 수정일`,
    `코인 충전`,
    `환불 안내`,
    `이용약관`,
    `개인정보처리방침`,
    `운영자 · 문의`,
  ],
  de: [
    `Deutsch`,
    `Sprache`,
    `Seitennavigation`,
    `Richtlinien`,
    `Aktualisiert`,
    `Münzen kaufen`,
    `Rückerstattungen`,
    `Nutzungsbedingungen`,
    `Datenschutzerklärung`,
    `Über uns & Kontakt`,
  ],
  fr: [
    `Français`,
    `Langue`,
    `Navigation de la page`,
    `Politiques`,
    `Mise à jour`,
    `Acheter des pièces`,
    `Remboursements`,
    `Conditions d’utilisation`,
    `Politique de confidentialité`,
    `À propos et contact`,
  ],
  es: [
    `Español`,
    `Idioma`,
    `Navegación de la página`,
    `Políticas`,
    `Actualizado`,
    `Comprar monedas`,
    `Reembolsos`,
    `Condiciones de uso`,
    `Política de privacidad`,
    `Acerca de y contacto`,
  ],
  ja: [
    `日本語`,
    `言語`,
    `ページナビゲーション`,
    `ポリシー`,
    `最終更新日`,
    `コイン購入`,
    `返金ポリシー`,
    `利用規約`,
    `プライバシーポリシー`,
    `運営者・お問い合わせ`,
  ],
  zh: [
    `简体中文`,
    `语言`,
    `页面导航`,
    `政策`,
    `更新日期`,
    `购买金币`,
    `退款政策`,
    `使用条款`,
    `隐私政策`,
    `关于与联系`,
  ],
  it: [
    `Italiano`,
    `Lingua`,
    `Navigazione della pagina`,
    `Informative`,
    `Aggiornato`,
    `Acquista monete`,
    `Rimborsi`,
    `Condizioni d’uso`,
    `Informativa sulla privacy`,
    `Informazioni e contatti`,
  ],
  pt: [
    `Português`,
    `Idioma`,
    `Navegação da página`,
    `Políticas`,
    `Atualizado`,
    `Comprar moedas`,
    `Reembolsos`,
    `Termos de uso`,
    `Política de privacidade`,
    `Sobre e contato`,
  ],
  ru: [
    `Русский`,
    `Язык`,
    `Навигация по странице`,
    `Правила`,
    `Обновлено`,
    `Покупка монет`,
    `Возвраты`,
    `Условия использования`,
    `Политика конфиденциальности`,
    `Об игре и контакты`,
  ],
  pl: [
    `Polski`,
    `Język`,
    `Nawigacja strony`,
    `Zasady`,
    `Aktualizacja`,
    `Kup monety`,
    `Zwroty`,
    `Regulamin`,
    `Polityka prywatności`,
    `O grze i kontakt`,
  ],
};
function t(t) {
  let n = String(t || ``)
    .toLowerCase()
    .split(/[-_]/)[0];
  return Object.hasOwn(e, n) ? n : null;
}
function n(e, t) {
  if (!e) return ``;
  let n = e.replace(/-(en|ko|de|fr|es|ja|zh|it|pt|ru|pl)$/, ``);
  return t === `en` ? n : n + `-` + t;
}
function r(e, t, r, i) {
  let a = new URL(e, i);
  return (
    a.searchParams.set(`lang`, t),
    r === t ? a.searchParams.delete(`gameLang`) : a.searchParams.set(`gameLang`, r),
    (a.hash = n(a.hash, t)),
    a.pathname + a.search + a.hash
  );
}
var i;
try {
  i = localStorage.getItem(`rdstr.lang`);
} catch {}
var a = new URLSearchParams(location.search),
  o =
    t(a.get(`lang`)) ||
    t(i) ||
    [...(navigator.languages || []), navigator.language].map(t).find(Boolean) ||
    `en`,
  s = t(a.get(`gameLang`)) || o,
  c = e[o],
  l = [`/pricing`, `/refunds`, `/terms`, `/privacy`, `/legal`];
document.documentElement.lang = o;
for (let e of document.querySelectorAll(`[data-document-lang]`))
  e.hidden = e.dataset.documentLang !== o;
var u = document.querySelector(`[data-document-lang="${o}"] h1`);
u && (document.title = `${u.textContent} · Roadster Dash`);
for (let e of document.querySelectorAll(`[data-legal-route]`)) {
  let t = e.dataset.legalRoute;
  if (((e.href = r(t, o, s, location.origin)), !e.closest(`article`))) {
    let n = l.indexOf(t.split(`#`)[0]);
    n !== -1 && (e.textContent = c[5 + n]);
  }
}
var d = document.getElementById(`legal-language`);
d &&
  ((d.value = o),
  (document.getElementById(`legal-language-label`).textContent = c[1]),
  (d.onchange = () => {
    location.assign(r(location.pathname + location.hash, d.value, s, location.origin));
  }));
for (let e of document.querySelectorAll(`nav[aria-label]`))
  e.setAttribute(`aria-label`, e.querySelector(`[data-game-link]`) ? c[2] : c[3]);
var f = n(location.hash, o);
f &&
  f !== location.hash &&
  document.getElementById(f.slice(1)) &&
  (history.replaceState(history.state, ``, location.pathname + location.search + f),
  document.getElementById(f.slice(1)).scrollIntoView());
for (let e of document.querySelectorAll(`[data-game-link]`))
  e.href = `/?lang=${encodeURIComponent(s)}`;
