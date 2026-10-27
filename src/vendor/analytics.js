var e = { DEBUG: !1, LIB_VERSION: `1.438.12`, LIB_NAME: `web`, JS_SDK_VERSION: `0.9.5` },
  t = e,
  n = `$early_access_features`,
  r = `$active_feature_flags`,
  i = `$feature_flag_details`,
  a = `$feature_flag_errors`,
  o = `$feature_flag_evaluated_at`,
  s = `$feature_flag_request_id`,
  c = `$minimal_flag_called_events`,
  l = `$enabled_feature_flags`,
  u = `$stored_group_properties`,
  d = `$stored_person_properties`,
  f = `$flag_call_reported`,
  p = `$flag_call_reported_session_id`,
  m = `$feature_flag_payloads`,
  h = `$override_feature_flags`,
  g = `$override_feature_flag_payloads`,
  _ = `visibilitychange`,
  v = `$people_distinct_id`,
  y = `distinct_id`,
  b = `$device_id`,
  x = `$device_model`,
  S = `__alias`,
  C = `__cmpns`,
  w = `$fbc`,
  T = `$fbc_persistence`,
  E = `$fbp`,
  ee = `$fbp_persistence`,
  te = `__timers`,
  ne = `$autocapture_disabled_server_side`,
  D = `$heatmaps_enabled_server_side`,
  re = `$exception_capture_enabled_server_side`,
  ie = `$error_tracking_suppression_rules`,
  ae = `$error_tracking_capture_extension_exceptions`,
  oe = `$web_vitals_enabled_server_side`,
  se = `$dead_clicks_enabled_server_side`,
  ce = `$product_tours_enabled_server_side`,
  le = `$logs_capture_enabled_server_side`,
  ue = `$web_vitals_allowed_metrics`,
  de = `$session_recording_remote_config`,
  fe = `$session_recording_enabled_server_side`,
  pe = `$replay_sample_rate`,
  me = `$replay_override_sampling`,
  he = `$replay_override_linked_flag`,
  ge = `$replay_override_url_trigger`,
  _e = `$replay_override_event_trigger`,
  ve = `$sesid`,
  ye = `$session_is_sampled`,
  be = `$session_past_minimum_duration`,
  xe = `$session_recording_url_trigger_activated_session`,
  Se = `$session_recording_event_trigger_activated_session`,
  Ce = `$debug_first_full_snapshot_timestamp`,
  we = `$sess_rec_flush_size`,
  Te = `$groups`,
  Ee = `$surveys`,
  De = `$surveys_loaded_at`,
  Oe = `$surveys_activated`,
  ke = `$surveys_activated_session`,
  Ae = `$surveys_activated_timestamps`,
  je = `ph_product_tours`,
  Me = `$product_tours_activated`,
  Ne = `$product_tours_activated_session`,
  Pe = `$conversations_widget_session_id`,
  Fe = `$conversations_ticket_id`,
  Ie = `$conversations_widget_state`,
  Le = `$conversations_user_traits`,
  Re = `$user_state`,
  ze = `$client_session_props`,
  Be = `$capture_rate_limit`,
  Ve = `$initial_campaign_params`,
  He = `$initial_referrer_info`,
  Ue = `$initial_person_info`,
  We = `$epp`,
  Ge = `$posthog_cookieless`,
  Ke = `$cookieless_mode`,
  qe = `$sdk_debug_extensions_init_method`,
  Je = `$sdk_debug_extensions_init_time_ms`,
  Ye = `$sdk_debug_recording_script_not_loaded`,
  Xe = `$sdk_debug_replay_stale_config`,
  Ze = `$sdk_debug_replay_event_trigger_status`,
  Qe = `$sdk_debug_replay_linked_flag_trigger_status`,
  $e = `$sdk_debug_replay_matched_recording_trigger_groups`,
  et = `$sdk_debug_replay_pending_trigger_conditions`,
  tt = `$sdk_debug_replay_remote_trigger_matching_config`,
  nt = `$sdk_debug_replay_trigger_groups_count`,
  rt = `$sdk_debug_replay_url_trigger_status`,
  it = `$session_recording_start_reason`,
  at = `PostHog loadExternalDependency extension not found.`,
  ot = `anonymous`,
  st = `identified`,
  ct = `identified_only`,
  lt = `beforeunload`,
  ut = `$pageview`,
  dt = `$pageleave`,
  ft = `$identify`,
  pt = `$groupidentify`,
  O = `u` > typeof window ? window : void 0,
  mt = `u` > typeof globalThis ? globalThis : O,
  ht = mt?.navigator,
  k = mt?.document,
  gt = mt?.location,
  _t = mt?.fetch,
  vt =
    mt?.XMLHttpRequest && `withCredentials` in new mt.XMLHttpRequest() ? mt.XMLHttpRequest : void 0,
  yt = mt?.AbortController,
  bt = mt?.CompressionStream,
  xt = ht?.userAgent,
  St = typeof globalThis < `u` ? globalThis : O;
(St && typeof self > `u` && (St.self = St), St && typeof File > `u` && (St.File = function () {}));
var A = O ?? {},
  Ct = (function (e) {
    return (
      (e.AnonymousId = `anonymous_id`),
      (e.DistinctId = `distinct_id`),
      (e.Props = `props`),
      (e.EnablePersonProcessing = `enable_person_processing`),
      (e.PersonMode = `person_mode`),
      (e.FeatureFlagDetails = `feature_flag_details`),
      (e.FeatureFlags = `feature_flags`),
      (e.FeatureFlagPayloads = `feature_flag_payloads`),
      (e.BootstrapFeatureFlagDetails = `bootstrap_feature_flag_details`),
      (e.BootstrapFeatureFlags = `bootstrap_feature_flags`),
      (e.BootstrapFeatureFlagPayloads = `bootstrap_feature_flag_payloads`),
      (e.OverrideFeatureFlags = `override_feature_flags`),
      (e.Queue = `queue`),
      (e.AiQueue = `ai_queue`),
      (e.AiCaptureQueue = `ai_capture_queue`),
      (e.LogsQueue = `logs_queue`),
      (e.OptedOut = `opted_out`),
      (e.SessionId = `session_id`),
      (e.SessionStartTimestamp = `session_start_timestamp`),
      (e.SessionLastTimestamp = `session_timestamp`),
      (e.PersonProperties = `person_properties`),
      (e.GroupProperties = `group_properties`),
      (e.InstalledAppBuild = `installed_app_build`),
      (e.InstalledAppVersion = `installed_app_version`),
      (e.SessionReplay = `session_replay`),
      (e.PushRegistered = `push_registered`),
      (e.SessionReplayEventTriggerActivatedSession = `session_replay_event_trigger_activated_session`),
      (e.SurveyLastSeenDate = `survey_last_seen_date`),
      (e.SurveysInProgress = `surveys_in_progress`),
      (e.SurveysSeen = `surveys_seen`),
      (e.Surveys = `surveys`),
      (e.RemoteConfig = `remote_config`),
      (e.FlagsEndpointWasHit = `flags_endpoint_was_hit`),
      (e.DeviceId = `device_id`),
      e
    );
  })({}),
  wt = (function (e) {
    return ((e.GZipJS = `gzip-js`), (e.Base64 = `base64`), e);
  })({}),
  Tt = [
    `$snapshot`,
    `$pageview`,
    `$pageleave`,
    `$set`,
    `survey dismissed`,
    `survey sent`,
    `survey shown`,
    `$identify`,
    `$groupidentify`,
    `$create_alias`,
    `$$client_ingestion_warning`,
    `$web_experiment_applied`,
    `$feature_enrollment_update`,
    `$feature_flag_called`,
  ],
  Et = [`token`];
function j(e, t) {
  return e.indexOf(t) !== -1;
}
var Dt = function (e) {
    return e.trim();
  },
  Ot = function (e) {
    return e.replace(/^\$/, ``);
  };
function kt(e) {
  let t = [];
  return (
    JSON.stringify(e, function (e, n) {
      if (typeof n == `bigint`) return n.toString();
      if (typeof n != `function` && typeof n != `symbol`) {
        if (n instanceof Error) return { name: n.name, message: n.message, stack: n.stack };
        if (n && typeof n == `object`) {
          for (; t.length > 0 && t[t.length - 1] !== this; ) t.pop();
          if (t.includes(n)) return `[Circular]`;
          t.push(n);
        }
        return n;
      }
    }) ?? `null`
  );
}
var At = Object.prototype,
  jt = At.hasOwnProperty,
  Mt = At.toString,
  M =
    Array.isArray ||
    function (e) {
      return Mt.call(e) === `[object Array]`;
    },
  N = (e) => typeof e == `function`,
  P = (e) => e === Object(e) && !M(e),
  Nt = (e) => {
    if (P(e)) {
      for (let t in e) if (jt.call(e, t)) return !1;
      return !0;
    }
    return !1;
  },
  F = (e) => e === void 0,
  I = (e) => Mt.call(e) == `[object String]`,
  Pt = (e) => I(e) && e.trim().length === 0,
  L = (e) => e === null,
  R = (e) => F(e) || L(e),
  z = (e) => Mt.call(e) == `[object Number]` && e == e,
  Ft = (e) => z(e) && e > 0,
  It = (e) => Mt.call(e) === `[object Boolean]`,
  Lt = (e) => j(Tt, e),
  Rt = (e) => j(Et, e);
function zt(e) {
  return typeof e != `object` || !e;
}
function Bt(e, t) {
  return {}.toString.call(e) === `[object ${t}]`;
}
function Vt(e) {
  switch ({}.toString.call(e)) {
    case `[object Error]`:
    case `[object Exception]`:
    case `[object DOMException]`:
    case `[object DOMError]`:
    case `[object WebAssembly.Exception]`:
      return !0;
    default:
      return Ut(e, Error);
  }
}
function Ht(e) {
  return `u` > typeof Event && Ut(e, Event);
}
function Ut(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
var Wt = [!0, `true`, 1, `1`, `yes`],
  Gt = (e) => j(Wt, e),
  Kt = [!1, `false`, 0, `0`, `no`];
function qt(e, t, n, r, i, a, o) {
  try {
    var s = e[a](o),
      c = s.value;
  } catch (e) {
    n(e);
    return;
  }
  s.done ? t(c) : Promise.resolve(c).then(r, i);
}
function B(e) {
  return function () {
    var t = this,
      n = arguments;
    return new Promise(function (r, i) {
      var a = e.apply(t, n);
      function o(e) {
        qt(a, r, i, o, s, `next`, e);
      }
      function s(e) {
        qt(a, r, i, o, s, `throw`, e);
      }
      o(void 0);
    });
  };
}
var Jt =
    `amazonbot,amazonproductbot,app.hypefactors.com,applebot,archive.org_bot,awariobot,backlinksextendedbot,baiduspider,bingbot,bingpreview,chrome-lighthouse,dataforseobot,deepscan,duckduckbot,facebookexternal,facebookcatalog,http://yandex.com/bots,hubspot,ia_archiver,leikibot,linkedinbot,meta-externalagent,mj12bot,msnbot,nessus,petalbot,pinterestbot,prerender,rogerbot,screaming frog,sebot-wa,sitebulb,slackbot,slurp,trendictionbot,turnitin,twitterbot,vercel-screenshot,vercelbot,yahoo! slurp,yandexbot,zoombot,bot.htm,bot.php,(bot;,bot/,crawler,ahrefsbot,ahrefssiteaudit,semrushbot,siteauditbot,splitsignalbot,gptbot,oai-searchbot,chatgpt-user,perplexitybot,better uptime bot,sentryuptimebot,uptimerobot,headlesschrome,cypress,google-hoteladsverifier,adsbot-google,apis-google,duplexweb-google,feedfetcher-google,google favicon,google web preview,google-read-aloud,googlebot,googleother,google-cloudvertexbot,googleweblight,mediapartners-google,storebot-google,google-inspectiontool,bytespider`.split(
      `,`,
    ),
  Yt = new Map(),
  Xt = function (e, t = []) {
    if (!e) return !1;
    let n = (function (e, t) {
        let n = ``;
        for (let e = 0; t.length > e; e++) {
          let r = t[e];
          n += r.length + `:` + r;
        }
        return e.length + `:` + e + `|` + t.length + `:` + n;
      })(e, t),
      r = Yt.get(n);
    if (r !== void 0) return r;
    let i = e.toLowerCase(),
      a = Jt.concat(t).some((e) => i.indexOf(e.toLowerCase()) !== -1);
    return (256 > Yt.size || Yt.clear(), Yt.set(n, a), a);
  };
function Zt(e, t, n, r, i) {
  return (
    t > n && (r.warn(`min cannot be greater than max.`), (t = n)),
    z(e)
      ? e > n
        ? (r.warn(` cannot be  greater than max: ` + n + `. Using max value instead.`), n)
        : t > e
          ? (r.warn(` cannot be less than min: ` + t + `. Using min value instead.`), t)
          : e
      : (r.warn(` must be a number. using max or fallback. max: ` + n + `, fallback: ` + i),
        Zt(i ?? n, t, n, r))
  );
}
var Qt = class {
    constructor(e) {
      ((this._buckets = {}),
        (this._onBucketRateLimited = e._onBucketRateLimited),
        (this._bucketSize = Zt(e.bucketSize, 0, 100, e._logger)),
        (this._refillRate = Zt(e.refillRate, 0, this._bucketSize, e._logger)),
        (this._refillInterval = Zt(e.refillInterval, 0, 864e5, e._logger)));
    }
    _applyRefill(e, t) {
      let n = Math.floor((t - e.lastAccess) / this._refillInterval);
      n > 0 &&
        ((e.tokens = Math.min(e.tokens + n * this._refillRate, this._bucketSize)),
        (e.lastAccess += n * this._refillInterval));
    }
    consumeRateLimit(e) {
      var t;
      let n = Date.now(),
        r = String(e),
        i = this._buckets[r];
      return (
        i
          ? this._applyRefill(i, n)
          : ((i = { tokens: this._bucketSize, lastAccess: n }), (this._buckets[r] = i)),
        i.tokens === 0 ||
          (i.tokens--,
          i.tokens === 0 && ((t = this._onBucketRateLimited) == null || t.call(this, e)),
          i.tokens === 0)
      );
    }
    stop() {
      this._buckets = {};
    }
  },
  $t = `Mobile`,
  en = `Android`,
  tn = `Tablet`,
  nn = `Android Tablet`,
  rn = `iPad`,
  an = `Apple Watch`,
  on = `Safari`,
  sn = `BlackBerry`,
  cn = `Samsung Internet`,
  ln = `Chrome`,
  un = `Chrome iOS`,
  dn = `Internet Explorer`,
  fn = `Internet Explorer Mobile`,
  pn = `Opera`,
  mn = `Microsoft Edge`,
  hn = `Firefox`,
  gn = `Firefox iOS`,
  _n = `Nintendo`,
  vn = `PlayStation`,
  yn = `Xbox`,
  bn = `Android Mobile`,
  xn = `Mobile Safari`,
  Sn = `Windows`,
  Cn = `Windows Phone`,
  wn = `Nokia`,
  Tn = `Ouya`,
  En = `Generic ` + $t.toLowerCase(),
  Dn = `Generic ` + tn.toLowerCase(),
  On = `Konqueror`,
  kn = `Oculus Browser`,
  An = `Vivaldi`,
  jn = `Yandex`,
  Mn = `Whale`,
  Nn = `DuckDuckGo`,
  Pn = `Pale Moon`,
  Fn = `Waterfox`,
  In = `Brave`,
  Ln = `Claude`,
  Rn = `Codex`,
  zn = `ChatGPT`,
  Bn = `Google Search App`,
  Vn = RegExp(`Version/(\\d+(\\.\\d+)?)`),
  Hn = RegExp(`(Claude|Codex|ChatGPT)\\/(\\d+(\\.\\d+)?)`),
  Un = new RegExp(yn, `i`),
  Wn = RegExp(`PlayStation \\w+`, `i`),
  Gn = RegExp(`Nintendo \\w+`, `i`),
  Kn = RegExp(`BlackBerry|PlayBook|BB10`, `i`),
  qn = {
    "NT3.51": `NT 3.11`,
    "NT4.0": `NT 4.0`,
    "5.0": `2000`,
    5.1: `XP`,
    5.2: `XP`,
    "6.0": `Vista`,
    6.1: `7`,
    6.2: `8`,
    6.3: `8.1`,
    6.4: `10`,
    "10.0": `10`,
  },
  Jn = function (e, t, n, r) {
    return (
      (t ||= ``),
      (function (e) {
        return e?.brave ? In : null;
      })(n) ||
        (r?.detectGoogleSearchApp && j(e, `GSA/`)
          ? Bn
          : j(e, ` OPR/`) && j(e, `Mini`)
            ? `Opera Mini`
            : j(e, ` OPR/`)
              ? pn
              : Kn.test(e)
                ? sn
                : j(e, `IEMobile`) || j(e, `WPDesktop`)
                  ? fn
                  : j(e, `OculusBrowser`)
                    ? kn
                    : j(e, `SamsungBrowser`)
                      ? cn
                      : j(e, `Edge`) || j(e, `Edg/`)
                        ? mn
                        : j(e, `Vivaldi/`)
                          ? An
                          : j(e, `YaBrowser/`)
                            ? jn
                            : j(e, `Whale/`)
                              ? Mn
                              : j(e, `DuckDuckGo/`) || j(e, `Ddg/`)
                                ? Nn
                                : j(e, `Claude/`)
                                  ? Ln
                                  : j(e, `Codex/`)
                                    ? Rn
                                    : j(e, `ChatGPT/`)
                                      ? zn
                                      : j(e, `FBIOS`)
                                        ? `Facebook Mobile`
                                        : j(e, `UCWEB`) || j(e, `UCBrowser`)
                                          ? `UC Browser`
                                          : j(e, `CriOS`)
                                            ? un
                                            : j(e, `CrMo`) || j(e, ln)
                                              ? ln
                                              : j(e, en) && j(e, on)
                                                ? bn
                                                : j(e, `FxiOS`)
                                                  ? gn
                                                  : j(e.toLowerCase(), On.toLowerCase())
                                                    ? On
                                                    : j(e, `Brave/`)
                                                      ? In
                                                      : ((e, t) =>
                                                            (t && j(t, `Apple`)) ||
                                                            (function (e) {
                                                              return (
                                                                j(e, on) && !j(e, ln) && !j(e, en)
                                                              );
                                                            })(e))(e, t)
                                                        ? j(e, $t)
                                                          ? xn
                                                          : on
                                                        : j(e, `PaleMoon/`)
                                                          ? Pn
                                                          : j(e, `Waterfox/`)
                                                            ? Fn
                                                            : j(e, hn)
                                                              ? hn
                                                              : j(e, `MSIE`) || j(e, `Trident/`)
                                                                ? dn
                                                                : j(e, `Gecko`)
                                                                  ? hn
                                                                  : ``)
    );
  },
  Yn = {
    [fn]: [RegExp(`rv:(\\d+(\\.\\d+)?)`)],
    [mn]: [RegExp(`Edge?\\/(\\d+(\\.\\d+)?)`)],
    [ln]: [RegExp(`(Chrome|CrMo)\\/(\\d+(\\.\\d+)?)`)],
    [un]: [RegExp(`CriOS\\/(\\d+(\\.\\d+)?)`)],
    "UC Browser": [RegExp(`(UCBrowser|UCWEB)\\/(\\d+(\\.\\d+)?)`)],
    [on]: [Vn],
    [xn]: [Vn],
    [pn]: [RegExp(`(Opera|OPR)\\/(\\d+(\\.\\d+)?)`)],
    [hn]: [RegExp(`Firefox\\/(\\d+(\\.\\d+)?)`)],
    [gn]: [RegExp(`FxiOS\\/(\\d+(\\.\\d+)?)`)],
    [On]: [RegExp(`Konqueror[:/]?(\\d+(\\.\\d+)?)`, `i`)],
    [sn]: [RegExp(`BlackBerry (\\d+(\\.\\d+)?)`), Vn],
    [bn]: [RegExp(`android\\s(\\d+(\\.\\d+)?)`, `i`)],
    [cn]: [RegExp(`SamsungBrowser\\/(\\d+(\\.\\d+)?)`)],
    [kn]: [RegExp(`OculusBrowser\\/(\\d+(\\.\\d+)?)`)],
    [An]: [RegExp(`Vivaldi\\/(\\d+(\\.\\d+)?)`)],
    [jn]: [RegExp(`YaBrowser\\/(\\d+(\\.\\d+)?)`)],
    [Mn]: [RegExp(`Whale\\/(\\d+(\\.\\d+)?)`)],
    [In]: [RegExp(`Brave\\/(\\d+(\\.\\d+)?)`)],
    [Ln]: [Hn],
    [Rn]: [Hn],
    [zn]: [Hn],
    [Nn]: [RegExp(`(DuckDuckGo|Ddg)\\/(\\d+(\\.\\d+)?)`)],
    [Pn]: [RegExp(`PaleMoon\\/(\\d+(\\.\\d+)?)`)],
    [Fn]: [RegExp(`Waterfox\\/(\\d+(\\.\\d+)?)`)],
    [Bn]: [RegExp(`GSA\\/(\\d+(\\.\\d+)?)`)],
    [dn]: [RegExp(`(rv:|MSIE )(\\d+(\\.\\d+)?)`)],
    Mozilla: [RegExp(`rv:(\\d+(\\.\\d+)?)`)],
  },
  Xn = function (e, t, n, r) {
    let i = Yn[Jn(e, t, n, r)];
    if (F(i)) return null;
    for (let t = 0; i.length > t; t++) {
      let n = e.match(i[t]);
      if (n) return parseFloat(n[n.length - 2]);
    }
    return null;
  },
  Zn = [
    [RegExp(`Xbox; Xbox (.*?)[);]`, `i`), (e) => [yn, (e && e[1]) || ``]],
    [new RegExp(_n, `i`), [_n, ``]],
    [new RegExp(vn, `i`), [vn, ``]],
    [Kn, [sn, ``]],
    [
      new RegExp(Sn, `i`),
      (e, t) => {
        if (/Phone/.test(t) || /WPDesktop/.test(t)) return [Cn, ``];
        if (new RegExp($t).test(t) && !/IEMobile\b/.test(t)) return [`Windows Mobile`, ``];
        let n = /Windows NT ([0-9.]+)/i.exec(t);
        if (n && n[1]) {
          let e = qn[n[1]] || ``;
          return (/arm/i.test(t) && (e = `RT`), [Sn, e]);
        }
        return [Sn, ``];
      },
    ],
    [
      /((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/,
      (e) => (e && e[3] ? [`iOS`, [e[3], e[4], e[5] || `0`].join(`.`)] : [`iOS`, ``]),
    ],
    [
      /(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i,
      (e) => {
        let t = ``;
        return (e && e.length >= 3 && (t = F(e[2]) ? e[3] : e[2]), [`watchOS`, t]);
      },
    ],
    [
      RegExp(`(Android (\\d+)\\.(\\d+)\\.?(\\d+)?|Android)`, `i`),
      (e) => (e && e[2] ? [en, [e[2], e[3], e[4] || `0`].join(`.`)] : [en, ``]),
    ],
    [
      /Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i,
      (e) => {
        let t = [`Mac OS X`, ``];
        return (e && e[1] && (t[1] = [e[1], e[2], e[3] || `0`].join(`.`)), t);
      },
    ],
    [/Mac/i, [`Mac OS X`, ``]],
    [/CrOS/, [`Chrome OS`, ``]],
    [/Linux|debian/i, [`Linux`, ``]],
  ],
  Qn = function (e) {
    for (let t = 0; Zn.length > t; t++) {
      let [n, r] = Zn[t],
        i = n.exec(e),
        a = i && (N(r) ? r(i, e) : r);
      if (a) return a;
    }
    return [``, ``];
  },
  $n = function (e) {
    return Gn.test(e)
      ? _n
      : Wn.test(e)
        ? vn
        : Un.test(e)
          ? yn
          : new RegExp(Tn, `i`).test(e)
            ? Tn
            : RegExp(`(Windows Phone|WPDesktop)`, `i`).test(e)
              ? Cn
              : /iPad/.test(e)
                ? rn
                : /iPod/.test(e)
                  ? `iPod Touch`
                  : /iPhone/.test(e)
                    ? `iPhone`
                    : /(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(e)
                      ? an
                      : Kn.test(e)
                        ? sn
                        : /(kobo)\s(ereader|touch)/i.test(e)
                          ? `Kobo`
                          : new RegExp(wn, `i`).test(e)
                            ? wn
                            : /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(e) ||
                                /(kf[a-z]+)( bui|\)).+silk\//i.test(e)
                              ? `Kindle Fire`
                              : /(Android|ZTE)/i.test(e)
                                ? (new RegExp($t).test(e) &&
                                    !/(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(
                                      e,
                                    )) ||
                                  (/pixel[\daxl ]{1,6}/i.test(e) && !/pixel c/i.test(e)) ||
                                  /(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(e) ||
                                  (/lmy47v/i.test(e) && !/QTAQZ3/i.test(e))
                                  ? en
                                  : nn
                                : RegExp(`(pda|Mobile)`, `i`).test(e)
                                  ? En
                                  : new RegExp(tn, `i`).test(e) && !RegExp(`Tablet pc`, `i`).test(e)
                                    ? Dn
                                    : ``;
  },
  er = function (e, t) {
    let n = $n(e);
    return n === rn || n === nn || n === `Kobo` || n === `Kindle Fire` || n === Dn
      ? tn
      : n === _n || n === yn || n === vn || n === Tn
        ? `Console`
        : n === an
          ? `Wearable`
          : n
            ? $t
            : t?.userAgentDataPlatform === `Android` && (t?.maxTouchPoints ?? 0) > 0
              ? 600 >
                Math.min((r = t?.screenWidth) ?? 0, (i = t?.screenHeight) ?? 0) /
                  ((a = t?.devicePixelRatio) ?? 1)
                ? $t
                : tn
              : `Desktop`;
    var r, i, a;
  },
  tr = /\bFBAV\/(\d+(?:\.\d+)*)/i,
  nr = [
    [/\bInstagram(?:[ /](\d+(?:\.\d+)*))?\b/i, `Instagram`],
    [/\bBarcelona[ /](\d+(?:\.\d+)*)?/i, `Threads`],
    [/\b(?:MessengerForiOS|(?:FBAN|FB_IAB)\/Orca-Android)\b/i, `Messenger`, tr],
    [/\bFBAN\/EMA\b/i, `Facebook Lite`, tr],
    [/\b(?:FBIOS|(?:FBAN|FB_IAB)\/(?:FB4A|FBIOS))\b/i, `Facebook`, tr],
    [/\bLinkedInApp(?:\]?\/(\d+(?:\.\d+)*))?\b/i, `LinkedIn`],
    [/\bTwitter(?:Android| for (?:iPhone|iPad|Android))(?:\/(\d+(?:\.\d+)*))?\b/i, `Twitter`],
    [
      /\b(?:musical_ly|trill)(?:[_/](\d+\.\d+(?:\.\d+)*))?(?=\b|_)/i,
      `TikTok`,
      /\bapp_version\/(\d+(?:\.\d+)*)/i,
    ],
    [/\b(?:MicroMessenger|WeChat)\/(\d+(?:\.\d+)*)?/i, `WeChat`],
    [/\bLine\/(\d+(?:\.\d+)*)?/i, `Line`],
    [/\bGSA\/(\d+(?:\.\d+)*)?/i, `Google`],
    [
      /\[Pinterest\/(?:iOS|Android)\b|\bPinterest(?: for (?:Android(?: Tablet)?|iOS))?\/(\d+(?:\.\d+)*)/i,
      `Pinterest`,
    ],
    [/\b(?:WA4A|WAiOS)\/(\d+(?:\.\d+)*)?/i, `WhatsApp`],
    [/\bSnapchat[ /](\d+(?:\.\d+)*)?/i, `Snapchat`],
    [/\bBing(?:Web|Sapphire)\/(\d+(?:\.\d+)*)?/i, `Bing`],
    [/\bNAVER\(inapp; search;/i, `Naver`, /\bNAVER\(inapp; search;[^;)]*; (\d+(?:\.\d+)*)/i],
    [/\bKAKAOTALK[ /](\d+\.\d+(?:\.\d+)*)?/i, `KakaoTalk`],
  ],
  rr = `[Truncated]`,
  ir = `[Unserializable]`;
function ar(e) {
  let t = ``;
  for (let n = 0; e.length > n; n++) {
    let r = e.charCodeAt(n);
    if (55296 > r || r > 56319) t += 56320 > r || r > 57343 ? e[n] : `�`;
    else {
      let r = e.charCodeAt(n + 1);
      56320 > r || r > 57343 ? (t += `�`) : ((t += e[n] + e[n + 1]), n++);
    }
  }
  return t;
}
function or(e, t) {
  if (!t) return e;
  let n = [];
  try {
    n = Object.keys(t);
  } catch {
    n = [];
  }
  for (let r of n) {
    let n;
    try {
      n = t[r];
    } catch {
      n = ir;
    }
    Object.defineProperty(e, r, { value: n, enumerable: !0, writable: !0, configurable: !0 });
  }
  return e;
}
var sr = 3e5,
  cr = class {
    record(e) {
      if (e.kind === `too-large`) return;
      if (e.kind !== `retry-later`) return void this.reset();
      if (!e.retryAfterMs) return;
      let t = this.isOpen(),
        n = Date.now(),
        r = Math.min(e.retryAfterMs, sr);
      if (!t) return ((this._installedAt = n), void (this._until = n + r));
      this._until = Math.max(this._until, Math.min(n + r, this._installedAt + sr));
    }
    remainingMs() {
      let e = Date.now();
      if (this._installedAt - 5e3 > e) return (this.reset(), 0);
      let t = Math.min(sr, Math.max(0, this._until - e));
      return (t === 0 && this.reset(), t);
    }
    isOpen() {
      return this.remainingMs() > 0;
    }
    reset() {
      ((this._until = 0), (this._installedAt = 0));
    }
    constructor() {
      ((this._until = 0), (this._installedAt = 0));
    }
  },
  lr = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function ur(e, t) {
  return typeof (n = e) == `string` && lr.test(n) ? e : t();
  var n;
}
function dr(e, t) {
  let n = Error(t);
  try {
    Object.defineProperty(n, "name", { value: e, writable: !0, enumerable: !0, configurable: !0 });
  } catch {}
  return n;
}
function fr(e) {
  return e && e.split(`#`)[0];
}
function pr(e) {
  try {
    return e();
  } catch {
    return;
  }
}
function mr(e, t) {
  let n = setTimeout(e, t);
  return (n != null && n.unref && n?.unref(), n);
}
function hr(e, t, n) {
  return gr.apply(this, arguments);
}
function gr() {
  return (gr = B(function* (e, t, n) {
    let r;
    try {
      return yield Promise.race([
        e,
        new Promise((e, i) => {
          r = mr(() => {
            try {
              (n?.(), e());
            } catch (e) {
              i(e);
            }
          }, t);
        }),
      ]);
    } finally {
      clearTimeout(r);
    }
  })).apply(this, arguments);
}
function _r(e) {
  return (
    (_r =
      typeof Symbol == `function` && typeof Symbol.iterator == `symbol`
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == `function` &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? `symbol`
              : typeof e;
          }),
    _r(e)
  );
}
function vr(e, t, n) {
  return (
    (t = (function (e) {
      var t = (function (e) {
        if (_r(e) != `object` || !e) return e;
        var t = e[Symbol.toPrimitive];
        if (t !== void 0) {
          var n = t.call(e, `string`);
          if (_r(n) != `object`) return n;
          throw TypeError(`@@toPrimitive must return a primitive value.`);
        }
        return String(e);
      })(e);
      return _r(t) == `symbol` ? t : t + ``;
    })(t)) in e
      ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = n),
    e
  );
}
function yr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function V(e) {
  for (var t = 1; arguments.length > t; t++) {
    var n = arguments[t] == null ? {} : arguments[t];
    t % 2
      ? yr(Object(n), !0).forEach(function (t) {
          vr(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : yr(Object(n)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
          });
  }
  return e;
}
var br, xr, Sr, Cr;
function wr(e) {
  let t = globalThis._posthogChunkIds,
    n = globalThis._debugIds;
  if (!t && !n) return;
  let r = t ? Object.keys(t) : [],
    i = n ? Object.keys(n) : [];
  if (Cr && Tr(t, r, xr) && Tr(n, i, Sr)) return Cr;
  ((xr = t ? V({}, t) : void 0), (Sr = n ? V({}, n) : void 0), (Cr = {}), (br ??= {}));
  let a = (t, n) => {
    for (let r of t) {
      let t = n[r];
      if (!t) continue;
      let i = br?.[r];
      if (i) {
        Cr[i] = t;
        continue;
      }
      let a = e(r);
      for (let e = a.length - 1; e >= 0; e--) {
        let n = a[e]?.filename;
        if (n) {
          ((Cr[n] = t), (br[r] = n));
          break;
        }
      }
    }
  };
  return (n && a(i, n), t && a(r, t), Cr);
}
function Tr(e, t, n) {
  return e && n ? t.length === Object.keys(n).length && t.every((t) => e[t] === n[t]) : e === n;
}
var Er = class {
    constructor(e, t, n = []) {
      ((this.coercers = e), (this.stackParser = t), (this.modifiers = n));
    }
    buildFromUnknown(e, t = {}) {
      let n = (t && t.mechanism) || { handled: !0, type: `generic` },
        r = this.buildCoercingContext(n, t, 0).apply(e),
        i = this.buildParsingContext(t),
        a = this.parseStacktrace(r, i);
      return { $exception_list: this.convertToExceptionList(a, n), $exception_level: `error` };
    }
    modifyFrames(e) {
      var t = this;
      return B(function* () {
        for (let n of e)
          n.stacktrace &&
            n.stacktrace.frames &&
            M(n.stacktrace.frames) &&
            (n.stacktrace.frames = yield t.applyModifiers(n.stacktrace.frames));
        return e;
      })();
    }
    coerceFallback(e) {
      return {
        type: `Error`,
        value: `Unknown error`,
        stack: e.syntheticException?.stack,
        synthetic: !0,
      };
    }
    parseStacktrace(e, t) {
      let n, r;
      if (
        (e.cause != null && (n = this.parseStacktrace(e.cause, t)),
        e.stack != `` && e.stack != null)
      )
        try {
          r = this.applyChunkIds(
            this.stackParser(e.stack, e.synthetic ? t.skipFirstLines : 0),
            t.chunkIdMap,
          );
        } catch {}
      return V(
        V({}, e),
        {},
        { cause: n, stack: r, errors: e.errors?.map((e) => this.parseStacktrace(e, t)) },
      );
    }
    applyChunkIds(e, t) {
      return e.map((e) => (e.filename && t && (e.chunk_id = t[e.filename]), e));
    }
    applyCoercers(e, t) {
      for (let n of this.coercers) if (n.match(e)) return n.coerce(e, t);
      return this.coerceFallback(t);
    }
    applyModifiers(e) {
      var t = this;
      return B(function* () {
        let n = e;
        for (let e of t.modifiers) n = yield e(n);
        return n;
      })();
    }
    convertToExceptionList(e, t) {
      let n = [],
        r = (e, i, a) => {
          let o = n.length,
            s =
              i === void 0
                ? V(
                    V(
                      { type: typeof t.type == `string` && t.type.length > 0 ? t.type : `generic` },
                      typeof t.handled == `boolean`
                        ? { handled: t.handled }
                        : t.handled === void 0
                          ? { handled: !0 }
                          : {},
                    ),
                    {},
                    {
                      synthetic: typeof t.synthetic == `boolean` ? t.synthetic : e.synthetic,
                      exception_id: o,
                    },
                  )
                : {
                    type: `chained`,
                    source: a,
                    synthetic: e.synthetic,
                    exception_id: o,
                    parent_id: i,
                  },
            c = { type: e.type, value: e.value, mechanism: s };
          (e.stack && (c.stacktrace = { type: `raw`, frames: e.stack }),
            n.push(c),
            e.cause && r(e.cause, o, `cause`));
          for (let t of e.errors ?? []) r(t, o, `member`);
        };
      return (r(e), n);
    }
    buildParsingContext(e) {
      return { chunkIdMap: wr(this.stackParser), skipFirstLines: e.skipFirstLines ?? 1 };
    }
    getAggregateErrors(e) {
      try {
        if (Vt(e)) {
          let t = Object.getPrototypeOf(e);
          for (let n = 0; t && 100 > n; n++) {
            let n = Object.getOwnPropertyDescriptor(t, `constructor`)?.value;
            if (typeof n == `function` && n.name === `AggregateError`) {
              let t = e.errors;
              return M(t) ? t : void 0;
            }
            t = Object.getPrototypeOf(t);
          }
        }
      } catch {}
    }
    buildCoercingContext(e, t, n = 0) {
      let r = 0,
        i = 0,
        a = !1,
        o = new Set(),
        s = [],
        c = {},
        l = (e, t, n = 0) => {
          let l = u(t, n),
            d = l.apply;
          if (
            ((l.apply = (t) => {
              s.push(e);
              try {
                return d(t);
              } finally {
                s.pop();
              }
            }),
            n > 4 || (n > 0 && s.indexOf(e) !== -1))
          )
            return this.coerceFallback(l);
          let f = (typeof e == `object` && !!e) || typeof e == `function`;
          if ((n === 0 && r >= 50) || (f && o.has(e))) return;
          (f && o.add(e), n === 0 && r++);
          let p = this.getAggregateErrors(e),
            m,
            h;
          a ||= !!p;
          try {
            if (((m = this.applyCoercers(e, l)), !m)) throw c;
          } catch (e) {
            if (e === c) return void (n === 0 && r--);
            if (!a) throw e;
            m = this.coerceFallback(l);
          }
          if (!p || r >= 50) return m;
          try {
            h = p.length;
          } catch {
            return m;
          }
          if (!Number.isInteger(h) || 0 > h || h > 4294967295) return m;
          let g = [];
          for (let e = 0; 50 > r && 1e3 > i && h > e; e++) {
            let n;
            i++;
            try {
              n = l.next(p[e]);
            } catch {
              (r++, (n = this.coerceFallback(u(t + 1))));
            }
            n && g.push(n);
          }
          return V(V({}, m), {}, { errors: g });
        },
        u = (n, r = 0) =>
          V(
            V({}, t),
            {},
            {
              syntheticException: n == 0 ? t.syntheticException : void 0,
              mechanism: n == 0 ? e : {},
              apply(e) {
                let t = l(e, n, r + 1);
                if (!t) throw c;
                return t;
              },
              next: (e) => l(e, n + 1),
            },
          ),
        d = u(n);
      return V(V({}, d), {}, { apply: (e) => l(e, n) ?? this.coerceFallback(d) });
    }
  },
  Dr = /^([a-z][a-z0-9.+-]+):/i,
  Or = [
    `http`,
    `https`,
    `file`,
    `blob`,
    `app`,
    `capacitor`,
    `ionic`,
    `webpack`,
    `webpack-internal`,
    `ng`,
  ];
function kr(e) {
  if (!e || e === `<anonymous>`) return !1;
  let t = Dr.exec(e);
  return !t || Or.includes(t[1].toLowerCase());
}
function Ar(e, t, n, r, i) {
  let a = { platform: e, filename: t, function: n === `<anonymous>` ? `?` : n, in_app: kr(t) };
  return (F(r) || (a.lineno = r), F(i) || (a.colno = i), a);
}
var jr = (e, t) => {
    let n = e.indexOf(`safari-extension`) !== -1,
      r = e.indexOf(`safari-web-extension`) !== -1;
    return n || r
      ? [
          e.indexOf(`@`) === -1 ? `?` : e.split(`@`)[0],
          n ? `safari-extension:${t}` : `safari-web-extension:${t}`,
        ]
      : [e, t];
  },
  Mr = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
  Nr =
    /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
  Pr = /\((\S*)(?::(\d+))(?::(\d+))\)/,
  Fr = (e, t) => {
    let n = Mr.exec(e);
    if (n) {
      let [, e, r, i] = n;
      return Ar(t, e, `?`, +r, +i);
    }
    let r = Nr.exec(e);
    if (r) {
      if (r[2] && r[2].indexOf(`eval`) === 0) {
        let e = Pr.exec(r[2]);
        e && ((r[2] = e[1]), (r[3] = e[2]), (r[4] = e[3]));
      }
      let [e, n] = jr(r[1] || `?`, r[2]);
      return Ar(t, n, e, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
    }
  },
  Ir =
    /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
  Lr = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
  Rr = (e, t) => {
    let n = Ir.exec(e);
    if (n) {
      if (n[3] && n[3].indexOf(` > eval`) > -1) {
        let e = Lr.exec(n[3]);
        e && ((n[1] = n[1] || `eval`), (n[3] = e[1]), (n[4] = e[2]), (n[5] = ``));
      }
      let e = n[3],
        r = n[1] || `?`;
      return (([r, e] = jr(r, e)), Ar(t, e, r, n[4] ? +n[4] : void 0, n[5] ? +n[5] : void 0));
    }
  },
  zr = /\(error: (.*)\)/;
function Br(e, t) {
  return (
    e.filename === t.filename &&
    e.function === t.function &&
    e.module === t.module &&
    e.lineno === t.lineno &&
    e.colno === t.colno
  );
}
function Vr(e) {
  for (let t = 1; 10 >= t; t++) {
    let n = e.length - 2 * t;
    if (0 > n) break;
    let r = !0;
    for (let i = 0; t > i; i++)
      if (!Br(e[n + i], e[n + t + i])) {
        r = !1;
        break;
      }
    if (r) {
      for (let r = 0; t > r; r++) e[n + r] = e[n + t + r];
      return ((e.length = n + t), { start: n, length: t });
    }
  }
}
function Hr(e, t) {
  let n = t.start + t.length,
    r = Wr(e, t);
  r && e.splice(n + r === e.length ? n : t.start, r);
}
function Ur(e, t) {
  let n = t.start;
  for (; n > 0 && Br(e[n - 1], e[n - 1 + t.length]); ) n--;
  return t.start - n;
}
function Wr(e, t) {
  let n = t.start + t.length,
    r = n;
  for (; e.length > r && Br(e[r], e[r - t.length]); ) r++;
  return r - n;
}
function Gr(e, t) {
  let n = t[0],
    r = e.length - (n ? Ur(e, n) : 0);
  for (let n of t) r -= Wr(e, n);
  return r;
}
function Kr(e, t, n) {
  for (let r = 0; e.length > r; r++) {
    let i = e[(t + r) % e.length],
      a = e[(n + r) % e.length];
    if (i !== a) return a > i;
  }
  return !1;
}
var qr = class {
    match(e) {
      return this.isDOMException(e) || this.isDOMError(e);
    }
    coerce(e, t) {
      let n = I(e.stack);
      return {
        type: this.getType(e),
        value: this.getValue(e),
        stack: n ? e.stack : void 0,
        cause: e.cause ? t.next(e.cause) : void 0,
        synthetic: !1,
      };
    }
    getType(e) {
      return this.isDOMError(e) ? `DOMError` : `DOMException`;
    }
    getValue(e) {
      let t = e.name || (this.isDOMError(e) ? `DOMError` : `DOMException`);
      return e.message ? `${t}: ${e.message}` : t;
    }
    isDOMException(e) {
      return Bt(e, `DOMException`);
    }
    isDOMError(e) {
      return Bt(e, `DOMError`);
    }
  },
  Jr = class {
    match(e) {
      return Vt(e);
    }
    coerce(e, t) {
      let n = this.getStack(e),
        r = n === void 0 ? t.syntheticException?.stack : void 0,
        i = !!r;
      return {
        type: this.getType(e),
        value: this.getMessage(e, t),
        stack: n ?? r,
        cause: e.cause ? t.next(e.cause) : void 0,
        synthetic: i,
      };
    }
    getType(e) {
      return e.name || e.constructor.name;
    }
    getMessage(e, t) {
      let n = e.message;
      return String(n.error && typeof n.error.message == `string` ? n.error.message : n);
    }
    getStack(e) {
      try {
        let t = e.stacktrace;
        if (typeof t == `string` && t.length > 0) return t;
        let n = e.stack;
        return typeof n == `string` && n.length > 0 ? n : void 0;
      } catch {
        return;
      }
    }
  },
  Yr = class {
    match(e) {
      return !!Bt(e, `ErrorEvent`) && (e.error != null || this._hasUsableMessage(e));
    }
    coerce(e, t) {
      if (e.error != null) return t.apply(e.error);
      let n = t.apply(e.message);
      return V(V({}, n), {}, { stack: this._buildLocationStack(e) ?? n.stack, synthetic: !0 });
    }
    _hasUsableMessage(e) {
      return I(e.message) && e.message.length > 0;
    }
    _buildLocationStack(e) {
      let t = e,
        n = t.lineno ?? 0,
        r = t.colno ?? 0;
      if (I(t.filename) && t.filename.length !== 0 && n !== 0)
        return `Error\n    at ${t.filename}:${n}:${r}`;
    }
  },
  Xr =
    /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i,
  Zr = class {
    match(e) {
      return typeof e == `string`;
    }
    coerce(e, t) {
      let [n, r] = this.getInfos(e);
      return {
        type: n ?? `Error`,
        value: r ?? e,
        stack: t.syntheticException?.stack,
        synthetic: !0,
      };
    }
    getInfos(e) {
      let t = `Error`,
        n = e,
        r = e.match(Xr);
      return (r && ((t = r[1]), (n = r[2])), [t, n]);
    }
  },
  Qr = [`fatal`, `error`, `warning`, `log`, `info`, `debug`];
function $r(e, t = 40) {
  let n = Object.keys(e);
  if ((n.sort(), !n.length)) return `[object has no keys]`;
  for (let e = n.length; e > 0; e--) {
    let r = n.slice(0, e).join(`, `);
    if (t >= r.length) return e === n.length ? r : r.length > t ? `${r.slice(0, t)}...` : r;
  }
  return ``;
}
var ei = class {
    match(e) {
      return typeof e == `object` && !!e;
    }
    coerce(e, t) {
      let n = this.getErrorPropertyFromObject(e);
      return n
        ? t.apply(n)
        : {
            type: this.getType(e),
            value: this.getValue(e),
            stack: this.getStack(e) ?? t.syntheticException?.stack,
            level: this.isSeverityLevel(e.level) ? e.level : `error`,
            synthetic: !0,
          };
    }
    getType(e) {
      if (Ht(e)) return e.constructor.name;
      let t = `name` in e ? e.name : void 0;
      return I(t) && !Pt(t) ? t : `Error`;
    }
    getValue(e) {
      if (`name` in e && typeof e.name == `string`) {
        let t = `'${e.name}' captured as exception`;
        return (
          `message` in e && typeof e.message == `string` && (t += ` with message: '${e.message}'`),
          t
        );
      }
      if (`message` in e && typeof e.message == `string`) return e.message;
      let t = this.getObjectClassName(e);
      return `${t && t !== `Object` ? `'${t}'` : `Object`} captured as exception with keys: ${$r(e)}`;
    }
    isSeverityLevel(e) {
      return I(e) && !Pt(e) && Qr.indexOf(e) >= 0;
    }
    getStack(e) {
      try {
        return I(e.stacktrace) && e.stacktrace.length > 0
          ? e.stacktrace
          : I(e.stack) && e.stack.length > 0
            ? e.stack
            : void 0;
      } catch {
        return;
      }
    }
    getErrorPropertyFromObject(e) {
      for (let t in e)
        if ({}.hasOwnProperty.call(e, t)) {
          let n = e[t];
          if (Vt(n)) return n;
        }
    }
    getObjectClassName(e) {
      try {
        let t = Object.getPrototypeOf(e);
        return t ? t.constructor.name : void 0;
      } catch {
        return;
      }
    }
  },
  ti = class {
    match(e) {
      return Ht(e);
    }
    coerce(e, t) {
      let n = e.constructor.name;
      return {
        type: n,
        value: `${n} captured as exception with keys: ${$r(e)}`,
        stack: t.syntheticException?.stack,
        synthetic: !0,
      };
    }
  },
  ni = class {
    match(e) {
      return zt(e);
    }
    coerce(e, t) {
      return {
        type: `Error`,
        value: `Primitive value captured as exception: ${String(e)}`,
        stack: t.syntheticException?.stack,
        synthetic: !0,
      };
    }
  },
  ri = class {
    match(e) {
      return Bt(e, `PromiseRejectionEvent`) || this.isCustomEventWrappingRejection(e);
    }
    isCustomEventWrappingRejection(e) {
      if (!Ht(e)) return !1;
      try {
        let t = e.detail;
        return typeof t == `object` && !!t && `reason` in t;
      } catch {
        return !1;
      }
    }
    coerce(e, t) {
      let n = this.getUnhandledRejectionReason(e);
      return zt(n)
        ? {
            type: `UnhandledRejection`,
            value: `Non-Error promise rejection captured with value: ${String(n)}`,
            stack: t.syntheticException?.stack,
            synthetic: !0,
          }
        : t.apply(n);
    }
    getUnhandledRejectionReason(e) {
      try {
        if (`reason` in e) return e.reason;
        if (
          `detail` in e &&
          e.detail != null &&
          typeof e.detail == `object` &&
          `reason` in e.detail
        )
          return e.detail.reason;
      } catch {}
      return e;
    }
  },
  ii = `$message`,
  ai = `$timestamp`,
  oi = new Set([ii, ai]),
  si = { enabled: !0, max_bytes: 32768 };
function ci(e) {
  return e
    ? { enabled: e.enabled ?? si.enabled, max_bytes: ui(e.max_bytes, si.max_bytes) }
    : V({}, si);
}
var li = class {
  constructor(e) {
    ((this._entries = []), (this._totalBytes = 0), (this._config = ci(e)));
  }
  setConfig(e) {
    ((this._config = ci(e)), this._trimToMaxBytes());
  }
  add(e) {
    let t = (function (e) {
      let t;
      try {
        t = kt(e);
      } catch {
        return;
      }
      try {
        let e = JSON.parse(t);
        if (!P(e)) return;
        let n = e,
          r = n[ii],
          i = n[ai];
        return !I(r) || r.trim().length === 0 || (!I(i) && !z(i)) ? void 0 : { step: n, json: t };
      } catch {
        return;
      }
    })(e);
    if (!t) return;
    let n = (function (e) {
      if (`u` > typeof TextEncoder) return new TextEncoder().encode(e).length;
      let t = encodeURIComponent(e),
        n = 0;
      for (let e = 0; t.length > e; e++) t[e] === `%` ? ((n += 1), (e += 2)) : (n += 1);
      return n;
    })(t.json);
    n > this._config.max_bytes ||
      (this._entries.push({ step: t.step, bytes: n }),
      (this._totalBytes += n),
      this._trimToMaxBytes());
  }
  getAttachable() {
    return this._entries.map((e) => e.step);
  }
  clear() {
    ((this._entries = []), (this._totalBytes = 0));
  }
  size() {
    return this._entries.length;
  }
  _trimToMaxBytes() {
    for (; this._totalBytes > this._config.max_bytes && this._entries.length > 0; ) {
      let e = this._entries.shift();
      e && (this._totalBytes -= e.bytes);
    }
  }
};
function ui(e, t) {
  if (!z(e) || 1 / 0 === e || -1 / 0 === e) return t;
  let n = Math.floor(e);
  return 0 > n ? t : n;
}
var di = (e) => {
  if (typeof e != `string`) return e;
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
};
function fi(e) {
  return typeof e == `string` || e;
}
function pi(e) {
  return typeof e == `string` ? e : void 0;
}
var mi =
    `$feature_flag.$feature_flag_response.$feature_flag_has_experiment.$feature_flag_id.$feature_flag_version.$feature_flag_reason.$feature_flag_request_id.$feature_flag_evaluated_at.$feature_flag_error.locally_evaluated.$groups.$process_person_profile.$geoip_disable.$current_url.$pathname.$referring_domain.utm_source.utm_medium.utm_campaign.utm_content.utm_term.gad_source.mc_cid.gclid.gclsrc.dclid.gbraid.wbraid.fbclid.msclkid.twclid.li_fat_id.igshid.ttclid.rdt_cid.epik.qclid.sccid.oppref.bfcid.irclid._kx.$session_id.$window_id.$lib.$lib_version.$device_id.$is_server`.split(
      `.`,
    ),
  hi = `NativeGzipValidationError`,
  gi = (e) => e.length >= 2 && e[0] === 31 && e[1] === 139,
  _i = (e, t) => e === wt.GZipJS || t === wt.GZipJS || t === `gzip`,
  vi = (e) =>
    !(!e || typeof e != `object`) && (`name` in e ? String(e.name) : ``) === `NotReadableError`,
  yi,
  bi = (e) => {
    throw dr(hi, `Native gzip produced invalid output: ${e}`);
  },
  xi =
    ((Si = B(function* (e, t) {
      18 > e.size && bi(`too-short`);
      let n = new Uint8Array(yield e.slice(0, 10).arrayBuffer());
      (gi(n) && n[2] === 8) || bi(`invalid-header`);
      let r = new DataView(yield e.slice(e.size - 8).arrayBuffer());
      r.getUint32(0, !0) !==
        ((e) => {
          let t = (() => {
              if (yi) return yi;
              yi = [];
              for (let e = 0; 256 > e; e++) {
                let t = e;
                for (let e = 0; 8 > e; e++) t = 1 & t ? 3988292384 ^ (t >>> 1) : t >>> 1;
                yi[e] = t >>> 0;
              }
              return yi;
            })(),
            n = 4294967295;
          for (let r = 0; e.length > r; r++) n = t[255 & (n ^ e[r])] ^ (n >>> 8);
          return (4294967295 ^ n) >>> 0;
        })(t) && bi(`invalid-crc`);
      let i = t.length >>> 0;
      r.getUint32(4, !0) !== i && bi(`invalid-size`);
    })),
    function (e, t) {
      return Si.apply(this, arguments);
    }),
  Si;
function Ci() {
  return (
    (Ci = B(function* (e, t = !0, n) {
      try {
        let t = new TextEncoder().encode(e),
          n = new globalThis.CompressionStream(`gzip`),
          i = n.writable.getWriter(),
          a = i
            .write(t)
            .then(() => i.close())
            .catch(
              ((r = B(function* (e) {
                try {
                  yield i.abort(e);
                } catch {}
                throw e;
              })),
              function (e) {
                return r.apply(this, arguments);
              }),
            ),
          o = new Response(n.readable).blob(),
          [s] = yield Promise.all([o, a]);
        return (yield xi(s, t), s);
      } catch (e) {
        if (n?.rethrow) throw e;
        return (t && console.error(`Failed to gzip compress data`, e), null);
      }
      var r;
    })),
    Ci.apply(this, arguments)
  );
}
function wi(e, t) {
  if (e == null) return {};
  var n,
    r,
    i = (function (e, t) {
      if (e == null) return {};
      var n = {};
      for (var r in e)
        if ({}.hasOwnProperty.call(e, r)) {
          if (t.includes(r)) continue;
          n[r] = e[r];
        }
      return n;
    })(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; a.length > r; r++)
      t.includes((n = a[r])) || ({}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]));
  }
  return i;
}
var Ti = `[redacted]`,
  Ei = /^[A-Za-z0-9+/\n\r]+=*$/,
  Di = /^[A-Za-z0-9_-]+={0,2}$/,
  Oi = /[-_]/,
  ki = /^data:[^,\s]*;base64,/i,
  Ai = /^[A-Za-z0-9+/_-]+={0,2}$/,
  ji = /\bph[a-z]_[A-Za-z0-9_-]{20,}\b/g,
  Mi =
    /^(authorization|cookie|set-cookie|x-api-key|api[-_]?key|api[-_]?token|access[-_]?token|refresh[-_]?token|token|password|secret|client[-_]?secret|private[-_]?key)$/i,
  Ni = /[a-z][a-z0-9+.-]{0,63}:[^\s<>"]+/gi,
  Pi = /[\s<>"]/,
  Fi = new RegExp(Ni.source, `i`),
  Ii = /[a-z][a-z0-9+.-]{0,63}:\/\//i,
  Li = RegExp(`^${Ii.source}`, `i`),
  Ri = new RegExp(Ii.source, `gi`),
  zi =
    /(^|[-_./;])(auth|token|secret|password|passwd|pwd|credential|signature|sig|key|hmac|sas|bearer|jwt|session|sessionid)([-_./;]|$)/i,
  Bi = /^(code|AWSAccessKeyId|GoogleAccessId|Policy)$/i,
  Vi = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g,
  Hi = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}/g,
  Ui = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g,
  Wi =
    /(^|[^\w:])((?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,5}|::(?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6})))(?=$|[^\w:])/g,
  Gi = /\b\d{3}[ .-]\d{2}[ .-]\d{4}\b/g,
  Ki = /\b\d(?:[ ./-]?\d){12,}\b/g,
  qi = /\d+/g,
  Ji = /(^|[^\w+])((?:\+?1[ ./-]?)?(?:\(\d{3}\)[ ./-]?|\d{3}[ ./-])\d{3}[ ./-]\d{4})(?![\w])/g,
  Yi = /(^|[^\w])(\+\d{1,3}(?:[ ./()-]{0,2}\d){7,13})(?![\w])/g;
function Xi(e) {
  return (
    (function (e) {
      return Mi.test(e);
    })(e) ||
    zi.test(e) ||
    Bi.test(e)
  );
}
function Zi(e) {
  return e.split(`&`, 129).length > 128;
}
function Qi(e, t, n) {
  return Xi(e) ||
    (t.includes(`;`) &&
      (function (e) {
        return e.split(`;`).some((e) => Xi(e.split(`=`, 1)[0]));
      })(t))
    ? Ti
    : Fi.test(t)
      ? n
        ? ia(t, { allowNestedUrls: !1, stripPunctuation: !0 })
        : Ti
      : t;
}
function $i(e, t) {
  let n = new URLSearchParams(),
    r = !1,
    i = !1;
  for (let [a, o] of new URLSearchParams(e)) {
    let e = aa(a),
      s = aa(o);
    r ||= e !== a || s !== o;
    let c = Qi(e, s, t);
    ((r ||= c !== s), (i = Xi(e) || c !== s), n.append(e, c));
  }
  return { changed: r, lastFieldSensitive: i, serialized: n.toString() };
}
function ea(e, t) {
  if (!e.includes(`=`)) return { value: ta(e, t), lastFieldSensitive: !1 };
  let n = $i(e, t);
  return { value: n.changed ? n.serialized : e, lastFieldSensitive: n.lastFieldSensitive };
}
function ta(e, t) {
  return t ? ia(e, { allowNestedUrls: !1, stripPunctuation: !0 }) : Fi.test(e) ? Ti : e;
}
function na(e, t, n) {
  return e === `#`
    ? !t.fragment && (t.fragment = !0)
    : e === `?` &&
        (t.fragment
          ? n !== `=` && !t.fragmentQuery && (t.fragmentQuery = !0)
          : !t.query && (t.query = !0));
}
function ra(e, t) {
  if (e.length > 8192 && Li.test(e)) return Ti;
  let { address: n, suffix: r } = t.stripPunctuation
      ? (function (e) {
          let t = e.length;
          for (; t > 0 && `.,;:!?)]}'`.includes(e[t - 1]); ) t--;
          return { address: e.slice(0, t), suffix: e.slice(t) };
        })(e)
      : { address: e, suffix: `` },
    i;
  try {
    i = new URL(n);
  } catch {
    return Ti + r;
  }
  let a = i.search.slice(1),
    o = i.hash !== ``,
    s = (function (e) {
      let t = e.slice(1),
        n = t.indexOf(`?`);
      return 0 > n ? { head: t, tail: null } : { head: t.slice(0, n), tail: t.slice(n + 1) };
    })(i.hash);
  if (Zi(a) || Zi(s.head) || Zi(s.tail ?? ``)) return Ti + r;
  let c = !1;
  (i.username || i.password) && ((i.username = Ti), (i.password = ``), (c = !0));
  let l = $i(a, t.allowNestedUrls);
  l.changed && ((i.search = l.serialized), (c = !0));
  let u = ea(s.head, t.allowNestedUrls),
    d =
      s.tail === null
        ? null
        : ((f = s.tail),
          u.lastFieldSensitive
            ? { value: f === `` ? `` : Ti, lastFieldSensitive: !0 }
            : ea(f, t.allowNestedUrls));
  var f;
  let p = d === null ? u.value : `${u.value}?${d.value}`;
  p !== i.hash.slice(1) && ((i.hash = p), (c = !0));
  let m = o ? (d ?? u) : l;
  return (c ? aa(i.toString()) : n) + (m.lastFieldSensitive ? `` : r);
}
function ia(e, t) {
  return e.replace(Ni, (n) =>
    (function (e, t) {
      let n = (function (e) {
        if (!e.includes(`://`)) return [];
        let t = [...e.matchAll(Ri)].map((e) => e.index),
          n = [],
          r = { query: !1, fragment: !1, fragmentQuery: !1 },
          i = 0,
          a = !1,
          o = ``;
        for (let s = 0; e.length > s && t.length > i; s++) {
          t[i] === s && (s > 0 && o !== `=` && n.push(s), i++);
          let c = e[s];
          na(c, r, o) ? ((o = c), (a = !0)) : a && `=&`.includes(c) && (o = c);
        }
        return n;
      })(e);
      if (n.length === 0) return ra(e, t);
      let r = ``,
        i = 0;
      for (let a of n)
        ((r += ra(e.slice(i, a), V(V({}, t), {}, { stripPunctuation: !1 }))), (i = a));
      return r + ra(e.slice(i), t);
    })(n, V(V({}, t), {}, { stripPunctuation: t.stripPunctuation && n.length !== e.length })),
  );
}
function aa(e) {
  return e.replace(ji, Ti);
}
function oa(e, t) {
  return (function (e) {
    return (
      e.length >= 10240 &&
      (Ei.test(e) ||
        (function (e) {
          let t = ki.exec(e);
          if (!t) return !1;
          let n;
          try {
            n = decodeURIComponent(e.slice(t[0].length));
          } catch {
            return !1;
          }
          return Ai.test(n.replace(/[\r\n]/g, ``));
        })(e) ||
        (Oi.test(e) && Di.test(e)))
    );
  })(e)
    ? `[binary data redacted - not supported by PostHog MCP analytics]`
    : (function (e, t, n) {
        let r = 4 * n.maxStringLength;
        if (e.length > r) {
          let i = t(
            e.slice(
              0,
              (function (e, t) {
                let n = t;
                for (; n > 0 && !Pi.test(e[n - 1]); ) n--;
                return n;
              })(e, r),
            ),
          );
          if (i.length >= 2 * n.maxStringLength) return i + n.truncationSuffix;
        }
        return t(e);
      })(
        e,
        (e) =>
          (function (e) {
            return ia(e, { allowNestedUrls: !0, stripPunctuation: !0 });
          })(
            (function (e) {
              let t = e.replace(Vi, ` `);
              return (
                (t = t.replace(Hi, Ti)),
                (t = t.replace(Ui, Ti)),
                (t = t.replace(Wi, `$1${Ti}`)),
                (t = t.replace(Ki, ca)),
                (t = t.replace(Gi, Ti)),
                (t = t.replace(Ji, `$1${Ti}`)),
                (t = t.replace(Yi, `$1${Ti}`)),
                t
              );
            })(aa(e)),
          ),
        t,
      );
}
function sa(e) {
  let t = 0,
    n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let i = e.charCodeAt(r) - 48;
    if (0 > i || i > 9) return !1;
    (n && ((i *= 2), i > 9 && (i -= 9)), (t += i), (n = !n));
  }
  return t % 10 == 0;
}
function ca(e) {
  let t = [];
  for (let n = qi.exec(e); n !== null; n = qi.exec(e))
    t.push({ digits: n[0], start: n.index, end: n.index + n[0].length });
  let n = ``,
    r = 0,
    i = 0;
  for (; t.length > i; ) {
    let a = ``,
      o = -1;
    for (let e = i; t.length > e && ((a += t[e].digits), 19 >= a.length); e++)
      a.length >= 13 && sa(a) && (o = e);
    0 > o ? i++ : ((n += e.slice(r, t[i].start) + Ti), (r = t[o].end), (i = o + 1));
  }
  return n + e.slice(r);
}
var la = {}.propertyIsEnumerable;
function ua(e, t) {
  try {
    return pa(e, t, { ancestors: new WeakSet(), remainingNodes: 1e4 }, 0);
  } catch {
    return [];
  }
}
function da(e, t, n, r) {
  if (0 >= n.remainingNodes) return { stringValue: rr };
  if ((n.remainingNodes--, It(e))) return { boolValue: e };
  if (typeof e == `bigint`)
    return (function (e, t) {
      let n = e.toString(),
        r = BigInt(`9223372036854775808`);
      return e >= r || -r > e
        ? (t?.debug(`Attribute ${n} is outside the int64 range; encoding it as a string`),
          { stringValue: n })
        : { intValue: n };
    })(e, t);
  if (typeof e == `number`) {
    if (!Number.isFinite(e)) return { stringValue: String(e) };
    if (Number.isInteger(e)) {
      if (Number.isSafeInteger(e)) return { intValue: String(e) };
      if (typeof BigInt > `u`) return { stringValue: String(e) };
      let n = BigInt(e).toString();
      return e >= 0x8000000000000000 || -0x8000000000000000 > e
        ? (t?.debug(`Attribute ${n} is outside the int64 range; encoding it as a string`),
          { stringValue: n })
        : { intValue: n };
    }
    return { doubleValue: e };
  }
  if (typeof e == `string`) return { stringValue: ar(e) };
  if (typeof e == `function`) return { stringValue: `[Function]` };
  if (typeof e == `symbol`) return { stringValue: String(e) };
  if (typeof e == `object` && e) {
    if (n.ancestors.has(e)) return { stringValue: `[Circular]` };
    if (r >= 20) return { stringValue: rr };
    if (e instanceof Date) {
      let t = e.getTime(),
        n = Number.isFinite(t) ? e.toISOString() : String(e);
      return { stringValue: typeof n == `string` ? ar(n) : String(n) };
    }
    n.ancestors.add(e);
    try {
      try {
        let i = e.toJSON;
        if (typeof i == `function`) return da(i.call(e), t, n, r + 1);
      } catch {}
      return M(e)
        ? { arrayValue: { values: fa(e, t, n, r + 1) } }
        : { kvlistValue: { values: pa(e, t, n, r + 1) } };
    } finally {
      n.ancestors.delete(e);
    }
  }
  return { stringValue: ar(String(e)) };
}
function fa(e, t, n, r) {
  let i = [],
    a = Math.min(e.length, 1e3),
    o = 0;
  for (; a > o && n.remainingNodes > 0; o++)
    try {
      let a = o in e ? e[o] : void 0;
      if (R(a)) continue;
      i.push(da(a, t, n, r));
    } catch {
      i.push({ stringValue: ir });
    }
  return (e.length > o && i.push({ stringValue: rr }), i);
}
function pa(e, t, n, r) {
  let i = [];
  for (let a in e)
    if (la.call(e, a)) {
      if (!a) {
        t?.debug(`Dropping an attribute with an empty key`);
        continue;
      }
      if (i.length >= 1e3 || 0 >= n.remainingNodes) {
        t?.debug(`Attributes truncated: the value exceeds the OTLP encoder budget`);
        break;
      }
      try {
        let o = e[a];
        if (L(o) || F(o)) continue;
        i.push({ key: ar(a), value: da(o, t, n, r) });
      } catch {
        i.push({ key: ar(a), value: { stringValue: ir } });
      }
    }
  return i;
}
function ma(e, t, n) {
  return V(
    V(
      V(
        V({}, or({}, e.resourceAttributes)),
        {},
        { "service.name": e.serviceName || `unknown_service` },
        e.environment && { "deployment.environment": e.environment },
      ),
      e.serviceVersion && { "service.version": e.serviceVersion },
    ),
    {},
    { "telemetry.sdk.name": t, "telemetry.sdk.version": n },
  );
}
var ha = [
  `service.name`,
  `deployment.environment`,
  `service.version`,
  `telemetry.sdk.name`,
  `telemetry.sdk.version`,
];
function ga(e, t) {
  let n = or({}, e),
    r = {};
  for (let e of ha) ({}).hasOwnProperty.call(n, e) && ((r[e] = n[e]), delete n[e]);
  return [...ua(n, t), ...ua(r, t)];
}
var _a = {
    darwin: `macOS`,
    win32: `Windows`,
    cygwin: `Windows`,
    linux: `Linux`,
    android: `Android`,
    freebsd: `FreeBSD`,
    openbsd: `OpenBSD`,
    netbsd: `NetBSD`,
    sunos: `SunOS`,
    aix: `AIX`,
    haiku: `Haiku`,
    "Mac OS X": `macOS`,
  },
  va = {
    trace: { text: `TRACE`, number: 1 },
    debug: { text: `DEBUG`, number: 5 },
    info: { text: `INFO`, number: 9 },
    warn: { text: `WARN`, number: 13 },
    error: { text: `ERROR`, number: 17 },
    fatal: { text: `FATAL`, number: 21 },
  },
  ya = va.info;
function ba(e) {
  try {
    return ar(String(e));
  } catch {
    return ir;
  }
}
function xa(e, t, n, r) {
  let { text: i, number: a } = va[e.level || `info`] || ya,
    o = (function (e = Date.now()) {
      return String(e) + `000000`;
    })(z(r) ? r : void 0),
    s = {};
  (t.distinctId && (s.posthogDistinctId = t.distinctId),
    t.sessionId && (s.sessionId = t.sessionId),
    t.windowId && (s[`window.id`] = t.windowId),
    R(t.sessionStartTimestamp) || (s.sessionStartTimestamp = String(t.sessionStartTimestamp)),
    R(t.lastActivityTimestamp) || (s.lastActivityTimestamp = String(t.lastActivityTimestamp)),
    t.currentUrl && (s[`url.full`] = t.currentUrl),
    t.screenName && (s[`screen.name`] = t.screenName),
    t.appState && (s[`app.state`] = t.appState),
    t.activeFeatureFlags &&
      t.activeFeatureFlags.length > 0 &&
      (s.feature_flags = t.activeFeatureFlags));
  let c = V({}, s),
    l = e.attributes;
  if (l) {
    let e = [];
    try {
      e = Object.keys(l);
    } catch {
      e = [];
    }
    for (let t of e) {
      let e;
      try {
        e = l[t];
      } catch {
        e = ir;
      }
      Object.defineProperty(c, t, { value: e, enumerable: !0, writable: !0, configurable: !0 });
    }
  }
  let u = {
    timeUnixNano: o,
    observedTimeUnixNano: o,
    severityNumber: a,
    severityText: i,
    body: { stringValue: ba(e.body) },
    attributes: ua(c, n),
  };
  return (
    e.trace_id && (u.traceId = e.trace_id),
    e.span_id && (u.spanId = e.span_id),
    F(e.trace_flags) || (u.flags = e.trace_flags),
    u
  );
}
function Sa(e, t, n) {
  return ma(e, t, n);
}
function Ca(e, t, n, r) {
  return {
    resourceLogs: [
      {
        resource: { attributes: ga(t) },
        scopeLogs: [{ scope: { name: n, version: r }, logRecords: e }],
      },
    ],
  };
}
var wa = class {
  constructor(e) {
    ((this._onFire = e), (this._firesAt = 0));
  }
  get pending() {
    return !!this._timer;
  }
  arm(e) {
    (this.clear(),
      (this._firesAt = Date.now() + e),
      (this._timer = mr(() => {
        ((this._timer = void 0), this._onFire());
      }, e)));
  }
  armNoEarlierThan(e) {
    (this._timer && Date.now() + e <= this._firesAt) || this.arm(e);
  }
  clear() {
    this._timer &&= (clearTimeout(this._timer), void 0);
  }
};
function Ta() {
  return 0.75 + 0.5 * Math.random();
}
function Ea(e, t, n, r) {
  let i = e * 2 ** Math.min(Math.max(0, t - 1), 6);
  return Math.round((r === void 0 ? i : Math.min(i, Math.max(r, e))) * n);
}
var Da = class {
    constructor(e, t, n, r, i, a = () => Promise.resolve(), o) {
      ((this._instance = e),
        (this._config = t),
        (this._logger = n),
        (this._getContext = r),
        (this._onReady = i),
        (this._waitForStoragePersist = a),
        (this._scopeName = o),
        (this._flushTimer = new wa(() => this._flushInBackground())),
        (this._flushPromise = null),
        (this._evictedSinceAdvance = 0),
        (this._queueGeneration = 0),
        (this._retryAfter = new cr()),
        (this._consecutiveFlushFailures = 0),
        (this._flushJitter = 1),
        (this._intervalWindowStart = 0),
        (this._intervalLogCount = 0),
        (this._droppedWarned = !1),
        (this._maxBufferSize = t.maxBufferSize),
        (this._maxQueueSize = Math.max(t.maxQueueSize ?? t.maxBufferSize, t.maxBufferSize)),
        (this._flushIntervalMs = t.flushIntervalMs),
        (this._maxBatchRecordsPerPost = t.maxBatchRecordsPerPost),
        (this._rateCapWindowMs = t.rateCapWindowMs),
        (this._maxLogsPerInterval = t.maxLogsPerInterval));
    }
    clearQueue() {
      (this._queueGeneration++, this._instance.setPersistedProperty(Ct.LogsQueue, []));
    }
    reset() {
      (this._flushTimer.clear(),
        (this._intervalWindowStart = 0),
        (this._intervalLogCount = 0),
        (this._droppedWarned = !1),
        (this._consecutiveFlushFailures = 0),
        (this._flushJitter = 1),
        this._retryAfter.reset(),
        (this._maxBatchRecordsPerPost = this._config.maxBatchRecordsPerPost));
    }
    onReconnect() {
      ((this._consecutiveFlushFailures = 0),
        (this._flushJitter = 1),
        this._retryAfter.isOpen()
          ? this._hasQueuedRecords() && this._armFlushTimer()
          : this._flushInBackground());
    }
    captureLog(e, t) {
      if (this._instance.isDisabled || this._instance.optedOut || !e?.body) return;
      let n = this._runBeforeSend(e);
      if (n === null) return;
      if (!n.body) return void this._logger.info(`Log was rejected in beforeSend function`);
      if (!this._checkRateLimit()) return;
      let r = { record: xa(n, t?.context ?? this._getContext(), this._logger, t?.occurredAtMs) };
      this._onReady(() => this._enqueue(r));
    }
    _runBeforeSend(e) {
      let t = this._config.beforeSend;
      if (!t) return e;
      let n = M(t) ? t : [t],
        r = e;
      for (let e of n)
        try {
          let t = e(r);
          if (!t) return (this._logger.info(`Log was rejected in beforeSend function`), null);
          r = t;
        } catch (e) {
          return (this._logger.error(`Error in beforeSend function for log:`, e), null);
        }
      return r;
    }
    _checkRateLimit() {
      if (this._maxLogsPerInterval === void 0) return !0;
      let e = Date.now(),
        t = e - this._intervalWindowStart;
      return (
        (this._rateCapWindowMs > t && t >= 0) ||
          ((this._intervalWindowStart = e),
          (this._intervalLogCount = 0),
          (this._droppedWarned = !1)),
        this._maxLogsPerInterval > this._intervalLogCount
          ? (this._intervalLogCount++, !0)
          : ((this._droppedWarned ||=
              (this._logger.warn(
                `captureLog dropping logs: exceeded ${this._maxLogsPerInterval} logs per ${this._rateCapWindowMs}ms`,
              ),
              !0)),
            !1)
      );
    }
    flush() {
      var e = this;
      return B(function* () {
        if (!e._instance.isDisabled)
          return (
            (e._flushPromise ||= e._flushInner().finally(() => {
              e._flushPromise = null;
            })),
            e._flushPromise
          );
      })();
    }
    _flushInner() {
      var e = this;
      return B(function* () {
        e._flushTimer.clear();
        let t = e._instance.getPersistedProperty(Ct.LogsQueue) ?? [];
        if (t.length === 0) return;
        let n = t.length,
          r = 0;
        for (; t.length > 0 && n > r; ) {
          let n = e._queueGeneration;
          e._evictedSinceAdvance = 0;
          let i = Math.min(t.length, e._maxBatchRecordsPerPost),
            a = t.slice(0, i),
            o = Ca(
              a.map((e) => e.record),
              e._buildResourceAttributes(),
              e._scopeName ?? e._instance.getLibraryId(),
              e._instance.getLibraryVersion(),
            ),
            s = yield e._instance._sendLogsBatch(o);
          if (e._queueGeneration !== n) return;
          if (s.kind === `too-large` && a.length > 1)
            ((e._maxBatchRecordsPerPost = Math.max(1, Math.floor(a.length / 2))),
              e._logger.warn(
                `Logs batch of size ${a.length} was too large for the ingestion endpoint, reducing batch size to ${e._maxBatchRecordsPerPost}`,
              ));
          else if (
            (e._retryAfter.record(s),
            e._flushTimer.pending &&
              e._flushTimer.arm(Math.max(e._flushIntervalMs, e._retryAfter.remainingMs())),
            s.kind === `retry-later` ||
              (s.kind === `too-large`
                ? e._logger.warn(
                    `Dropping a single log record with batch size 1 — the record is larger than the server cap and cannot be split further.`,
                  )
                : s.kind === `ok` &&
                  e._config.maxBatchRecordsPerPost > e._maxBatchRecordsPerPost &&
                  (e._maxBatchRecordsPerPost = Math.min(
                    e._config.maxBatchRecordsPerPost,
                    e._maxBatchRecordsPerPost + 1,
                  )),
              yield e._persistQueueAdvance(a.length),
              (t = e._instance.getPersistedProperty(Ct.LogsQueue) ?? []),
              (r += a.length),
              s.kind === `fatal`))
          )
            throw s.error;
        }
      })();
    }
    _persistQueueAdvance(e) {
      var t = this;
      return B(function* () {
        let n = Math.max(0, e - t._evictedSinceAdvance),
          r = t._instance.getPersistedProperty(Ct.LogsQueue) ?? [];
        (t._instance.setPersistedProperty(Ct.LogsQueue, r.slice(n)),
          yield t._waitForStoragePersist());
      })();
    }
    _buildResourceAttributes() {
      return Sa(this._config, this._instance.getLibraryId(), this._instance.getLibraryVersion());
    }
    _enqueue(e) {
      if (this._instance.optedOut) return;
      let t = this._instance.getPersistedProperty(Ct.LogsQueue) ?? [];
      (this._maxQueueSize > t.length ||
        (t.shift(),
        this._evictedSinceAdvance++,
        this._logger.info(`Logs queue is full, dropping oldest record.`)),
        t.push(e),
        this._instance.setPersistedProperty(Ct.LogsQueue, t),
        this._maxBufferSize > t.length || this._retryAfter.isOpen()
          ? this._armFlushTimer()
          : this._flushInBackground());
    }
    _armFlushTimer() {
      this._flushTimer.pending ||
        this._flushTimer.arm(Math.max(this._flushIntervalMs, this._retryAfter.remainingMs()));
    }
    _nextFlushDelay() {
      return Math.max(
        Ea(this._flushIntervalMs, this._consecutiveFlushFailures, this._flushJitter, 3e4),
        this._retryAfter.remainingMs(),
      );
    }
    _hasQueuedRecords() {
      let e = this._instance.getPersistedProperty(Ct.LogsQueue);
      return !!e && e.length > 0;
    }
    shutdown(e) {
      var t = this;
      return B(function* () {
        t._flushTimer.clear();
        let n = t.flush().catch(() => {});
        e === void 0 ? yield n : yield hr(n, e);
      })();
    }
    flushWithTimeout(e) {
      var t = this;
      return B(function* () {
        let n = t.flush();
        yield hr(n, e, () => {
          n.catch(() => {});
        });
      })();
    }
    _flushInBackground() {
      this.flush()
        .then(
          () => {
            ((this._consecutiveFlushFailures = 0), (this._flushJitter = 1));
          },
          (e) => {
            (this._consecutiveFlushFailures++,
              (this._flushJitter = Ta()),
              this._logger.error(`PostHog logs flush failed:`, e));
          },
        )
        .finally(() => {
          !this._instance.isDisabled &&
            this._hasQueuedRecords() &&
            this._flushTimer.armNoEarlierThan(this._nextFlushDelay());
        });
    }
  },
  Oa = /^[0-9a-f]+$/;
function ka(e, t, n) {
  return typeof e == `string` && e.length === t && e !== n && Oa.test(e);
}
var Aa = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})(-.*)?$/,
  ja = `00`,
  Ma = [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1e3, 2500, 5e3, 7500, 1e4];
function Na(e) {
  return String(e) + `000000`;
}
function Pa(e, t, n, r) {
  let i = ``;
  return (
    r &&
      (i = Object.keys(r)
        .sort()
        .map((e) => `${JSON.stringify(e)}:${JSON.stringify(r[e])}`)
        .join(`,`)),
    `${e}\0${t}\0${n ?? ``}\0${i}`
  );
}
var Fa = class {
  constructor(e, t, n) {
    ((this._instance = e),
      (this._config = t),
      (this._logger = n),
      (this._series = new Map()),
      (this._flushTimer = new wa(() =>
        this.flush().catch((e) => {
          this._logger.error(`Metrics flush failed:`, e);
        }),
      )),
      (this._flushPromise = null),
      (this._seriesCapWarned = !1),
      (this._typeByName = new Map()),
      (this._typeCollisionWarned = new Set()),
      (this._retryAfter = new cr()),
      (this._consecutiveFlushFailures = 0),
      (this._flushJitter = 1),
      (this._generation = 0));
  }
  count(e, t = 1, n) {
    this._capture({ name: e, type: `count`, value: t, unit: n?.unit, attributes: n?.attributes });
  }
  gauge(e, t, n) {
    this._capture({ name: e, type: `gauge`, value: t, unit: n?.unit, attributes: n?.attributes });
  }
  histogram(e, t, n) {
    this._capture({
      name: e,
      type: `histogram`,
      value: t,
      unit: n?.unit,
      attributes: n?.attributes,
    });
  }
  flush() {
    var e = this;
    let t = this._flushPromise,
      n = (function () {
        var n = B(function* () {
          (t && (yield t.catch(() => {})), yield e._doFlush());
        });
        return function () {
          return n.apply(this, arguments);
        };
      })()().finally(() => {
        this._flushPromise === n && (this._flushPromise = null);
      });
    return ((this._flushPromise = n), n);
  }
  drainWindow() {
    if (this._series.size === 0) return null;
    let e = this._series;
    return (
      (this._series = new Map()),
      (this._seriesCapWarned = !1),
      (this._typeByName = new Map()),
      (this._typeCollisionWarned = new Set()),
      this._buildPayload(e)
    );
  }
  reset() {
    (this._generation++,
      this._retryAfter.reset(),
      (this._consecutiveFlushFailures = 0),
      (this._flushJitter = 1),
      this._flushTimer.clear(),
      (this._series = new Map()),
      (this._flushPromise = null),
      (this._seriesCapWarned = !1),
      (this._typeByName = new Map()),
      (this._typeCollisionWarned = new Set()));
  }
  _capture(e) {
    if (this._instance.isDisabled || this._instance.optedOut) return;
    let t = this._runBeforeSend(e);
    if (t === null) return;
    if (!t.name || typeof t.name != `string`)
      return void this._logger.warn(`Dropping metric with empty name`);
    if (typeof t.value != `number` || !Number.isFinite(t.value))
      return void this._logger.warn(`Dropping metric '${t.name}': value must be a finite number`);
    if (t.type === `count` && 0 > t.value)
      return void this._logger.warn(
        `Dropping count '${t.name}': counters are monotonic, value must be >= 0`,
      );
    let n, r;
    try {
      ((n = t.attributes ? V({}, t.attributes) : void 0), (r = Pa(t.type, t.name, t.unit, n)));
    } catch (e) {
      this._logger.warn(`Dropping metric '${t.name}': attributes could not be serialized`, e);
      return;
    }
    let i = this._series.get(r);
    if (!i) {
      if (!this._admitNewSeries()) return;
      ((i = { name: t.name, type: t.type, unit: t.unit, attributes: n, windowStartMs: Date.now() }),
        this._series.set(r, i));
    }
    let a = this._typeByName.get(t.name);
    (a === void 0
      ? this._typeByName.set(t.name, t.type)
      : a === t.type ||
        this._typeCollisionWarned.has(t.name) ||
        (this._typeCollisionWarned.add(t.name),
        this._logger.warn(
          `Metric name '${t.name}' is already used as a ${a}; recording it as a ${t.type} too will blend both series in charts. Use a distinct name.`,
        )),
      this._fold(i, t.value));
    let o = this._activeTraceContext();
    (o && (i.exemplar = V(V({}, o), {}, { value: t.value, timeMs: Date.now() })),
      this._armFlushTimer());
  }
  _activeTraceContext() {
    try {
      var e, t;
      let n = (function (e) {
        let t = (function (e) {
          if (typeof e != `string`) return;
          let t = Aa.exec(e.trim());
          if (!t) return;
          let [, n, r, i, a, o] = t;
          return n === `ff` ||
            (n === `00` && o) ||
            !(function (e) {
              return ka(e, 32, `00000000000000000000000000000000`);
            })(r) ||
            !(function (e) {
              return ka(e, 16, `0000000000000000`);
            })(i)
            ? void 0
            : { version: n, traceId: r, spanId: i, flags: a };
        })(e);
        return (
          t && {
            traceId: t.traceId,
            spanId: t.spanId,
            flags: ((n = t.flags), 1 & parseInt(n, 16) ? `01` : ja),
          }
        );
        var n;
      })(
        (e = (t = this._instance).getActiveSpan) == null || (e = e.call(t)) == null
          ? void 0
          : e.traceparent(),
      );
      if (n && n.flags === `01`) return { traceId: n.traceId, spanId: n.spanId };
    } catch {}
  }
  _admitNewSeries() {
    return (
      this._config.maxSeriesPerFlush > this._series.size ||
      (this._seriesCapWarned ||
        ((this._seriesCapWarned = !0),
        this._logger.warn(
          `Metric series cap reached (${this._config.maxSeriesPerFlush} per flush window); dropping new series until the next flush. Reduce attribute cardinality.`,
        )),
      !1)
    );
  }
  _fold(e, t) {
    switch (e.type) {
      case `count`:
        e.total = (e.total ?? 0) + t;
        break;
      case `gauge`:
        e.last = t;
        break;
      case `histogram`: {
        e.hist ||= { count: 0, sum: 0, min: t, max: t, bucketCounts: Array(Ma.length + 1).fill(0) };
        let n = e.hist;
        ((n.count += 1),
          (n.sum += t),
          (n.min = Math.min(n.min, t)),
          (n.max = Math.max(n.max, t)),
          (n.bucketCounts[
            (function (e, t) {
              for (let n = 0; t.length > n; n++) if (t[n] >= e) return n;
              return t.length;
            })(t, Ma)
          ] += 1));
        break;
      }
    }
  }
  _runBeforeSend(e) {
    let t = this._config.beforeSend;
    if (!t) return e;
    let n = M(t) ? t : [t],
      r = e;
    for (let e of n)
      try {
        let t = e(r);
        if (!t) return (this._logger.info(`Metric was rejected in beforeSend function`), null);
        r = t;
      } catch (e) {
        return (this._logger.error(`Error in beforeSend function for metric:`, e), null);
      }
    return r;
  }
  _armFlushTimer() {
    this._flushTimer.pending || this._flushTimer.arm(this._nextFlushDelay());
  }
  _nextFlushDelay() {
    return Math.max(
      Ea(this._config.flushIntervalMs, this._consecutiveFlushFailures, this._flushJitter, 3e4),
      this._retryAfter.remainingMs(),
    );
  }
  _doFlush() {
    var e = this;
    return B(function* () {
      if ((e._flushTimer.clear(), e._series.size === 0)) return;
      let t = e._series;
      ((e._series = new Map()),
        (e._seriesCapWarned = !1),
        (e._typeByName = new Map()),
        (e._typeCollisionWarned = new Set()));
      let n = e._generation,
        r = yield e._instance._sendMetricsBatch(e._buildPayload(t));
      if (n === e._generation)
        switch (
          (e._retryAfter.record(r),
          r.kind === `retry-later`
            ? (e._consecutiveFlushFailures++, (e._flushJitter = Ta()))
            : ((e._consecutiveFlushFailures = 0), (e._flushJitter = 1)),
          e._flushTimer.pending && e._flushTimer.arm(e._nextFlushDelay()),
          r.kind)
        ) {
          case `ok`:
            return;
          case `retry-later`:
            (e._mergeWindowBack(t), e._flushTimer.armNoEarlierThan(e._nextFlushDelay()));
            return;
          case `too-large`:
            e._logger.warn(`Metrics batch exceeded the server size limit and was dropped`);
            return;
          case `fatal`:
            e._logger.error(`Failed to send metrics batch:`, r.error);
            return;
        }
    })();
  }
  _buildPayload(e) {
    return (
      (t = this._buildMetrics(e)),
      (n = (function (e, t, n) {
        return ma(e, t, n);
      })(this._config, this._instance.getLibraryId(), this._instance.getLibraryVersion())),
      (r = this._instance.getLibraryId()),
      (i = this._instance.getLibraryVersion()),
      {
        resourceMetrics: [
          {
            resource: { attributes: ga(n) },
            scopeMetrics: [{ scope: { name: r, version: i }, metrics: t }],
          },
        ],
      }
    );
    var t, n, r, i;
  }
  _buildMetrics(e) {
    let t = Na(Date.now()),
      n = new Map();
    for (let r of e.values()) {
      let e = Pa(r.type, r.name, r.unit, void 0),
        i = n.get(e);
      i ||
        ((i = V({ name: r.name }, r.unit && { unit: r.unit })),
        r.type === `count`
          ? (i.sum = { aggregationTemporality: 1, isMonotonic: !0, dataPoints: [] })
          : r.type === `gauge`
            ? (i.gauge = { dataPoints: [] })
            : (i.histogram = { aggregationTemporality: 1, dataPoints: [] }),
        n.set(e, i));
      let a = ua(r.attributes ?? {}, this._logger),
        o = Na(r.windowStartMs),
        s = Ia(r.exemplar);
      if (r.type === `count`) {
        let e = V(
          { attributes: a, startTimeUnixNano: o, timeUnixNano: t, asDouble: r.total ?? 0 },
          s,
        );
        i.sum.dataPoints.push(e);
      } else if (r.type === `gauge`) {
        let e = V({ attributes: a, timeUnixNano: t, asDouble: r.last ?? 0 }, s);
        i.gauge.dataPoints.push(e);
      } else if (r.hist) {
        let e = V(
          {
            attributes: a,
            startTimeUnixNano: o,
            timeUnixNano: t,
            count: r.hist.count,
            sum: r.hist.sum,
            min: r.hist.min,
            max: r.hist.max,
            bucketCounts: r.hist.bucketCounts,
            explicitBounds: Ma,
          },
          s,
        );
        i.histogram.dataPoints.push(e);
      }
    }
    return Array.from(n.values());
  }
  _mergeWindowBack(e) {
    for (let [t, n] of e) {
      let e = this._series.get(t);
      if (e)
        switch (
          ((e.windowStartMs = Math.min(e.windowStartMs, n.windowStartMs)),
          (e.exemplar = e.exemplar ?? n.exemplar),
          e.type)
        ) {
          case `count`:
            e.total = (e.total ?? 0) + (n.total ?? 0);
            break;
          case `gauge`:
            break;
          case `histogram`:
            if (n.hist) {
              if (e.hist) {
                ((e.hist.count += n.hist.count),
                  (e.hist.sum += n.hist.sum),
                  (e.hist.min = Math.min(e.hist.min, n.hist.min)),
                  (e.hist.max = Math.max(e.hist.max, n.hist.max)));
                for (let t = 0; e.hist.bucketCounts.length > t; t++)
                  e.hist.bucketCounts[t] += n.hist.bucketCounts[t];
              } else e.hist = n.hist;
            }
        }
      else this._admitNewSeries() && this._series.set(t, n);
    }
  }
};
function Ia(e) {
  return e
    ? {
        exemplars: [
          {
            filteredAttributes: [],
            timeUnixNano: Na(e.timeMs),
            asDouble: e.value,
            traceId: e.traceId,
            spanId: e.spanId,
          },
        ],
      }
    : {};
}
var La = (t, { debugEnabled: n } = {}) => {
    let r = {
      _log(r, ...i) {
        let a;
        try {
          a = typeof window > `u` ? void 0 : window;
        } catch {
          return;
        }
        a &&
          (e.DEBUG || a.POSTHOG_DEBUG || n) &&
          !F(a.console) &&
          a.console &&
          (`__rrweb_original__` in a.console[r] ? a.console[r].__rrweb_original__ : a.console[r])(
            t,
            ...i,
          );
      },
      debug(...e) {
        r._log(`debug`, ...e);
      },
      info(...e) {
        r._log(`log`, ...e);
      },
      warn(...e) {
        r._log(`warn`, ...e);
      },
      error(...e) {
        r._log(`error`, ...e);
      },
      critical(...e) {
        console.error(t, ...e);
      },
      uninitializedWarning(e) {
        r.error(`You must initialize PostHog before calling ${e}`);
      },
      createLogger: (e, n) => La(`${t} ${e}`, n),
    };
    return r;
  },
  H = La(`[PostHog.js]`),
  U = H.createLogger;
function Ra(e, t) {
  M(e) && e.forEach(t);
}
function W(e, t) {
  if (!R(e)) {
    if (M(e)) e.forEach(t);
    else if (((e) => e instanceof FormData)(e)) e.forEach((e, n) => t(e, n));
    else for (let n in e) jt.call(e, n) && t(e[n], n);
  }
}
var G = function (e, ...t) {
  for (let n of t) for (let t in n) n[t] !== void 0 && (e[t] = n[t]);
  return e;
};
function za(e) {
  let t = Object.keys(e),
    n = t.length,
    r = Array(n);
  for (; n--; ) r[n] = [t[n], e[t[n]]];
  return r;
}
var Ba = function (e) {
    return function (...t) {
      try {
        return e.apply(this, t);
      } catch (e) {
        (H.critical(
          `Implementation error. Please turn on debug mode and open a ticket on https://app.posthog.com/home#panel=support%3Asupport%3A.`,
        ),
          H.critical(e));
      }
    };
  },
  Va = function (e) {
    let t = {};
    return (
      W(e, function (e, n) {
        ((I(e) && e.length > 0) || z(e)) && (t[n] = e);
      }),
      t
    );
  };
function Ha(e) {
  let t = V({}, e);
  for (let n of [`name`, `message`, `stack`, `cause`, `errors`])
    try {
      n in e && (t[n] = e[n]);
    } catch {}
  return t;
}
var Ua = [`herokuapp.com`, `vercel.app`, `netlify.app`];
function Wa(e) {
  let t = e?.hostname;
  if (!I(t)) return !1;
  let n = t.split(`.`).slice(-2).join(`.`);
  for (let e of Ua) if (n === e) return !1;
  return !0;
}
function K(e, t, n, r) {
  let { capture: i = !1, passive: a = !0 } = r ?? {};
  e?.addEventListener(t, n, { capture: i, passive: a });
}
function Ga(e) {
  return e.name === `ph_toolbar_internal`;
}
var Ka = (e) => {
  if (k) {
    try {
      let t = e + `=`,
        n = k.cookie.split(`;`).filter((e) => e.length);
      for (let e = 0; n.length > e; e++) {
        let r = n[e];
        for (; r.charAt(0) == ` `; ) r = r.substring(1, r.length);
        if (r.indexOf(t) === 0) return decodeURIComponent(r.substring(t.length, r.length));
      }
    } catch {}
    return null;
  }
};
(Math.trunc ||
  (Math.trunc = function (e) {
    return 0 > e ? Math.ceil(e) : Math.floor(e);
  }),
  Number.isInteger ||
    (Number.isInteger = function (e) {
      return z(e) && isFinite(e) && Math.floor(e) === e;
    }));
var qa = class e {
    constructor(e) {
      if (((this.bytes = e), e.length !== 16)) throw TypeError(`not 128-bit length`);
    }
    static fromFieldsV7(t, n, r, i) {
      if (
        !Number.isInteger(t) ||
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        !Number.isInteger(i) ||
        0 > t ||
        0 > n ||
        0 > r ||
        0 > i ||
        t > 0xffffffffffff ||
        n > 4095 ||
        r > 1073741823 ||
        i > 4294967295
      )
        throw RangeError(`invalid field value`);
      let a = new Uint8Array(16);
      return (
        (a[0] = t / 2 ** 40),
        (a[1] = t / 2 ** 32),
        (a[2] = t / 2 ** 24),
        (a[3] = t / 2 ** 16),
        (a[4] = t / 256),
        (a[5] = t),
        (a[6] = 112 | (n >>> 8)),
        (a[7] = n),
        (a[8] = 128 | (r >>> 24)),
        (a[9] = r >>> 16),
        (a[10] = r >>> 8),
        (a[11] = r),
        (a[12] = i >>> 24),
        (a[13] = i >>> 16),
        (a[14] = i >>> 8),
        (a[15] = i),
        new e(a)
      );
    }
    toString() {
      let e = ``;
      for (let t = 0; this.bytes.length > t; t++)
        ((e = e + (this.bytes[t] >>> 4).toString(16) + (15 & this.bytes[t]).toString(16)),
          (t !== 3 && t !== 5 && t !== 7 && t !== 9) || (e += `-`));
      if (e.length !== 36) throw Error(`Invalid UUIDv7 was generated`);
      return e;
    }
    clone() {
      return new e(this.bytes.slice(0));
    }
    equals(e) {
      return this.compareTo(e) === 0;
    }
    compareTo(e) {
      for (let t = 0; 16 > t; t++) {
        let n = this.bytes[t] - e.bytes[t];
        if (n !== 0) return Math.sign(n);
      }
      return 0;
    }
  },
  Ja = class {
    generate() {
      let e = this.generateOrAbort();
      if (!F(e)) return e;
      {
        this._timestamp = 0;
        let e = this.generateOrAbort();
        if (F(e)) throw Error(`Could not generate UUID after timestamp reset`);
        return e;
      }
    }
    generateOrAbort() {
      let e = (() => {
        let e = Date.now();
        return z(e) && isFinite(e) ? Math.min(Math.max(Math.floor(e), 0), 0xffffffffffff) : 0;
      })();
      if (e > this._timestamp) ((this._timestamp = e), this._resetCounter());
      else {
        if (this._timestamp >= e + 1e4) return;
        (this._counter++,
          this._counter > 4398046511103 && (this._timestamp++, this._resetCounter()));
      }
      return qa.fromFieldsV7(
        this._timestamp,
        Math.trunc(this._counter / 2 ** 30),
        this._counter & (2 ** 30 - 1),
        this._random.nextUint32(),
      );
    }
    _resetCounter() {
      this._counter = 1024 * this._random.nextUint32() + (1023 & this._random.nextUint32());
    }
    constructor() {
      ((this._timestamp = 0), (this._counter = 0), (this._random = new Xa()));
    }
  },
  Ya = (e) => {
    if (`u` > typeof UUIDV7_DENY_WEAK_RNG && UUIDV7_DENY_WEAK_RNG)
      throw Error(`no cryptographically strong RNG available`);
    for (let t = 0; e.length > t; t++)
      e[t] = 65536 * Math.trunc(65536 * Math.random()) + Math.trunc(65536 * Math.random());
    return e;
  };
O && !F(O.crypto) && crypto.getRandomValues && (Ya = (e) => crypto.getRandomValues(e));
var Xa = class {
    nextUint32() {
      return (
        this._buffer.length > this._cursor || (Ya(this._buffer), (this._cursor = 0)),
        this._buffer[this._cursor++]
      );
    }
    constructor() {
      ((this._buffer = new Uint32Array(8)), (this._cursor = 1 / 0));
    }
  },
  Za,
  Qa = () => $a().toString(),
  $a = () => (Za ||= new Ja()).generate(),
  eo = ``,
  to = /[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i,
  no = null,
  q = {
    _is_supported() {
      if (!L(no)) return no;
      if (((no = !1), k))
        try {
          let e = `__ph_cookie_support_${Qa()}`;
          (q._set(e, `xyz`), (no = Ka(e) === `"xyz"`), q._remove(e));
        } catch {
          no = !1;
        }
      return no;
    },
    _error(e) {
      H.error(`cookieStore error: ` + e);
    },
    _get: Ka,
    _parse(e) {
      let t;
      try {
        t = JSON.parse(q._get(e)) || {};
      } catch {}
      return t;
    },
    _set(e, t, n, r, i) {
      if (!k) return !1;
      try {
        let a = ``,
          o = ``,
          s = (function (e, t) {
            if (t) {
              let t = (function (e, t = k) {
                if (eo) return eo;
                if (!t || [`localhost`, `127.0.0.1`].includes(e)) return ``;
                let n = e.split(`.`),
                  r = Math.min(n.length, 8),
                  i = `dmn_chk_` + Qa();
                for (; !eo && r--; ) {
                  let e = n.slice(r).join(`.`),
                    a = i + `=1;domain=.` + e + `;path=/`;
                  ((t.cookie = a + `;max-age=3`),
                    t.cookie.includes(i) && ((t.cookie = a + `;max-age=0`), (eo = e)));
                }
                return eo;
              })(e);
              if (!t) {
                let n = ((e) => {
                  let t = e.match(to);
                  return t ? t[0] : ``;
                })(e);
                (n !== t && H.info(`Warning: cookie subdomain discovery mismatch`, n, t), (t = n));
              }
              return t ? `; domain=.` + t : ``;
            }
            return ``;
          })(k.location.hostname, r);
        if (n) {
          let e = new Date();
          (e.setTime(e.getTime() + 864e5 * n), (a = `; expires=` + e.toUTCString()));
        }
        i && (o = `; secure`);
        let c =
          e + `=` + encodeURIComponent(JSON.stringify(t)) + a + `; SameSite=Lax; path=/` + s + o;
        return (
          c.length > 3686.4 && H.warn(`cookieStore warning: large cookie, len=` + c.length),
          (k.cookie = c),
          !0
        );
      } catch {
        return !1;
      }
    },
    _remove(e, t) {
      if (k?.cookie && (!t || !L(Ka(e))))
        try {
          q._set(e, ``, -1, t);
        } catch {
          return;
        }
    },
  },
  ro = null,
  J = {
    _is_supported() {
      if (!L(ro)) return ro;
      let e = !0;
      if (F(O)) e = !1;
      else
        try {
          let t = `__mplssupport__`;
          (J._set(t, `xyz`), J._get(t) !== `"xyz"` && (e = !1), J._remove(t));
        } catch {
          e = !1;
        }
      return (e || H.error(`localStorage unsupported; falling back to cookie store`), (ro = e), e);
    },
    _error(e) {
      H.error(`localStorage error: ` + e);
    },
    _get(e) {
      try {
        return O?.localStorage.getItem(e);
      } catch (e) {
        J._error(e);
      }
      return null;
    },
    _parse(e) {
      try {
        return JSON.parse(J._get(e)) || {};
      } catch {}
      return null;
    },
    _set(e, t) {
      try {
        return (O?.localStorage.setItem(e, JSON.stringify(t)), !0);
      } catch (e) {
        J._error(e);
      }
      return !1;
    },
    _remove(e) {
      try {
        O?.localStorage.removeItem(e);
      } catch (e) {
        J._error(e);
      }
    },
  },
  io = [d, r, l, i, m, s, o, a, f],
  ao = [b, y, ve, ye, We, Ue, T, Re],
  oo = (e) => e + `_cpm`,
  so = [`__proto__`, `constructor`, `prototype`],
  co = (e) => {
    if (!P(e)) return {};
    let t = {};
    return (
      Object.keys(e).forEach((n) => {
        so.indexOf(n) === -1 && (t[n] = e[n]);
      }),
      t
    );
  },
  lo = (e, t = []) => {
    let n = {};
    return (
      [...ao, ...t].forEach((t) => {
        let r = e[t];
        F(r) || L(r) || r === `` || (n[t] = r);
      }),
      n
    );
  },
  uo = (e) => {
    let t = 5381,
      n = 2166136261;
    for (let r = 0; e.length > r; r++) {
      let i = e.charCodeAt(r);
      ((t = (33 * t) ^ i), (n = Math.imul(n ^ i, 16777619)));
    }
    return e.length.toString(36) + `.` + (t >>> 0).toString(36) + `.` + (n >>> 0).toString(36);
  },
  fo = (e, t) => ({ p: t, f: uo(JSON.stringify(e)) }),
  po = (e, t) => {
    if (!t) return { properties: [], isValid: !1 };
    try {
      let n = q._parse(oo(e)),
        r = n?.f === uo(t) && M(n.p);
      return { properties: r ? n.p : [], isValid: r };
    } catch {
      return { properties: [], isValid: !1 };
    }
  },
  mo = (e, t) => t + `|` + (q._get(oo(e)) || ``),
  ho = {},
  go = {
    _is_supported: () => !0,
    _error(e) {
      H.error(`memoryStorage error: ` + e);
    },
    _get: (e) => (e in ho ? ho[e] : null),
    _parse: (e) => (e in ho ? ho[e] : null),
    _set: (e, t) => ((ho[e] = t), !0),
    _remove(e) {
      delete ho[e];
    },
  },
  _o = null,
  Y = {
    _is_supported() {
      if (!L(_o)) return _o;
      if (((_o = !0), F(O))) _o = !1;
      else
        try {
          let e = `__support__`;
          (Y._set(e, `xyz`), Y._get(e) !== `"xyz"` && (_o = !1), Y._remove(e));
        } catch {
          _o = !1;
        }
      return _o;
    },
    _error(e) {
      H.error(`sessionStorage error: `, e);
    },
    _get(e) {
      try {
        return O?.sessionStorage.getItem(e);
      } catch (e) {
        Y._error(e);
      }
      return null;
    },
    _parse(e) {
      try {
        return JSON.parse(Y._get(e)) || null;
      } catch {}
      return null;
    },
    _set(e, t) {
      try {
        return (O?.sessionStorage.setItem(e, JSON.stringify(t)), !0);
      } catch (e) {
        Y._error(e);
      }
      return !1;
    },
    _remove(e) {
      try {
        O?.sessionStorage.removeItem(e);
      } catch (e) {
        Y._error(e);
      }
    },
  },
  vo = class {
    constructor(e) {
      this._instance = e;
    }
    get _config() {
      return this._instance.config;
    }
    get consent() {
      return this._getDnt() ? 0 : this._storedConsent;
    }
    isOptedOut() {
      return (
        this._config.cookieless_mode === `always` ||
        this.isRejected() ||
        (this.consent === -1 && this._config.cookieless_mode === `on_reject`)
      );
    }
    isOptedIn() {
      return !this.isOptedOut();
    }
    isExplicitlyOptedOut() {
      return this.consent === 0;
    }
    isRejected() {
      return (
        this.consent === 0 || (this.consent === -1 && this._config.opt_out_capturing_by_default)
      );
    }
    optInOut(e) {
      this._storage._set(
        this._storageKey,
        +!!e,
        this._config.cookie_expiration,
        this._config.cross_subdomain_cookie,
        this._config.secure_cookie,
      );
    }
    reset() {
      this._storage._remove(this._storageKey, this._config.cross_subdomain_cookie);
    }
    get _storageKey() {
      let {
        token: e,
        opt_out_capturing_cookie_prefix: t,
        consent_persistence_name: n,
      } = this._instance.config;
      return n || (t ? t + e : `__ph_opt_in_out_` + e);
    }
    get _storedConsent() {
      let e = this._storage._get(this._storageKey);
      return Gt(e) ? 1 : j(Kt, e) ? 0 : -1;
    }
    get _storage() {
      let e = this._config.opt_out_capturing_persistence_type,
        t = e === `localStorage` ? J : q,
        n = t._is_supported() ? t : go;
      if (!this._persistentStore || this._persistentStore !== n) {
        this._persistentStore = n;
        let t = e === `localStorage` ? q : J;
        t._get(this._storageKey) &&
          (this._persistentStore._get(this._storageKey) ||
            this.optInOut(Gt(t._get(this._storageKey))),
          t._remove(this._storageKey, this._config.cross_subdomain_cookie));
      }
      return this._persistentStore;
    }
    _getDnt() {
      return (
        !!this._config.respect_dnt &&
        [ht?.doNotTrack, ht?.msDoNotTrack, A.doNotTrack, ht?.globalPrivacyControl].some((e) =>
          Gt(e),
        )
      );
    }
  };
function yo(e, t) {
  var n;
  let r = e == null || (n = e.config) == null ? void 0 : n.get_current_url;
  if (!N(r)) return t;
  try {
    let e = r(t);
    return I(e) && e ? e : t;
  } catch (e) {
    return (H.error(`Error in get_current_url, falling back to window.location.href`, e), t);
  }
}
function bo(e) {
  return (
    e instanceof Element &&
    (e.id === `__POSTHOG_TOOLBAR__` || !!e.closest?.call(e, `.toolbar-global-fade-container`))
  );
}
function xo(e) {
  return !!e && e.nodeType === 1;
}
function So(e, t) {
  return !!e && !!e.tagName && e.tagName.toLowerCase() === t.toLowerCase();
}
function Co(e) {
  return !!e && e.nodeType === 3;
}
function wo(e) {
  return !!e && e.nodeType === 11 && xo(e.host);
}
function To(e) {
  return e ? Dt(e).split(/\s+/) : [];
}
function Eo(e, t) {
  let n = (function (e) {
    var t;
    let n = O == null || (t = O.location) == null ? void 0 : t.href;
    return F(n) ? void 0 : yo(e, n);
  })(t);
  return !!(n && e && e.some((e) => n.match(e)));
}
function Do(e) {
  let t = ``;
  switch (typeof e.className) {
    case `string`:
      t = e.className;
      break;
    case `object`:
      t =
        (e.className && `baseVal` in e.className ? e.className.baseVal : null) ||
        e.getAttribute(`class`) ||
        ``;
      break;
    default:
      t = ``;
  }
  return To(t);
}
function Oo(e) {
  return R(e)
    ? null
    : Dt(e)
        .split(/(\s+)/)
        .filter((e) => is(e))
        .join(``)
        .replace(/[\r\n]/g, ` `)
        .replace(/[ ]+/g, ` `)
        .substring(0, 255);
}
function ko(e) {
  let t = ``;
  return (
    Yo(e) &&
      !Xo(e) &&
      e.childNodes &&
      e.childNodes.length &&
      W(e.childNodes, function (e) {
        Co(e) && e.textContent && (t += Oo(e.textContent) ?? ``);
      }),
    Dt(t)
  );
}
function Ao(e) {
  return F(e.target)
    ? e.srcElement || null
    : e.target?.shadowRoot
      ? e.composedPath()[0] || null
      : e.target || null;
}
var jo = [`a`, `button`, `form`, `input`, `select`, `textarea`, `label`];
function Mo(e, t) {
  let n =
    e.matches ||
    e.matchesSelector ||
    e.msMatchesSelector ||
    e.mozMatchesSelector ||
    e.webkitMatchesSelector ||
    e.oMatchesSelector;
  try {
    return !!n && n.call(e, t);
  } catch {
    return !1;
  }
}
function No(e, t) {
  if (F(t)) return !0;
  for (let n of e) if (t.some((e) => Mo(n, e))) return !0;
  return !1;
}
function Po(e) {
  let t = e.parentNode;
  return !(!t || !xo(t)) && t;
}
var Fo = [`.ph-no-autocapture`, `[data-ph-no-autocapture]`],
  Io = [`next`, `previous`, `prev`, `>`, `<`, `→`, `←`, `›`, `‹`, `»`, `«`, `▶`, `◀`, `❯`, `❮`],
  Lo = [...Io, `+`, `-`, `−`, `–`],
  Ro = Lo.length + 10,
  zo = [`button`, `a`, `input`, `select`, `textarea`, `label`],
  Bo = [`button`, `link`, `tab`, `menuitem`, `option`],
  Vo = (e, t) =>
    /[a-z0-9]/i.test(t) ? (j(Lo, t) ? RegExp(`\\b${t}\\b`).test(e) : e.includes(t)) : e === t,
  Ho = (e) => j(zo, e.tagName.toLowerCase()) || j(Bo, (e.getAttribute(`role`) || ``).toLowerCase());
function Uo(e) {
  let t = ``,
    n = ``,
    r = (e) => {
      xo(e) &&
        Yo(e) &&
        !Xo(e) &&
        ((t += ` ${ko(e)}`), (n = n || e.getAttribute(`aria-label`) || ``), W(e.childNodes, r));
    };
  (r(e), (t = Dt(t.replace(/\s+/g, ` `))));
  let i = (is(t) ? t : ``).toLowerCase();
  return { safeText: i, ariaLabel: Dt(e.getAttribute(`aria-label`) || (i ? `` : n)).toLowerCase() };
}
var Wo = [`.ph-no-rageclick`, `.ph-no-capture`],
  Go = [``, `text`, `search`, `email`, `password`, `url`, `tel`, `number`];
function Ko(e, t) {
  if (!O || qo(e)) return !1;
  let n, r, i;
  var a;
  if (
    (It(t)
      ? ((n = !!t && Wo), (r = void 0), (i = !1))
      : ((n = t?.css_selector_ignorelist ?? Wo),
        (r = t?.content_ignorelist),
        (i = (a = t?.ignore_text_selection) != null && a)),
    !1 === n ||
      (i &&
        (function (e) {
          return (
            !(!e || !xo(e)) &&
            (!!So(e, `textarea`) ||
              (So(e, `input`)
                ? j(Go, (e.getAttribute(`type`) || ``).toLowerCase())
                : (function (e) {
                    if (e.isContentEditable) return !0;
                    let t = e.getAttribute?.call(e, `contenteditable`);
                    return t === `true` || t === ``;
                  })(e)))
          );
        })(e)))
  )
    return !1;
  let { targetElementList: o } = Jo(e, !1);
  return !(
    (r &&
      (function (e, { safeText: t, ariaLabel: n }) {
        let r;
        if (!0 === e) r = Io;
        else {
          if (!M(e)) return !1;
          if (e.length > Ro)
            return (
              H.error(
                `[PostHog] content_ignorelist array cannot exceed ${Ro} items. Use css_selector_ignorelist for more complex matching.`,
              ),
              !1
            );
          r = e.map((e) => e.toLowerCase());
        }
        return r.some((e) => Vo(t, e) || Vo(n, e));
      })(
        r,
        (function (e, t) {
          for (let e of t) if (Ho(e)) return Uo(e);
          for (let e of t) {
            try {
              if (O?.getComputedStyle(e).getPropertyValue(`cursor`) !== `pointer`) break;
            } catch {
              break;
            }
            let t = Uo(e);
            if (t.safeText || t.ariaLabel) return t;
          }
          return Uo(e);
        })(e, o),
      )) ||
    No(o, n)
  );
}
var qo = (e) => !e || So(e, `html`) || !xo(e),
  Jo = (e, t) => {
    if (!O || qo(e)) return { parentIsUsefulElement: !1, targetElementList: [] };
    let n = !1,
      r = [e],
      i = e;
    for (; i.parentNode && !So(i, `body`); ) {
      if (wo(i.parentNode)) {
        (r.push(i.parentNode.host), (i = i.parentNode.host));
        continue;
      }
      let e = Po(i);
      if (!e) break;
      if (t || jo.indexOf(e.tagName.toLowerCase()) > -1) n = !0;
      else
        try {
          let t = O.getComputedStyle(e);
          t && t.getPropertyValue(`cursor`) === `pointer` && (n = !0);
        } catch {}
      (r.push(e), (i = e));
    }
    return { parentIsUsefulElement: n, targetElementList: r };
  };
function Yo(e) {
  let t = new Set(),
    n = 0;
  for (let r = e; r.parentNode && !So(r, `body`); r = r.parentNode) {
    if (n++ >= 1e3 || t.has(r)) return !1;
    t.add(r);
    let e = Do(r);
    if (j(e, `ph-sensitive`) || j(e, `ph-no-capture`)) return !1;
  }
  if (j(Do(e), `ph-include`)) return !0;
  let r = e.type || ``;
  if (I(r))
    switch (r.toLowerCase()) {
      case `hidden`:
      case `password`:
        return !1;
    }
  let i = e.name || e.id || ``;
  return (
    !I(i) ||
    !/^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i.test(
      i.replace(/[^a-zA-Z0-9]/g, ``),
    )
  );
}
function Xo(e) {
  return !!(
    (So(e, `input`) && ![`button`, `checkbox`, `submit`, `reset`].includes(e.type)) ||
    So(e, `select`) ||
    So(e, `textarea`) ||
    e.getAttribute(`contenteditable`) === `true`
  );
}
var Zo = RegExp(
    `^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$`,
  ),
  Qo = /(^|[^0-9A-Za-z_])([0-9][0-9 -]*[0-9])(?=$|[^0-9A-Za-z_])/g,
  $o = [16, 15, 14, 13],
  es = RegExp(`^(\\d{3}-?\\d{2}-?\\d{4})$`),
  ts = RegExp(
    `(^|[^0-9])((?!000|666)[0-9]{3}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4})(?=$|([^0-9]))`,
    `g`,
  ),
  ns = /[0-9A-Za-z_]/;
function rs(e) {
  let t = 0,
    n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let i = e.charCodeAt(r) - 48;
    (n && ((i *= 2), i > 9 && (i -= 9)), (t += i), (n = !n));
  }
  return t % 10 == 0;
}
function is(e, t = !0) {
  return !(
    R(e) ||
    (I(e) &&
      ((e = Dt(e)),
      (t
        ? Zo.test((e || ``).replace(/[- ]/g, ``))
        : (function (e) {
            let t;
            for (Qo.lastIndex = 0; (t = Qo.exec(e)); ) {
              let e = t[2];
              if (!e) continue;
              let n = e.replace(/[- ]/g, ``);
              for (let e = 0; n.length > e; e++)
                for (let t of $o) {
                  let r = e + t;
                  if (n.length >= r) {
                    let t = n.slice(e, r);
                    if (Zo.test(t) && rs(t)) return !0;
                  }
                }
            }
            return !1;
          })(e)) ||
        (t
          ? es.test(e)
          : (function (e) {
              let t;
              for (ts.lastIndex = 0; (t = ts.exec(e)); ) {
                let e = t[1],
                  n = t[3];
                if (!(e && n && ns.test(e) && ns.test(n))) return !0;
              }
              return !1;
            })(e))))
  );
}
function as(e) {
  let t = ko(e);
  return ((t = `${t} ${os(e)}`.trim()), is(t) ? t : ``);
}
function os(e) {
  let t = ``;
  return (
    e &&
      e.childNodes &&
      e.childNodes.length &&
      W(e.childNodes, function (e) {
        if (e && e.tagName?.toLowerCase() === `span`)
          try {
            let n = ko(e);
            ((t = `${t} ${n}`.trim()),
              e.childNodes && e.childNodes.length && (t = `${t} ${os(e)}`.trim()));
          } catch (e) {
            H.error(`[AutoCapture]`, e);
          }
      }),
    t
  );
}
function ss(e) {
  return e.replace(/"|\\"/g, `\\"`);
}
function cs(e) {
  let t = e.attr__class;
  if (t) return M(t) ? t : To(t);
}
var ls = U(`[Dead Clicks]`),
  us = () => !0,
  ds = (e) => {
    let t = !!e.instance.persistence?.get_property(se),
      n = e.instance.config.capture_dead_clicks;
    return It(n) ? n : !!P(n) || t;
  },
  fs = class {
    get lazyLoadedDeadClicksAutocapture() {
      return this._lazyLoadedDeadClicksAutocapture;
    }
    constructor(e, t, n) {
      ((this.instance = e),
        (this.isEnabled = t),
        (this.onCapture = n),
        this.startIfEnabledOrStop());
    }
    onRemoteConfig(e) {
      if (!e.ok) return;
      let t = e.config;
      `captureDeadClicks` in t &&
        (this.instance.persistence &&
          this.instance.persistence.register({ [se]: t.captureDeadClicks }),
        this.startIfEnabledOrStop());
    }
    startIfEnabledOrStop() {
      this.isEnabled(this)
        ? this._loadScript(() => {
            this._start();
          })
        : this.stop();
    }
    _loadScript(e) {
      var t, n;
      A.__PosthogExtensions__?.initDeadClicksAutocapture
        ? e()
        : (t = A.__PosthogExtensions__) == null ||
          (n = t.loadExternalDependency) == null ||
          n.call(t, this.instance, `dead-clicks-autocapture`, (t) => {
            t ? ls.error(`failed to load script`, t) : e();
          });
    }
    _start() {
      if (k) {
        if (
          !this._lazyLoadedDeadClicksAutocapture &&
          A.__PosthogExtensions__?.initDeadClicksAutocapture
        ) {
          let e = P(this.instance.config.capture_dead_clicks)
            ? V({}, this.instance.config.capture_dead_clicks)
            : {};
          ((e.__onCapture = this.onCapture),
            this.onCapture && (e.capture_dead_swipes = !1),
            (this._lazyLoadedDeadClicksAutocapture =
              A.__PosthogExtensions__.initDeadClicksAutocapture(this.instance, e)),
            this._lazyLoadedDeadClicksAutocapture.start(k),
            ls.info(`starting...`));
        }
      } else ls.error("`document` not found. Cannot start.");
    }
    stop() {
      this._lazyLoadedDeadClicksAutocapture &&
        (this._lazyLoadedDeadClicksAutocapture.stop(),
        (this._lazyLoadedDeadClicksAutocapture = void 0),
        ls.info(`stopping...`));
    }
  },
  ps = U(`[SegmentIntegration]`);
function ms(e, t, n = !0) {
  let r = e.config.segment;
  if (!r) return t();
  let { analytics: i, filterProperties: a } = ((e) => N(e.register))((o = r))
    ? { analytics: o }
    : o;
  var o;
  (function (e, t, n, r) {
    let i = (t) => {
        let i = () => t.anonymousId() || Qa();
        ((e.config.get_device_id = i),
          r &&
            t.id() &&
            (e.register({ distinct_id: t.id(), $device_id: i() }),
            e.persistence.set_property(Re, st)),
          n(r ? void 0 : t.anonymousId() || void 0));
      },
      a = t.user();
    `then` in a && N(a.then) ? a.then(i) : i(a);
  })(
    e,
    i,
    (n) => {
      i.register(
        ((e, t, { filterProperties: n } = {}) => {
          (typeof Promise < `u` && Promise.resolve) ||
            ps.warn(
              `This browser does not have Promise support, and can not use the segment integration`,
            );
          let r = (r, i) => {
            if (!i) return r;
            let a = !!t && r.event.anonymousId === t && !r.event.userId;
            (a ||
              r.event.userId ||
              r.event.anonymousId === e.get_distinct_id() ||
              (ps.info(`No userId set, resetting PostHog`), e.reset()),
              a || (t = void 0),
              r.event.userId &&
                r.event.userId !== e.get_distinct_id() &&
                (ps.info(`UserId set, identifying with PostHog`), e.identify(r.event.userId)));
            let o = e.calculateEventProperties(i, r.event.properties);
            if (!R(n)) {
              let e = r.event.properties || {},
                t = {};
              for (let n of Object.keys(o)) jt.call(e, n) || (t[n] = o[n]);
              let i = ((e, t) => {
                let n = M(e) ? e : [e],
                  r = V({}, t);
                for (let e of n)
                  try {
                    if (((r = e(r)), R(r))) return null;
                  } catch (e) {
                    return (ps.error(`Error in Segment filterProperties:`, e), null);
                  }
                return r;
              })(n, t);
              if (R(i)) return r;
              o = i;
            }
            return ((r.event.properties = Object.assign({}, o, r.event.properties)), r);
          };
          return {
            name: `PostHog JS`,
            type: `enrichment`,
            version: `1.0.0`,
            isLoaded() {
              return !0;
            },
            load() {
              return Promise.resolve();
            },
            track(e) {
              return r(e, e.event.event);
            },
            page(e) {
              return r(e, ut);
            },
            identify(e) {
              return r(e, ft);
            },
            screen(e) {
              return r(e, `$screen`);
            },
          };
        })(e, n, { filterProperties: a }),
      ).then(
        () => {
          t();
        },
        (e) => {
          (ps.error(`Failed to register the Segment integration`, e), t());
        },
      );
    },
    n,
  );
}
var hs = `posthog-js`;
function gs(
  e,
  {
    organization: t,
    projectId: n,
    prefix: r,
    severityAllowList: i = [`error`],
    sendExceptionsToPostHog: a = !0,
  } = {},
) {
  return (o) => {
    if ((i !== `*` && !i.includes(o.level)) || !e.__loaded) return o;
    o.tags ||= {};
    let s = e.requestRouter.endpointFor(
      `ui`,
      `/project/${e.config.token}/person/${e.get_distinct_id()}`,
    );
    ((o.tags[`PostHog Person URL`] = s),
      e.sessionRecordingStarted() &&
        (o.tags[`PostHog Recording URL`] = e.get_session_replay_url({ withTimestamp: !0 })));
    let c = o.exception?.values || [],
      l = c.map((e) =>
        V(
          V({}, e),
          {},
          {
            stacktrace: e.stacktrace
              ? V(
                  V({}, e.stacktrace),
                  {},
                  {
                    type: `raw`,
                    frames: (e.stacktrace.frames || []).map((e) =>
                      V(V({}, e), {}, { platform: `web:javascript` }),
                    ),
                  },
                )
              : void 0,
          },
        ),
      ),
      u = {
        $exception_message: c[0]?.value || o.message,
        $exception_type: c[0]?.type,
        $exception_level: o.level,
        $exception_list: l,
        $sentry_event_id: o.event_id,
        $sentry_exception: o.exception,
        $sentry_exception_message: c[0]?.value || o.message,
        $sentry_exception_type: c[0]?.type,
        $sentry_tags: o.tags,
      };
    var d;
    return (
      t &&
        n &&
        (u.$sentry_url =
          (r || `https://sentry.io/organizations/`) +
          t +
          `/issues/?project=` +
          n +
          `&query=` +
          o.event_id),
      a && ((d = e.exceptions) == null || d.sendExceptionEvent(u)),
      o
    );
  };
}
var _s = class {
    constructor(e, t, n, r, i, a) {
      ((this.name = hs),
        (this.setupOnce = function (o) {
          o(
            gs(e, {
              organization: t,
              projectId: n,
              prefix: r,
              severityAllowList: i,
              sendExceptionsToPostHog: a == null || a,
            }),
          );
        }));
    }
  },
  vs = class {
    constructor(e) {
      ((this._onSessionIdChange = (e, t, n) => {
        n &&
          (n.noSessionId ||
            n.activityTimeout ||
            n.sessionPastMaximumLength ||
            n.crossTabAdoption) &&
          (H.info(`[PageViewManager] Session rotated, clearing pageview state`, {
            sessionId: e,
            changeReason: n,
          }),
          (this._currentPageview = void 0),
          this._instance.scrollManager.resetContext());
      }),
        (this._instance = e),
        this._setupSessionRotationHandler());
    }
    _setupSessionRotationHandler() {
      this._unsubscribeSessionId = this._instance.sessionManager?.onSessionId(
        this._onSessionIdChange,
      );
    }
    destroy() {
      var e;
      ((e = this._unsubscribeSessionId) == null || e.call(this),
        (this._unsubscribeSessionId = void 0));
    }
    doPageView(e, t) {
      let n = this._previousPageViewProperties(e, t);
      return (
        (this._currentPageview = {
          pathname: O?.location.pathname ?? ``,
          pageViewId: t,
          timestamp: e,
        }),
        this._instance.scrollManager.resetContext(),
        n
      );
    }
    doPageLeave(e) {
      return this._previousPageViewProperties(e, this._currentPageview?.pageViewId);
    }
    doEvent() {
      return { $pageview_id: this._currentPageview?.pageViewId };
    }
    _previousPageViewProperties(e, t) {
      let n = this._currentPageview;
      if (!n) return { $pageview_id: t };
      let r = { $pageview_id: t, $prev_pageview_id: n.pageViewId },
        i = this._instance.scrollManager.getContext();
      if (i && !this._instance.config.disable_scroll_properties) {
        let {
          maxScrollHeight: e,
          lastScrollY: t,
          maxScrollY: n,
          maxContentHeight: a,
          lastContentY: o,
          maxContentY: s,
        } = i;
        if (!(F(e) || F(t) || F(n) || F(a) || F(o) || F(s))) {
          ((e = Math.ceil(e)),
            (t = Math.ceil(t)),
            (n = Math.ceil(n)),
            (a = Math.ceil(a)),
            (o = Math.ceil(o)),
            (s = Math.ceil(s)));
          let i = e > 1 ? Zt(t / e, 0, 1, H) : 1,
            c = e > 1 ? Zt(n / e, 0, 1, H) : 1,
            l = a > 1 ? Zt(o / a, 0, 1, H) : 1,
            u = a > 1 ? Zt(s / a, 0, 1, H) : 1;
          r = G(r, {
            $prev_pageview_last_scroll: t,
            $prev_pageview_last_scroll_percentage: i,
            $prev_pageview_max_scroll: n,
            $prev_pageview_max_scroll_percentage: c,
            $prev_pageview_last_content: o,
            $prev_pageview_last_content_percentage: l,
            $prev_pageview_max_content: s,
            $prev_pageview_max_content_percentage: u,
          });
        }
      }
      return (
        n.pathname && (r.$prev_pageview_pathname = n.pathname),
        n.timestamp && (r.$prev_pageview_duration = (e.getTime() - n.timestamp.getTime()) / 1e3),
        r
      );
    }
  },
  ys = [`flags`, `surveys`],
  bs = {
    [v]: { exposure: `hidden` },
    [S]: { exposure: `hidden` },
    [C]: { exposure: `hidden` },
    [te]: { exposure: `hidden` },
    [T]: { exposure: `hidden` },
    [ee]: { exposure: `hidden` },
    [ne]: { exposure: `event` },
    [D]: { exposure: `hidden` },
    [le]: { exposure: `hidden` },
    [re]: { exposure: `event` },
    [ie]: { exposure: `hidden` },
    [ae]: { exposure: `event` },
    [oe]: { exposure: `event` },
    [se]: { exposure: `event` },
    [ce]: { exposure: `hidden` },
    [ue]: { exposure: `event` },
    [de]: { exposure: `hidden` },
    [fe]: { exposure: `hidden` },
    [ve]: { exposure: `hidden` },
    [ye]: { exposure: `event` },
    [pe]: { exposure: `event`, shouldSkipFromEventProperties: (e) => L(e) },
    [be]: { exposure: `event` },
    [xe]: { exposure: `event` },
    [Se]: { exposure: `event` },
    [Ce]: { exposure: `event` },
    [we]: { exposure: `hidden` },
    [l]: { exposure: `hidden`, storageGroup: `flags` },
    [r]: { exposure: `hidden`, storageGroup: `flags` },
    [n]: { exposure: `hidden` },
    [i]: { exposure: `hidden`, storageGroup: `flags` },
    [m]: { exposure: `hidden`, storageGroup: `flags` },
    [s]: { exposure: `hidden`, storageGroup: `flags`, volatile: !0 },
    [c]: { exposure: `hidden`, storageGroup: `flags` },
    [h]: { exposure: `hidden` },
    [g]: { exposure: `hidden` },
    [d]: { exposure: `hidden` },
    [u]: { exposure: `hidden` },
    [Ee]: { exposure: `hidden`, storageGroup: `surveys` },
    [De]: { exposure: `hidden`, storageGroup: `surveys`, volatile: !0 },
    [Oe]: { exposure: `event` },
    [ke]: { exposure: `hidden` },
    [Ae]: { exposure: `hidden` },
    [je]: { exposure: `hidden` },
    [Me]: { exposure: `hidden` },
    [Ne]: { exposure: `hidden` },
    [Pe]: { exposure: `event` },
    [Fe]: { exposure: `event` },
    [Ie]: { exposure: `event` },
    [Le]: { exposure: `event` },
    [f]: { exposure: `hidden` },
    [p]: { exposure: `hidden` },
    [Te]: { exposure: `event` },
    [a]: { exposure: `hidden` },
    [o]: { exposure: `hidden`, storageGroup: `flags`, volatile: !0 },
    [Re]: { exposure: `hidden` },
    [ze]: { exposure: `hidden` },
    [Be]: { exposure: `hidden` },
    [Ve]: { exposure: `hidden` },
    [He]: { exposure: `hidden` },
    [Ue]: { exposure: `hidden` },
    [We]: { exposure: `hidden` },
    [me]: { exposure: `event` },
    [he]: { exposure: `event` },
    [ge]: { exposure: `event` },
    [_e]: { exposure: `event` },
    [qe]: { exposure: `event` },
    [Je]: { exposure: `event` },
    [Ye]: { exposure: `hidden` },
    [Xe]: { exposure: `hidden` },
    [Ze]: { exposure: `hidden` },
    [Qe]: { exposure: `hidden` },
    [$e]: { exposure: `hidden` },
    [et]: { exposure: `hidden` },
    [tt]: { exposure: `hidden` },
    [nt]: { exposure: `hidden` },
    [rt]: { exposure: `hidden` },
    [it]: { exposure: `event` },
  },
  xs = [
    [`$posthog_sr_group_event_trigger_`, { exposure: `hidden` }],
    [`$posthog_sr_group_url_trigger_`, { exposure: `hidden` }],
    [`$posthog_sr_group_sampling_`, { exposure: `hidden` }],
  ],
  X = (e) => {
    let t = bs[e];
    if (t) return t;
    for (let [t, n] of xs) if (e.indexOf(t) === 0) return n;
  };
function Ss() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return;
  }
}
var Cs = () => {
    try {
      return `u` > typeof window && !1 !== window.navigator.onLine;
    } catch {
      return !1;
    }
  },
  ws = (e, t) => e >= t && Cs(),
  Ts = (e, t, n, r) => {
    if (e === 0) {
      if (Cs()) {
        let e = t + 1;
        return (e === n && r(), e);
      }
      return t;
    }
    return 0;
  },
  Es = (e, t) => {
    try {
      let n;
      return JSON.stringify(
        e,
        (e, t) =>
          Vt(t)
            ? ((n ??= new WeakMap()), n.has(t) || n.set(t, Ha(t)), n.get(t))
            : typeof t == `bigint`
              ? t.toString()
              : t,
        t,
      );
    } catch {
      return kt(e);
    }
  },
  Ds = (e) => {
    let t = k?.createElement(`a`);
    return F(t) ? null : ((t.href = e), t);
  },
  Os = function (e, t) {
    let n = ((e.split(`#`)[0] || ``).split(/\?(.*)/)[1] || ``).replace(/^\?+/g, ``).split(`&`),
      r;
    for (let e = 0; n.length > e; e++) {
      let i = n[e].split(`=`);
      if (i[0] === t) {
        r = i;
        break;
      }
    }
    if (!M(r) || 2 > r.length) return ``;
    {
      let e = r[1];
      try {
        e = decodeURIComponent(e);
      } catch {
        H.error(`Skipping decoding for malformed query param: ` + e);
      }
      return e.replace(/\+/g, ` `);
    }
  },
  ks = function (e, t, n) {
    if (!e || !t || !t.length) return e;
    let r = e.split(`#`),
      i = r[1],
      a = (r[0] || ``).split(`?`),
      o = a[1],
      s = a[0],
      c = (o || ``).split(`&`),
      l = [];
    for (let e = 0; c.length > e; e++) {
      let r = c[e].split(`=`);
      M(r) && (t.includes(r[0]) ? l.push(r[0] + `=` + n) : l.push(c[e]));
    }
    let u = s;
    return (o != null && (u += `?` + l.join(`&`)), i != null && (u += `#` + i), u);
  },
  As = function (e, t) {
    let n = e.match(RegExp(t + `=([^&]*)`));
    return n ? n[1] : null;
  },
  js = [
    `gclid`,
    `gclsrc`,
    `dclid`,
    `gbraid`,
    `wbraid`,
    `fbclid`,
    `msclkid`,
    `twclid`,
    `li_fat_id`,
    `igshid`,
    `ttclid`,
    `rdt_cid`,
    `epik`,
    `qclid`,
    `sccid`,
    `oppref`,
    `bfcid`,
    `irclid`,
    `_kx`,
  ],
  Ms = [
    `utm_source`,
    `utm_medium`,
    `utm_campaign`,
    `utm_content`,
    `utm_term`,
    `gad_source`,
    `mc_cid`,
    ...js,
  ],
  Ns = `<masked>`,
  Ps = [`li_fat_id`];
function Fs(e, t, n) {
  if (!k) return {};
  let r = t ? [...js, ...(n || [])] : [],
    i = Is(ks(k.URL, r, Ns), e);
  return G(
    (function () {
      let e = {};
      return (
        W(Ps, function (t) {
          let n = Ka(t);
          e[t] = n || null;
        }),
        e
      );
    })(),
    i,
  );
}
function Is(e, t) {
  let n = Ms.concat(t || []),
    r = {};
  return (
    W(n, function (t) {
      let n = Os(e, t);
      r[t] = n || null;
    }),
    r
  );
}
function Ls(e) {
  let t = (function (e) {
      return e
        ? e.search(`https?://(.*)google.([^/?]*)`) === 0
          ? `google`
          : e.search(`https?://(.*)bing.com`) === 0
            ? `bing`
            : e.search(`https?://(.*)yahoo.com`) === 0
              ? `yahoo`
              : e.search(`https?://(.*)duckduckgo.com`) === 0
                ? `duckduckgo`
                : null
        : null;
    })(e),
    n = t == `yahoo` ? `p` : `q`,
    r = {};
  if (!L(t)) {
    r.$search_engine = t;
    let e = k ? Os(k.referrer, n) : ``;
    e.length && (r.ph_keyword = e);
  }
  return r;
}
function Rs() {
  return navigator.language || navigator.userLanguage;
}
function zs() {
  let e = Rs();
  return typeof e == `string` ? e.split(`-`)[0] : void 0;
}
var Bs = `$direct`;
function Vs() {
  return k?.referrer || Bs;
}
function Hs(e, t, n = !1) {
  let r = e ? [...js, ...(t || [])] : [],
    i = (n ? fr(gt?.href) : gt?.href)?.substring(0, 1e3);
  return { r: Vs().substring(0, 1e3), u: i ? ks(i, r, Ns) : void 0 };
}
function Us(e, t = !1) {
  let { r: n, u: r } = e,
    i = t ? fr(r) : r,
    a = { $referrer: n, $referring_domain: n == null ? void 0 : n == Bs ? Bs : Ds(n)?.host };
  if (i) {
    a.$current_url = i;
    let e = Ds(i);
    ((a.$host = e?.host), (a.$pathname = e?.pathname), G(a, Is(i)));
  }
  return (n && G(a, Ls(n)), a);
}
function Ws() {
  try {
    return new Date().getTimezoneOffset();
  } catch {
    return;
  }
}
var Gs = { flags: o, surveys: De },
  Ks = [`cookie`, `localstorage`, `localstorage+cookie`, `sessionstorage`, `memory`],
  qs = (e) => `${e}_cookie_identity_change_pending`,
  Js = (e) => {
    let t = ``,
      n = 0;
    for (let r of e) {
      let e = encodeURIComponent(JSON.stringify(r).slice(1, -1)).length;
      if (n + e > 1e3) break;
      ((t += r), (n += e));
    }
    return t;
  },
  Z = `main`,
  Ys = [l, r, i, m, s, o, c, d],
  Xs = (e) => Ys.indexOf(e) !== -1,
  Zs = [T, ee],
  Qs = (e) => Zs.indexOf(e) !== -1,
  $s = (e, t) => {
    try {
      return JSON.stringify(e) === JSON.stringify(t);
    } catch {
      return e === t;
    }
  },
  ec = (e) => {
    if (!e) return {};
    let t = JSON.parse(e);
    return P(t) ? t : {};
  },
  tc = (e, t) => {
    W(e, (n, r) => {
      let i = X(r);
      (i && i.exposure !== `event`) || {}.hasOwnProperty.call(t, r) || delete e[r];
    });
  },
  nc = class {
    constructor(e, t, n = !0, r = !e.cookieless_mode) {
      if (
        ((this._slotState = {}),
        (this._splitStorageEligible = !1),
        (this._storesIdentityInCookie = !1),
        (this._splitStorage = !1),
        (this._cookieIdentityChangePending = !1),
        (this._cookieSyncSuppressed = !1),
        (this._pendingCrossTabFeatureFlagChanges = new Map()),
        (this._storageMigrationInProgress = !1),
        (this._localIdentityChangePending = !1),
        (this._crossTabFeatureFlagIdentityMismatch = !1),
        (this._metaIdentifierChangePending = new Set()),
        (this._crossTabFeatureFlagHandlers = new Set()),
        (this._config = e),
        (this._ownsSplitStorage = n),
        (this.props = {}),
        (this._campaign_params_url = void 0),
        (this._name = ((e) => {
          let t = ``;
          return (
            e.token && (t = e.token.replace(/\+/g, `PL`).replace(/\//g, `SL`).replace(/=/g, `EQ`)),
            e.persistence_name ? `ph_` + e.persistence_name : `ph_` + t + `_posthog`
          );
        })(e)),
        (this._disabled = e.disable_persistence || !!t),
        (this._storage = this._buildStorage(e)),
        (this._splitStorage = this._resolveSplitStorage(e)),
        this.load(r),
        this._markLoadedCrossTabFeatureFlagChangesPending(),
        e.debug && H.info(`Persistence loaded`, e.persistence, V({}, this.props)),
        this.update_config(e, e, t),
        this.save(),
        O)
      ) {
        let e = () => this.flush();
        (K(O, `beforeunload`, e, { capture: !1 }),
          K(O, `pagehide`, e, { capture: !1 }),
          (this._onStorage = (e) => {
            if (
              this._splitStorageEligible &&
              (!e.storageArea || e.storageArea === O?.localStorage) &&
              e.key
            ) {
              if (e.key !== this._name) {
                if (this._splitStorage) {
                  let t = ys.find((t) => e.key === this._groupEntryName(t));
                  t && this._syncCrossTabFeatureFlagProperties(e.key, t);
                }
              } else this._syncCrossTabFeatureFlagProperties(e.key, Z);
            }
          }),
          K(O, `storage`, this._onStorage));
      }
    }
    markCrossTabFeatureFlagChanges(e) {
      Object.entries(e).forEach(([e, t]) => {
        let n = this._pendingCrossTabFeatureFlagChanges.get(e);
        if (!Xs(e) || !0 === n) return;
        if (!0 === t) return void this._setCrossTabFeatureFlagChangesPending(e, !0);
        let r = new Set(n || []);
        (t.forEach((e) => r.add(e)), r.size && this._setCrossTabFeatureFlagChangesPending(e, r));
      });
    }
    onCrossTabFeatureFlagChange(e) {
      return (
        this._crossTabFeatureFlagHandlers.add(e),
        () => this._crossTabFeatureFlagHandlers.delete(e)
      );
    }
    destroy() {
      (this._onStorage &&
        O &&
        (O.removeEventListener(`storage`, this._onStorage), (this._onStorage = void 0)),
        this._crossTabFeatureFlagHandlers.clear());
    }
    _syncCrossTabFeatureFlagProperties(e, t, n = !0) {
      if (this._disabled) return !1;
      let r, i;
      try {
        if (((i = J._get(e)), L(i))) {
          let e = this._slotWriteState(t);
          return ((e.storageValue = null), t !== Z && (e.persisted = !1), !1);
        }
        r = ec(i);
      } catch {
        return !1;
      }
      let a = t === Z ? r : J._parse(this._name);
      if (a && this._hasCrossTabFeatureFlagIdentityMismatch(a)) return !1;
      let o = this._mergeCrossTabFeatureFlagProperties(r, t, n);
      return (
        (t === Z && this._splitStorage && !$s(this._partitionProps().main, r)) ||
          this._rememberCrossTabStorageFingerprint(r, t, !0, i),
        o
      );
    }
    _hasCrossTabFeatureFlagIdentityMismatch(e) {
      let t = this.props[y],
        n = e[y];
      return !F(t) && !F(n) && t !== n;
    }
    _rememberCrossTabStorageFingerprint(e, t, n, r) {
      let i = this._slotWriteState(t);
      ((i.storageValue = r), t !== Z && (i.persisted = n));
      try {
        i.fingerprint = this._entryFingerprint(e, t);
      } catch {
        i.fingerprint = void 0;
      }
    }
    _mergeCrossTabFeatureFlagProperties(e, t, n) {
      let r = !1;
      return (
        Ys.forEach((n) => {
          let i = X(n)?.storageGroup;
          if ((t === Z && this._splitStorage && i) || (t !== Z && i !== t)) return;
          let a = n in e,
            o = this._mergePendingCrossTabFeatureFlagChanges(n, a ? e[n] : void 0),
            s = this._pendingCrossTabFeatureFlagChanges.has(n) ? n in this.props : a;
          (s === n in this.props && $s(o, this.props[n])) ||
            (s ? this._setProp(n, o, !1) : this._deleteProp(n, !1), (r = !0));
        }),
        r && n && this._crossTabFeatureFlagHandlers.forEach((e) => e()),
        r
      );
    }
    _reconcileCrossTabFeatureFlagPropertiesBeforeWrite() {
      if (!this._splitStorageEligible) return !1;
      try {
        this._crossTabFeatureFlagIdentityMismatch = !1;
        let e = J._get(this._name),
          t = this._slotWriteState(Z),
          n,
          r = !1,
          i = !1;
        if (e !== t.storageValue) {
          if (L(e)) t.storageValue = null;
          else {
            if (
              ((n = ec(e)),
              (this._crossTabFeatureFlagIdentityMismatch =
                !this._localIdentityChangePending &&
                this._hasCrossTabFeatureFlagIdentityMismatch(n)),
              this._crossTabFeatureFlagIdentityMismatch)
            )
              return !1;
            ((i = this._mergeCrossTabFeatureFlagProperties(n, Z, !1)),
              !this._splitStorage || $s(this._partitionProps().main, n)
                ? this._rememberCrossTabStorageFingerprint(n, Z, !0, e)
                : (t.storageValue = e),
              (r = !0));
          }
        }
        return (
          this._splitStorage &&
            ys.forEach((e) => {
              let t = J._get(this._groupEntryName(e)),
                a = this._slotWriteState(e),
                o = n || {},
                s = r && Ys.some((t) => X(t)?.storageGroup === e && t in o);
              if (t === a.storageValue && !s) return;
              if (L(t))
                return (
                  (a.storageValue = null),
                  (a.persisted = !1),
                  void (s && (i = this._mergeCrossTabFeatureFlagProperties(o, e, !1) || i))
                );
              let c = ec(t);
              ((i = this._mergeCrossTabFeatureFlagProperties(c, e, !1) || i),
                this._rememberCrossTabStorageFingerprint(c, e, !0, t));
            }),
          i
        );
      } catch {
        return !1;
      }
    }
    _setCrossTabFeatureFlagChangesPending(e, t) {
      this._pendingCrossTabFeatureFlagChanges.set(e, t);
      let n = X(e);
      (n != null && n.volatile) ||
        ((this._slotWriteState((this._splitStorage ? n?.storageGroup : void 0) || Z).fingerprint =
          void 0),
        this._markGroupDirty(e));
    }
    _markAllCrossTabFeatureFlagChangesPending() {
      Ys.forEach((e) => this._pendingCrossTabFeatureFlagChanges.set(e, !0));
    }
    _markLoadedCrossTabFeatureFlagChangesPending() {
      if (this._splitStorageEligible)
        try {
          let e = J._get(this._name),
            t = ec(e);
          ((this._slotWriteState(Z).storageValue = e),
            Ys.forEach((e) => {
              let n = this._splitStorage ? X(e)?.storageGroup : void 0,
                r = n ? J._get(this._groupEntryName(n)) : null;
              if (n) {
                let e = this._slotWriteState(n);
                ((e.storageValue = r), (e.persisted = !L(r)));
              }
              let i = n && !L(r) ? ec(r) : t;
              e in this.props
                ? this._markPendingCrossTabFeatureFlagChanges(e, i[e], this.props[e])
                : e in i && this._setCrossTabFeatureFlagChangesPending(e, !0);
            }));
        } catch {}
    }
    _mergePendingCrossTabFeatureFlagChanges(e, t) {
      let n = this._pendingCrossTabFeatureFlagChanges.get(e);
      if (!n) return t;
      if (!0 === n) return this.props[e];
      if (e === `$active_feature_flags`) {
        let r = new Set(M(t) ? t : []),
          i = new Set(M(this.props[e]) ? this.props[e] : []);
        return (n.forEach((e) => (i.has(e) ? r.add(e) : r.delete(e))), Array.from(r));
      }
      let r = P(t) ? V({}, t) : {},
        i = P(this.props[e]) ? this.props[e] : {};
      return (
        n.forEach((e) => {
          e in i ? (r[e] = i[e]) : delete r[e];
        }),
        r
      );
    }
    _markPendingCrossTabFeatureFlagChanges(e, t, n) {
      if (!Xs(e)) return;
      let r = this._pendingCrossTabFeatureFlagChanges.get(e);
      if (!0 === r) return;
      let i = t;
      if (this._splitStorageEligible)
        try {
          let t = this._splitStorage ? X(e)?.storageGroup : void 0,
            n = t ? this._groupEntryName(t) : this._name;
          i = ec(J._get(n))[e];
        } catch {}
      let a = new Set(r || []);
      if (e === `$active_feature_flags`) {
        if ((!F(t) && !M(t)) || (!F(i) && !M(i)) || !M(n))
          return void this._setCrossTabFeatureFlagChangesPending(e, !0);
        let r = new Set(t || []),
          o = new Set(i || []),
          s = new Set(n);
        (new Set([...r, ...s]).forEach((e) => {
          r.has(e) !== s.has(e) && a.add(e);
        }),
          a.forEach((e) => {
            o.has(e) === s.has(e) && a.delete(e);
          }));
      } else {
        if (!P(n))
          return void ($s(i, n)
            ? this._pendingCrossTabFeatureFlagChanges.delete(e)
            : this._setCrossTabFeatureFlagChangesPending(e, !0));
        {
          if ((!F(t) && !P(t)) || (F(t) && Nt(n) && F(i)))
            return void this._setCrossTabFeatureFlagChangesPending(e, !0);
          let r = P(t) ? t : {},
            o = P(i) ? i : {};
          (new Set([...Object.keys(r), ...Object.keys(n)]).forEach((e) => {
            (e in r == e in n && $s(r[e], n[e])) || a.add(e);
          }),
            a.forEach((e) => {
              e in o == e in n && $s(o[e], n[e]) && a.delete(e);
            }));
        }
      }
      a.size
        ? this._setCrossTabFeatureFlagChangesPending(e, a)
        : this._pendingCrossTabFeatureFlagChanges.delete(e);
    }
    _saveDebounceMs() {
      let e = this._config?.persistence_save_debounce_ms;
      return z(e) && e > 0 ? e : 0;
    }
    _rememberCurrentCookieProperties(e) {
      if (
        this._config.cookieWinsOnConflict &&
        this._config.persistence.toLowerCase() === `localstorage+cookie`
      ) {
        if (e)
          try {
            let t = lo(e, this._config.cookie_persisted_properties || []),
              n = fo(t, this._config.cookie_persisted_properties || []),
              r = JSON.stringify(t) + `|` + JSON.stringify(n),
              i = q._get(this._name) || void 0;
            i &&
              mo(this._name, i) === r &&
              ((this._lastSeenCookiePropertiesFingerprint = r),
              (this._lastSeenMainCookieValue = i));
          } catch {}
        else
          try {
            let e = q._get(this._name) || void 0;
            ((this._lastSeenCookiePropertiesFingerprint = e ? mo(this._name, e) : void 0),
              (this._lastSeenMainCookieValue = e));
          } catch {}
      }
    }
    syncCookieProperties() {
      return this._syncCookieProperties(this._config);
    }
    _syncCookieProperties(e, t = !1) {
      if (
        (this._disabled && !t) ||
        this._cookieSyncSuppressed ||
        !e.cookieWinsOnConflict ||
        e.persistence.toLowerCase() !== `localstorage+cookie`
      )
        return !1;
      let n;
      try {
        n = q._get(this._name) || void 0;
      } catch {}
      if (!n || n === this._lastSeenMainCookieValue) return !1;
      let c = mo(this._name, n),
        p;
      try {
        p = co(JSON.parse(n));
      } catch {
        return !1;
      }
      if ((q._get(this._name) || void 0) !== n) return !1;
      ((this._lastSeenCookiePropertiesFingerprint = c), (this._lastSeenMainCookieValue = n));
      let h = po(this._name, n),
        g = [...ao, ...h.properties],
        _ = {};
      if (
        (Object.keys(p).forEach((e) => {
          let t = p[e];
          (F(t) ||
            L(t) ||
            t === `` ||
            (e === `$user_state` && t !== `anonymous` && t !== `identified`)) &&
            ((_[e] = !0), delete p[e]);
        }),
        Nt(p))
      )
        return !1;
      let v = `distinct_id` in p || p.$user_state === `anonymous` || p.$user_state === `identified`,
        b = this.props,
        x = b[y],
        C = b[Re],
        w = G({}, b);
      ([...ao, ...(e.cookie_persisted_properties || [])].forEach((e) => {
        if (
          g.indexOf(e) !== -1 &&
          !(e in p) &&
          !_[e] &&
          (v || (e !== `distinct_id` && e !== `$user_state`))
        ) {
          let t = w[e];
          (h.isValid || ao.indexOf(e) === -1 || (!1 !== t && t !== 0)) && delete w[e];
        }
      }),
        (this.props = G(w, p)),
        Ys.forEach((e) => {
          let t = e in this.props;
          (e in b === t && $s(b[e], this.props[e])) ||
            (t
              ? this._markPendingCrossTabFeatureFlagChanges(e, b[e], this.props[e])
              : this._setCrossTabFeatureFlagChangesPending(e, !0));
        }),
        !v || `$user_state` in p || `$user_state` in this.props || this._setProp(Re, ot));
      let T = this.props[y],
        E = this.props[Re];
      return (
        !v ||
          (T === x && E === C) ||
          ((this._localIdentityChangePending = !0),
          (this._cookieIdentityChangePending = !0),
          Y._set(qs(this._name), !0),
          this._deleteProp(d),
          this._deleteProp(r),
          this._deleteProp(l),
          this._deleteProp(i),
          this._deleteProp(m),
          this._deleteProp(s),
          this._deleteProp(o),
          this._deleteProp(a),
          this._deleteProp(f),
          E !== `anonymous` ||
            (C !== `identified` && p.$user_state !== `anonymous` && (F(x) || T === x)) ||
            (tc(this.props, p), this._deleteProp(u)),
          E === `identified` ? (this.props.$user_id = T) : delete this.props.$user_id,
          this._deleteProp(S)),
        !0
      );
    }
    consumeCookieIdentityChange() {
      let e = qs(this._name),
        t = this._cookieIdentityChangePending || !!Y._get(e);
      return ((this._cookieIdentityChangePending = !1), t && Y._remove(e), t);
    }
    _beginCookieSyncSuppression(e = !1) {
      return !(
        this._cookieSyncSuppressed ||
        (this._disabled && !e) ||
        !this._config.cookieWinsOnConflict ||
        this._config.persistence.toLowerCase() !== `localstorage+cookie` ||
        ((this._cookieSyncSuppressed = !0), 0)
      );
    }
    _publishSuppressedCookieSnapshot() {
      this._cookieSyncSuppressed &&
        (F(this._pendingSaveTimer) ||
          (clearTimeout(this._pendingSaveTimer), (this._pendingSaveTimer = void 0)),
        delete this._slotState[Z],
        this._writeNow(!0));
    }
    _endCookieSyncSuppression(e = !0) {
      if (this._cookieSyncSuppressed)
        try {
          e
            ? this._publishSuppressedCookieSnapshot()
            : F(this._pendingSaveTimer) ||
              (clearTimeout(this._pendingSaveTimer), (this._pendingSaveTimer = void 0));
        } finally {
          this._cookieSyncSuppressed = !1;
        }
    }
    isDisabled() {
      return !!this._disabled;
    }
    _buildStorage(e) {
      Ks.indexOf(e.persistence.toLowerCase()) === -1 &&
        (H.critical(
          `Unknown persistence type ` + e.persistence + `; falling back to localStorage+cookie`,
        ),
        (e.persistence = `localStorage+cookie`));
      let t = ((e = [], t = !1, n = () => !1) => {
          let r = [...ao, ...e];
          return V(
            V({}, J),
            {},
            {
              _parse(e) {
                try {
                  let i,
                    a = {};
                  try {
                    ((i = q._get(e) || void 0), (a = i ? co(JSON.parse(i)) : {}));
                  } catch {}
                  let o = JSON.parse(J._get(e) || `{}`),
                    s;
                  if (t) {
                    let t = po(e, i),
                      n = [...ao, ...t.properties],
                      c = {};
                    Object.keys(a).forEach((e) => {
                      let t = a[e];
                      L(t) ||
                        t === `` ||
                        (e === `$user_state` && t !== `anonymous` && t !== `identified`) ||
                        (c[e] = t);
                    });
                    let l =
                      `distinct_id` in c ||
                      c.$user_state === `anonymous` ||
                      c.$user_state === `identified`;
                    if (Object.keys(c).length > 0) {
                      let e = o[y],
                        i = o.$user_state ?? ot;
                      (r.forEach((e) => {
                        if (
                          n.indexOf(e) !== -1 &&
                          !(e in a) &&
                          (l || (e !== `distinct_id` && e !== `$user_state`))
                        ) {
                          let n = o[e];
                          (t.isValid || ao.indexOf(e) === -1 || (!1 !== n && n !== 0)) &&
                            delete o[e];
                        }
                      }),
                        !l || `$user_state` in a || `$user_state` in o || (o[Re] = ot),
                        !l ||
                          ((`distinct_id` in c ? c[y] : o[y]) === e &&
                            (`$user_state` in c ? c[Re] : o[Re]) === i) ||
                          (io.forEach((e) => delete o[e]),
                          c.$user_state === `identified` && `distinct_id` in c
                            ? (o.$user_id = c[y])
                            : delete o.$user_id,
                          c.$user_state !== `identified` && (delete o[Te], delete o[u]),
                          delete o.__alias));
                    }
                    s = G(o, c);
                  } else s = G(a, o);
                  return (n() || J._set(e, s), s);
                } catch {}
                return null;
              },
              _set(n, r, i, a, o, s) {
                let c = J._set(n, r, void 0, void 0, s);
                try {
                  let l = lo(r, e);
                  if (Object.keys(l).length) {
                    if (t) {
                      let t = oo(n),
                        u = fo(l, e);
                      if ((q._set(t, u, i, a, o, s), q._get(t) !== JSON.stringify(u))) {
                        q._remove(t, a);
                        let e = lo(r);
                        return (q._set(n, e, i, a, o, s), c);
                      }
                    }
                    q._set(n, l, i, a, o, s);
                  }
                } catch (e) {
                  J._error(e);
                }
                return c;
              },
              _remove(e, t) {
                try {
                  (O?.localStorage.removeItem(e), q._remove(e, t), q._remove(oo(e), t));
                } catch (e) {
                  J._error(e);
                }
              },
            },
          );
        })(e.cookie_persisted_properties || [], e.cookieWinsOnConflict, () => !!this._disabled),
        n,
        r = !1,
        i = !1,
        a = e.persistence.toLowerCase();
      return (
        a === `localstorage` && J._is_supported()
          ? ((n = J), (i = !0))
          : a === `localstorage+cookie` && t._is_supported()
            ? ((n = t), (i = !0), (r = !0))
            : a === `sessionstorage` && Y._is_supported()
              ? (n = Y)
              : a === `memory`
                ? (n = go)
                : a === `cookie` && q._is_supported()
                  ? ((n = q), (r = !0))
                  : t._is_supported()
                    ? ((n = t), (i = !0), (r = !0))
                    : q._is_supported()
                      ? ((n = q), (r = !0))
                      : (n = go),
        (this._splitStorageEligible = i),
        (this._storesIdentityInCookie = r),
        n
      );
    }
    _groupEntryName(e) {
      return `${this._name}__${e}`;
    }
    _resolveSplitStorage(e) {
      return this._splitStorageEligible && !!e.split_storage;
    }
    properties() {
      let e = {};
      return (
        W(this.props, (t, n) => {
          let r = X(n);
          if (!r || r.exposure === `event`) {
            var i;
            if (r != null && (i = r.shouldSkipFromEventProperties) != null && i.call(r, t)) return;
            e[n] = t;
          }
        }),
        e
      );
    }
    load(e = !1) {
      if (this._disabled && !e) return;
      let t =
          this._config.cookieWinsOnConflict &&
          this._config.persistence.toLowerCase() === `localstorage+cookie`,
        n = t ? J._parse(this._name) : null,
        r = {};
      if (t)
        try {
          ((r = co(q._parse(this._name))),
            W(r, (e, t) => {
              (F(e) || L(e) || e === ``) && delete r[t];
            }));
        } catch {}
      let i = this._storage._parse(this._name);
      if ((i && (this.props = G({}, i)), this._splitStorage && this._loadGroupEntries(), t && i)) {
        let e = n?.[y],
          t = n?.$user_state ?? ot,
          a = i[y],
          o = i.$user_state ?? ot;
        if (a !== e || o !== t) {
          ((this._cookieIdentityChangePending = !0), this._disabled || Y._set(qs(this._name), !0));
          let n = G({}, this.props);
          (io.forEach((e) => delete n[e]),
            o !== `anonymous` ||
              (t !== `identified` && r.$user_state !== `anonymous` && (F(e) || a === e)) ||
              (tc(n, r), delete n[u]),
            (this.props = n));
          let i = new Set();
          (io.forEach((e) => {
            let t = X(e)?.storageGroup;
            t && i.add(t);
          }),
            i.forEach((e) => {
              if (this._disabled) return;
              let t = {};
              (W(this.props, (n, r) => {
                X(r)?.storageGroup === e && (t[r] = n);
              }),
                Nt(t)
                  ? (J._remove(this._groupEntryName(e)), (this._slotState[e] = {}))
                  : J._set(this._groupEntryName(e), t) &&
                    (this._slotState[e] = {
                      persisted: !0,
                      fingerprint: this._entryFingerprint(t, e),
                    }));
            }));
        }
      }
      Y._get(qs(this._name)) && (this._cookieIdentityChangePending = !0);
    }
    _loadGroupEntries() {
      for (let e of ys) {
        let t = J._parse(this._groupEntryName(e));
        if (t && !Nt(t)) {
          let n = this._slotWriteState(e);
          ((n.persisted = !0),
            this._mainCarriesGroupKey(e) || (n.fingerprint = this._entryFingerprint(t, e)),
            this._groupEntryIsStale(e, t) || G(this.props, t));
        }
      }
    }
    _mainCarriesGroupKey(e) {
      return Object.keys(this.props).some((t) => X(t)?.storageGroup === e);
    }
    _groupEntryIsStale(e, t) {
      let n = Gs[e];
      if (!n) return !1;
      let r = t[n],
        i = this.props[n];
      return z(r) && z(i) && i > r;
    }
    refreshKey(e) {
      if (this._disabled || this._metaIdentifierChangePending.has(e)) return;
      let t = this._splitStorage ? X(e)?.storageGroup : void 0,
        n = t ? J._parse(this._groupEntryName(t)) : this._storage._parse(this._name);
      if (n && e in n) this._setProp(e, n[e], !1);
      else {
        if (t) {
          let t = this._storage._parse(this._name);
          if (t && e in t) return void this._setProp(e, t[e], !1);
        }
        this._deleteProp(e, !1);
      }
    }
    save() {
      if (this._disabled) return;
      let e = this._saveDebounceMs();
      e > 0
        ? F(this._pendingSaveTimer) &&
          (this._pendingSaveTimer = setTimeout(() => {
            ((this._pendingSaveTimer = void 0), this._writeNow());
          }, e))
        : this._writeNow();
    }
    flush() {
      F(this._pendingSaveTimer) ||
        (clearTimeout(this._pendingSaveTimer), (this._pendingSaveTimer = void 0), this._writeNow());
    }
    _writeNow(e = !1) {
      if (this._disabled || (this._cookieSyncSuppressed && !e)) return;
      e ||
        (this.syncCookieProperties(),
        (this._config.cookieWinsOnConflict &&
          this._config.persistence.toLowerCase() === `localstorage+cookie`) ||
          Zs.forEach((e) => this.refreshKey(e)));
      let t = !e && !this._storageMigrationInProgress;
      t || (this._crossTabFeatureFlagIdentityMismatch = !1);
      let n = !!t && this._reconcileCrossTabFeatureFlagPropertiesBeforeWrite();
      if (this._crossTabFeatureFlagIdentityMismatch)
        return void (
          this._config.debug &&
          H.warn(`skipping persistence write because storage belongs to a different distinct ID`)
        );
      if (this._splitStorage)
        return (
          this._writeNowSplit(),
          void (n && this._crossTabFeatureFlagHandlers.forEach((e) => e()))
        );
      let r = this._writeEntry(this._storage, this._name, this.props, Z);
      (r === `written` && this._rememberCurrentCookieProperties(this.props),
        r !== `failed` &&
          (this._pendingCrossTabFeatureFlagChanges.clear(),
          (this._localIdentityChangePending = !1),
          this._metaIdentifierChangePending.clear()),
        n && this._crossTabFeatureFlagHandlers.forEach((e) => e()));
    }
    _writeNowSplit() {
      let { main: e, groups: t } = this._partitionProps(),
        n = this._writeEntry(this._storage, this._name, e, Z);
      (n === `written` && this._rememberCurrentCookieProperties(e),
        n !== `failed` &&
          ((this._localIdentityChangePending = !1),
          this._metaIdentifierChangePending.clear(),
          Ys.forEach((e) => {
            var t;
            ((t = X(e)) != null && t.storageGroup) ||
              this._pendingCrossTabFeatureFlagChanges.delete(e);
          })));
      for (let e of ys) {
        let n = t[e];
        if (Nt(n) && !this._slotState[e]?.persisted) {
          Ys.forEach((t) => {
            X(t)?.storageGroup === e && this._pendingCrossTabFeatureFlagChanges.delete(t);
          });
          continue;
        }
        let r = this._writeEntry(J, this._groupEntryName(e), n, e);
        r !== `failed` &&
          Ys.forEach((t) => {
            let n = X(t);
            n?.storageGroup !== e ||
              (r !== `written` && n.volatile) ||
              this._pendingCrossTabFeatureFlagChanges.delete(t);
          });
      }
    }
    _partitionProps() {
      let e = {},
        t = { flags: {}, surveys: {} };
      return (
        W(this.props, (n, r) => {
          let i = X(r)?.storageGroup;
          i ? (t[i][r] = n) : (e[r] = n);
        }),
        { main: e, groups: t }
      );
    }
    _entryFingerprint(e, t) {
      if (t === Z)
        return (
          JSON.stringify(e) +
          `|` +
          this._expire_days +
          `|` +
          this._cross_subdomain +
          `|` +
          this._secure
        );
      let n = {};
      return (
        W(e, (e, t) => {
          n[t] = X(t)?.volatile ? `__volatile__` : e;
        }),
        JSON.stringify(n)
      );
    }
    _writeEntry(e, t, n, r) {
      let i = this._slotWriteState(r);
      if (r !== Z && !i.dirty && !F(i.fingerprint)) return `skipped`;
      let a;
      try {
        if (((a = this._entryFingerprint(n, r)), a === i.fingerprint))
          return ((i.dirty = !1), `skipped`);
      } catch {
        a = void 0;
      }
      return e._set(
        t,
        n,
        this._expire_days,
        this._cross_subdomain,
        this._secure,
        this._config.debug,
      )
        ? ((i.dirty = !1),
          r !== Z && (i.persisted = !0),
          F(a) || (i.fingerprint = a),
          this._splitStorageEligible && (i.storageValue = J._get(t)),
          `written`)
        : (this._config.debug &&
            H.warn(`failed to persist storage entry "${t}"; will retry on next save`),
          `failed`);
    }
    remove({ keepGroupEntries: e = !1 } = {}) {
      if (
        (this._markAllCrossTabFeatureFlagChangesPending(),
        F(this._pendingSaveTimer) ||
          (clearTimeout(this._pendingSaveTimer), (this._pendingSaveTimer = void 0)),
        this._storage._remove(this._name, !1),
        this._storage._remove(this._name, !0),
        !e && this._ownsSplitStorage)
      )
        for (let e of ys) J._remove(this._groupEntryName(e));
      (e ? delete this._slotState[Z] : (this._slotState = {}),
        (this._lastSeenCookiePropertiesFingerprint = void 0),
        (this._lastSeenMainCookieValue = void 0));
    }
    clear() {
      (this.remove(), (this.props = {}));
    }
    register_once(e, t, n) {
      if (P(e)) {
        (this.syncCookieProperties(),
          F(t) && (t = `None`),
          (this._expire_days = F(n) ? this._default_expiry : n));
        let r = !1;
        if (
          (W(e, (e, n) => {
            (this.props.hasOwnProperty(n) && this.props[n] !== t) ||
              (this._setProp(n, e), (r = !0));
          }),
          r)
        )
          return (this.save(), !0);
      }
      return !1;
    }
    register(e, t) {
      if (P(e)) {
        (this.syncCookieProperties(), (this._expire_days = F(t) ? this._default_expiry : t));
        let n = !1;
        if (
          (W(e, (t, r) => {
            e.hasOwnProperty(r) &&
              (this.props[r] !== t || P(t) || M(t)) &&
              (this._setProp(r, t), (n = !0));
          }),
          n)
        )
          return (this.save(), !0);
      }
      return !1;
    }
    unregister(e) {
      this.syncCookieProperties();
      let t = typeof e == `string` ? [e] : e,
        n = !1;
      for (let e of t) e in this.props && (this._deleteProp(e), (n = !0));
      n && this.save();
    }
    update_campaign_params() {
      let e = k?.URL;
      if (e === this._campaign_params_url) return;
      let t = Fs(
          this._config.custom_campaign_params,
          this._config.mask_personal_data_properties,
          this._config.custom_personal_data_properties,
        ),
        n = !Nt(Va(t));
      return (n && this.register(t), (this._campaign_params_url = e), n ? t : void 0);
    }
    update_search_keyword() {
      this.register(
        (function () {
          let e = k?.referrer;
          return e ? Ls(e) : {};
        })(),
      );
    }
    update_referrer_info() {
      this.register_once(
        { $referrer: Vs(), $referring_domain: (k?.referrer && Ds(k.referrer)?.host) || Bs },
        void 0,
      );
    }
    set_initial_person_info() {
      if (this.props.$initial_campaign_params || this.props.$initial_referrer_info) return;
      let e = Hs(
        this._config.mask_personal_data_properties,
        this._config.custom_personal_data_properties,
        this._config.disable_capture_url_hashes,
      );
      this.register_once(
        { [Ue]: this._storesIdentityInCookie ? { r: Js(e.r), u: e.u ? Js(e.u) : void 0 } : e },
        void 0,
      );
    }
    get_initial_props() {
      let e = {};
      W([He, Ve], (t) => {
        let n = this.props[t];
        n &&
          W(n, function (t, n) {
            e[`$initial_` + Ot(n)] = t;
          });
      });
      let t = this.props[Ue];
      return (
        t &&
          G(
            e,
            (function (e, t = !1) {
              let n = Us(e, t),
                r = {};
              return (
                W(n, function (e, t) {
                  r[`$initial_${Ot(t)}`] = e;
                }),
                r
              );
            })(t, this._config.disable_capture_url_hashes),
          ),
        e
      );
    }
    safe_merge(e) {
      return (
        W(this.props, function (t, n) {
          n in e || (e[n] = t);
        }),
        e
      );
    }
    update_config(e, t, n) {
      let r = e.persistence !== t.persistence,
        i = !((e, t) => {
          if (e.length !== t.length) return !1;
          let n = [...e].sort(),
            r = [...t].sort();
          return n.every((e, t) => e === r[t]);
        })(e.cookie_persisted_properties || [], t.cookie_persisted_properties || []),
        a = r || i,
        o = e.cookieWinsOnConflict !== t.cookieWinsOnConflict,
        s = e.disable_persistence || !!n,
        c = !!this._disabled && !s;
      (s || this._syncCookieProperties(t, c),
        (this._config = e),
        !s &&
          (r || i || o) &&
          ((this._lastSeenCookiePropertiesFingerprint = void 0),
          (this._lastSeenMainCookieValue = void 0),
          this._syncCookieProperties(
            V(V({}, e), {}, { cookie_persisted_properties: t.cookie_persisted_properties }),
            c,
          )));
      let l = a || o ? this._buildStorage(e) : this._storage;
      this._truncateExistingPersonInfoForCookie();
      let u = this._resolveSplitStorage(e),
        d = a || u !== this._splitStorage,
        f =
          !s &&
          (d ||
            e.cross_subdomain_cookie !== this._cross_subdomain ||
            e.secure_cookie !== this._secure) &&
          this._beginCookieSyncSuppression(c);
      this._storageMigrationInProgress = d;
      try {
        if (
          ((this._default_expiry = this._expire_days = e.cookie_expiration),
          this.set_disabled(s),
          this.set_cross_subdomain(e.cross_subdomain_cookie),
          this.set_secure(e.secure_cookie),
          d)
        ) {
          let e = this.props;
          (this.clear(),
            (this._storage = l),
            (this._splitStorage = u),
            (this.props = e),
            this.save());
        } else o && ((this._storage = l), s || (delete this._slotState[Z], this._writeNow()));
      } finally {
        ((this._storageMigrationInProgress = !1), f && this._endCookieSyncSuppression());
      }
    }
    _truncateExistingPersonInfoForCookie() {
      let e = this.props[Ue];
      if (!this._storesIdentityInCookie || !P(e) || typeof e.r != `string`) return;
      let t = Js(e.r),
        n = typeof e.u == `string` ? Js(e.u) : e.u;
      (t === e.r && n === e.u) || this._setProp(Ue, V(V({}, e), {}, { r: t, u: n }));
    }
    set_disabled(e) {
      ((this._disabled = e), this._disabled ? this.remove() : this.save());
    }
    set_cross_subdomain(e) {
      e !== this._cross_subdomain &&
        ((this._cross_subdomain = e), this.remove({ keepGroupEntries: !0 }), this.save());
    }
    set_secure(e) {
      e !== this._secure &&
        ((this._secure = e), this.remove({ keepGroupEntries: !0 }), this.save());
    }
    set_event_timer(e, t) {
      let n = this.props.__timers || {};
      ((n[e] = t), this._setProp(te, n), this.save());
    }
    remove_event_timer(e) {
      let t = this.props.__timers || {},
        n = t[e];
      return (F(n) || (delete t[e], this._setProp(te, t), this.save()), n);
    }
    get_property(e) {
      return this.props[e];
    }
    set_property(e, t) {
      (this._setProp(e, t), this.save());
    }
    _setProp(e, t, n = !0) {
      var r;
      let i = this.props[e];
      ((this.props[e] = t),
        n &&
          ((e !== `distinct_id` && e !== `$user_state`) ||
            i === t ||
            (this._localIdentityChangePending = !0),
          Qs(e) && !$s(i, t) && this._metaIdentifierChangePending.add(e),
          this._markPendingCrossTabFeatureFlagChanges(e, i, t),
          ((r = X(e)) != null && r.volatile) || this._markGroupDirty(e)));
    }
    _deleteProp(e, t = !0) {
      (delete this.props[e],
        t &&
          (Xs(e) && this._setCrossTabFeatureFlagChangesPending(e, !0),
          Qs(e) && this._metaIdentifierChangePending.add(e),
          this._markGroupDirty(e)));
    }
    _markGroupDirty(e) {
      let t = X(e)?.storageGroup;
      t && (this._slotWriteState(t).dirty = !0);
    }
    _slotWriteState(e) {
      return this._slotState[e] || (this._slotState[e] = {});
    }
  },
  rc = { GZipJS: `gzip-js`, Base64: `base64` },
  ic = { Activation: `events`, Cancellation: `cancelEvents` },
  ac = { Popover: `popover`, API: `api`, Widget: `widget`, ExternalSurvey: `external_survey` },
  oc = {
    SHOWN: `survey shown`,
    DISMISSED: `survey dismissed`,
    SENT: `survey sent`,
    ABANDONED: `survey abandoned`,
  },
  sc = {
    SURVEY_ID: `$survey_id`,
    SURVEY_NAME: `$survey_name`,
    SURVEY_RESPONSE: `$survey_response`,
    SURVEY_ITERATION: `$survey_iteration`,
    SURVEY_ITERATION_START_DATE: `$survey_iteration_start_date`,
    SURVEY_PARTIALLY_COMPLETED: `$survey_partially_completed`,
    SURVEY_SUBMISSION_ID: `$survey_submission_id`,
    SURVEY_QUESTIONS: `$survey_questions`,
    SURVEY_COMPLETED: `$survey_completed`,
    PRODUCT_TOUR_ID: `$product_tour_id`,
    SURVEY_LAST_SEEN_DATE: `$survey_last_seen_date`,
    SURVEY_LANGUAGE: `$survey_language`,
  },
  cc = { Popover: `popover`, Inline: `inline` };
function lc(e) {
  let t = !0;
  return {
    dispose() {
      if (t) {
        t = !1;
        let n = e();
        n && N(n.then) && n.then(void 0, () => {});
      }
    },
  };
}
var uc = {
    SHOWN: `product tour shown`,
    DISMISSED: `product tour dismissed`,
    COMPLETED: `product tour completed`,
    STEP_SHOWN: `product tour step shown`,
    STEP_COMPLETED: `product tour step completed`,
    BUTTON_CLICKED: `product tour button clicked`,
    STEP_SELECTOR_FAILED: `product tour step selector failed`,
    BANNER_CONTAINER_SELECTOR_FAILED: `product tour banner container selector failed`,
    BANNER_ACTION_CLICKED: `product tour banner action clicked`,
  },
  dc = {
    TOUR_ID: `$product_tour_id`,
    TOUR_NAME: `$product_tour_name`,
    TOUR_ITERATION: `$product_tour_iteration`,
    TOUR_RENDER_REASON: `$product_tour_render_reason`,
    TOUR_STEP_ID: `$product_tour_step_id`,
    TOUR_STEP_ORDER: `$product_tour_step_order`,
    TOUR_STEP_TYPE: `$product_tour_step_type`,
    TOUR_DISMISS_REASON: `$product_tour_dismiss_reason`,
    TOUR_BUTTON_TEXT: `$product_tour_button_text`,
    TOUR_BUTTON_ACTION: `$product_tour_button_action`,
    TOUR_BUTTON_LINK: `$product_tour_button_link`,
    TOUR_BUTTON_TOUR_ID: `$product_tour_button_tour_id`,
    TOUR_STEPS_COUNT: `$product_tour_steps_count`,
    TOUR_STEP_SELECTOR: `$product_tour_step_selector`,
    TOUR_STEP_SELECTOR_FOUND: `$product_tour_step_selector_found`,
    TOUR_STEP_ELEMENT_TAG: `$product_tour_step_element_tag`,
    TOUR_STEP_ELEMENT_ID: `$product_tour_step_element_id`,
    TOUR_STEP_ELEMENT_CLASSES: `$product_tour_step_element_classes`,
    TOUR_STEP_ELEMENT_TEXT: `$product_tour_step_element_text`,
    TOUR_ERROR: `$product_tour_error`,
    TOUR_MATCHES_COUNT: `$product_tour_matches_count`,
    TOUR_FAILURE_PHASE: `$product_tour_failure_phase`,
    TOUR_WAITED_FOR_ELEMENT: `$product_tour_waited_for_element`,
    TOUR_WAIT_DURATION_MS: `$product_tour_wait_duration_ms`,
    TOUR_BANNER_SELECTOR: `$product_tour_banner_selector`,
    TOUR_LINKED_SURVEY_ID: `$product_tour_linked_survey_id`,
    USE_MANUAL_SELECTOR: `$use_manual_selector`,
    INFERENCE_DATA_PRESENT: `$inference_data_present`,
    TOUR_LAST_SEEN_DATE: `$product_tour_last_seen_date`,
    TOUR_TYPE: `$product_tour_type`,
  },
  fc = U(`[RateLimiter]`),
  pc = class {
    constructor(e) {
      ((this.serverLimits = {}),
        (this.lastEventRateLimited = !1),
        (this.checkForLimiting = (e) => {
          let t = e.text;
          if (t && t.length)
            try {
              (JSON.parse(t).quota_limited || []).forEach((e) => {
                (fc.info(`${e || `events`} is quota limited.`),
                  (this.serverLimits[e] = new Date().getTime() + 6e4));
              });
            } catch (e) {
              fc.warn(`could not rate limit - continuing. Error: "${e?.message}"`, { text: t });
              return;
            }
        }),
        (this.instance = e),
        (this.lastEventRateLimited = this.clientRateLimitContext(!0).isRateLimited));
    }
    get captureEventsPerSecond() {
      return this.instance.config.rate_limiting?.events_per_second || 10;
    }
    get captureEventsBurstLimit() {
      return Math.max(
        this.instance.config.rate_limiting?.events_burst_limit || 10 * this.captureEventsPerSecond,
        this.captureEventsPerSecond,
      );
    }
    clientRateLimitContext(e = !1) {
      var t;
      let { captureEventsBurstLimit: n, captureEventsPerSecond: r } = this,
        i = new Date().getTime(),
        a = this.instance.persistence?.get_property(`$capture_rate_limit`) ?? {
          tokens: n,
          last: i,
        };
      ((a.tokens += (Math.max(0, i - a.last) / 1e3) * r),
        (a.last = Math.max(a.last, i)),
        a.tokens > n && (a.tokens = n));
      let o = 1 > a.tokens;
      if ((o || e || (a.tokens = Math.max(0, a.tokens - 1)), o && !e)) {
        let e = (z(a.dropped) ? a.dropped : 0) + 1;
        ((a.dropped = e), !this.lastEventRateLimited && this._captureWarning(e) && (a.dropped = 0));
      }
      return (
        (this.lastEventRateLimited = o),
        (t = this.instance.persistence) == null || t.set_property(`$capture_rate_limit`, a),
        { isRateLimited: o, remainingTokens: a.tokens }
      );
    }
    _isPropertyAllowed(e) {
      let t = this.instance.config.property_denylist;
      return !M(t) || !t.includes(e);
    }
    _triggeringPage() {
      if (
        this._isPropertyAllowed(`$current_url`) &&
        this._isPropertyAllowed(`$pathname`) &&
        gt?.pathname
      )
        return `${gt.origin ?? ``}${gt.pathname}`;
    }
    _captureWarning(e) {
      var t;
      let { captureEventsBurstLimit: n, captureEventsPerSecond: r } = this,
        i = this._triggeringPage(),
        a = this._isPropertyAllowed(`$session_id`)
          ? (t = this.instance).get_session_id?.call(t)
          : void 0,
        o = [
          `${e} event(s) dropped since the last warning`,
          i ? `triggered on ${i}` : void 0,
          a ? `session ${a}` : void 0,
        ]
          .filter(Boolean)
          .join(`, `);
      return !!this.instance.capture(
        `$$client_ingestion_warning`,
        {
          $$client_ingestion_warning_message: `posthog-js client rate limited: ${o}. Config is set to ${r} events per second and ${n} events burst limit.`,
        },
        { skip_client_rate_limiting: !0 },
      );
    }
    isServerRateLimited(e) {
      let t = this.serverLimits[e || `events`] || !1;
      return !1 !== t && new Date().getTime() < t;
    }
  },
  mc = U(`[RemoteConfig]`),
  hc = class {
    constructor(e) {
      this._instance = e;
    }
    get remoteConfig() {
      var e;
      return (e = A._POSTHOG_REMOTE_CONFIG) == null || (e = e[this._instance.config.token]) == null
        ? void 0
        : e.config;
    }
    _loadRemoteConfigJs(e) {
      var t, n;
      A.__PosthogExtensions__?.loadExternalDependency
        ? (t = A.__PosthogExtensions__) == null ||
          (n = t.loadExternalDependency) == null ||
          n.call(t, this._instance, `remote-config`, () => e(this.remoteConfig))
        : e();
    }
    _loadRemoteConfigJSON(e) {
      this._instance._send_request({
        method: `GET`,
        url: this._instance.requestRouter.endpointFor(
          `assets`,
          `/array/${this._instance.config.token}/config`,
        ),
        callback: e,
      });
    }
    load() {
      try {
        if (this.remoteConfig)
          return (
            mc.info(`Using preloaded remote config`, this.remoteConfig),
            void this._onRemoteConfig(this.remoteConfig)
          );
        if (this._instance._shouldDisableFlags())
          return void mc.warn(`Remote config is disabled. Falling back to local config.`);
        this._loadRemoteConfigJs((e) => {
          if (!e)
            return (
              mc.info(`No config found after loading remote JS config. Falling back to JSON.`),
              void this._loadRemoteConfigJSON((e) => {
                this._onRemoteConfig(e.json, e);
              })
            );
          this._onRemoteConfig(e);
        });
      } catch (e) {
        (mc.error(`Error loading remote config`, e), this._onRemoteConfig());
      }
    }
    _onRemoteConfig(e, t) {
      !e &&
        t &&
        (t.statusCode === 0
          ? t.error || mc.warn(`Failed to fetch remote config from PostHog.`)
          : mc.error(`Failed to fetch remote config from PostHog.`));
      try {
        this._instance._onRemoteConfig(e ? { ok: !0, config: e } : { ok: !1 });
      } catch (e) {
        mc.error(`Error applying remote config`, e);
      }
      if (
        !1 !== e?.hasFeatureFlags &&
        !this._instance.config.advanced_disable_feature_flags_on_first_load
      )
        try {
          var n;
          (n = this._instance.featureFlags) == null || n.ensureFlagsLoaded();
        } catch (e) {
          mc.error(`Error loading feature flags`, e);
        }
    }
  },
  gc = Uint8Array,
  _c = Uint16Array,
  vc = Uint32Array,
  yc = new gc([
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0,
  ]),
  bc = new gc([
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13,
    13, 0, 0,
  ]),
  xc = new gc([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
  Sc = function (e, t) {
    for (var n = new _c(31), r = 0; 31 > r; ++r) n[r] = t += 1 << e[r - 1];
    var i = new vc(n[30]);
    for (r = 1; 30 > r; ++r) for (var a = n[r]; n[r + 1] > a; ++a) i[a] = ((a - n[r]) << 5) | r;
    return [n, i];
  },
  Cc = Sc(yc, 2),
  wc = Cc[1];
((Cc[0][28] = 258), (wc[258] = 28));
for (var Tc = Sc(bc, 0)[1], Ec = new _c(32768), Q = 0; 32768 > Q; ++Q) {
  var Dc = ((43690 & Q) >>> 1) | ((21845 & Q) << 1);
  Ec[Q] =
    (((65280 &
      (Dc =
        ((61680 & (Dc = ((52428 & Dc) >>> 2) | ((13107 & Dc) << 2))) >>> 4) |
        ((3855 & Dc) << 4))) >>>
      8) |
      ((255 & Dc) << 8)) >>>
    1;
}
var Oc = function (e, t, n) {
    for (var r = e.length, i = 0, a = new _c(t); r > i; ++i) ++a[e[i] - 1];
    var o,
      s = new _c(t);
    for (i = 0; t > i; ++i) s[i] = (s[i - 1] + a[i - 1]) << 1;
    if (n) {
      o = new _c(1 << t);
      var c = 15 - t;
      for (i = 0; r > i; ++i)
        if (e[i])
          for (
            var l = (i << 4) | e[i], u = t - e[i], d = s[e[i] - 1]++ << u, f = d | ((1 << u) - 1);
            f >= d;
            ++d
          )
            o[Ec[d] >>> c] = l;
    } else for (o = new _c(r), i = 0; r > i; ++i) o[i] = Ec[s[e[i] - 1]++] >>> (15 - e[i]);
    return o;
  },
  kc = new gc(288);
for (Q = 0; 144 > Q; ++Q) kc[Q] = 8;
for (Q = 144; 256 > Q; ++Q) kc[Q] = 9;
for (Q = 256; 280 > Q; ++Q) kc[Q] = 7;
for (Q = 280; 288 > Q; ++Q) kc[Q] = 8;
var Ac = new gc(32);
for (Q = 0; 32 > Q; ++Q) Ac[Q] = 5;
var jc = Oc(kc, 9, 0),
  Mc = Oc(Ac, 5, 0),
  Nc = function (e) {
    return ((e / 8) | 0) + (7 & e && 1);
  },
  Pc = function (e, t, n) {
    ((t == null || 0 > t) && (t = 0), (n == null || n > e.length) && (n = e.length));
    var r = new (e instanceof _c ? _c : e instanceof vc ? vc : gc)(n - t);
    return (r.set(e.subarray(t, n)), r);
  },
  Fc = function (e, t, n) {
    var r = (t / 8) | 0;
    ((e[r] |= n <<= 7 & t), (e[r + 1] |= n >>> 8));
  },
  Ic = function (e, t, n) {
    var r = (t / 8) | 0;
    ((e[r] |= n <<= 7 & t), (e[r + 1] |= n >>> 8), (e[r + 2] |= n >>> 16));
  },
  Lc = function (e, t) {
    for (var n = [], r = 0; e.length > r; ++r) e[r] && n.push({ s: r, f: e[r] });
    var i = n.length,
      a = n.slice();
    if (!i) return [new gc(0), 0];
    if (i == 1) {
      var o = new gc(n[0].s + 1);
      return ((o[n[0].s] = 1), [o, 1]);
    }
    (n.sort(function (e, t) {
      return e.f - t.f;
    }),
      n.push({ s: -1, f: 25001 }));
    var s = n[0],
      c = n[1],
      l = 0,
      u = 1,
      d = 2;
    for (n[0] = { s: -1, f: s.f + c.f, l: s, r: c }; u != i - 1; )
      ((s = n[n[d].f > n[l].f ? l++ : d++]),
        (c = n[l != u && n[d].f > n[l].f ? l++ : d++]),
        (n[u++] = { s: -1, f: s.f + c.f, l: s, r: c }));
    var f = a[0].s;
    for (r = 1; i > r; ++r) a[r].s > f && (f = a[r].s);
    var p = new _c(f + 1),
      m = Rc(n[u - 1], p, 0);
    if (m > t) {
      r = 0;
      var h = 0,
        g = m - t,
        _ = 1 << g;
      for (
        a.sort(function (e, t) {
          return p[t.s] - p[e.s] || e.f - t.f;
        });
        i > r;
        ++r
      ) {
        var v = a[r].s;
        if (t >= p[v]) break;
        ((h += _ - (1 << (m - p[v]))), (p[v] = t));
      }
      for (h >>>= g; h > 0; ) {
        var y = a[r].s;
        t > p[y] ? (h -= 1 << (t - p[y]++ - 1)) : ++r;
      }
      for (; r >= 0 && h; --r) {
        var b = a[r].s;
        p[b] == t && (--p[b], ++h);
      }
      m = t;
    }
    return [new gc(p), m];
  },
  Rc = function (e, t, n) {
    return e.s == -1 ? Math.max(Rc(e.l, t, n + 1), Rc(e.r, t, n + 1)) : (t[e.s] = n);
  },
  zc = function (e) {
    for (var t = e.length; t && !e[--t]; );
    for (
      var n = new _c(++t),
        r = 0,
        i = e[0],
        a = 1,
        o = function (e) {
          n[r++] = e;
        },
        s = 1;
      t >= s;
      ++s
    )
      if (e[s] == i && s != t) ++a;
      else {
        if (!i && a > 2) {
          for (; a > 138; a -= 138) o(32754);
          a > 2 && (o(a > 10 ? ((a - 11) << 5) | 28690 : ((a - 3) << 5) | 12305), (a = 0));
        } else if (a > 3) {
          for (o(i), --a; a > 6; a -= 6) o(8304);
          a > 2 && (o(((a - 3) << 5) | 8208), (a = 0));
        }
        for (; a--; ) o(i);
        ((a = 1), (i = e[s]));
      }
    return [n.subarray(0, r), t];
  },
  Bc = function (e, t) {
    for (var n = 0, r = 0; t.length > r; ++r) n += e[r] * t[r];
    return n;
  },
  Vc = function (e, t, n) {
    var r = n.length,
      i = Nc(t + 2);
    ((e[i] = 255 & r), (e[i + 1] = r >>> 8), (e[i + 2] = 255 ^ e[i]), (e[i + 3] = 255 ^ e[i + 1]));
    for (var a = 0; r > a; ++a) e[i + a + 4] = n[a];
    return 8 * (i + 4 + r);
  },
  Hc = function (e, t, n, r, i, a, o, s, c, l, u) {
    (Fc(t, u++, n), ++i[256]);
    for (
      var d = Lc(i, 15),
        f = d[0],
        p = d[1],
        m = Lc(a, 15),
        h = m[0],
        g = m[1],
        _ = zc(f),
        v = _[0],
        y = _[1],
        b = zc(h),
        x = b[0],
        S = b[1],
        C = new _c(19),
        w = 0;
      v.length > w;
      ++w
    )
      C[31 & v[w]]++;
    for (w = 0; x.length > w; ++w) C[31 & x[w]]++;
    for (var T = Lc(C, 7), E = T[0], ee = T[1], te = 19; te > 4 && !E[xc[te - 1]]; --te);
    var ne,
      D,
      re,
      ie,
      ae = (l + 5) << 3,
      oe = Bc(i, kc) + Bc(a, Ac) + o,
      se = Bc(i, f) + Bc(a, h) + o + 14 + 3 * te + Bc(C, E) + (2 * C[16] + 3 * C[17] + 7 * C[18]);
    if (oe >= ae && se >= ae) return Vc(t, u, e.subarray(c, c + l));
    if ((Fc(t, u, 1 + (oe > se)), (u += 2), oe > se)) {
      ((ne = Oc(f, p, 0)), (D = f), (re = Oc(h, g, 0)), (ie = h));
      var ce = Oc(E, ee, 0);
      for (
        Fc(t, u, y - 257), Fc(t, u + 5, S - 1), Fc(t, u + 10, te - 4), u += 14, w = 0;
        te > w;
        ++w
      )
        Fc(t, u + 3 * w, E[xc[w]]);
      u += 3 * te;
      for (var le = [v, x], ue = 0; 2 > ue; ++ue) {
        var de = le[ue];
        for (w = 0; de.length > w; ++w)
          (Fc(t, u, ce[(fe = 31 & de[w])]),
            (u += E[fe]),
            fe > 15 && (Fc(t, u, (de[w] >>> 5) & 127), (u += de[w] >>> 12)));
      }
    } else ((ne = jc), (D = kc), (re = Mc), (ie = Ac));
    for (w = 0; s > w; ++w)
      if (r[w] > 255) {
        var fe;
        (Ic(t, u, ne[257 + (fe = (r[w] >>> 18) & 31)]),
          (u += D[fe + 257]),
          fe > 7 && (Fc(t, u, (r[w] >>> 23) & 31), (u += yc[fe])));
        var pe = 31 & r[w];
        (Ic(t, u, re[pe]), (u += ie[pe]), pe > 3 && (Ic(t, u, (r[w] >>> 5) & 8191), (u += bc[pe])));
      } else (Ic(t, u, ne[r[w]]), (u += D[r[w]]));
    return (Ic(t, u, ne[256]), u + D[256]);
  },
  Uc = new vc([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]),
  Wc = new gc(0),
  Gc = (function () {
    for (var e = new vc(256), t = 0; 256 > t; ++t) {
      for (var n = t, r = 9; --r; ) n = (1 & n && 3988292384) ^ (n >>> 1);
      e[t] = n;
    }
    return e;
  })(),
  Kc = function (e, t, n) {
    for (; n; ++t) ((e[t] = n), (n >>>= 8));
  };
function qc(e, t) {
  t === void 0 && (t = {});
  var n = (function () {
      var e = 4294967295;
      return {
        p(t) {
          for (var n = e, r = 0; t.length > r; ++r) n = Gc[(255 & n) ^ t[r]] ^ (n >>> 8);
          e = n;
        },
        d() {
          return 4294967295 ^ e;
        },
      };
    })(),
    r = e.length;
  n.p(e);
  var i,
    a,
    o,
    s,
    c,
    l,
    u =
      ((s = 10 + (((i = t).filename && i.filename.length + 1) || 0)),
      (c = 8),
      (function (e, t, n, r, i, a) {
        var o = e.length,
          s = new gc(r + o + 5 * (1 + Math.floor(o / 7e3)) + i),
          c = s.subarray(r, s.length - i),
          l = 0;
        if (!t || 8 > o)
          for (var u = 0; o >= u; u += 65535) {
            var d = u + 65535;
            o > d
              ? (l = Vc(c, l, e.subarray(u, d)))
              : ((c[u] = a), (l = Vc(c, l, e.subarray(u, o))));
          }
        else {
          for (
            var f = Uc[t - 1],
              p = f >>> 13,
              m = 8191 & f,
              h = (1 << n) - 1,
              g = new _c(32768),
              _ = new _c(h + 1),
              v = Math.ceil(n / 3),
              y = 2 * v,
              b = function (t) {
                return (e[t] ^ (e[t + 1] << v) ^ (e[t + 2] << y)) & h;
              },
              x = new vc(25e3),
              S = new _c(288),
              C = new _c(32),
              w = 0,
              T = 0,
              E = ((u = 0), 0),
              ee = 0,
              te = 0;
            o > u;
            ++u
          ) {
            var ne = b(u),
              D = 32767 & u,
              re = _[ne];
            if (((g[D] = re), (_[ne] = D), u >= ee)) {
              var ie = o - u;
              if ((w > 7e3 || E > 24576) && ie > 423) {
                ((l = Hc(e, c, 0, x, S, C, T, E, te, u - te, l)), (E = w = T = 0), (te = u));
                for (var ae = 0; 286 > ae; ++ae) S[ae] = 0;
                for (ae = 0; 30 > ae; ++ae) C[ae] = 0;
              }
              var oe = 2,
                se = 0,
                ce = m,
                le = (D - re) & 32767;
              if (ie > 2 && ne == b(u - le))
                for (
                  var ue = Math.min(p, ie) - 1, de = Math.min(32767, u), fe = Math.min(258, ie);
                  de >= le && --ce && D != re;

                ) {
                  if (e[u + oe] == e[u + oe - le]) {
                    for (var pe = 0; fe > pe && e[u + pe] == e[u + pe - le]; ++pe);
                    if (pe > oe) {
                      if (((oe = pe), (se = le), pe > ue)) break;
                      var me = Math.min(le, pe - 2),
                        he = 0;
                      for (ae = 0; me > ae; ++ae) {
                        var ge = (u - le + ae + 32768) & 32767,
                          _e = (ge - g[ge] + 32768) & 32767;
                        _e > he && ((he = _e), (re = ge));
                      }
                    }
                  }
                  le += ((D = re) - (re = g[D]) + 32768) & 32767;
                }
              if (se) {
                x[E++] = 268435456 | (wc[oe] << 18) | Tc[se];
                var ve = 31 & wc[oe],
                  ye = 31 & Tc[se];
                ((T += yc[ve] + bc[ye]), ++S[257 + ve], ++C[ye], (ee = u + oe), ++w);
              } else ((x[E++] = e[u]), ++S[e[u]]);
            }
          }
          ((l = Hc(e, c, a, x, S, C, T, E, te, u - te, l)), a || (l = Vc(c, l, Wc)));
        }
        return Pc(s, 0, r + Nc(l) + i);
      })(
        (a = e),
        (o = t).level == null ? 6 : o.level,
        o.mem == null ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(a.length)))) : 12 + o.mem,
        s,
        c,
        !l,
      )),
    d = u.length;
  return (
    (function (e, t) {
      var n = t.filename;
      if (
        ((e[0] = 31),
        (e[1] = 139),
        (e[2] = 8),
        (e[8] = 2 > t.level ? 4 : t.level == 9 ? 2 : 0),
        (e[9] = 3),
        t.mtime != 0 && Kc(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)),
        n)
      ) {
        e[3] = 8;
        for (var r = 0; n.length >= r; ++r) e[r + 10] = n.charCodeAt(r);
      }
    })(u, t),
    Kc(u, d - 8, n.d()),
    Kc(u, d - 4, r),
    u
  );
}
var Jc = !!vt || !!_t,
  Yc = new WeakMap(),
  Xc = `text/plain`,
  Zc = 0,
  Qc = !1,
  $c = (e, t) => {
    let [n, r] = e.split(`#`),
      [i, a] = n.split(`?`);
    if (!a) return e;
    let o = a
      .split(`&`)
      .filter((e) => e.split(`=`)[0] !== t)
      .join(`&`);
    return `${i}${o ? `?${o}` : ``}${r ? `#${r}` : ``}`;
  },
  el = (e, t, n = !0) => {
    let [r, i] = e.split(`?`),
      a = V({}, t),
      o =
        i?.split(`&`).map((e) => {
          var t;
          let [r, i] = e.split(`=`),
            o = n && (t = a[r]) != null ? t : i;
          return (delete a[r], `${r}=${o}`);
        }) ?? [],
      s = (function (e, t = `&`) {
        let n,
          r,
          i = [];
        return (
          W(e, function (e, t) {
            F(e) ||
              F(t) ||
              t === `undefined` ||
              ((n = encodeURIComponent(((e) => e instanceof File)(e) ? e.name : e.toString())),
              (r = encodeURIComponent(t)),
              (i[i.length] = r + `=` + n));
          }),
          i.join(t)
        );
      })(a);
    return (s && o.push(s), o.length > 0 ? `${r}?${o.join(`&`)}` : r);
  },
  tl = (e) => {
    if (e._encodedBody) return e._encodedBody;
    let { data: t, compression: n } = e;
    if (!t) return;
    if (n === rc.GZipJS) {
      let e = qc(
        (function (e) {
          var t = e.length;
          if (typeof TextEncoder < `u`) return new TextEncoder().encode(e);
          for (
            var n = new gc(e.length + (e.length >>> 1)),
              r = 0,
              i = function (e) {
                n[r++] = e;
              },
              a = 0;
            t > a;
            ++a
          ) {
            if (r + 5 > n.length) {
              var o = new gc(r + 8 + ((t - a) << 1));
              (o.set(n), (n = o));
            }
            var s = e.charCodeAt(a);
            128 > s
              ? i(s)
              : 2048 > s
                ? (i(192 | (s >>> 6)), i(128 | (63 & s)))
                : s > 55295 && 57344 > s
                  ? (i(240 | ((s = (65536 + (1047552 & s)) | (1023 & e.charCodeAt(++a))) >>> 18)),
                    i(128 | ((s >>> 12) & 63)),
                    i(128 | ((s >>> 6) & 63)),
                    i(128 | (63 & s)))
                  : (i(224 | (s >>> 12)), i(128 | ((s >>> 6) & 63)), i(128 | (63 & s)));
          }
          return Pc(n, 0, r);
        })(Es(t)),
        { mtime: 0 },
      );
      return {
        contentType: Xc,
        body: e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength),
        estimatedSize: e.byteLength,
      };
    }
    if (n === rc.Base64) {
      let e = ((e) => `data=` + encodeURIComponent(typeof e == `string` ? e : Es(e)))(
        (function (e) {
          return (
            e &&
            btoa(
              encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, (e, t) =>
                String.fromCharCode(parseInt(t, 16)),
              ),
            )
          );
        })(Es(t)),
      );
      return {
        contentType: `application/x-www-form-urlencoded`,
        body: e,
        estimatedSize: new Blob([e]).size,
      };
    }
    let r = Es(t);
    return { contentType: `application/json`, body: r, estimatedSize: new Blob([r]).size };
  },
  nl = (e) => {
    let t = () =>
        e.transport === `sendBeacon`
          ? {
              url: el(e.url, { compression: rc.Base64 }),
              encodedBody: tl(V(V({}, e), {}, { compression: rc.Base64, _encodedBody: void 0 })),
            }
          : {
              url: $c(e.url, `compression`),
              encodedBody: tl(V(V({}, e), {}, { compression: void 0, _encodedBody: void 0 })),
            },
      n;
    try {
      n = tl(e);
    } catch (n) {
      if (_i(e.compression, Os(e.url, `compression`)))
        return (H.error(`Failed to gzip request body, sending uncompressed payload`, n), t());
      throw n;
    }
    return n &&
      _i(e.compression, Os(e.url, `compression`)) &&
      !((r = n.body) instanceof ArrayBuffer
        ? gi(new Uint8Array(r))
        : ArrayBuffer.isView(r) && gi(new Uint8Array(r.buffer, r.byteOffset, r.byteLength)))
      ? ((Qc = !0), t())
      : { url: e.url, encodedBody: n };
    var r;
  },
  rl = (e) => {
    try {
      return nl(e);
    } catch (n) {
      var t;
      (H.error(n), (t = e.callback) == null || t.call(e, { statusCode: 0, error: n }));
      return;
    }
  },
  il = (function () {
    var e = B(function* (e) {
      let n = yield (function (e) {
        return Ci.apply(this, arguments);
      })(Es(e.data), t.DEBUG, { rethrow: !0 });
      if (!n) return e;
      let r = yield n.arrayBuffer();
      return V(
        V({}, e),
        {},
        { _encodedBody: { contentType: Xc, body: r, estimatedSize: r.byteLength } },
      );
    });
    return function (t) {
      return e.apply(this, arguments);
    };
  })(),
  al = /Failed to fetch|NetworkError|Load failed/i,
  ol = (e) => e?.name === `TypeError` && al.test(e?.message || ``),
  sl = (e) => {
    try {
      let t = (function (e, t = Date.now()) {
        if (typeof e != `string` || !e) return;
        let n = e.trim(),
          r = /^\d+\s*,/.test(n) ? n.slice(0, n.indexOf(`,`)).trim() : n;
        if (/^\d+$/.test(r)) {
          let e = 1e3 * Math.min(Number(r), 300);
          return e > 0 ? e : void 0;
        }
        if (!/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[ ,]/.test(r)) return;
        let i = /^\w{3} \w{3} /.test(r) ? r + ` GMT` : r,
          a = Date.parse(i) - t;
        return Number.isFinite(a) && a > 0 ? Math.min(a, sr) : void 0;
      })(e());
      return F(t) ? void 0 : Math.min(t, 3e4);
    } catch {
      return;
    }
  },
  cl = (e) => {
    let t = rl(e);
    if (!t) return;
    let n = new vt();
    Yc.set(n, !0);
    let { url: r, encodedBody: i } = t;
    n.open(e.method || `GET`, r, !0);
    let { contentType: a, body: o } = i ?? {};
    (W(e.headers, function (e, t) {
      n.setRequestHeader(t, e);
    }),
      a && n.setRequestHeader(`Content-Type`, a),
      e.timeout && (n.timeout = e.timeout),
      (n.onreadystatechange = () => {
        if (n.readyState === 4) {
          var t;
          let r = { statusCode: n.status, text: n.responseText };
          if (n.status === 200)
            try {
              r.json = JSON.parse(n.responseText);
            } catch {}
          (t = e.callback) == null ||
            t.call(
              e,
              r,
              sl(() => n.getResponseHeader(`Retry-After`)),
            );
        }
      }),
      n.send(o));
  },
  ll = (e) => {
    let t = rl(e);
    if (!t) return;
    let { url: n, encodedBody: r } = t,
      { contentType: i, body: a, estimatedSize: o } = r ?? {},
      s = new Headers();
    (W(e.headers, function (e, t) {
      s.append(t, e);
    }),
      i && s.append(`Content-Type`, i));
    let c = null,
      l = !1;
    if (yt) {
      let t = new yt();
      c = {
        signal: t.signal,
        timeout: setTimeout(() => {
          l = !0;
          try {
            t.abort(
              dr(
                `AbortError`,
                `PostHog request timed out` + ((n = e.timeout) ? ` after ${n}ms` : ``),
              ),
            );
          } catch (e) {
            d(e);
          }
          var n;
        }, e.timeout),
      };
    }
    let u = !1,
      d = (t) => {
        var n;
        u ||
          ((u = !0),
          (l && t?.name === `AbortError`) || ol(t) ? H.warn(t) : H.error(t),
          (n = e.callback) == null || n.call(e, { statusCode: 0, error: t }));
      },
      f = 0,
      p = () => {
        ((Zc -= f), (f = 0), c && clearTimeout(c.timeout));
      };
    try {
      let t = V(
          {
            method: e?.method || `GET`,
            headers: s,
            referrerPolicy: `strict-origin`,
            body: a,
            signal: c?.signal,
          },
          e.fetchOptions,
        ),
        r = o ?? (F(a) ? 0 : void 0);
      ((t.keepalive =
        t.method === `POST` &&
        !e._keepaliveDisabled &&
        !1 !== t.keepalive &&
        t.body === a &&
        !F(r) &&
        r >= 0 &&
        52428.8 > Zc + r),
        t.keepalive && ((f = r), (Zc += f)),
        _t(n, t)
          .then((t) =>
            t.text().then((n) => {
              var r;
              if (u) return;
              let i = { statusCode: t.status, text: n };
              if (t.status === 200)
                try {
                  i.json = JSON.parse(n);
                } catch (e) {
                  H.error(e);
                }
              ((u = !0),
                p(),
                (r = e.callback) == null ||
                  r.call(
                    e,
                    i,
                    sl(() => t.headers.get(`Retry-After`)),
                  ));
            }),
          )
          .catch((e) => {
            (p(), d(e));
          })
          .finally(p));
    } catch (e) {
      (p(), d(e));
    }
  },
  ul = (e) => {
    try {
      let { url: t, encodedBody: n } = nl(e),
        { contentType: r, body: i, estimatedSize: a } = n ?? {};
      if (!i) return;
      let o = i instanceof Blob ? i : new Blob([i], { type: r });
      if (ht.sendBeacon(t, o)) return;
      let s = M(e.data) ? e.data : e.data?.batch;
      if (M(s) && s.length > 1 && (a ?? 0) > 16384) {
        let t = Math.ceil(s.length / 2),
          n = (t) => (M(e.data) ? t : V(V({}, e.data), {}, { batch: t }));
        (ul(V(V({}, e), {}, { data: n(s.slice(0, t)) })),
          ul(V(V({}, e), {}, { data: n(s.slice(t)) })));
        return;
      }
      (H.warn(
        `Beacon of ~${a ?? 0} bytes was rejected by the browser, falling back to ${_t ? `fetch` : `XHR`}`,
      ),
        _t ? ll(V(V({}, e), {}, { _keepaliveDisabled: !0 })) : cl(e));
    } catch (e) {
      H.warn(`Beacon send failed`, e);
    }
  },
  dl = (e, t, n, r) => {
    let i = r === `query` ? (t === `POST` ? `sent_at` : `_`) : void 0;
    return el(
      n === rc.GZipJS ? $c(e, `compression`) : e,
      V(V({}, i ? { [i]: Date.now().toString() } : {}), n === rc.GZipJS ? {} : { compression: n }),
    );
  },
  fl = (() => {
    let e = [];
    return (
      _t && e.push({ transport: `fetch`, method: ll }),
      vt && e.push({ transport: `XHR`, method: cl }),
      ht != null && ht.sendBeacon && e.push({ transport: `sendBeacon`, method: ul }),
      e
    );
  })(),
  pl = !Jc && xt?.indexOf(`MSIE`) === -1 && xt?.indexOf(`Mozilla`) === -1;
function ml(e, t, n) {
  var r, i;
  (n && (t = V(V({}, t), {}, { callback: (e) => n(e) })),
    e.__loaded
      ? pl
        ? e.__request_queue.push(t)
        : e.rateLimiter.isServerRateLimited(t.batchKey)
          ? t.fireCallbackOnDrop && ((r = t.callback) == null || r.call(t, { statusCode: 429 }))
          : ((t.transport = t.transport || e.config.api_transport),
            (t.headers = V(V({}, e.config.request_headers), t.headers)),
            (t.compression =
              t.compression === `best-available`
                ? (e.compression ?? t.compressionFallback)
                : t.compression),
            (F(e.config.disable_beacon)
              ? e.config.__preview_disable_beacon
              : e.config.disable_beacon) && (t.disableTransport = [`sendBeacon`]),
            (t.fetchOptions = t.fetchOptions || e.config.fetch_options),
            ((e, t) => {
              let n = V(V({}, e), {}, { callback: t ?? ((t) => e.callback?.call(e, t)) });
              n.timeout = n.timeout || 6e4;
              let r = n.transport ?? `fetch`;
              (r === `sendBeacon` && F(n.compression) && n.data && (n.compression = rc.Base64),
                n.method === `POST` &&
                  n.data &&
                  (n.timestampMode === `capture-body`
                    ? (n.data = ((e) => {
                        var t;
                        let n = (M(e) ? e : [e]).map((e) =>
                            V(
                              V({}, e),
                              e.timestamp instanceof Date && !isNaN(e.timestamp.getTime())
                                ? { timestamp: e.timestamp.toISOString() }
                                : {},
                            ),
                          ),
                          r = n[0];
                        return {
                          api_key:
                            (r == null || (t = r.properties) == null ? void 0 : t.token) ??
                            r?.token,
                          batch: n,
                          sent_at: new Date().toISOString(),
                        };
                      })(n.data))
                    : n.timestampMode === `body` &&
                      (n.data = ((e, t = new Date().toISOString()) =>
                        M(e)
                          ? e.map((e) => V(V({}, e), {}, { sent_at: t }))
                          : V(V({}, e), {}, { sent_at: t }))(n.data))),
                (n.url = dl(n.url, n.method, n.compression, n.timestampMode)));
              let i = fl.filter(
                  (e) =>
                    !n.disableTransport ||
                    !e.transport ||
                    !n.disableTransport.includes(e.transport),
                ),
                a =
                  (function (e, t) {
                    for (let n = 0; e.length > n; n++) if (t(e[n])) return e[n];
                  })(i, (e) => e.transport === r)?.method ?? i[0].method;
              if (!a) throw Error(`No available transport method`);
              let o = (e) => {
                try {
                  a(e);
                } catch (e) {
                  var t;
                  (ol(e) ? H.warn(e) : H.error(e),
                    (t = n.callback) == null || t.call(n, { statusCode: 0, error: e }));
                }
              };
              r !== `sendBeacon` &&
              !n.preferSyncCompression &&
              n.data &&
              n.compression === rc.GZipJS &&
              bt &&
              typeof Promise < `u` &&
              !Qc
                ? il(n)
                    .then((e) => {
                      o(e);
                    })
                    .catch((t) => {
                      if (vi(t))
                        return (
                          (Qc = !0),
                          void o(
                            V(
                              V({}, n),
                              {},
                              {
                                compression: void 0,
                                url: dl(e.url, e.method, void 0, e.timestampMode),
                              },
                            ),
                          )
                        );
                      (((e) => {
                        if (!e || typeof e != `object`) return !1;
                        let t = `name` in e ? String(e.name) : ``;
                        return vi(e) || t === hi;
                      })(t) && (Qc = !0),
                        o(n));
                    })
                : o(n);
            })(t, (r, i) => {
              var a, o, s;
              (e.rateLimiter.checkForLimiting(r),
                400 > r.statusCode || (a = (o = e.config).on_request_error) == null || a.call(o, r),
                n ? n(r, i) : (s = t.callback) == null || s.call(t, r));
            }))
      : t.fireCallbackOnDrop && ((i = t.callback) == null || i.call(t, { statusCode: 0 })));
}
var hl = class {
    constructor(e, t) {
      ((this._isPaused = !0),
        (this._queue = []),
        (this._flushTimeoutMs = Zt(
          t?.flush_interval_ms || 3e3,
          250,
          5e3,
          H.createLogger(`flush interval`),
          3e3,
        )),
        (this._sendRequest = e));
    }
    enqueue(e) {
      (this._queue.push(e), this._flushTimeout || this._setFlushTimeout());
    }
    unload() {
      this._clearFlushTimeout();
      let e = this._queue.length > 0 ? this._formatQueue() : {},
        t = Object.values(e);
      [
        ...t.filter((e) => e.url.indexOf(`/e`) === 0),
        ...t.filter((e) => e.url.indexOf(`/e`) !== 0),
      ].map((e) => {
        this._sendRequestSafely(V(V({}, e), {}, { callback: void 0 }), `sendBeacon`);
      });
    }
    enable() {
      ((this._isPaused = !1), this._setFlushTimeout());
    }
    _setFlushTimeout() {
      this._isPaused ||
        (this._flushTimeout = setTimeout(() => {
          (this._clearFlushTimeout(), this._flush());
        }, this._flushTimeoutMs));
    }
    _flush() {
      if (this._queue.length > 0) {
        let e = this._formatQueue();
        for (let t in e) this._sendRequestSafely(e[t]);
      }
    }
    _sendRequestSafely(e, t) {
      try {
        this._sendRequest(e, t);
      } catch (e) {
        H.error(e);
      }
    }
    _clearFlushTimeout() {
      (clearTimeout(this._flushTimeout), (this._flushTimeout = void 0));
    }
    _formatQueue() {
      let e = {},
        t = {};
      W(this._queue, (n) => {
        var r;
        let i = n,
          a = ((i ? i.batchKey : null) || i.url) + (i.batchGroup ? `:${i.batchGroup}` : ``);
        (F(e[a]) &&
          ((e[a] = V(V({}, i), {}, { data: [], callback: void 0, fireCallbackOnDrop: void 0 })),
          (t[a] = [])),
          (r = e[a].data) == null || r.push(i.data),
          i.callback && t[a].push(i.callback));
      });
      for (let n in t) {
        let r = t[n];
        r.length &&
          (e[n].callback = (e) => {
            for (let t of r) t(e);
          });
      }
      return ((this._queue = []), e);
    }
  },
  gl = [`retriesPerformedSoFar`],
  _l = class {
    constructor(e) {
      ((this._instance = e),
        (this._isPolling = !1),
        (this._pollIntervalMs = 3e3),
        (this._queue = []),
        (this._queue = []),
        (this._areWeOnline = !0),
        this.resume());
    }
    resume() {
      if (!F(O) && `onLine` in O.navigator) {
        if (((this._areWeOnline = O.navigator.onLine), this._onlineListener)) return;
        ((this._onlineListener = () => {
          ((this._areWeOnline = !0), this._flush());
        }),
          (this._offlineListener = () => {
            this._areWeOnline = !1;
          }),
          K(O, `online`, this._onlineListener),
          K(O, `offline`, this._offlineListener));
      }
    }
    get length() {
      return this._queue.length;
    }
    retriableRequest(e, t) {
      let { retriesPerformedSoFar: n } = e,
        r = wi(e, gl);
      (Ft(n) && (r.url = el(r.url, { retry_count: n })),
        ml(this._instance, t ? V(V({}, r), {}, { transport: t }) : r, (e, t) => {
          var i;
          if (e.statusCode !== 200 && (400 > e.statusCode || e.statusCode >= 500)) {
            if ((e.statusCode === 0 ? 3 : 10) > (n ?? 0))
              return void this._enqueue(V({ retriesPerformedSoFar: n }, r), t);
            e.statusCode === 0 &&
              H.warn(
                `Request failed before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped retrying after ${n ?? 0} retries.`,
              );
          }
          (i = r.callback) == null || i.call(r, e);
        }));
    }
    _enqueue(e, t) {
      let n = e.retriesPerformedSoFar || 0;
      e.retriesPerformedSoFar = n + 1;
      let r = Math.max(
          (function (e) {
            let t = 3e3 * 2 ** e,
              n = t / 2,
              r = Math.min(18e5, t),
              i = (Math.random() - 0.5) * (r - n);
            return Math.ceil(r + i);
          })(n),
          t ?? 0,
        ),
        i = Date.now() + r;
      this._queue.push({ retryAt: i, requestOptions: e });
      let a = `Enqueued failed request for retry in ${r}`;
      (navigator.onLine || (a += ` (Browser is offline)`),
        H.warn(a),
        this._isPolling || ((this._isPolling = !0), this._poll()));
    }
    _poll() {
      if ((this._poller && clearTimeout(this._poller), this._queue.length === 0))
        return ((this._isPolling = !1), void (this._poller = void 0));
      this._poller = setTimeout(() => {
        (this._areWeOnline && this._queue.length > 0 && this._flush(), this._poll());
      }, this._pollIntervalMs);
    }
    _flush() {
      let e = Date.now(),
        t = [],
        n = this._queue.filter((n) => e > n.retryAt || (t.push(n), !1));
      if (((this._queue = t), n.length > 0))
        for (let { requestOptions: e } of n) this.retriableRequest(e);
    }
    unload() {
      ((this._poller &&= (clearTimeout(this._poller), void 0)),
        (this._isPolling = !1),
        F(O) ||
          ((this._onlineListener &&=
            (O.removeEventListener(`online`, this._onlineListener), void 0)),
          (this._offlineListener &&=
            (O.removeEventListener(`offline`, this._offlineListener), void 0))));
      for (let { requestOptions: e } of this._queue)
        try {
          this._instance._send_request(
            V(V({}, e), {}, { callback: M(e.data) ? void 0 : e.callback, transport: `sendBeacon` }),
          );
        } catch (e) {
          H.error(e);
        }
      this._queue = [];
    }
  },
  vl = class {
    constructor(e) {
      ((this._instance = e),
        (this._updateScrollData = () => {
          this._context ||= {};
          let e = this.scrollElement(),
            t = this.scrollY(),
            n = e ? Math.max(0, e.scrollHeight - e.clientHeight) : 0,
            r = t + (e?.clientHeight || 0),
            i = e?.scrollHeight || 0;
          ((this._context.lastScrollY = Math.ceil(t)),
            (this._context.maxScrollY = Math.max(t, this._context.maxScrollY ?? 0)),
            (this._context.maxScrollHeight = Math.max(n, this._context.maxScrollHeight ?? 0)),
            (this._context.lastContentY = r),
            (this._context.maxContentY = Math.max(r, this._context.maxContentY ?? 0)),
            (this._context.maxContentHeight = Math.max(i, this._context.maxContentHeight ?? 0)));
        }));
    }
    get _scrollRoot() {
      return this._instance.config.scroll_root_selector;
    }
    getContext() {
      return this._context;
    }
    resetContext() {
      let e = this._context;
      return ((this._context = void 0), setTimeout(this._updateScrollData, 0), e);
    }
    startMeasuringScrollPosition() {
      (K(O, `scroll`, this._updateScrollData, { capture: !0 }),
        K(O, `scrollend`, this._updateScrollData, { capture: !0 }),
        K(O, `resize`, this._updateScrollData));
    }
    scrollElement() {
      if (this._scrollRoot) {
        let t = M(this._scrollRoot) ? this._scrollRoot : [this._scrollRoot];
        for (let n of t) {
          var e;
          let t = O == null || (e = O.document) == null ? void 0 : e.querySelector(n);
          if (t) return t;
        }
      } else {
        var t;
        return O == null || (t = O.document) == null ? void 0 : t.documentElement;
      }
    }
    _scrollPosition(e) {
      var t, n;
      let r = e === `y` ? `scrollTop` : `scrollLeft`;
      if (this._scrollRoot) {
        let e = this.scrollElement();
        return (e && e[r]) || 0;
      }
      return O
        ? e === `y`
          ? O.scrollY ||
            O.pageYOffset ||
            ((t = O.document) == null || (t = t.documentElement) == null ? void 0 : t.scrollTop) ||
            0
          : O.scrollX ||
            O.pageXOffset ||
            ((n = O.document) == null || (n = n.documentElement) == null ? void 0 : n.scrollLeft) ||
            0
        : 0;
    }
    scrollY() {
      return this._scrollPosition(`y`);
    }
    scrollX() {
      return this._scrollPosition(`x`);
    }
  },
  yl = (e) =>
    Hs(
      e?.config.mask_personal_data_properties,
      e?.config.custom_personal_data_properties,
      e?.config.disable_capture_url_hashes,
    ),
  bl = class {
    constructor(e, t, n, r) {
      ((this._onSessionIdCallback = (e) => {
        let t = this._getStored();
        if (t && t.sessionId === e) return;
        let n = { sessionId: e, props: this._sessionSourceParamGenerator(this._instance) };
        this._persistence.register({ [ze]: n });
      }),
        (this._instance = e),
        (this._sessionIdManager = t),
        (this._persistence = n),
        (this._sessionSourceParamGenerator = r || yl),
        this._sessionIdManager.onSessionId(this._onSessionIdCallback));
    }
    _getStored() {
      return this._persistence.props[ze];
    }
    getSetOnceProps() {
      let e = this._getStored()?.props;
      return e
        ? `r` in e
          ? Us(e, this._instance.config.disable_capture_url_hashes)
          : {
              $referring_domain: e.referringDomain,
              $pathname: e.initialPathName,
              utm_source: e.utm_source,
              utm_campaign: e.utm_campaign,
              utm_medium: e.utm_medium,
              utm_content: e.utm_content,
              utm_term: e.utm_term,
            }
        : {};
    }
    getSessionProps() {
      let e = {};
      return (
        W(Va(this.getSetOnceProps()), (t, n) => {
          (n === `$current_url` && (n = `url`), (e[`$session_entry_${Ot(n)}`] = t));
        }),
        e
      );
    }
  },
  xl = class {
    on(e, t) {
      return (
        this._events[e] || (this._events[e] = []),
        this._events[e].push(t),
        () => {
          this._events[e] = this._events[e].filter((e) => e !== t);
        }
      );
    }
    emit(e, t) {
      for (let n of this._events[e] || []) n(t);
      for (let n of this._events[`*`] || []) n(e, t);
    }
    constructor() {
      this._events = {};
    }
  },
  Sl = U(`[SessionId]`),
  Cl = 864e5,
  wl = class {
    on(e, t) {
      return this._eventEmitter.on(e, t);
    }
    constructor(e, t, n) {
      var r;
      if (
        ((this._lastPersistedActivityTimestamp = null),
        (this._lastCookieSyncTimestamp = null),
        (this._sessionIdChangedHandlers = []),
        (this._beforeUnloadListener = void 0),
        (this._destroyed = !1),
        (this._eventEmitter = new xl()),
        (this._sessionHasBeenIdleTooLong = (e, t) =>
          !(!Ft(e) || !Ft(t)) && Math.abs(e - t) > this.sessionTimeoutMs),
        !e.persistence)
      )
        throw Error(`SessionIdManager requires a PostHogPersistence instance`);
      if (e.config.cookieless_mode === `always`)
        throw Error(`SessionIdManager cannot be used with cookieless_mode="always"`);
      ((this._config = e.config),
        (this._persistence = e.persistence),
        (this._windowId = void 0),
        (this._sessionId = void 0),
        (this._sessionStartTimestamp = null),
        (this._pendingBootstrapSession = void 0),
        (this._sessionActivityTimestamp = null),
        (this._sessionIdGenerator = t || Qa),
        (this._windowIdGenerator = n || Qa));
      let i = this._config.persistence_name || this._config.token;
      if (
        ((this._sessionTimeoutMs =
          1e3 *
          Zt(
            this._config.session_idle_timeout_seconds || 1800,
            60,
            36e3,
            Sl.createLogger(`session_idle_timeout_seconds`),
            1800,
          )),
        e.register({ $configured_session_timeout_ms: this._sessionTimeoutMs }),
        this._resetIdleTimer(),
        (this._window_id_storage_key = `ph_` + i + `_window_id`),
        (this._primary_window_exists_storage_key = `ph_` + i + `_primary_window_exists`),
        this._canUseSessionStorage())
      ) {
        let e = Y._parse(this._window_id_storage_key),
          t = Y._parse(this._primary_window_exists_storage_key);
        (e && !t ? (this._windowId = e) : Y._remove(this._window_id_storage_key),
          Y._set(this._primary_window_exists_storage_key, !0));
      }
      ((r = this._config.bootstrap) != null &&
        r.sessionID &&
        this.setBootstrapSessionId(this._config.bootstrap.sessionID),
        this._listenToReloadWindow());
    }
    get sessionTimeoutMs() {
      return this._sessionTimeoutMs;
    }
    onSessionId(e) {
      return (
        F(this._sessionIdChangedHandlers) && (this._sessionIdChangedHandlers = []),
        this._sessionIdChangedHandlers.push(e),
        this._sessionId && e(this._sessionId, this._windowId),
        () => {
          this._sessionIdChangedHandlers = this._sessionIdChangedHandlers.filter((t) => t !== e);
        }
      );
    }
    _canUseSessionStorage() {
      return (
        this._config.persistence !== `memory` && !this._persistence._disabled && Y._is_supported()
      );
    }
    _setWindowId(e) {
      e !== this._windowId &&
        ((this._windowId = e),
        this._canUseSessionStorage() && Y._set(this._window_id_storage_key, e));
    }
    _getWindowId() {
      return this._windowId
        ? this._windowId
        : this._canUseSessionStorage()
          ? Y._parse(this._window_id_storage_key)
          : null;
    }
    _isActivityChangeBelowGranularity(e) {
      let t = this._lastPersistedActivityTimestamp;
      return !L(t) && !L(e) && 5e3 > Math.abs(e - t);
    }
    _setSessionId(e, t, n) {
      let r = t !== this._sessionActivityTimestamp,
        i = e === this._sessionId && n === this._sessionStartTimestamp;
      ((this._sessionStartTimestamp = n),
        (this._sessionActivityTimestamp = t),
        (this._sessionId = e),
        (i && !r) ||
          (i && this._isActivityChangeBelowGranularity(t)) ||
          ((this._lastPersistedActivityTimestamp = t),
          this._persistence.register({ [ve]: [t, e, n] })));
    }
    _useCrossTabRefreshHardening() {
      let e = this._config?.persistence_save_debounce_ms;
      return Ft(e) && e > 0;
    }
    _refreshSessionIdFromStorage() {
      this._useCrossTabRefreshHardening()
        ? this._persistence.refreshKey(ve)
        : (this._persistence.flush(), this._persistence.load());
    }
    _flushPendingActivityTimestamp() {
      if (
        L(this._sessionActivityTimestamp) ||
        this._sessionActivityTimestamp === this._lastPersistedActivityTimestamp
      )
        return;
      this._refreshSessionIdFromStorage();
      let [, e, t] = this._getSessionId();
      e === this._sessionId &&
        t === this._sessionStartTimestamp &&
        ((this._lastPersistedActivityTimestamp = this._sessionActivityTimestamp),
        this._persistence.register({
          [ve]: [
            this._sessionActivityTimestamp,
            this._sessionId ?? null,
            this._sessionStartTimestamp,
          ],
        }),
        this._persistence.flush());
    }
    _freshestActivityTimestamp() {
      let [e] = this._getSessionId(),
        t = Ft(e) ? e : 0,
        n = Ft(this._sessionActivityTimestamp) ? this._sessionActivityTimestamp : 0;
      return Math.max(t, n);
    }
    _isSessionIdleAfterCrossTabRefresh(e) {
      return (
        this._refreshSessionIdFromStorage(),
        this._sessionHasBeenIdleTooLong(e, this._freshestActivityTimestamp())
      );
    }
    _getSessionId() {
      let e = this._persistence.props[ve];
      return (M(e) && e.length === 2 && e.push(e[0]), e || [0, null, 0]);
    }
    resetSessionId() {
      ((this._lastPersistedActivityTimestamp = null),
        (this._pendingBootstrapSession = void 0),
        clearTimeout(this._enforceIdleTimeout),
        (this._enforceIdleTimeout = void 0),
        this._setSessionId(null, null, null));
    }
    setBootstrapSessionId(e, t = !1) {
      let n = ((e, t = new Date().getTime()) => {
        try {
          let n = ((e) => {
            let t = e.replace(/-/g, ``);
            if (t.length !== 32) throw Error(`Not a valid UUID`);
            if (t[12] !== `7`) throw Error(`Not a UUIDv7`);
            return parseInt(t.substring(0, 12), 16);
          })(e);
          return n > t + 6e4 ? void Sl.error(`Bootstrap sessionID cannot be in the future`) : n;
        } catch (e) {
          Sl.error(`Invalid sessionID in bootstrap`, e);
          return;
        }
      })(e);
      return (
        !F(n) &&
        (t
          ? (this._pendingBootstrapSession = { sessionId: e, sessionStartTimestamp: n })
          : this._setSessionId(e, new Date().getTime(), n),
        !0)
      );
    }
    destroy() {
      ((this._destroyed = !0),
        this._flushPendingActivityTimestamp(),
        clearTimeout(this._enforceIdleTimeout),
        (this._enforceIdleTimeout = void 0),
        this._beforeUnloadListener &&
          O &&
          (O.removeEventListener(lt, this._beforeUnloadListener, { capture: !1 }),
          (this._beforeUnloadListener = void 0)),
        (this._sessionIdChangedHandlers = []));
    }
    _listenToReloadWindow() {
      ((this._beforeUnloadListener = () => {
        (this._flushPendingActivityTimestamp(),
          this._canUseSessionStorage() && Y._remove(this._primary_window_exists_storage_key));
      }),
        K(O, lt, this._beforeUnloadListener, { capture: !1 }));
    }
    checkAndGetSessionAndWindowId(e = !1, t = null, n = !1) {
      if (this._config.cookieless_mode === `always`)
        throw Error(
          `checkAndGetSessionAndWindowId should not be called with cookieless_mode="always"`,
        );
      let r = t || new Date().getTime(),
        i = this._sessionId;
      if (n) this._lastCookieSyncTimestamp = r;
      else if (
        L(this._lastCookieSyncTimestamp) ||
        this._lastCookieSyncTimestamp > r ||
        r - this._lastCookieSyncTimestamp >= 1e3
      ) {
        var a, o;
        ((a = (o = this._persistence).syncCookieProperties) == null || a.call(o),
          (this._lastCookieSyncTimestamp = r));
      }
      let [, s, c] = this._getSessionId(),
        l = !F(i) && s !== i,
        u = this._freshestActivityTimestamp(),
        d = this._getWindowId(),
        f = this._pendingBootstrapSession,
        p = !!f && (f.sessionStartTimestamp > r + 6e4 || r - f.sessionStartTimestamp > Cl),
        m = f ? p : Ft(c) && Math.abs(r - c) > Cl,
        h = !1,
        g = l,
        _ = !s || !!f,
        v = s,
        y = !_ && !e && this._sessionHasBeenIdleTooLong(r, u);
      if (
        (y &&
          ((y = this._isSessionIdleAfterCrossTabRefresh(r)),
          y || Sl.info(`cross-tab refresh kept the session alive`, { sessionId: s }),
          ([, s, c] = this._getSessionId()),
          y || (_ = !s || !!f)),
        _ || y || m)
      ) {
        g = !1;
        let e = f && !p;
        ((s = e ? f.sessionId : this._sessionIdGenerator()),
          (d = this._windowIdGenerator()),
          Sl.info(`new session ID assigned`, {
            sessionId: s,
            windowId: d,
            bootstrapped: !!e,
            changeReason: { noSessionId: _, activityTimeout: y, sessionPastMaximumLength: m },
          }),
          (c = e ? f.sessionStartTimestamp : r),
          (this._pendingBootstrapSession = void 0),
          (h = !0));
      } else
        (d || ((d = this._windowIdGenerator()), (h = !0)),
          (g ||= s !== v),
          g && (Sl.info(`adopted cross-tab session id`, { sessionId: s, windowId: d }), (h = !0)));
      let b = Ft(u) && e && !m ? u : r,
        x = Ft(c) ? c : new Date().getTime();
      (this._setWindowId(d), this._setSessionId(s, b, x), e || this._resetIdleTimer());
      let S = {
        noSessionId: _,
        activityTimeout: y,
        sessionPastMaximumLength: m,
        crossTabAdoption: g,
      };
      return (
        h && this._sessionIdChangedHandlers.forEach((e) => e(s, d, S)),
        {
          sessionId: s,
          windowId: d,
          sessionStartTimestamp: x,
          changeReason: h ? S : void 0,
          lastActivityTimestamp: u,
        }
      );
    }
    _resetIdleTimer() {
      this._destroyed ||
        (clearTimeout(this._enforceIdleTimeout),
        (this._enforceIdleTimeout = setTimeout(() => {
          if (!this._destroyed) {
            if (this._isSessionIdleAfterCrossTabRefresh(new Date().getTime())) {
              let e = this._sessionId;
              (this.resetSessionId(),
                this._eventEmitter.emit(`forcedIdleReset`, { idleSessionId: e }));
            } else this._resetIdleTimer();
          }
        }, 1.1 * this.sessionTimeoutMs)));
    }
  },
  Tl = function (e, t) {
    if (!e) return !1;
    let n = e.userAgent;
    if (n && Xt(n, t)) return !0;
    try {
      let n = e?.userAgentData;
      if (n?.brands && n.brands.some((e) => Xt(e?.brand, t))) return !0;
    } catch {}
    return !!e.webdriver;
  };
function El() {
  return (El = B(function* () {
    let e = ht?.userAgentData;
    if (e?.getHighEntropyValues)
      try {
        let t = (yield e.getHighEntropyValues([`model`]))?.model;
        return I(t) && t.length > 0 ? t : void 0;
      } catch (e) {
        H.info(`Unable to resolve $device_model from userAgentData.getHighEntropyValues`, e);
        return;
      }
  })).apply(this, arguments);
}
function Dl(e, t) {
  let n = `$survey_${t}/${e.id}`;
  return (
    e.current_iteration &&
      e.current_iteration > 0 &&
      (n = `$survey_${t}/${e.id}/${e.current_iteration}`),
    n
  );
}
function Ol(e) {
  var t;
  return !!(
    (t = e.conditions) != null &&
    (t = t.events) != null &&
    (t = t.values) != null &&
    t.length
  );
}
var kl = (e, t) => {
    if (
      !((e) => {
        try {
          new RegExp(e);
        } catch {
          return !1;
        }
        return !0;
      })(t)
    )
      return !1;
    try {
      return new RegExp(t).test(e);
    } catch {
      return !1;
    }
  },
  Al = (e) => e.toLowerCase(),
  jl = {
    exact: (e, t) => t.some((t) => e.some((e) => t === e)),
    is_not: (e, t) => t.every((t) => e.every((e) => t !== e)),
    regex: (e, t) => t.some((t) => e.some((e) => kl(t, e))),
    not_regex: (e, t) => t.every((t) => e.every((e) => !kl(t, e))),
    icontains: (e, t) => t.map(Al).some((t) => e.map(Al).some((e) => t.includes(e))),
    not_icontains: (e, t) => t.map(Al).every((t) => e.map(Al).every((e) => !t.includes(e))),
    gt: (e, t) =>
      t.some((t) => {
        let n = parseFloat(t);
        return !isNaN(n) && e.some((e) => n > parseFloat(e));
      }),
    lt: (e, t) =>
      t.some((t) => {
        let n = parseFloat(t);
        return !isNaN(n) && e.some((e) => n < parseFloat(e));
      }),
  };
function Ml(e, t) {
  return (
    !e ||
    Object.entries(e).every(([e, n]) => {
      let r = t?.[e];
      if (r == null) return !1;
      let i = jl[n.operator];
      return !!i && i(n.values.map(String), [String(r)]);
    })
  );
}
function Nl(e, t, n) {
  return Es({ distinct_id: e, userPropertiesToSet: t, userPropertiesToSetOnce: n });
}
var Pl = `custom`,
  Fl = `i.posthog.com`,
  Il = /^\/static\//,
  Ll = [`/s/`, `/e/`, `/i/`],
  Rl = class {
    constructor(e) {
      ((this._regionCache = {}), (this.instance = e));
    }
    get apiHost() {
      let e = this.instance.config.api_host.trim().replace(/\/$/, ``);
      return e === `https://app.posthog.com` ? `https://us.i.posthog.com` : e;
    }
    get flagsApiHost() {
      let e = this.instance.config.flags_api_host;
      return e ? e.trim().replace(/\/$/, ``) : this.apiHost;
    }
    get uiHost() {
      let e = this.instance.config.ui_host?.replace(/\/$/, ``);
      return (
        (e ||= this.apiHost.replace(`.${Fl}`, `.posthog.com`)),
        e === `https://app.posthog.com` ? `https://us.posthog.com` : e
      );
    }
    get region() {
      return (
        this._regionCache[this.apiHost] ||
          (this._regionCache[this.apiHost] =
            /https:\/\/(app|us|us-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)
              ? `us`
              : /https:\/\/(eu|eu-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)
                ? `eu`
                : Pl),
        this._regionCache[this.apiHost]
      );
    }
    _staticAssetHostOverride(e) {
      if (!Il.test(e)) return;
      let t = this.instance.config.asset_host;
      return (typeof t == `string` && t.trim().replace(/\/$/, ``)) || void 0;
    }
    _urlKey(e) {
      let t = Ds(e);
      return t ? t.protocol + `//` + t.host + t.pathname : void 0;
    }
    _prepareEndpoint(e, t, n) {
      if (e === `ui`) return n;
      let r = n,
        i = this.instance.config.rewriteRequestPath;
      if (i) {
        let e = Ds(n)?.href || n;
        r = i(new URL(e)).toString();
      }
      if (i && e === `api` && Ll.some((e) => t.indexOf(e) === 0)) {
        let e = this._urlKey(r);
        if (e) {
          let t = this.apiHost,
            n = this._ingestionEndpoints;
          ((n?.apiHost === t && n.rewriteRequestPath === i) ||
            ((n = { apiHost: t, rewriteRequestPath: i, urls: new Set() }),
            (this._ingestionEndpoints = n)),
            n.urls.add(e));
        }
      }
      return r;
    }
    isIngestionEndpoint(e) {
      let t = this._ingestionEndpoints,
        n = this._urlKey(e);
      return (
        t?.apiHost === this.apiHost &&
        t.rewriteRequestPath === this.instance.config.rewriteRequestPath &&
        !!n &&
        t.urls.has(n)
      );
    }
    endpointFor(e, t = ``) {
      if (((t &&= t[0] === `/` ? t : `/${t}`), e === `ui`))
        return this._prepareEndpoint(e, t, this.uiHost + t);
      if (e === `flags`) return this._prepareEndpoint(e, t, this.flagsApiHost + t);
      if (e === `assets`) {
        let n = this._staticAssetHostOverride(t);
        if (n) return this._prepareEndpoint(e, t, `${n}${t}`);
      }
      if (this.region === Pl) return this._prepareEndpoint(e, t, this.apiHost + t);
      let n = Fl + t;
      switch (e) {
        case `assets`:
          return this._prepareEndpoint(e, t, `https://${this.region}-assets.${n}`);
        case `api`:
          return this._prepareEndpoint(e, t, `https://${this.region}.${n}`);
      }
    }
  },
  $ = U(`[Surveys]`),
  zl = (e) => {
    try {
      let t = ((e) =>
        ((e, t) =>
          `seenSurvey_${(function (e) {
            return e.current_iteration && e.current_iteration > 0
              ? `${e.id}_${e.current_iteration}`
              : e.id;
          })(t)}`)(0, e))(e);
      if (localStorage.getItem(t)) return;
      localStorage.setItem(t, `true`);
    } catch (e) {
      $.error(`Failed to persist survey seen state`, e);
    }
  },
  Bl = [ac.Popover, ac.Widget, ac.API],
  Vl = { ignoreConditions: !1, ignoreDelay: !1, displayType: cc.Popover },
  Hl = U(`[PostHog ExternalIntegrations]`),
  Ul = { intercom: `intercom-integration`, crispChat: `crisp-chat-integration` },
  Wl = class {
    constructor(e) {
      this._instance = e;
    }
    _loadScript(e, t) {
      var n, r;
      (n = A.__PosthogExtensions__) == null ||
        (r = n.loadExternalDependency) == null ||
        r.call(n, this._instance, e, (e) => {
          if (e) return Hl.error(`failed to load script`, e);
          t();
        });
    }
    startIfEnabledOrStop() {
      for (let [r, i] of Object.entries(this._instance.config.integrations ?? {})) {
        var e, t, n;
        (i &&
          !((e = A.__PosthogExtensions__) != null && (e = e.integrations) != null && e[r]) &&
          this._loadScript(Ul[r], () => {
            var e;
            (e = A.__PosthogExtensions__) == null ||
              (e = e.integrations) == null ||
              (e = e[r]) == null ||
              e.start(this._instance);
          }),
          !i &&
            (t = A.__PosthogExtensions__) != null &&
            (t = t.integrations) != null &&
            t[r] &&
            ((n = A.__PosthogExtensions__) == null ||
              (n = n.integrations) == null ||
              (n = n[r]) == null ||
              n.stop()));
      }
    }
  },
  Gl = `autocapture`,
  Kl = `featureFlags`,
  ql = `logs`,
  Jl = `surveys`,
  Yl = class {
    constructor(e) {
      this._instance = e;
    }
    initialize() {}
    get(e) {
      let t = this._instance.persistence;
      if (typeof e == `string`) return t?.get_property(e);
      let n = {};
      for (let r of e) {
        let e = t?.get_property(r);
        F(e) || (n[r] = e);
      }
      return n;
    }
    set(e, t) {
      var n;
      (n = this._instance.persistence) == null || n.register(typeof e == `string` ? { [e]: t } : e);
    }
    remove(e) {
      var t;
      (t = this._instance.persistence) == null || t.unregister(e);
    }
  },
  Xl = class {
    constructor(e) {
      ((this.instance = e),
        (this._logger = H),
        (this.kv = new Yl(e)),
        (this.onEvent = (e) =>
          lc(
            this.instance._addCaptureHook((t, n) => {
              if (n)
                try {
                  e({ event: t, properties: n.properties });
                } catch (e) {
                  this._logger.error(`Browser extension event listener failed`, e);
                }
            }),
          )),
        (this.onRemoteConfig = (e) => {
          let t = (t) => {
              try {
                e(t);
              } catch (e) {
                this._logger.error(`Browser extension remote config listener failed`, e);
              }
            },
            n = this.instance._internalEventEmitter.on(`extensionsRemoteConfig`, t);
          return (this.instance._lastRemoteConfig && t(this.instance._lastRemoteConfig), lc(n));
        }));
    }
    get logger() {
      return this._logger;
    }
    get distinctId() {
      return this.instance.get_distinct_id();
    }
    get anonymousId() {
      return this.instance.get_property(`$device_id`) ?? this.distinctId;
    }
    get deviceId() {
      let e = this.instance.get_property(b);
      return typeof e == `string` ? e : void 0;
    }
    get library() {
      return { name: t.LIB_NAME, version: t.LIB_VERSION };
    }
    get initialPersonProperties() {
      return this.instance.persistence?.get_initial_props() ?? {};
    }
    get groups() {
      return this.instance.getGroups();
    }
    get session() {
      try {
        let e = this.instance.sessionManager?.checkAndGetSessionAndWindowId(!0);
        return {
          sessionId: e?.sessionId ?? ``,
          windowId: e?.windowId ?? ``,
          sessionStartTimestamp: e?.sessionStartTimestamp ?? 0,
          lastActivityTimestamp: e?.lastActivityTimestamp ?? 0,
        };
      } catch {
        return { sessionId: ``, windowId: ``, sessionStartTimestamp: 0, lastActivityTimestamp: 0 };
      }
    }
    get isOptedOut() {
      return this.instance.has_opted_out_capturing();
    }
    get canCapture() {
      return N(this.instance.is_capturing) ? this.instance.is_capturing() : !this.isOptedOut;
    }
    get projectToken() {
      return this.instance.config.token;
    }
    getExtension(e) {
      let t;
      switch (e) {
        case Kl:
        case `featureFlagsCommon`:
          t = this.instance.featureFlags;
          break;
        case ql:
          t = this.instance.logs;
          break;
        case Jl:
          t = this.instance.surveys;
          break;
        case Gl:
          t = this.instance.autocapture;
      }
      return t;
    }
    capture(e, t, n) {
      n
        ? this.instance.capture(e, t, {
            timestamp: n.timestamp,
            uuid: n.uuid,
            $set: n.set,
            $set_once: n.setOnce,
          })
        : this.instance.capture(e, t);
    }
    registerDynamicEventProperties(e) {
      return lc(this.instance._registerExtensionEventProperties(e));
    }
    sendRequest(e) {
      var t = this;
      return B(function* (e, n = {}) {
        let r = n.target ?? `api`,
          i = t.instance.requestRouter.endpointFor(r, e),
          a = r === `api` && e === `/i/v1/logs`,
          o = {
            method: n.method,
            url: n.query ? el(i, n.query) : i,
            data: n.body,
            headers: n.headers,
            timeout: n.timeoutMs,
            fireCallbackOnDrop: !0,
            transport: n.transport,
            compression: n.compression,
            compressionFallback:
              n.target === `flags` && n.compression === `best-available` ? wt.Base64 : void 0,
            timestampMode: n.sentAt,
          };
        return (
          a && (o.batchKey = `logs`),
          n.transport === `sendBeacon`
            ? (t.instance._send_request(o), { statusCode: 202 })
            : new Promise((e) => {
                ((o.callback = e), t.instance._send_request(o));
              })
        );
      }).apply(this, arguments);
    }
  },
  Zl = {},
  Ql = 0,
  $l = () => {},
  eu = `Consent opt in/out is not valid with cookieless_mode="always" and will be ignored`,
  tu = `Surveys module not available`,
  nu = `sanitize_properties is deprecated. Use before_send instead`,
  ru = `Invalid value for property_denylist config: `,
  iu = [
    `$recording_status`,
    `$sdk_debug_recording_script_not_loaded`,
    `$sdk_debug_replay_url_trigger_status`,
    `$sdk_debug_replay_event_trigger_status`,
    `$sdk_debug_replay_linked_flag_trigger_status`,
    `$sdk_debug_replay_rrweb_error`,
    `$sdk_debug_replay_internal_buffer_length`,
    `$sdk_debug_replay_flushed_size`,
  ],
  au = [`$feature_flag_called`, `$$heatmap`, `$snapshot`],
  ou = (e) => e.charAt(0) === `$` && !j(au, e),
  su = /^[A-Za-z0-9_-]{1,400}$/,
  cu = /^fb\.[0-9]+\.[0-9]+\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/,
  lu = /^fb\.[0-9]+\.[0-9]+\.[0-9]+$/,
  uu = [`token`, `distinct_id`, Ke],
  du = `posthog`,
  fu = (e) => {
    let t = {};
    return (
      e &&
        e !== `unset` &&
        (`2025-11-30` > e || (t.strictMinimumDuration = !0),
        `2026-05-30` > e || (t.canvasCapture = { resolutionScale: 0.6 }),
        `2026-06-25` > e || (t.streamNetworkBody = !0),
        `2026-08-30` > e || (t.captureJsonLd = !0)),
      t
    );
  },
  pu = (e) => {
    var t;
    return V(
      {
        api_host: `https://us.i.posthog.com`,
        flags_api_host: null,
        ui_host: null,
        asset_host: null,
        token: ``,
        autocapture: !0,
        cross_subdomain_cookie: Wa(k?.location),
        persistence: `localStorage+cookie`,
        persistence_name: ``,
        cookie_persisted_properties: [],
        loaded: $l,
        save_campaign_params: !0,
        custom_campaign_params: [],
        custom_blocked_useragents: [],
        save_referrer: !0,
        capture_pageleave: `if_capture_pageview`,
        defaults: e ?? `unset`,
        __preview_deferred_init_extensions: !1,
        __preview_replay_sync_fetch: !1,
        __preview_external_dependency_versioned_paths: !1,
        __preview_cookie_wins_on_conflict: !1,
        debug: (gt && I(gt?.search) && gt.search.indexOf(`__posthog_debug=true`) !== -1) || !1,
        cookie_expiration: 365,
        upgrade: !1,
        disable_session_recording: !1,
        disable_persistence: !1,
        disable_web_experiments: !0,
        disable_surveys: !1,
        disable_surveys_automatic_display: !1,
        disable_conversations: !1,
        disable_product_tours: !1,
        disableDeviceModel: !1,
        reuseAnonymousId: !1,
        disable_external_dependency_loading: !1,
        strict_script_versioning: `fallback`,
        enable_recording_console_log: void 0,
        secure_cookie: (O == null || (t = O.location) == null ? void 0 : t.protocol) === `https:`,
        ip: !1,
        opt_out_capturing_by_default: !1,
        opt_out_persistence_by_default: !1,
        opt_out_useragent_filter: !1,
        opt_out_capturing_persistence_type: `localStorage`,
        consent_persistence_name: null,
        opt_out_capturing_cookie_prefix: null,
        opt_in_site_apps: !1,
        property_denylist: [],
        respect_dnt: !1,
        sanitize_properties: null,
        request_headers: {},
        request_batching: !0,
        properties_string_max_length: 65535,
        mask_all_element_attributes: !1,
        mask_all_text: !1,
        mask_personal_data_properties: !1,
        custom_personal_data_properties: [],
        advanced_disable_flags: !1,
        advanced_disable_decide: !1,
        advanced_disable_feature_flags: !1,
        advanced_disable_feature_flags_on_first_load: !1,
        advanced_only_evaluate_survey_feature_flags: !1,
        advanced_feature_flags_dedup_per_session: !1,
        advanced_enable_surveys: !1,
        advanced_disable_toolbar_metrics: !1,
        feature_flag_request_timeout_ms: 3e3,
        feature_flag_request_max_retries: 1,
        surveys_request_timeout_ms: 1e4,
        on_request_error(e) {
          H.error(`Bad HTTP status: ` + e.statusCode + ` ` + e.text);
        },
        get_device_id: (e) => e,
        capture_performance: void 0,
        name: `posthog`,
        bootstrap: {},
        disable_compression: !1,
        session_idle_timeout_seconds: 1800,
        person_profiles: ct,
        before_send: void 0,
        get_current_url: void 0,
        request_queue_config: { flush_interval_ms: 3e3 },
        error_tracking: {},
        _onCapture: $l,
      },
      ((e) => ({
        rageclick:
          e && e >= `2026-05-30`
            ? { content_ignorelist: Lo, ignore_text_selection: !0 }
            : !e || `2025-11-30` > e || { content_ignorelist: !0 },
        capture_pageview: !e || `2025-05-24` > e || `history_change`,
        session_recording: fu(e),
        external_scripts_inject_target: e && e >= `2026-01-30` ? `head` : `body`,
        internal_or_test_user_hostname:
          e && e >= `2026-01-30` ? /^(localhost|127\.0\.0\.1)$/ : void 0,
        persistence_save_debounce_ms: e && e >= `2026-05-30` ? 250 : 0,
        split_storage: !(!e || `2026-05-30` > e),
        detect_google_search_app: !(!e || `2026-05-30` > e),
        disable_capture_url_hashes: !(!e || `2026-06-25` > e),
        cookieWinsOnConflict: !(!e || e === `unset` || `2026-08-29` > e),
      }))(e),
    );
  },
  mu = [
    [`process_person`, `person_profiles`],
    [`xhr_headers`, `request_headers`],
    [`cookie_name`, `persistence_name`],
    [`disable_cookie`, `disable_persistence`],
    [`__preview_disable_beacon`, `disable_beacon`],
    [`store_google`, `save_campaign_params`],
    [`verbose`, `debug`],
    [`__preview_cookie_wins_on_conflict`, `cookieWinsOnConflict`],
  ],
  hu = (e) => {
    let t = {};
    for (let [n, r] of mu) F(e[n]) || (t[r] = e[n]);
    let n = G({}, t, e),
      r = e.__preview_external_dependency_versioned_paths;
    return (
      F(r) ||
        (F(e.strict_script_versioning) && (n.strict_script_versioning = !!r),
        I(r) && F(e.asset_host) && (n.asset_host = r)),
      M(e.property_blacklist) &&
        (F(e.property_denylist)
          ? (n.property_denylist = e.property_blacklist)
          : M(e.property_denylist)
            ? (n.property_denylist = [...e.property_blacklist, ...e.property_denylist])
            : H.error(ru + e.property_denylist)),
      n
    );
  },
  gu = class {
    constructor() {
      this.__forceAllowLocalhost = !1;
    }
    get _forceAllowLocalhost() {
      return this.__forceAllowLocalhost;
    }
    set _forceAllowLocalhost(e) {
      (H.error(
        "WebPerformanceObserver is deprecated and has no impact on network capture. Use `_forceAllowLocalhostNetworkCapture` on `posthog.sessionRecording`",
      ),
        (this.__forceAllowLocalhost = e));
    }
  },
  _u = class n {
    _removeExtension(e) {
      if (!e) return;
      let t = this._extensions.indexOf(e);
      t !== -1 && this._extensions.splice(t, 1);
    }
    _replaceExtension(e, t) {
      var n;
      return (
        this._removeExtension(e),
        this._extensions.push(t),
        (n = t.initialize) == null || n.call(t),
        t
      );
    }
    _inCookielessMode() {
      return (
        this.config.cookieless_mode === `always` ||
        (this.config.cookieless_mode === `on_reject` && this.consent.isRejected())
      );
    }
    _warnIfVolatileIdentityWithoutStableId() {
      if (
        this._hasWarnedAboutVolatileIdentity ||
        this.config.reuseAnonymousId ||
        this.config.segment ||
        this._inCookielessMode()
      )
        return;
      let e = this.config.persistence === `memory` || this.config.persistence === `sessionStorage`;
      if ((!e && !this.config.disable_persistence) || this._hasStableInitialDistinctId) return;
      let t, n, r;
      (e
        ? ((t = `persistence is set to '${this.config.persistence}'`),
          (n =
            this.config.persistence === `memory`
              ? `on every page load`
              : `for every new browser tab or window`),
          (r = `Either set persistence to 'localStorage+cookie', keep this persistence and pass a stable ID through bootstrap.distinctID, or enable reuseAnonymousId.`))
        : ((t = `persistence is disabled (disable_persistence is true)`),
          (n = `on every page load`),
          (r = `Either set disable_persistence to false, keep persistence disabled and pass a stable ID through bootstrap.distinctID, or enable reuseAnonymousId.`)),
        (this._hasWarnedAboutVolatileIdentity = !0),
        console.warn(
          `[PostHog.js]`,
          `${t} but no bootstrap.distinctID was provided. PostHog will mint a new distinct ID ${n}, so calling identify() merges a new ID onto the person each time. A person can then pass the distinct-ID limit and its events stop appearing on person pages and the session tab. ${r}`,
        ));
    }
    _syncCookielessIdentity() {
      let e = this.persistence;
      if (!e || this._isConsentTransition) return;
      if (this._inCookielessMode())
        return void (
          this.config.cookieless_mode === `on_reject` &&
          this.get_distinct_id() !== `$posthog_cookieless` &&
          (this._sync_opt_out_with_persistence(), this._enterCookielessMode())
        );
      if (this.get_distinct_id() !== `$posthog_cookieless`) return;
      this._is_persistence_disabled() || e.load(!0);
      let t = this.get_distinct_id();
      if (!t || t === `$posthog_cookieless`) {
        let t = this.config.get_device_id(Qa());
        (this.register({ distinct_id: t, $device_id: t }), e.set_property(Re, ot));
      }
      this._sync_opt_out_with_persistence();
    }
    get decideEndpointWasHit() {
      var e;
      return (e = this.featureFlags?.hasLoadedFlags) != null && e;
    }
    get flagsEndpointWasHit() {
      var e;
      return (e = this.featureFlags?.hasLoadedFlags) != null && e;
    }
    constructor() {
      ((this._isPageUnloading = !1),
        (this._isShutdown = !1),
        (this.webPerformance = new gu()),
        (this._personProcessingSetOncePropertiesSent = !1),
        (this.version = t.LIB_VERSION),
        (this._sessionRegisteredPropKeys = new Set()),
        (this._sessionRegisteredPropertiesStorageKey = ``),
        (this._internalEventEmitter = new xl()),
        (this._extensions = []),
        (this._extensionEventPropertyProducers = []),
        (this._replayDebugPropertiesPaused = !1),
        (this._hasStableInitialDistinctId = !1),
        (this._hasWarnedAboutVolatileIdentity = !1),
        (this._isConsentTransition = !1),
        (this._calculate_event_properties = this.calculateEventProperties.bind(this)),
        (this.config = pu()),
        (this.SentryIntegration = _s),
        (this.sentryIntegration = (e) =>
          (function (e, t) {
            let n = gs(e, t);
            return { name: hs, processEvent: (e) => n(e) };
          })(this, e)),
        (this.__request_queue = []),
        (this.__loaded = !1),
        (this.analyticsDefaultEndpoint = `/e/`),
        (this._initialPageviewCaptured = !1),
        (this._visibilityStateListener = null),
        (this._initialPersonProfilesConfig = null),
        (this._cachedPersonProperties = null),
        (this.scrollManager = new vl(this)),
        (this.pageViewManager = new vs(this)),
        (this.rateLimiter = new pc(this)),
        (this.requestRouter = new Rl(this)),
        (this.consent = new vo(this)),
        (this.externalIntegrations = new Wl(this)));
      let e = n.__defaultExtensionClasses ?? {};
      ((this.featureFlags = e.featureFlags && new e.featureFlags(this)),
        (this.toolbar = e.toolbar && new e.toolbar(this)),
        (this.surveys = e.surveys && new e.surveys(this)),
        (this.conversations = e.conversations && new e.conversations(this)),
        (this.logs = e.logs && new e.logs(this)),
        (this.metrics = e.metrics && new e.metrics(this)),
        (this.experiments = e.experiments && new e.experiments(this)),
        (this.exceptions = e.exceptions && new e.exceptions(this)),
        (this.people = {
          set: (e, t, n) => {
            let r = I(e) ? { [e]: t } : e;
            (this.setPersonProperties(r), n?.({}));
          },
          set_once: (e, t, n) => {
            let r = I(e) ? { [e]: t } : e;
            (this.setPersonProperties(void 0, r), n?.({}));
          },
        }),
        this.on(`eventCaptured`, (e) => H.info(`send "${e?.event}"`, e)));
    }
    init(e, t, r) {
      if (r && r !== du) {
        let i = Zl[r] ?? new n();
        return (i._init(e, t, r), (Zl[r] = i), (Zl[du][r] = i), i);
      }
      return this._init(e, t, r);
    }
    _init(e, n = {}, r) {
      var i;
      let a = I(e) ? e.trim() : ``;
      if (!a)
        return (
          H.critical(
            `PostHog was initialized without a token. This likely indicates a misconfiguration. Please check the first argument passed to posthog.init()`,
          ),
          this
        );
      if (this.__loaded)
        return (
          a === this.config?.token
            ? console.warn(
                `[PostHog.js]`,
                `You have already initialized PostHog! Re-initializing is a no-op`,
              )
            : console.warn(
                `[PostHog.js]`,
                `You have already initialized PostHog with a different project token! Re-initializing is a no-op, so events will keep going to the project this instance was initialized with. To capture into a second project, load PostHog once, then initialize a named instance after the SDK has loaded, e.g. posthog.init('${a}', { ... }, 'project2')`,
              ),
          this
        );
      ((this.__loaded = !0),
        (this.config = pu(n.defaults)),
        (n.debug = this._checkLocalStorageForDebug(n.debug)),
        (this._originalUserConfig = n),
        (this._triggered_notifs = []),
        n.person_profiles
          ? (this._initialPersonProfilesConfig = n.person_profiles)
          : n.process_person && (this._initialPersonProfilesConfig = n.process_person));
      let o = pu(n.defaults),
        s = hu(n),
        c = G({}, o, s, { name: r, token: a });
      (P(o.rageclick) && P(s.rageclick) && (c.rageclick = G({}, o.rageclick, s.rageclick)),
        P(o.session_recording) &&
          P(s.session_recording) &&
          (c.session_recording = G({}, o.session_recording, s.session_recording)),
        this.set_config(c),
        this.config.on_xhr_error &&
          H.error(`on_xhr_error is deprecated. Use on_request_error instead`),
        (this.compression = n.disable_compression ? void 0 : rc.GZipJS));
      let l = this._is_persistence_disabled(),
        u = !this._inCookielessMode();
      if (
        ((this.persistence = new nc(this.config, l, !0, u)),
        (this.sessionPersistence =
          this.config.persistence === `sessionStorage` || this.config.persistence === `memory`
            ? this.persistence
            : new nc(V(V({}, this.config), {}, { persistence: `sessionStorage` }), l, !1, u)),
        (this._sessionRegisteredPropertiesStorageKey =
          `ph_` +
          (this.config.persistence_name || this.config.token) +
          `_session_registered_properties`),
        this.config.persistence !== `memory` && !l && Y._is_supported())
      ) {
        let e = Y._parse(this._sessionRegisteredPropertiesStorageKey);
        M(e) &&
          e.forEach((e) => {
            I(e) && this._sessionRegisteredPropKeys.add(e);
          });
      } else Y._remove(this._sessionRegisteredPropertiesStorageKey);
      let d = V({}, this.persistence.props),
        f = V({}, this.sessionPersistence.props);
      (this.register({ $initialization_time: new Date().toISOString() }),
        (this._requestQueue = new hl(
          (e, t) => this._send_retriable_request(e, t),
          this.config.request_queue_config,
        )),
        (this._retryQueue = new _l(this)),
        (this.__request_queue = []));
      let p = this._inCookielessMode();
      (p ||
        ((this.sessionManager = new wl(this)),
        (this.sessionPropsManager = new bl(this, this.sessionManager, this.persistence)),
        this.sessionManager.onSessionId((e, t, n) => {
          ((n != null && n.activityTimeout) ||
            (n != null && n.sessionPastMaximumLength) ||
            (n != null && n.crossTabAdoption)) &&
            this._clearSessionRegisteredProps();
        })),
        this._enrollFeatureFlags(),
        this.config.__preview_deferred_init_extensions
          ? (H.info(`Deferring extension initialization to improve startup performance`),
            (this._extensionInitTimeout = setTimeout(() => {
              ((this._extensionInitTimeout = void 0), this._initExtensions(p));
            }, 0)))
          : (H.info(`Initializing extensions synchronously`), this._initExtensions(p)),
        (t.DEBUG = t.DEBUG || this.config.debug),
        t.DEBUG &&
          H.info(`Starting in debug mode`, {
            this: this,
            config: n,
            thisC: V({}, this.config),
            p: d,
            s: f,
          }),
        this.config.identity_distinct_id &&
          !((i = n.bootstrap) != null && i.distinctID) &&
          (n.bootstrap = V(
            V({}, n.bootstrap),
            {},
            { distinctID: this.config.identity_distinct_id, isIdentifiedID: !0 },
          )));
      let m = n.bootstrap?.distinctID;
      if (((this._hasStableInitialDistinctId = !!m && !Pt(m)), n.bootstrap?.distinctID)) {
        let e = n.bootstrap.distinctID,
          t = this.get_distinct_id(),
          r = this.persistence.get_property(Re);
        if (n.bootstrap.isIdentifiedID && t != null && t !== e && r === `anonymous`)
          this.identify(e);
        else if (n.bootstrap.isIdentifiedID && t != null && t !== e && r === `identified`)
          H.warn(
            `Bootstrap distinctID differs from an already-identified user. The existing identity is preserved. Call reset() before reinitializing if you intend to switch users.`,
          );
        else {
          let t = this.config.get_device_id(Qa()),
            r = n.bootstrap.isIdentifiedID ? t : e;
          (this.persistence.set_property(Re, n.bootstrap.isIdentifiedID ? st : ot),
            this.register({ distinct_id: e, $device_id: r }));
        }
      }
      if (p) this.register_once({ distinct_id: Ge, $device_id: null }, ``);
      else if (!this.get_distinct_id()) {
        let e = this.config.get_device_id(Qa());
        (this.register_once({ distinct_id: e, $device_id: e }, ``),
          this.persistence.set_property(Re, ot));
      }
      return (
        K(O, `onpagehide` in self ? `pagehide` : `unload`, this._handle_unload.bind(this), {
          passive: !1,
        }),
        K(O, `pageshow`, () => {
          var e;
          ((this._isPageUnloading = !1),
            this._isShutdown || (e = this._retryQueue) == null || e.resume());
        }),
        n.segment ? ms(this, () => this._loaded()) : this._loaded(),
        N(this.config._onCapture) &&
          this.config._onCapture !== $l &&
          (H.warn("onCapture is deprecated. Please use `before_send` instead"),
          this.on(`eventCaptured`, (e) => this.config._onCapture(e.event, e))),
        this.config.ip &&
          H.warn(
            'The `ip` config option has NO EFFECT AT ALL and has been deprecated. Use a custom transformation or "Discard IP data" project setting instead. See https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address for more information.',
          ),
        this.config.disableDeviceModel ||
          (function () {
            return El.apply(this, arguments);
          })()
            .then((e) => {
              e && this.register({ [x]: e });
            })
            .catch($l),
        this
      );
    }
    _isSharedExtension(e) {
      let t = e;
      return I(t.name) && N(t.setup);
    }
    _enrollExtension(e, t) {
      var n = this;
      this._isSharedExtension(e)
        ? t.push(
            B(function* () {
              try {
                yield e.setup(n._getBrowserClientAdapter());
              } catch (t) {
                H.error(`Failed to set up extension "${e.name}"`, t);
                try {
                  yield e.dispose?.call(e);
                } catch (t) {
                  H.error(`Failed to dispose extension "${e.name}"`, t);
                }
              }
            }),
          )
        : this._extensions.push(e);
    }
    _enrollFeatureFlags() {
      var e = this;
      let t =
        this.config.__extensionClasses?.featureFlags ?? n.__defaultExtensionClasses?.featureFlags;
      var r, i, a;
      if (t) {
        if (
          ((this.featureFlags && this.featureFlags instanceof t) ||
            ((r = this._featureFlagsReloadingUnsubscribe) == null || r.call(this),
            (this._featureFlagsReloadingUnsubscribe = void 0),
            (this.featureFlags = new t(this))),
          N(this.featureFlags.onReloading) && N(this.featureFlags.setup))
        ) {
          if (!this._featureFlagsReloadingUnsubscribe) {
            this._featureFlagsReloadingUnsubscribe = this.featureFlags.onReloading(() => {
              this._internalEventEmitter.emit(`featureFlagsReloading`, !0);
            });
            let t = this.featureFlags;
            B(function* () {
              try {
                yield t.setup(e._getBrowserClientAdapter());
              } catch (n) {
                H.error(`Failed to set up feature flags`, n);
                let r = e._featureFlagsReloadingUnsubscribe;
                e._featureFlagsReloadingUnsubscribe = void 0;
                try {
                  r?.();
                } catch (e) {
                  H.error(`Failed to unsubscribe feature flag reloading`, e);
                }
                try {
                  yield t.dispose();
                } catch (e) {
                  H.error(`Failed to dispose feature flags`, e);
                }
              }
            })();
          }
        } else (i = (a = this.featureFlags).initialize) == null || i.call(a);
      }
    }
    _initExtensions(e) {
      let t = performance.now(),
        r = V(V({}, n.__defaultExtensionClasses), this.config.__extensionClasses),
        i = [];
      (r.exceptions &&
        this._extensions.push((this.exceptions = this.exceptions ?? new r.exceptions(this))),
        r.historyAutocapture &&
          this._extensions.push((this.historyAutocapture = new r.historyAutocapture(this))),
        r.tracingHeaders &&
          this._extensions.push((this.tracingHeaders = new r.tracingHeaders(this))),
        r.siteApps && this._extensions.push((this.siteApps = new r.siteApps(this))),
        r.sessionRecording &&
          !e &&
          this._extensions.push((this.sessionRecording = new r.sessionRecording(this))),
        this.config.disable_scroll_properties ||
          i.push(() => {
            this.scrollManager.startMeasuringScrollPosition();
          }),
        r.autocapture && this._enrollExtension((this.autocapture = new r.autocapture(this)), i),
        r.surveys && this._enrollExtension((this.surveys = this.surveys ?? new r.surveys(this)), i),
        r.logs && this._enrollExtension((this.logs = this.logs ?? new r.logs(this)), i),
        r.metrics && this._extensions.push((this.metrics = this.metrics ?? new r.metrics(this))),
        r.conversations &&
          this._extensions.push(
            (this.conversations = this.conversations ?? new r.conversations(this)),
          ),
        r.productTours && this._extensions.push((this.productTours = new r.productTours(this))),
        r.heatmaps && this._extensions.push((this.heatmaps = new r.heatmaps(this))),
        r.webVitalsAutocapture &&
          this._extensions.push((this.webVitalsAutocapture = new r.webVitalsAutocapture(this))),
        r.exceptionObserver &&
          this._extensions.push((this.exceptionObserver = new r.exceptionObserver(this))),
        r.deadClicksAutocapture &&
          this._extensions.push(
            (this.deadClicksAutocapture = new r.deadClicksAutocapture(this, ds)),
          ),
        r.toolbar && this._extensions.push((this.toolbar = this.toolbar ?? new r.toolbar(this))),
        r.experiments &&
          this._extensions.push((this.experiments = this.experiments ?? new r.experiments(this))),
        r.webMCP && this._extensions.push((this.webMCP = this.webMCP ?? new r.webMCP(this))),
        this._extensions.forEach((e) => {
          e.initialize &&
            i.push(() => {
              var t;
              (t = e.initialize) == null || t.call(e);
            });
        }),
        i.push(() => {
          if (this._pendingRemoteConfig) {
            let e = this._pendingRemoteConfig;
            ((this._pendingRemoteConfig = void 0),
              this._extensions.forEach((t) => t.onRemoteConfig?.call(t, e)));
          }
        }),
        this._processInitTaskQueue(i, t));
    }
    _processInitTaskQueue(e, t) {
      for (; e.length > 0; ) {
        if (
          this.config.__preview_deferred_init_extensions &&
          performance.now() - t >= 30 &&
          e.length > 0
        )
          return void (this._extensionInitTimeout = setTimeout(() => {
            ((this._extensionInitTimeout = void 0), this._processInitTaskQueue(e, t));
          }, 0));
        let n = e.shift();
        if (n)
          try {
            n();
          } catch (e) {
            H.error(`Error initializing extension:`, e);
          }
      }
      let n = Math.round(performance.now() - t);
      (this.register_for_session({
        [qe]: this.config.__preview_deferred_init_extensions ? `deferred` : `synchronous`,
        [Je]: n,
      }),
        this.config.__preview_deferred_init_extensions &&
          H.info(`PostHog extensions initialized (${n}ms)`));
    }
    _onRemoteConfig(e) {
      if (!k || !k.body)
        return (
          H.info(`document not ready yet, trying again in 500 milliseconds...`),
          void setTimeout(() => {
            this._onRemoteConfig(e);
          }, 500)
        );
      if (
        (this.config.__preview_deferred_init_extensions && (this._pendingRemoteConfig = e),
        (this._lastRemoteConfig = e),
        (this.compression = void 0),
        e.ok)
      ) {
        var t;
        let n = e.config;
        (n.supportedCompression &&
          !this.config.disable_compression &&
          (this.compression = j(n.supportedCompression, rc.GZipJS)
            ? rc.GZipJS
            : j(n.supportedCompression, rc.Base64)
              ? rc.Base64
              : void 0),
          (t = n.analytics) != null &&
            t.endpoint &&
            (this.analyticsDefaultEndpoint = n.analytics.endpoint));
      }
      (this.set_config({
        person_profiles: this._initialPersonProfilesConfig ? this._initialPersonProfilesConfig : ct,
      }),
        this._internalEventEmitter.emit(`extensionsRemoteConfig`, e),
        this._extensions.forEach((t) => t.onRemoteConfig?.call(t, e)));
    }
    _loaded() {
      try {
        this.config.loaded(this);
      } catch (e) {
        H.critical("`loaded` function failed", e);
      }
      if (
        (this._start_queue_if_opted_in(),
        this.config.internal_or_test_user_hostname && gt?.hostname)
      ) {
        let e = gt.hostname,
          t = this.config.internal_or_test_user_hostname;
        (typeof t == `string` ? e === t : t.test(e)) && this.setInternalOrTestUser();
      }
      (this.config.capture_pageview &&
        setTimeout(() => {
          (this.consent.isOptedIn() || this._inCookielessMode()) && this._captureInitialPageview();
        }, 1),
        (this._remoteConfigLoader = new hc(this)),
        this._remoteConfigLoader.load());
    }
    _start_queue_if_opted_in() {
      var e;
      this.is_capturing() &&
        this.config.request_batching &&
        ((e = this._requestQueue) == null || e.enable());
    }
    _dom_loaded() {
      (this.is_capturing() && Ra(this.__request_queue, (e) => this._send_retriable_request(e)),
        (this.__request_queue = []),
        this._start_queue_if_opted_in());
    }
    _handle_unload() {
      var e, t, n, r, i, a;
      ((this._isPageUnloading = !0),
        (e = this.surveys) == null || (t = e.handlePageUnload) == null || t.call(e),
        (n = this.metrics) == null || n.flush(`sendBeacon`),
        this.config.request_batching
          ? (this._shouldCapturePageleave() && this.capture(dt),
            (r = this.logs) == null || r.flushLogs(`sendBeacon`),
            (i = this._requestQueue) == null || i.unload(),
            (a = this._retryQueue) == null || a.unload())
          : this._shouldCapturePageleave() && this.capture(dt, null, { transport: `sendBeacon` }));
    }
    _send_request(e) {
      ml(this, e);
    }
    _send_retriable_request(e, t) {
      this._retryQueue
        ? this._retryQueue.retriableRequest(e, t)
        : this._send_request(t ? V(V({}, e), {}, { transport: t }) : e);
    }
    _execute_array(e) {
      Ql++;
      try {
        let t,
          n = [],
          r = [],
          i = [];
        Ra(e, (e) => {
          if (e) {
            if (((t = e[0]), M(t))) i.push(e);
            else if (N(e))
              try {
                e.call(this);
              } catch (t) {
                H.error(`Error executing queued PostHog call`, e, t);
              }
            else
              M(e) && t === `alias`
                ? n.push(e)
                : M(e) && t.indexOf(`capture`) !== -1 && N(this[t])
                  ? i.push(e)
                  : r.push(e);
          }
        });
        let a = function (e, t) {
          Ra(e, function (e) {
            try {
              if (M(e[0])) {
                let n = t;
                W(e, function (e) {
                  n = n[e[0]].apply(n, e.slice(1));
                });
              } else t[e[0]].apply(t, e.slice(1));
            } catch (t) {
              H.error(`Error executing queued PostHog call`, e, t);
            }
          });
        };
        (a(n, this), a(r, this), a(i, this));
      } finally {
        Ql--;
      }
    }
    push(e) {
      if (Ql > 0 && M(e) && I(e[0])) {
        let t = n.prototype[e[0]];
        N(t) && t.apply(this, e.slice(1));
      } else this._execute_array([e]);
    }
    get _facebookClickIdChannel() {
      return {
        property: w,
        persistenceKey: T,
        cookieName: `_fbc`,
        pattern: cu,
        register: (e, t) => this.persistence?.register({ [T]: { value: e, delivered: t } }),
        unregister: () => this.persistence?.unregister(T),
      };
    }
    get _facebookBrowserIdChannel() {
      return {
        property: E,
        persistenceKey: ee,
        cookieName: `_fbp`,
        pattern: lu,
        register: (e, t) => this.persistence?.register({ [ee]: { value: e, delivered: t } }),
        unregister: () => this.persistence?.unregister(ee),
      };
    }
    _getPersistedMetaIdentifier(e) {
      let t = this.persistence?.get_property(e.persistenceKey);
      return I(t) && e.pattern.test(t)
        ? { value: t, delivered: !1 }
        : P(t) && I(t.value) && e.pattern.test(t.value)
          ? { value: t.value, delivered: !0 === t.delivered }
          : void 0;
    }
    _storeMetaIdentifier(e, t, n) {
      return t === n?.value
        ? { value: t, pending: !n.delivered }
        : (e.register(t, !1), { value: t, pending: !0 });
    }
    _readMetaCookie(e) {
      if (!this.config.save_campaign_params || this._inCookielessMode()) return;
      let t = Ka(e.cookieName);
      return I(t) && e.pattern.test(t) ? t : void 0;
    }
    _updateFacebookClickId(e, t, n, r) {
      if (!this.persistence) return;
      let i = this._facebookClickIdChannel;
      this.persistence.refreshKey(i.persistenceKey);
      let a = this._getPersistedMetaIdentifier(i);
      if (r) return void i.unregister();
      if (n) return I(t) && cu.test(t) ? this._storeMetaIdentifier(i, t, a) : void i.unregister();
      let o = I(e) && su.test(e) ? e : void 0,
        s = this._readMetaCookie(i);
      return s &&
        ((e, t, n) => {
          let r = e.split(`.`);
          if (t) return r[3] === t;
          if (!n) return !0;
          let i = n.value.split(`.`);
          return r[3] === i[3] || Number(r[2]) > Number(i[2]);
        })(s, o, a)
        ? this._storeMetaIdentifier(i, s, a)
        : o
          ? a?.value.split(`.`)[3] === o
            ? { value: a.value, pending: !a.delivered }
            : this._storeMetaIdentifier(i, `fb.1.${Date.now()}.${o}`, a)
          : a
            ? { value: a.value, pending: !a.delivered }
            : void 0;
    }
    _updateFacebookBrowserId(e, t, n) {
      if (!this.persistence) return;
      let r = this._facebookBrowserIdChannel;
      this.persistence.refreshKey(r.persistenceKey);
      let i = this._getPersistedMetaIdentifier(r);
      if (n) return void r.unregister();
      if (t) return I(e) && lu.test(e) ? this._storeMetaIdentifier(r, e, i) : void r.unregister();
      let a = this._readMetaCookie(r);
      return a
        ? this._storeMetaIdentifier(r, a, i)
        : i
          ? { value: i.value, pending: !i.delivered }
          : void 0;
    }
    _markMetaIdentifierDelivered(e, t) {
      if (!this.persistence) return;
      this.persistence.refreshKey(e.persistenceKey);
      let n = this._getPersistedMetaIdentifier(e);
      n?.value !== t || n.delivered || e.register(t, !0);
    }
    capture(e, t, n) {
      if (!(this.__loaded && this.persistence && this.sessionPersistence && this._requestQueue))
        return void H.uninitializedWarning(`posthog.capture`);
      if (!this.is_capturing()) return;
      if (F(e) || !I(e)) return void H.error(`No event name provided to posthog.capture`);
      if ((this._syncCookielessIdentity(), e === `$snapshot` && this._inCookielessMode())) return;
      let r = !this.config.opt_out_useragent_filter && this._is_bot();
      if (r && !this.config.__preview_capture_bot_pageviews) return;
      let i = n?.skip_client_rate_limiting ? void 0 : this.rateLimiter.clientRateLimitContext();
      if (i?.isRateLimited)
        return void H.critical(`This capture call is ignored due to client rate limiting.`);
      let a;
      (t != null &&
        t.$current_url &&
        !I(t?.$current_url) &&
        (H.error(
          "Invalid `$current_url` property provided to `posthog.capture`. Input must be a string. Ignoring provided value.",
        ),
        t == null || delete t.$current_url),
        e !== `$exception` ||
          (n != null && n._originatedFromCaptureException) ||
          H.warn(
            "Using `posthog.capture('$exception')` is unreliable because it does not attach required metadata. Use `posthog.captureException(error)` instead, which attaches required metadata automatically.",
          ),
        this.sessionPersistence.update_search_keyword(),
        this.config.save_campaign_params && (a = this.sessionPersistence.update_campaign_params()),
        this.config.save_referrer && this.sessionPersistence.update_referrer_info(),
        (this.config.save_campaign_params || this.config.save_referrer) &&
          this.persistence.set_initial_person_info());
      let o = new Date(),
        s = n?.timestamp || o,
        c = ur(n?.uuid, Qa),
        l = { uuid: c, event: e, properties: this.calculateEventProperties(e, t || {}, s, c) };
      (e === `$pageview` &&
        this.config.__preview_capture_bot_pageviews &&
        r &&
        ((l.event = `$bot_pageview`), (l.properties.$browser_type = `bot`)),
        i && (l.properties.$lib_rate_limit_remaining_tokens = i.remainingTokens));
      let u =
        e === `$feature_flag_called` &&
        !1 === l.properties.$feature_flag_has_experiment &&
        !0 === this.get_property(`$minimal_flag_called_events`);
      n != null && n.$set && !u && (l.$set = n?.$set);
      let d = P(t?.$set) ? t.$set : void 0,
        f = M(t?.$unset) ? t.$unset : [],
        p = n?.$unset || [],
        m = (e) => {
          var t;
          let r = !!n?.$set && e in n.$set;
          return {
            hasProvided: r || (!!d && e in d),
            provided: r ? (n == null || (t = n.$set) == null ? void 0 : t[e]) : d?.[e],
            unset: f.indexOf(e) !== -1 || p.indexOf(e) !== -1,
          };
        },
        h = m(w),
        g = m(E),
        _ = [
          {
            channel: this._facebookClickIdChannel,
            hasProvided: h.hasProvided,
            update: this._updateFacebookClickId(a?.fbclid, h.provided, h.hasProvided, h.unset),
          },
          {
            channel: this._facebookBrowserIdChannel,
            hasProvided: g.hasProvided,
            update: this._updateFacebookBrowserId(g.provided, g.hasProvided, g.unset),
          },
        ];
      for (let { channel: e, hasProvided: t, update: n } of _)
        n &&
          !0 === l.properties.$process_person_profile &&
          n.pending &&
          !t &&
          !u &&
          (l.$set = V({ [e.property]: n.value }, l.$set));
      let v = n?.$unset;
      v && (l.$unset = v);
      let y = u ? void 0 : this._calculate_set_once_properties(n?.$set_once, e !== pt, e === ft);
      if (
        (y && (l.$set_once = y),
        (n != null && n._noTruncate) ||
          ((b = this.config.properties_string_max_length),
          (l = (function (e, t) {
            let n = new Set();
            return (function e(r, i) {
              if (r !== Object(r)) return t ? t(r) : r;
              if (n.has(r)) return;
              let a;
              if ((n.add(r), M(r)))
                ((a = []),
                  Ra(r, (t) => {
                    a.push(e(t));
                  }));
              else {
                let t = {};
                (W(Vt(r) ? Ha(r) : r, (r, i) => {
                  n.has(r) || (t[i] = e(r, i));
                }),
                  (a = t));
              }
              return a;
            })(e);
          })(l, (e) => (I(e) ? e.slice(0, b) : e)))),
        (l.timestamp = s),
        F(n?.timestamp) ||
          ((l.properties.$event_time_override_provided = !0),
          (l.properties.$event_time_override_system_time = o)),
        u &&
          (l.properties = ((e, t = []) => {
            let n = {},
              r = (t) => {
                e[t] !== void 0 && (n[t] = e[t]);
              };
            return (mi.forEach(r), t.forEach(r), n);
          })(l.properties, uu)),
        e === oc.DISMISSED || e === oc.SENT)
      ) {
        let n = t?.[sc.SURVEY_ID],
          r = t?.[sc.SURVEY_ITERATION];
        (zl({ id: n, current_iteration: r }),
          (l.$set = V(
            V({}, l.$set),
            {},
            {
              [Dl({ id: n, current_iteration: r }, e === oc.SENT ? `responded` : `dismissed`)]: !0,
            },
          )));
      } else
        e === oc.SHOWN &&
          (l.$set = V(V({}, l.$set), {}, { [sc.SURVEY_LAST_SEEN_DATE]: new Date().toISOString() }));
      var b;
      if (e === uc.SHOWN) {
        let e = t?.[dc.TOUR_TYPE];
        e &&
          (l.$set = V(
            V({}, l.$set),
            {},
            { [`${dc.TOUR_LAST_SEEN_DATE}/${e}`]: new Date().toISOString() },
          ));
      }
      let x = V(V({}, l.properties.$set), l.$set);
      if ((Nt(x) || this.setPersonPropertiesForFlags(x), !R(this.config.before_send))) {
        let e = this._runBeforeSend(l);
        if (!e) return;
        ((l = e), (l.uuid = ur(l.uuid, Qa)));
      }
      this.sessionRecording &&
        !this._replayDebugPropertiesPaused &&
        ou(e) &&
        ((this._replayDebugPropertiesPaused = !0),
        setTimeout(() => (this._replayDebugPropertiesPaused = !1), 3e4));
      let S = _.filter(({ channel: e, update: t }) => {
        let n =
          l.$set?.[e.property] ?? (P(l.properties?.$set) ? l.properties.$set[e.property] : void 0);
        return t?.pending && n === t.value;
      });
      this._internalEventEmitter.emit(`eventCaptured`, l);
      let C = n?._url ?? this.requestRouter.endpointFor(`api`, this.analyticsDefaultEndpoint),
        T = n?._batchKey === `recordings` || /\/s\/(?:\?|$)/.test(C),
        ee = V(
          V(
            V(
              {
                method: `POST`,
                url: C,
                data: l,
                compression: `best-available`,
                preferSyncCompression: n?.send_instantly,
                timestampMode: T ? `body` : `capture-body`,
                batchKey: n?._batchKey,
              },
              T && l.properties?.$session_id
                ? {
                    batchGroup:
                      l.properties.$session_id +
                      (l.properties.$window_id ? `-${l.properties.$window_id}` : ``),
                  }
                : {},
            ),
            n?.transport ? { transport: n.transport } : {},
          ),
          S.length
            ? {
                fireCallbackOnDrop: !0,
                callback: (e) => {
                  if (e.statusCode >= 200 && 300 > e.statusCode)
                    for (let { channel: e, update: t } of S)
                      this._markMetaIdentifierDelivered(e, t.value);
                },
              }
            : {},
        );
      if (!this.config.request_batching || (n && !n?._batchKey) || n?.send_instantly) {
        let e;
        (!ee.transport &&
          !ee.callback &&
          Nt(this.config.request_headers ?? {}) &&
          this._isPageUnloading &&
          (e = `sendBeacon`),
          this._send_retriable_request(ee, e));
      } else this._requestQueue.enqueue(ee);
      return l;
    }
    _addCaptureHook(e) {
      return this.on(`eventCaptured`, (t) => e(t.event, t));
    }
    getExtension(e) {
      return this._browserClientAdapter?.getExtension(e);
    }
    _getBrowserClientAdapter() {
      return (this._browserClientAdapter ??= new Xl(this));
    }
    _registerExtensionEventProperties(e) {
      this._extensionEventPropertyProducers.push(e);
      let t = !0;
      return () => {
        if (!t) return;
        t = !1;
        let n = this._extensionEventPropertyProducers.indexOf(e);
        n !== -1 && this._extensionEventPropertyProducers.splice(n, 1);
      };
    }
    _processCookieIdentityChange(e = !0) {
      var t, n;
      return (
        !!this.persistence?.consumeCookieIdentityChange() &&
        ((this._cachedPersonProperties = null),
        this.persistence.get_property(`$user_state`) === `anonymous` &&
          ((n = this.sessionPersistence) == null || n.clear(),
          this._sessionRegisteredPropKeys.clear(),
          this._persistSessionRegisteredPropKeys()),
        (t = this.featureFlags) == null || t.reset(),
        e && this.reloadFeatureFlags(),
        !0)
      );
    }
    calculateEventProperties(t, n, r, i, a) {
      if (((r ||= new Date()), !this.persistence || !this.sessionPersistence)) return n;
      (this._syncCookielessIdentity(),
        this.persistence.syncCookieProperties(),
        this._processCookieIdentityChange());
      let o = a ? void 0 : this.persistence.remove_event_timer(t),
        s = V({}, n);
      if (
        ((s.token = this.config.token),
        (s.$config_defaults = this.config.defaults),
        this._inCookielessMode() && (s[Ke] = !0),
        t === `$snapshot`)
      ) {
        let e = V(V({}, this.persistence.properties()), this.sessionPersistence.properties());
        return (
          (s.distinct_id = e.distinct_id),
          ((!I(s.distinct_id) && !z(s.distinct_id)) || Pt(s.distinct_id)) &&
            H.error(
              `Invalid distinct_id for replay event. This indicates a bug in your implementation`,
            ),
          s
        );
      }
      let c = (function (t, n, r, i = !1) {
        var a, o, s;
        if (!xt) return {};
        let c = t ? [...js, ...(n || [])] : [],
          [l, u] = Qn(xt),
          [d, f] = (function (e) {
            for (let t = 0; nr.length > t; t++) {
              let [n, r, i] = nr[t],
                a = e.match(n);
              if (a) return [r, ((i && e.match(i)) || a)?.[1] || ``];
            }
            return [``, ``];
          })(xt),
          p = (function () {
            return (`u` > typeof navigator ? navigator : void 0)?.brave ? { brave: !0 } : {};
          })(),
          m = {};
        F(r) || (m.detectGoogleSearchApp = r);
        let h = {},
          g = (a = navigator) == null || (a = a.userAgentData) == null ? void 0 : a.platform,
          _ = navigator?.maxTouchPoints,
          v = O == null || (o = O.screen) == null ? void 0 : o.width,
          y = O == null || (s = O.screen) == null ? void 0 : s.height,
          b = O?.devicePixelRatio;
        (F(g) || (h.userAgentDataPlatform = g),
          F(_) || (h.maxTouchPoints = _),
          F(v) || (h.screenWidth = v),
          F(y) || (h.screenHeight = y),
          F(b) || (h.devicePixelRatio = b));
        let x = G(
          Va({
            $os: l,
            $os_version: u,
            $browser: Jn(xt, navigator.vendor, p, m),
            $webview_app: d,
            $webview_app_version: f,
            $device: $n(xt),
            $device_type: er(xt, h),
            $timezone: Ss(),
            $timezone_offset: Ws(),
          }),
          {
            $current_url: ks(i ? fr(gt?.href) : gt?.href, c, Ns),
            $host: gt?.host,
            $pathname: gt?.pathname,
            $raw_user_agent: xt.length > 1e3 ? xt.substring(0, 997) + `...` : xt,
            $browser_version: Xn(xt, navigator.vendor, p, m),
            $browser_language: Rs(),
            $browser_language_prefix: zs(),
            $screen_height: O?.screen.height,
            $screen_width: O?.screen.width,
            $viewport_height: O?.innerHeight,
            $viewport_width: O?.innerWidth,
            $lib: e.LIB_NAME,
            $lib_version: e.LIB_VERSION,
            $insert_id:
              Math.random().toString(36).substring(2, 10) +
              Math.random().toString(36).substring(2, 10),
            $time: Date.now() / 1e3,
          },
        );
        return (e.SDK_DIST_CHANNEL && (x.$sdk_dist_channel = e.SDK_DIST_CHANNEL), x);
      })(
        this.config.mask_personal_data_properties,
        this.config.custom_personal_data_properties,
        this.config.detect_google_search_app,
        this.config.disable_capture_url_hashes,
      );
      if (this.sessionManager) {
        let { sessionId: e, windowId: t } = this.sessionManager.checkAndGetSessionAndWindowId(
          a,
          r.getTime(),
          !0,
        );
        ((s.$session_id = e), (s.$window_id = t));
      }
      this.sessionPropsManager && G(s, this.sessionPropsManager.getSessionProps());
      try {
        if (this.sessionRecording) {
          let e = this.sessionRecording.sdkDebugProperties,
            n = !this._replayDebugPropertiesPaused && ou(t);
          for (let t in e) (n || j(iu, t)) && (s[t] = e[t]);
        }
        s.$sdk_debug_retry_queue_size = this._retryQueue?.length;
      } catch (e) {
        s.$sdk_debug_error_capturing_properties = String(e);
      }
      let l;
      if (
        (this.requestRouter.region === Pl && (s.$lib_custom_api_host = this.config.api_host),
        (l =
          t !== `$pageview` || a
            ? t !== `$pageleave` || a
              ? this.pageViewManager.doEvent()
              : this.pageViewManager.doPageLeave(r)
            : this.pageViewManager.doPageView(r, i)),
        (s = G(s, l)),
        t === `$pageview` && k && (s.title = k.title),
        !F(o))
      ) {
        let e = r.getTime() - o;
        s.$duration = parseFloat((e / 1e3).toFixed(3));
      }
      xt &&
        this.config.opt_out_useragent_filter &&
        (s.$browser_type = this._is_bot() ? `bot` : `browser`);
      let u = this.persistence.properties(),
        d = this.sessionPersistence.properties(),
        f = s.$groups,
        p = u.$groups;
      (P(f) && !Nt(f) && (s.$groups = V(V({}, P(p) ? p : {}), f)),
        W([`$referrer`, `$referring_domain`], (e) => {
          e in u && delete d[e];
        }));
      let m = {};
      if (this._extensionEventPropertyProducers.length > 0)
        for (let e of this._extensionEventPropertyProducers.slice())
          try {
            G(m, e());
          } catch (e) {
            H.error(`Failed to produce browser extension event properties`, e);
          }
      ((s = G({}, c, u, d, V(V({}, m), s))),
        (s.$is_identified = this._isIdentified()),
        M(this.config.property_denylist)
          ? W(this.config.property_denylist, function (e) {
              delete s[e];
            })
          : H.error(
              ru +
                this.config.property_denylist +
                ` or property_blacklist config: ` +
                this.config.property_blacklist,
            ));
      let h = this.config.sanitize_properties;
      h && (H.error(nu), (s = h(s, t)));
      let g = this._hasPersonProcessing();
      return (
        (s.$process_person_profile = g),
        g && !a && this._requirePersonProcessing(`_calculate_event_properties`),
        s
      );
    }
    _calculate_set_once_properties(e, t = !0, n = !1) {
      if (
        !this.persistence ||
        !this._hasPersonProcessing() ||
        (this._personProcessingSetOncePropertiesSent && !n)
      )
        return e;
      let r = this.persistence.get_initial_props(),
        i = this.sessionPropsManager?.getSetOnceProps(),
        a = G({}, r, i || {}, e || {}),
        o = this.config.sanitize_properties;
      return (
        o && (H.error(nu), (a = o(a, `$set_once`))),
        t && (this._personProcessingSetOncePropertiesSent = !0),
        Nt(a) ? void 0 : a
      );
    }
    register(e, t) {
      var n;
      (n = this.persistence) == null || n.register(e, t);
    }
    register_once(e, t, n) {
      var r;
      (r = this.persistence) == null || r.register_once(e, t, n);
    }
    register_for_session(e) {
      var t, n;
      ((t = this.persistence) == null || t.syncCookieProperties(),
        this._processCookieIdentityChange(),
        (n = this.sessionPersistence) == null || n.register(e),
        Object.keys(e).forEach((e) => this._sessionRegisteredPropKeys.add(e)),
        this._persistSessionRegisteredPropKeys());
    }
    unregister(e) {
      var t;
      (t = this.persistence) == null || t.unregister(e);
    }
    unregister_for_session(e) {
      var t;
      ((t = this.sessionPersistence) == null || t.unregister(e),
        this._sessionRegisteredPropKeys.delete(e),
        this._persistSessionRegisteredPropKeys());
    }
    _register_single(e, t) {
      this.register({ [e]: t });
    }
    _clearSessionRegisteredProps() {
      (this._sessionRegisteredPropKeys.forEach((e) => {
        var t;
        (t = this.sessionPersistence) == null || t.unregister(e);
      }),
        this._sessionRegisteredPropKeys.clear(),
        this._persistSessionRegisteredPropKeys());
    }
    _persistSessionRegisteredPropKeys() {
      if (!this._sessionRegisteredPropertiesStorageKey) return;
      if (
        this.config.persistence === `memory` ||
        this.sessionPersistence?._disabled ||
        !Y._is_supported()
      )
        return void Y._remove(this._sessionRegisteredPropertiesStorageKey);
      let e = [];
      (this._sessionRegisteredPropKeys.forEach((t) => e.push(t)),
        e.length > 0
          ? Y._set(this._sessionRegisteredPropertiesStorageKey, e)
          : Y._remove(this._sessionRegisteredPropertiesStorageKey));
    }
    getFeatureFlag(e, t) {
      return this.featureFlags?.getFeatureFlag(e, t);
    }
    getFeatureFlagPayload(e) {
      return this.featureFlags?.getFeatureFlagPayload(e);
    }
    getFeatureFlagResult(e, t) {
      return this.featureFlags?.getFeatureFlagResult(e, t);
    }
    getAllFeatureFlags() {
      return this.featureFlags?.getAllFeatureFlags() ?? [];
    }
    isFeatureEnabled(e, t) {
      return this.featureFlags?.isFeatureEnabled(e, t) ?? t?.defaultValue;
    }
    reloadFeatureFlags() {
      var e;
      (e = this.featureFlags) == null || e.reloadFeatureFlags();
    }
    updateFlags(e, t, n) {
      var r;
      (r = this.featureFlags) == null || r.updateFlags(e, t, n);
    }
    updateEarlyAccessFeatureEnrollment(e, t, n) {
      var r;
      (r = this.featureFlags) == null || r.updateEarlyAccessFeatureEnrollment(e, t, n);
    }
    getEarlyAccessFeatures(e, t = !1, n) {
      return this.featureFlags?.getEarlyAccessFeatures(e, t, n);
    }
    on(e, t) {
      return this._internalEventEmitter.on(e, t);
    }
    onFeatureFlags(e) {
      return this.featureFlags
        ? this.featureFlags.onFeatureFlags(e)
        : (e([], {}, { errorsLoading: !0 }), () => {});
    }
    onSurveysLoaded(e) {
      return this.surveys
        ? this.surveys.onSurveysLoaded(e)
        : (e([], { isLoaded: !1, error: tu }), () => {});
    }
    onSessionId(e) {
      return this.sessionManager?.onSessionId(e) ?? (() => {});
    }
    getSurveys(e, t = !1) {
      this.surveys ? this.surveys.getSurveys(e, t) : e([], { isLoaded: !1, error: tu });
    }
    getActiveMatchingSurveys(e, t = !1) {
      this.surveys
        ? this.surveys.getActiveMatchingSurveys(e, t)
        : e([], { isLoaded: !1, error: tu });
    }
    onActiveMatchingSurveysChanged(e) {
      return this.surveys
        ? this.surveys.onActiveMatchingSurveysChanged(e)
        : (e([], { isLoaded: !1, error: tu }), () => {});
    }
    renderSurvey(e, t) {
      var n;
      (n = this.surveys) == null || n.renderSurvey(e, t);
    }
    displaySurvey(e, t = Vl) {
      var n;
      (n = this.surveys) == null || n.displaySurvey(e, t);
    }
    cancelPendingSurvey(e) {
      var t;
      (t = this.surveys) == null || t.cancelPendingSurvey(e);
    }
    canRenderSurvey(e) {
      return this.surveys?.canRenderSurvey(e) ?? { visible: !1, disabledReason: tu };
    }
    canRenderSurveyAsync(e, t = !1) {
      return (
        this.surveys?.canRenderSurveyAsync(e, t) ??
        Promise.resolve({ visible: !1, disabledReason: tu })
      );
    }
    _validateIdentifyId(e) {
      return !e || Pt(e)
        ? (H.critical(`Unique user id has not been set in posthog.identify`), !1)
        : e === `$posthog_cookieless`
          ? (H.critical(
              `The string "${e}" was set in posthog.identify which indicates an error. This ID is only used as a sentinel value.`,
            ),
            !1)
          : (![`distinct_id`, `distinctid`].includes(e.toLowerCase()) &&
              ![`undefined`, `null`].includes(e.toLowerCase())) ||
            (H.critical(
              `The string "${e}" was set in posthog.identify which indicates an error. This ID should be unique to the user and not a hardcoded string.`,
            ),
            !1);
    }
    identify(e, t, n) {
      if (!this.__loaded || !this.persistence) return H.uninitializedWarning(`posthog.identify`);
      if (
        (z(e) &&
          ((e = e.toString()),
          H.warn(
            `The first argument to posthog.identify was a number, but it should be a string. It has been converted to a string.`,
          )),
        !this._validateIdentifyId(e) || !this._requirePersonProcessing(`posthog.identify`))
      )
        return;
      this._syncCookielessIdentity();
      let r = this.get_distinct_id(),
        i = this.persistence.syncCookieProperties() && this.get_distinct_id() !== r,
        a = this._processCookieIdentityChange(!1),
        o = this.persistence._beginCookieSyncSuppression(),
        s = !1;
      try {
        let r = this.get_distinct_id();
        (this.register({ $user_id: e }),
          this.get_property(`$device_id`) ||
            this.register_once({ $had_persisted_distinct_id: !0, $device_id: r }, ``),
          e !== r &&
            e !== this.get_property(`__alias`) &&
            (this.unregister(S), this.register({ distinct_id: e })));
        let o = (this.persistence.get_property(`$user_state`) || `anonymous`) === ot,
          l = e !== r,
          u = !l && o;
        if (l && o) {
          var c;
          let i = this.config.reuseAnonymousId
            ? { distinct_id: e }
            : { distinct_id: e, $anon_distinct_id: r };
          (this.persistence.set_property(Re, st),
            this.setPersonPropertiesForFlags({ $set: t || {}, $set_once: n || {} }, !1),
            this.config.cookieWinsOnConflict && this.persistence._publishSuppressedCookieSnapshot(),
            this.capture(`$identify`, i, { $set: t || {}, $set_once: n || {} }) &&
              (this._cachedPersonProperties = Nl(e, t, n)),
            (c = this.featureFlags) == null ||
              c.setAnonymousDistinctId(this.config.reuseAnonymousId ? void 0 : r));
        } else if (u) {
          this.persistence.set_property(Re, st);
          let r = t || {},
            i = n || {};
          (this.setPersonPropertiesForFlags({ $set: r, $set_once: i }, !1),
            this.config.cookieWinsOnConflict && this.persistence._publishSuppressedCookieSnapshot(),
            this.capture(`$set`, { $set: r, $set_once: i }) &&
              (this._cachedPersonProperties = Nl(e, t, n)));
        } else (t || n) && this.setPersonProperties(t, n);
        (l || i || a
          ? (this.reloadFeatureFlags(),
            this.featureFlags ? this.featureFlags.resetFlagCallReported() : this.unregister(f))
          : u && (t || n) && this.reloadFeatureFlags(),
          (s = !0));
      } finally {
        o && this.persistence._endCookieSyncSuppression(s);
      }
    }
    setPersonProperties(e, t) {
      if ((!e && !t) || !this._requirePersonProcessing(`posthog.setPersonProperties`)) return;
      let n = Nl(this.get_distinct_id(), e, t);
      this._cachedPersonProperties === n
        ? H.info(
            `A duplicate setPersonProperties call was made with the same properties. It has been ignored.`,
          )
        : (this.setPersonPropertiesForFlags({ $set: e || {}, $set_once: t || {} }, !0),
          this.capture(`$set`, { $set: e || {}, $set_once: t || {} }) &&
            (this._cachedPersonProperties = n));
    }
    unsetPersonProperties(e) {
      var t;
      let n = (M(e) ? e : [e]).filter((e) => I(e) && e.length > 0);
      n.length !== 0 &&
        this._requirePersonProcessing(`posthog.unsetPersonProperties`) &&
        ((t = this.featureFlags) == null || t.unsetPersonPropertiesForFlags(n, !0),
        this.capture(`$set`, { $unset: n }),
        (this._cachedPersonProperties = null));
    }
    group(e, t, n) {
      var r;
      if (!e || !t) return void H.error(`posthog.group requires a group type and group key`);
      ((r = this.persistence) == null || r.syncCookieProperties(),
        this._processCookieIdentityChange());
      let i = this.getGroups(),
        a = i[e] !== t;
      if (
        (a && this.resetGroupPropertiesForFlags(e),
        this.register({ $groups: V(V({}, i), {}, { [e]: t }) }),
        (a || n) && this._hasPersonProcessing())
      ) {
        let r = { $group_type: e, $group_key: t };
        (n && (r.$group_set = n), this.capture(pt, r));
      }
      (n && this.setGroupPropertiesForFlags({ [e]: n }), a && !n && this.reloadFeatureFlags());
    }
    resetGroups() {
      (this.register({ $groups: {} }),
        this.resetGroupPropertiesForFlags(),
        this.reloadFeatureFlags());
    }
    setPersonPropertiesForFlags(e, t = !0) {
      var n;
      (n = this.featureFlags) == null || n.setPersonPropertiesForFlags(e, t);
    }
    resetPersonPropertiesForFlags(e = !0) {
      var t;
      (t = this.featureFlags) == null || t.resetPersonPropertiesForFlags(e);
    }
    setGroupPropertiesForFlags(e, t = !0) {
      var n;
      this._requirePersonProcessing(`posthog.setGroupPropertiesForFlags`) &&
        ((n = this.featureFlags) == null || n.setGroupPropertiesForFlags(e, t));
    }
    resetGroupPropertiesForFlags(e) {
      var t;
      (t = this.featureFlags) == null || t.resetGroupPropertiesForFlags(e);
    }
    reset(e) {
      let t = It(e) ? e : e?.resetDeviceID,
        n = It(e) || e == null ? void 0 : e.bootstrap;
      this._reset(t, !1, n);
    }
    _reset(e, t = !1, n) {
      var r, i, a, o, s;
      if ((H.info(`reset`), !this.__loaded)) return H.uninitializedWarning(`posthog.reset`);
      let c = n?.sessionID;
      ((this.config.bootstrap = n || this._originalUserConfig?.bootstrap || {}),
        (r = this.featureFlags) == null ||
          (i = r.updateConfig) == null ||
          i.call(r, this.config, this._shouldDisableFlags()));
      let l = this.get_property(b),
        u = this.get_property(x),
        d = this.get_property(de);
      (a = this.sessionRecording) == null || a.flushBeforeIdentityReset();
      let f = this.is_capturing();
      (t || this.consent.reset(),
        t ||
          !f ||
          this.is_capturing() ||
          console.warn(
            `[PostHog.js]`,
            "reset() cleared the stored consent, and capturing is now off because of `opt_out_capturing_by_default`. Call opt_in_capturing() again, and prefer calling reset() before opting in rather than after.",
          ));
      let p =
          (o = this.persistence) == null || (s = o._beginCookieSyncSuppression) == null
            ? void 0
            : s.call(o),
        m = this._isConsentTransition;
      this._isConsentTransition = m || t;
      let h = !1;
      try {
        var g, _, v, y, S, C, w, T, E, ee, te, ne;
        if (
          ((g = this.persistence) == null || g.clear(),
          (_ = this.sessionPersistence) == null || _.clear(),
          this._sessionRegisteredPropKeys.clear(),
          this._persistSessionRegisteredPropKeys(),
          F(d) ||
            (ee = this.persistence) == null ||
            ee.register({ $session_recording_remote_config: d }),
          (v = this.surveys) == null || v.reset(),
          (y = this.featureFlags) == null || y.reset(),
          (S = this.conversations) == null || S.reset(),
          (C = this.logs) == null || C.reset(),
          (w = this.metrics) == null || w.reset(),
          (T = this.persistence) == null || T.set_property(`$user_state`, `anonymous`),
          (E = this.sessionManager) == null || E.resetSessionId(),
          (this._cachedPersonProperties = null),
          this.config.cookieless_mode === `always`)
        )
          this.register_once({ distinct_id: Ge, $device_id: null }, ``);
        else {
          let t = this.config.get_device_id(Qa());
          (this.register_once({ distinct_id: t, $device_id: e ? t : l }, ``),
            e || F(u) || this.register({ [x]: u }));
        }
        if (
          (this.register({ $last_posthog_reset: new Date().toISOString() }, 1),
          n &&
            (n.distinctID &&
              !this._inCookielessMode() &&
              ((ne = this.persistence) == null ||
                ne.set_property(`$user_state`, n.isIdentifiedID ? `identified` : `anonymous`),
              this.register({ distinct_id: n.distinctID })),
            (te = this.featureFlags) == null || te.initialize(),
            !R(c) && !this.sessionManager?.setBootstrapSessionId(c, !0)))
        ) {
          let e = V({}, n);
          (delete e.sessionID, (this.config.bootstrap = e));
        }
        (delete this.config.identity_distinct_id,
          delete this.config.identity_hash,
          delete this.config.identity_claims,
          (h = !0));
      } finally {
        var D, re;
        ((this._isConsentTransition = m),
          p &&
            ((D = this.persistence) == null ||
              (re = D._endCookieSyncSuppression) == null ||
              re.call(D, h)));
      }
      this.reloadFeatureFlags();
    }
    shutdown(e) {
      var t = this;
      return B(function* () {
        if (!t.__loaded) return void H.uninitializedWarning(`posthog.shutdown`);
        ((t._isShutdown = !0),
          clearTimeout(t._extensionInitTimeout),
          (t._extensionInitTimeout = void 0));
        let e = t._featureFlagsReloadingUnsubscribe;
        t._featureFlagsReloadingUnsubscribe = void 0;
        for (let n of [
          () => t.sessionRecording?.dispose(),
          () => t.logs?.flushLogs(`sendBeacon`),
          () => t.metrics?.flush(`sendBeacon`),
          () => t.metrics?.dispose(),
          () => t.logs?.dispose(),
          () => t.surveys?.dispose(),
          () => t.autocapture?.dispose(),
          () => e?.(),
          () => t._requestQueue?.unload(),
          () => t._retryQueue?.unload(),
          () => t.featureFlags?.destroy(),
          () => t.persistence?.destroy(),
          () => t.sessionPersistence?.destroy(),
        ])
          try {
            let e = n();
            e &&
              N(e.then) &&
              e.then(void 0, (e) => {
                H.error(`Error during shutdown`, e);
              });
          } catch (e) {
            H.error(`Error during shutdown`, e);
          }
      })();
    }
    setIdentity(e, t) {
      var n;
      (delete this.config.identity_claims,
        (this.config.identity_distinct_id = e),
        (this.config.identity_hash = t),
        this.alias(e),
        (n = this.conversations) == null || n._onIdentityChanged());
    }
    clearIdentity() {
      var e;
      (delete this.config.identity_distinct_id,
        delete this.config.identity_hash,
        delete this.config.identity_claims,
        (e = this.conversations) == null || e._onIdentityCleared());
    }
    get_distinct_id() {
      return this.get_property(`distinct_id`);
    }
    getGroups() {
      return this.get_property(`$groups`) || {};
    }
    get_session_id() {
      return this.sessionManager?.checkAndGetSessionAndWindowId(!0).sessionId ?? ``;
    }
    get_session_replay_url(e) {
      if (!this.sessionManager) return ``;
      let { sessionId: t, sessionStartTimestamp: n } =
          this.sessionManager.checkAndGetSessionAndWindowId(!0),
        r = this.requestRouter.endpointFor(`ui`, `/project/${this.config.token}/replay/${t}`);
      if (e?.withTimestamp && n) {
        let t = e.timestampLookBack ?? 10;
        if (!n) return r;
        r += `?t=${Math.max(Math.floor((new Date().getTime() - n) / 1e3) - t, 0)}`;
      }
      return r;
    }
    alias(e, t) {
      return e === this.get_property(`$people_distinct_id`)
        ? (H.critical(`Attempting to create alias for existing People user - aborting.`), -2)
        : this._requirePersonProcessing(`posthog.alias`)
          ? (F(t) && (t = this.get_distinct_id()),
            e === t
              ? (H.warn(`alias matches current distinct_id - skipping api call.`),
                this.identify(e),
                -1)
              : (this._register_single(S, e),
                this.capture(`$create_alias`, { alias: e, distinct_id: t })))
          : void 0;
    }
    set_config(e) {
      let n = V({}, this.config);
      if (P(e)) {
        var r, i, a, o, s, c, l, u, d, f, p, m, h, g;
        G(this.config, hu(e));
        let x = this._is_persistence_disabled();
        if (this.persistence) {
          let e =
            this.config.persistence === `sessionStorage` || this.config.persistence === `memory`;
          var _, v;
          if (
            (e &&
              this.sessionPersistence !== this.persistence &&
              ((_ = this.sessionPersistence) == null || _.remove(),
              (v = this.sessionPersistence) == null || v.destroy()),
            this.persistence.update_config(this.config, n, x),
            e)
          )
            this.sessionPersistence = this.persistence;
          else if (this.sessionPersistence === this.persistence)
            this.sessionPersistence = new nc(
              V(V({}, this.config), {}, { persistence: `sessionStorage` }),
              x,
              !1,
            );
          else {
            var y;
            (y = this.sessionPersistence) == null ||
              y.update_config(
                V(V({}, this.config), {}, { persistence: `sessionStorage` }),
                V(V({}, n), {}, { persistence: `sessionStorage` }),
                x,
              );
          }
        }
        let S = this._checkLocalStorageForDebug(this.config.debug);
        var b;
        (It(S) && (this.config.debug = S),
          It(this.config.debug) &&
            (this.config.debug
              ? ((t.DEBUG = !0),
                J._is_supported() && J._set(`ph_debug`, !0),
                H.info(`set_config`, { config: e, oldConfig: n, newConfig: V({}, this.config) }))
              : ((t.DEBUG = !1), J._is_supported() && J._remove(`ph_debug`))),
          (r = this.featureFlags) == null ||
            (i = r.updateConfig) == null ||
            i.call(r, this.config, this._shouldDisableFlags()),
          (a = this.exceptionObserver) == null || a.onConfigChange(),
          (o = this.exceptions) == null || o.onConfigChange(),
          (s = this.metrics) == null || s.onConfigChange(),
          (c = this.webMCP) == null || c.startIfEnabled(),
          (l = this.sessionRecording) == null || l.startIfEnabledOrStop(),
          (u = this.tracingHeaders) == null || u.startIfEnabledOrStop(),
          (d = this.autocapture) == null || d.startIfEnabled(),
          (f = this.heatmaps) == null || f.startIfEnabled(),
          (`capture_pageview` in e || `disable_capture_url_hashes` in e) &&
            ((b = this.historyAutocapture) == null || b.startIfEnabledOrStop()),
          (p = this.exceptionObserver) == null || p.startIfEnabledOrStop(),
          (m = this.deadClicksAutocapture) == null || m.startIfEnabledOrStop(),
          (h = this.surveys) == null || h.loadIfEnabled(),
          this._sync_opt_out_with_persistence(),
          (g = this.externalIntegrations) == null || g.startIfEnabledOrStop(),
          !n.segment && this.config.segment && this.persistence && ms(this, $l, !1));
      }
    }
    _overrideSDKInfo(e, n) {
      ((t.LIB_NAME = e), (t.LIB_VERSION = n));
    }
    startSessionRecording(e) {
      let t = !0 === e,
        n = {
          sampling: t || !!e?.sampling,
          linked_flag: t || !!e?.linked_flag,
          url_trigger: t || !!e?.url_trigger,
          event_trigger: t || !!e?.event_trigger,
        };
      var r, i, a, o, s;
      (Object.values(n).some(Boolean) &&
        ((r = this.sessionManager) == null || r.checkAndGetSessionAndWindowId(),
        n.sampling && ((i = this.sessionRecording) == null || i.overrideSampling()),
        n.linked_flag && ((a = this.sessionRecording) == null || a.overrideLinkedFlag()),
        n.url_trigger && ((o = this.sessionRecording) == null || o.overrideTrigger(`url`)),
        n.event_trigger && ((s = this.sessionRecording) == null || s.overrideTrigger(`event`))),
        this.set_config({ disable_session_recording: !1 }));
    }
    stopSessionRecording() {
      this.set_config({ disable_session_recording: !0 });
    }
    sessionRecordingStarted() {
      return !!this.sessionRecording?.started;
    }
    captureException(e, t) {
      try {
        if (!this.exceptions) return;
        let n = this.exceptions.buildProperties(e, {
          handled: !0,
          syntheticException: Error(`PostHog syntheticException`),
        });
        return this.exceptions.sendExceptionEvent(V(V({}, n), t));
      } catch {
        return;
      }
    }
    addExceptionStep(e, t) {
      var n;
      (n = this.exceptions) == null || n.addExceptionStep(e, t);
    }
    captureLog(e) {
      var t;
      (t = this.logs) == null || t.captureLog(e);
    }
    get logger() {
      return this.logs?.logger ?? n._noopLogger;
    }
    startExceptionAutocapture(e) {
      this.set_config({ capture_exceptions: e == null || e });
    }
    stopExceptionAutocapture() {
      this.set_config({ capture_exceptions: !1 });
    }
    loadToolbar(e) {
      var t;
      return (t = this.toolbar?.loadToolbar(e)) != null && t;
    }
    get_property(e) {
      return this.persistence?.props[e];
    }
    getSessionProperty(e) {
      return this.sessionPersistence?.props[e];
    }
    toString() {
      let e = this.config.name ?? du;
      return (e !== du && (e = `posthog.` + e), e);
    }
    _isIdentified() {
      return (
        this.persistence?.get_property(`$user_state`) === `identified` ||
        this.sessionPersistence?.get_property(`$user_state`) === `identified`
      );
    }
    _hasPersonProcessing() {
      var e, t;
      return !(
        this.config.person_profiles === `never` ||
        (this.config.person_profiles === `identified_only` &&
          !this._isIdentified() &&
          Nt(this.getGroups()) &&
          !((e = this.persistence) != null && (e = e.props) != null && e.__alias) &&
          !((t = this.persistence) != null && (t = t.props) != null && t.$epp))
      );
    }
    _shouldCapturePageleave() {
      return (
        !0 === this.config.capture_pageleave ||
        (this.config.capture_pageleave === `if_capture_pageview` && !!this.config.capture_pageview)
      );
    }
    createPersonProfile() {
      this._hasPersonProcessing() ||
        (this._requirePersonProcessing(`posthog.createPersonProfile`) &&
          this.setPersonProperties({}, {}));
    }
    setInternalOrTestUser() {
      this._requirePersonProcessing(`posthog.setInternalOrTestUser`) &&
        this.setPersonProperties({ $internal_or_test_user: !0 });
    }
    _requirePersonProcessing(e) {
      return this.config.person_profiles === `never`
        ? (H.error(
            e + ` was called, but process_person is set to "never". This call will be ignored.`,
          ),
          !1)
        : (this._warnIfVolatileIdentityWithoutStableId(), this._register_single(We, !0), !0);
    }
    _is_persistence_disabled() {
      if (this.config.cookieless_mode === `always`) return !0;
      let e = this.consent.isOptedOut();
      return (
        this.config.disable_persistence ||
        (e &&
          !(
            !this.config.opt_out_persistence_by_default &&
            this.config.cookieless_mode !== `on_reject`
          ))
      );
    }
    _sync_opt_out_with_persistence() {
      let e = this._is_persistence_disabled();
      var t, n, r;
      return (
        this.is_capturing() || (t = this.logs) == null || t._onOptOut(),
        this.persistence?._disabled !== e && ((n = this.persistence) == null || n.set_disabled(e)),
        this.sessionPersistence?._disabled !== e &&
          ((r = this.sessionPersistence) == null || r.set_disabled(e)),
        this._persistSessionRegisteredPropKeys(),
        e
      );
    }
    opt_in_capturing(e) {
      var t;
      if (this.config.cookieless_mode !== `always`) {
        if (this._inCookielessMode()) {
          var r, i, a;
          ((r = this.sessionRecording) == null || r.dispose({ discardBufferedEvents: !0 }),
            this._reset(!0, !0),
            (i = this.sessionManager) == null || i.destroy(),
            (a = this.pageViewManager) == null || a.destroy(),
            (this.sessionManager = new wl(this)),
            (this.pageViewManager = new vs(this)),
            this.persistence &&
              (this.sessionPropsManager = new bl(this, this.sessionManager, this.persistence)));
          let e =
            this.config.__extensionClasses?.sessionRecording ??
            n.__defaultExtensionClasses?.sessionRecording;
          var o, s;
          e &&
            ((this.sessionRecording = this._replaceExtension(this.sessionRecording, new e(this))),
            this._lastRemoteConfig &&
              ((o = this.sessionRecording) == null ||
                (s = o.onRemoteConfig) == null ||
                s.call(o, this._lastRemoteConfig)));
        }
        var c;
        (this.consent.optInOut(!0),
          this._sync_opt_out_with_persistence(),
          this._start_queue_if_opted_in(),
          (t = this.sessionRecording) == null || t.startIfEnabledOrStop(),
          this.config.cookieless_mode == `on_reject` &&
            ((c = this.surveys) == null || c.loadIfEnabled()),
          (F(e?.captureEventName) || (e != null && e.captureEventName)) &&
            this.capture(e?.captureEventName ?? `$opt_in`, e?.captureProperties, {
              send_instantly: !0,
            }),
          this.config.capture_pageview && this._captureInitialPageview());
      } else H.warn(eu);
    }
    opt_out_capturing() {
      this.config.cookieless_mode === `always`
        ? H.warn(eu)
        : (this.consent.optInOut(!1),
          this._sync_opt_out_with_persistence(),
          this.config.cookieless_mode === `on_reject` && this._enterCookielessMode());
    }
    _enterCookielessMode() {
      var e, t;
      let n = this.sessionRecording;
      (n?.dispose({ discardBufferedEvents: !0 }),
        this.get_distinct_id() !== `$posthog_cookieless` && this._reset(!0, !0),
        this.register({ distinct_id: Ge, $device_id: null }),
        this._removeExtension(n),
        (this.sessionRecording = void 0),
        (e = this.sessionManager) == null || e.destroy(),
        (t = this.pageViewManager) == null || t.destroy(),
        (this.sessionManager = void 0),
        (this.sessionPropsManager = void 0),
        this.config.capture_pageview && this._captureInitialPageview(),
        this._start_queue_if_opted_in());
    }
    has_opted_in_capturing() {
      return this.consent.isOptedIn();
    }
    has_opted_out_capturing() {
      return this.consent.isOptedOut();
    }
    get_explicit_consent_status() {
      let e = this.consent.consent;
      return e === 1 ? `granted` : e === 0 ? `denied` : `pending`;
    }
    is_capturing() {
      return (
        !this._isConsentTransition &&
        (this.config.cookieless_mode === `always` ||
          (this.config.cookieless_mode === `on_reject`
            ? this.consent.isRejected() || this.consent.isOptedIn()
            : !this.has_opted_out_capturing()))
      );
    }
    clear_opt_in_out_capturing() {
      (this.consent.reset(), this._sync_opt_out_with_persistence());
    }
    _is_bot() {
      return ht ? Tl(ht, this.config.custom_blocked_useragents) : void 0;
    }
    _captureInitialPageview() {
      k &&
        (k.visibilityState === `visible`
          ? this._initialPageviewCaptured ||
            ((this._initialPageviewCaptured = !0),
            this.capture(ut, { title: k.title }, { send_instantly: !0 }),
            (this._visibilityStateListener &&=
              (k.removeEventListener(_, this._visibilityStateListener), null)))
          : this._visibilityStateListener ||
            ((this._visibilityStateListener = this._captureInitialPageview.bind(this)),
            K(k, _, this._visibilityStateListener)));
    }
    debug(e) {
      !1 === e
        ? (O?.console.log(`You've disabled debug mode.`), this.set_config({ debug: !1 }))
        : (O?.console.log(
            "You're now in debug mode. All calls to PostHog will be logged in your console.\nYou can disable this with `posthog.debug(false)`.",
          ),
          this.set_config({ debug: !0 }));
    }
    _shouldDisableFlags() {
      let e = this._originalUserConfig || {};
      return `advanced_disable_flags` in e
        ? !!e.advanced_disable_flags
        : !1 === this.config.advanced_disable_flags
          ? !0 === this.config.advanced_disable_decide
            ? (H.warn(
                `Config field 'advanced_disable_decide' is deprecated. Please use 'advanced_disable_flags' instead. The old field will be removed in a future major version.`,
              ),
              !0)
            : (function (e, t, n, r, i) {
                let a = t in e && !R(e[t]),
                  o = n in e && !R(e[n]);
                return a
                  ? e[t]
                  : !!o &&
                      (i &&
                        i.warn(
                          `Config field '${n}' is deprecated. Please use '${t}' instead. The old field will be removed in a future major version.`,
                        ),
                      e[n]);
              })(e, `advanced_disable_flags`, `advanced_disable_decide`, 0, H)
          : !!this.config.advanced_disable_flags;
    }
    _runBeforeSend(e) {
      if (R(this.config.before_send)) return e;
      let t = Object.keys(e.properties ?? {}).filter(Rt),
        n = M(this.config.before_send) ? this.config.before_send : [this.config.before_send],
        r = e;
      for (let t of n)
        try {
          if (((r = t(r)), R(r))) {
            let t = `Event '${e.event}' was rejected in beforeSend function`;
            return (
              Lt(e.event) ? H.warn(`${t}. This can cause unexpected behavior.`) : H.info(t),
              null
            );
          }
          (r.properties && !Nt(r.properties)) ||
            H.warn(
              `Event '${e.event}' has no properties after beforeSend function, this is likely an error.`,
            );
        } catch (t) {
          return (H.error(`Error in beforeSend function for event '${e.event}':`, t), null);
        }
      for (let n of t)
        if (r.properties && R(r.properties[n]))
          return (
            H.warn(
              `Event '${e.event}' had its '${n}' property removed in a beforeSend function. This property is required for ingestion, so the event will be dropped.`,
            ),
            null
          );
      return r;
    }
    getPageViewId() {
      return this.pageViewManager._currentPageview?.pageViewId;
    }
    captureTraceFeedback(e, t) {
      this.capture(`$ai_feedback`, { $ai_trace_id: String(e), $ai_feedback_text: t });
    }
    captureTraceMetric(e, t, n) {
      this.capture(`$ai_metric`, {
        $ai_trace_id: String(e),
        $ai_metric_name: t,
        $ai_metric_value: String(n),
      });
    }
    _checkLocalStorageForDebug(e) {
      let t = It(e) && !e,
        n = J._is_supported() && J._get(`ph_debug`) === `true`;
      return !t && (!!n || e);
    }
  };
((_u.__defaultExtensionClasses = {}),
  (_u._noopLogger = (() => {
    let e = () => {};
    return { trace: e, debug: e, info: e, warn: e, error: e, fatal: e };
  })()),
  (function (e, t) {
    for (let n = 0; t.length > n; n++) e.prototype[t[n]] = Ba(e.prototype[t[n]]);
  })(_u, [`identify`]));
var vu = class {
    constructor(e) {
      this.disabled = !1 === e;
      let t = P(e) ? e : {};
      ((this.thresholdPx = t.threshold_px || 30),
        (this.timeoutMs = t.timeout_ms || 1e3),
        (this.clickCount = t.click_count || 3),
        (this.clicks = []));
    }
    isRageClick(e, t, n) {
      if (this.disabled) return !1;
      let r = this.clicks[this.clicks.length - 1];
      if (
        r &&
        Math.abs(e - r.x) + Math.abs(t - r.y) < this.thresholdPx &&
        this.timeoutMs > n - r.timestamp
      ) {
        if (
          (this.clicks.push({ x: e, y: t, timestamp: n }), this.clicks.length === this.clickCount)
        )
          return !0;
      } else this.clicks = [{ x: e, y: t, timestamp: n }];
      return !1;
    }
  },
  yu = `$copy_autocapture`,
  bu = U(`[AutoCapture]`);
function xu(e, t) {
  return t.length > e ? t.slice(0, e) + `...` : t;
}
function Su(e) {
  if (e.previousElementSibling) return e.previousElementSibling;
  let t = e;
  do t = t.previousSibling;
  while (t && !xo(t));
  return t;
}
function Cu(
  e,
  {
    e: t,
    maskAllElementAttributes: n,
    maskAllText: r,
    elementAttributeIgnoreList: i,
    elementsChainAsString: a,
    disableCaptureUrlHashes: o,
  },
) {
  if (!xo(e)) return { props: {} };
  let s = [e],
    c = new Set([e]),
    l = e;
  for (; l.parentNode && !So(l, `body`) && 1e3 > s.length; )
    if (wo(l.parentNode)) {
      let e = l.parentNode.host;
      if (c.has(e)) break;
      (c.add(e), s.push(e), (l = e));
    } else {
      if (!xo(l.parentNode) || c.has(l.parentNode)) break;
      (c.add(l.parentNode), s.push(l.parentNode), (l = l.parentNode));
    }
  let u =
    t.type === `click` && e.namespaceURI === `http://www.w3.org/2000/svg`
      ? s.findIndex((e) => So(e, `button`) || So(e, `a`))
      : -1;
  u > 0 && (r ||= s.slice(0, u + 1).some((e) => !Yo(e) || Xo(e)));
  let d = [],
    f = {},
    p,
    m = !1,
    h = !1;
  if (
    (W(s, (e) => {
      let t = Yo(e);
      if (So(e, `a`) && !n && !i?.includes(`href`)) {
        let n = e.getAttribute(`href`);
        m = !!(t && n && is(n)) && (o ? fr(n) : n);
      }
      (j(Do(e), `ph-no-capture`) && (h = !0),
        d.push(
          (function (e, t, n, r, i = !1) {
            let a = e.tagName.toLowerCase(),
              o = { tag_name: a };
            jo.indexOf(a) > -1 &&
              !n &&
              (o.$el_text =
                a.toLowerCase() === `a` || a.toLowerCase() === `button`
                  ? xu(1024, as(e))
                  : xu(1024, ko(e)));
            let s = Do(e);
            (t ||
              (r != null && r.includes(`class`)) ||
              0 >= s.length ||
              (o.classes = s.filter(function (e) {
                return e !== ``;
              })),
              W(e.attributes, function (n) {
                var a;
                if (
                  (!Xo(e) || [`name`, `id`, `class`, `aria-label`].indexOf(n.name) !== -1) &&
                  !r?.includes(n.name) &&
                  !t &&
                  is(n.value) &&
                  (!I((a = n.name)) ||
                    (a.substring(0, 10) !== `_ngcontent` && a.substring(0, 7) !== `_nghost`))
                ) {
                  let e = n.value;
                  (n.name === `class` && (e = To(e).join(` `)),
                    (o[`attr__` + n.name] = xu(1024, n.name === `href` && i ? fr(e) : e)));
                }
              }));
            let c = 1,
              l = 1,
              u = e;
            for (; (u = Su(u)); ) (c++, u.tagName === e.tagName && l++);
            return ((o.nth_child = c), (o.nth_of_type = l), o);
          })(e, n, r, i, o),
        ),
        W(
          (function (e) {
            if (!Yo(e)) return {};
            let t = {};
            return (
              W(e.attributes, function (e) {
                if (e.name && e.name.indexOf(`data-ph-capture-attribute`) === 0) {
                  let n = e.name.replace(`data-ph-capture-attribute-`, ``),
                    r = e.value;
                  n && r && is(r) && (t[n] = r);
                }
              }),
              t
            );
          })(e),
          (e, t) => {
            ({}).hasOwnProperty.call(f, t) || (f[t] = e);
          },
        ));
    }),
    h)
  )
    return { props: {}, explicitNoCapture: h };
  if (
    (u > 0 && ((e = s[u]), d.splice(0, u)),
    r || (d[0].$el_text = So(e, `a`) || So(e, `button`) ? as(e) : ko(e)),
    m)
  ) {
    var g;
    d[0].attr__href = m;
    let e = Ds(m)?.host,
      t = O == null || (g = O.location) == null ? void 0 : g.host;
    e && t && e !== t && (p = m);
  }
  return {
    props: G(
      ((v = t.type), { $event_type: v, $ce_version: 1 }),
      a ? {} : { $elements: d },
      {
        $elements_chain:
          ((_ = d),
          M(_)
            ? (function (e) {
                return e
                  .map((e) => {
                    let t = ``;
                    if ((e.tag_name && (t += e.tag_name), e.attr_class)) {
                      e.attr_class.sort();
                      for (let n of e.attr_class) t += `.${n.replace(/"/g, ``)}`;
                    }
                    let n = V(
                        V(
                          V(
                            V({}, e.text ? { text: e.text } : {}),
                            {},
                            { "nth-child": e.nth_child ?? 0, "nth-of-type": e.nth_of_type ?? 0 },
                            e.href ? { href: e.href } : {},
                          ),
                          e.attr_id ? { attr_id: e.attr_id } : {},
                        ),
                        e.attributes,
                      ),
                      r = {};
                    return (
                      za(n)
                        .sort(([e], [t]) =>
                          (function (e, t) {
                            return t > e ? -1 : +(e > t);
                          })(e, t),
                        )
                        .forEach(([e, t]) => (r[ss(e.toString())] = ss(t.toString()))),
                      (t += `:`),
                      (t += za(r)
                        .map(([e, t]) => `${e}="${t}"`)
                        .join(``)),
                      t
                    );
                  })
                  .join(`;`);
              })(
                (function (e) {
                  return e.map((e) => {
                    let t = {
                      text: e.$el_text?.slice(0, 400),
                      tag_name: e.tag_name,
                      href: e.attr__href?.slice(0, 2048),
                      attr_class: cs(e),
                      attr_id: e.attr__id,
                      nth_child: e.nth_child,
                      nth_of_type: e.nth_of_type,
                      attributes: {},
                    };
                    return (
                      za(e)
                        .filter(([e]) => e.indexOf(`attr__`) === 0)
                        .forEach(([e, n]) => (t.attributes[e] = n)),
                      t
                    );
                  });
                })(_),
              )
            : ``),
      },
      d[0]?.$el_text ? { $el_text: d[0]?.$el_text } : {},
      p && t.type === `click` ? { $external_click_url: p } : {},
      f,
    ),
    target: e,
  };
  var _, v;
}
var wu = class {
    _clearPointer() {
      ((this._pointerDown = void 0),
        clearTimeout(this._pointerExpiry),
        (this._pointerExpiry = void 0));
    }
    _isExcludedPointerTarget(e) {
      if (!Yo(e)) return !0;
      let t = this._refreshConfig().css_selector_ignorelist ?? Fo,
        n = new Set(),
        r = e;
      for (; r; ) {
        if (n.size >= 1e3 || n.has(r)) return !0;
        n.add(r);
        let e = r,
          i = Do(e);
        if (j(i, `ph-no-capture`) || j(i, `ph-sensitive`) || Xo(e) || t.some((t) => Mo(e, t)))
          return !0;
        let a = r.parentNode;
        r = wo(a) ? a.host : a && xo(a) ? a : null;
      }
      return !1;
    }
    _trackPointer(e) {
      if (!this.isEnabled || e.type === `pointercancel`) return void this._clearPointer();
      if (e.type === `pointerdown`) {
        this._clearPointer();
        let t = Ao(e);
        e.isPrimary &&
          e.button === 0 &&
          !e.ctrlKey &&
          t &&
          xo(t) &&
          (this._pointerDown = {
            target: t,
            excluded: this._isExcludedPointerTarget(t),
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            released: !1,
            distinctId: this._client?.distinctId,
          });
        return;
      }
      let t = this._pointerDown;
      t &&
        (e.pointerId !== t.id || Math.abs(e.clientX - t.x) > 5 || Math.abs(e.clientY - t.y) > 5
          ? this._clearPointer()
          : e.type === `pointerup` &&
            ((t.released = !0), (this._pointerExpiry = setTimeout(() => this._clearPointer(), 0))));
    }
    _recoverClickTarget(e) {
      let t = this._pointerDown;
      this._clearPointer();
      let n = Ao(e);
      if (
        t?.released &&
        t.target.isConnected &&
        t.distinctId === this._client?.distinctId &&
        e.pointerId === t.id &&
        (e.detail > 0 || e.pointerType === `touch` || e.pointerType === `pen`) &&
        e.button === 0 &&
        5 >= Math.abs(e.clientX - t.x) &&
        5 >= Math.abs(e.clientY - t.y) &&
        n &&
        (So(n, `html`) || So(n, `body`))
      ) {
        if (t.excluded) return null;
        let e = this._refreshConfig().css_selector_ignorelist ?? Fo;
        return [n, k?.documentElement, k?.body].some((t) => {
          if (!t) return !1;
          let n = Do(t);
          return (
            j(n, `ph-no-capture`) ||
            j(n, `ph-sensitive`) ||
            !Yo(t) ||
            Xo(t) ||
            e.some((e) => Mo(t, e))
          );
        })
          ? null
          : t.target;
      }
    }
    constructor(e) {
      ((this._configSource = e),
        (this.name = Gl),
        (this._initialized = !1),
        (this._isDisabledServerSide = null),
        (this._hasReceivedConfigResponse = !1),
        (this._elementSelectorsByOwner = new Map()),
        (this._elementsChainAsString = !1),
        (this._config = {
          enabled: !1,
          rageclick: !1,
          maskAllElementAttributes: !1,
          maskAllText: !1,
          disableCaptureUrlHashes: !1,
          remoteRequestsDisabled: !1,
        }),
        (this._disposed = !1),
        this._configSource.refresh(this._config),
        (this.rageclicks = new vu(this._config.rageclick)),
        (this._elementSelectors = null));
    }
    setup(e) {
      (this._compileUrlPatterns(), (this._client = e));
      let t = e.onRemoteConfig(this.onRemoteConfig.bind(this));
      this._disposed ? t.dispose() : ((this._remoteConfigSubscription = t), this.startIfEnabled());
    }
    dispose() {
      var e;
      this._disposed ||
        ((this._disposed = !0),
        (this._client = void 0),
        (e = this._remoteConfigSubscription) == null || e.dispose(),
        (this._remoteConfigSubscription = void 0),
        this._elementSelectorsByOwner.clear(),
        (this._elementSelectors = null),
        this._removeDomEventHandlers());
    }
    _refreshConfig() {
      return (this._configSource.refresh(this._config), this._config);
    }
    _compileUrlPatterns() {
      return (
        this._refreshConfig(),
        (this._config.url_allowlist = this._config.url_allowlist?.map((e) => new RegExp(e))),
        (this._config.url_ignorelist = this._config.url_ignorelist?.map((e) => new RegExp(e))),
        this._config
      );
    }
    _addDomEventHandlers() {
      if (!this.isBrowserSupported())
        return void bu.info(
          `Disabling Automatic Event Collection because this browser is not supported`,
        );
      if (!O || !k) return;
      let e = (this._domEventHandler = (e) => {
        e ||= O?.event;
        try {
          if (e.type === `blur`) return void this._clearPointer();
          if (e.type.indexOf(`pointer`) === 0) return void this._trackPointer(e);
          let t = e.type === `click` ? this._recoverClickTarget(e) : void 0;
          if (L(t)) return;
          this._captureEvent(e, `$autocapture`, t);
        } catch (e) {
          bu.error(`Failed to capture event`, e);
        }
      });
      if (
        (K(O, `blur`, e),
        K(k, `submit`, e, { capture: !0 }),
        K(k, `change`, e, { capture: !0 }),
        K(k, `click`, e, { capture: !0 }),
        W([`pointerdown`, `pointermove`, `pointerup`, `pointercancel`], (t) => {
          K(k, t, e, { capture: !0 });
        }),
        this._refreshConfig().capture_copied_text)
      ) {
        let e = (this._copiedTextHandler = (e) => {
          e ||= O?.event;
          try {
            this._captureEvent(e, yu);
          } catch (e) {
            bu.error(`Failed to capture clipboard event`, e);
          }
        });
        (K(k, `copy`, e, { capture: !0 }),
          K(k, `cut`, e, { capture: !0 }),
          K(k, `paste`, e, { capture: !0 }));
      }
    }
    _removeDomEventHandlers() {
      (this._clearPointer(),
        (this._domEventHandler &&=
          (O?.removeEventListener(`blur`, this._domEventHandler),
          W([`pointerdown`, `pointermove`, `pointerup`, `pointercancel`], (e) => {
            k?.removeEventListener(e, this._domEventHandler, !0);
          }),
          k?.removeEventListener(`submit`, this._domEventHandler, !0),
          k?.removeEventListener(`change`, this._domEventHandler, !0),
          k?.removeEventListener(`click`, this._domEventHandler, !0),
          void 0)),
        (this._copiedTextHandler &&=
          (k?.removeEventListener(`copy`, this._copiedTextHandler, !0),
          k?.removeEventListener(`cut`, this._copiedTextHandler, !0),
          k?.removeEventListener(`paste`, this._copiedTextHandler, !0),
          void 0)),
        (this._initialized = !1));
    }
    startIfEnabled() {
      (this.isEnabled || this._clearPointer(),
        !this._disposed &&
          this._client &&
          this.isEnabled &&
          !this._initialized &&
          (this._addDomEventHandlers(), (this._initialized = !0)));
    }
    onRemoteConfig(e) {
      if (this._disposed) return;
      if (((this._hasReceivedConfigResponse = !0), !e.ok)) return void this.startIfEnabled();
      let t = e.config;
      t.elementsChainAsString && (this._elementsChainAsString = t.elementsChainAsString);
      let n = t.autocapture_opt_out;
      var r;
      (It(n) &&
        ((r = this._client) == null || r.kv.set(`$autocapture_disabled_server_side`, n),
        (this._isDisabledServerSide = n)),
        this.startIfEnabled());
    }
    setElementSelectors(e, t = this) {
      if (this._disposed) return;
      e.size
        ? this._elementSelectorsByOwner.set(t, new Set(e))
        : this._elementSelectorsByOwner.delete(t);
      let n = new Set();
      (this._elementSelectorsByOwner.forEach((e) => {
        e.forEach((e) => n.add(e));
      }),
        (this._elementSelectors = n));
    }
    getElementSelectors(e, t) {
      var n;
      let r = [];
      return (
        (n = this._elementSelectors) == null ||
          n.forEach((n) => {
            k?.querySelectorAll(n)?.forEach((i) => {
              (e !== i && t !== i) || j(r, n) || r.push(n);
            });
          }),
        r
      );
    }
    get isEnabled() {
      if (this._disposed) return !1;
      let e = this._client?.kv.get(ne),
        t = this._isDisabledServerSide,
        n = this._refreshConfig();
      if (!n.remoteRequestsDisabled && !this._hasReceivedConfigResponse) return !1;
      let r = n.remoteRequestsDisabled && !this._hasReceivedConfigResponse;
      if (L(t) && !It(e) && !r) return !1;
      let i = this._isDisabledServerSide ?? !!e;
      return !!n.enabled && !i;
    }
    _captureEvent(e, t = `$autocapture`, n) {
      if (!this.isEnabled) return void this._clearPointer();
      let r = n || Ao(e);
      Co(r) && (r = r.parentNode || null);
      let i = this._compileUrlPatterns();
      var a;
      t === `$autocapture` &&
        e.type === `click` &&
        e instanceof MouseEvent &&
        i.rageclick &&
        (a = this.rageclicks) != null &&
        a.isRageClick(e.clientX, e.clientY, e.timeStamp || new Date().getTime()) &&
        Ko(r, i.rageclick) &&
        this._captureEvent(e, `$rageclick`, n);
      let o = t === yu,
        s = o ? V(V({}, i), {}, { dom_event_allowlist: void 0 }) : i;
      if (
        r &&
        (function (e, t, n, r, i, a) {
          if (
            !O ||
            qo(e) ||
            (n?.url_allowlist && !Eo(n.url_allowlist, a)) ||
            (n?.url_ignorelist && Eo(n.url_ignorelist, a))
          )
            return !1;
          if (n?.dom_event_allowlist) {
            let e = n.dom_event_allowlist;
            if (e && !e.some((e) => t.type === e)) return !1;
          }
          let { parentIsUsefulElement: o, targetElementList: s } = Jo(e, r);
          if (
            !(function (e, t) {
              let n = t?.element_allowlist;
              if (F(n)) return !0;
              for (let t of e) if (n.some((e) => t.tagName.toLowerCase() === e)) return !0;
              return !1;
            })(s, n) ||
            !No(s, n?.css_selector_allowlist) ||
            No(s, n?.css_selector_ignorelist ?? Fo)
          )
            return !1;
          try {
            let n = O.getComputedStyle(e);
            if (n && n.getPropertyValue(`cursor`) === `pointer` && t.type === `click`) return !0;
          } catch {}
          let c = e.tagName.toLowerCase();
          switch (c) {
            case `html`:
              return !1;
            case `form`:
              return (i || [`submit`]).indexOf(t.type) >= 0;
            case `input`:
            case `select`:
            case `textarea`:
              return (i || [`change`, `click`]).indexOf(t.type) >= 0;
            default:
              return o
                ? (i || [`click`]).indexOf(t.type) >= 0
                : (i || [`click`]).indexOf(t.type) >= 0 &&
                    (jo.indexOf(c) > -1 || e.getAttribute(`contenteditable`) === `true`);
          }
        })(r, e, s, o, o ? [`copy`, `cut`, `paste`] : void 0, {
          config: { get_current_url: i.getCurrentUrl },
        })
      ) {
        var c;
        let {
          props: n,
          explicitNoCapture: a,
          target: o,
        } = Cu(r, {
          e,
          maskAllElementAttributes: i.maskAllElementAttributes,
          maskAllText: i.maskAllText,
          elementAttributeIgnoreList: i.element_attribute_ignorelist,
          elementsChainAsString: this._elementsChainAsString,
          disableCaptureUrlHashes: i.disableCaptureUrlHashes,
        });
        if (a) return !1;
        let s = this.getElementSelectors(r, o);
        if ((s && s.length > 0 && (n.$element_selectors = s), t === yu)) {
          let t = e.type || `clipboard`;
          if (t !== `paste`) {
            var l;
            let e = O == null || (l = O.getSelection()) == null ? void 0 : l.toString(),
              t = Oo(e);
            if (!t) return !1;
            ((n.$selected_content = t), (n.$clipboard_text_length = e?.length ?? 0));
          }
          n.$copy_type = t;
        }
        return ((c = this._client) == null || c.capture(t, n), !0);
      }
    }
    isBrowserSupported() {
      return N(k?.querySelectorAll);
    }
  },
  Tu = class {
    constructor(e) {
      this._instance = e;
    }
    refresh(e) {
      let t = this._instance.config,
        n = P(t.autocapture) ? t.autocapture : void 0;
      ((e.enabled = !!t.autocapture),
        (e.rageclick = t.rageclick),
        (e.maskAllElementAttributes = t.mask_all_element_attributes),
        (e.maskAllText = t.mask_all_text),
        (e.disableCaptureUrlHashes = t.disable_capture_url_hashes),
        (e.getCurrentUrl = t.get_current_url),
        (e.remoteRequestsDisabled = this._instance._shouldDisableFlags()),
        (e.url_allowlist = n?.url_allowlist),
        (e.url_ignorelist = n?.url_ignorelist),
        (e.dom_event_allowlist = n?.dom_event_allowlist),
        (e.element_allowlist = n?.element_allowlist),
        (e.css_selector_allowlist = n?.css_selector_allowlist),
        (e.css_selector_ignorelist = n?.css_selector_ignorelist),
        (e.element_attribute_ignorelist = n?.element_attribute_ignorelist),
        (e.capture_copied_text = n?.capture_copied_text));
    }
  },
  Eu = U(`[ExceptionAutocapture]`),
  Du = () => {},
  Ou = (e) => {
    if (N(e)) return e.__posthog_layer__ ?? e.__rrweb_layer__;
  };
function ku(e, t, n) {
  try {
    if (!(t in e)) return Du;
    let r = { next: e[t] },
      i = n(function (...e) {
        return r.next.apply(this, e);
      });
    return (
      N(i) &&
        ((i.prototype = i.prototype || {}),
        Object.defineProperties(i, {
          __posthog_wrapped__: { enumerable: !1, value: !0 },
          __posthog_layer__: { enumerable: !1, value: r },
        })),
      (e[t] = i),
      () => {
        if (e[t] === i) return void (e[t] = r.next);
        let n = e[t],
          a = Ou(n);
        for (; a; ) {
          if (a.next === i) return void (a.next = r.next);
          ((n = a.next), (a = Ou(n)));
        }
      }
    );
  } catch {
    return Du;
  }
}
var Au = U(`[TracingHeaders]`),
  ju = U(`[Web Vitals]`),
  Mu = 9e5,
  Nu = [`CLS`, `FCP`, `INP`, `LCP`],
  Pu = [`INP`, `LCP`],
  Fu = [
    `interactionTarget`,
    `interactionType`,
    `inputDelay`,
    `processingDuration`,
    `presentationDelay`,
    `loadState`,
    `target`,
    `url`,
    `timeToFirstByte`,
    `resourceLoadDelay`,
    `resourceLoadDuration`,
    `elementRenderDelay`,
    `largestShiftTarget`,
    `largestShiftTime`,
    `largestShiftValue`,
    `firstByteToFCP`,
  ],
  Iu = `disabled`,
  Lu = `lazy_loading`,
  Ru = U(`[SessionRecording]`),
  zu = [Ye, Xe, Ze, Qe, $e, et, tt, nt, rt],
  Bu = U(`[Heatmaps]`);
function Vu(e) {
  return P(e) && `clientX` in e && `clientY` in e && z(e.clientX) && z(e.clientY);
}
var Hu = U(`[Product Tours]`),
  Uu = (e) => !e.config.disable_product_tours && !!e.persistence?.get_property(ce),
  Wu = [`$set_once`, `$set`],
  Gu = U(`[SiteApps]`),
  Ku = `Error while initializing PostHog app with config id `,
  qu = (e, t) => (e?.then ? e.then(t) : t(e)),
  Ju = `SDK is not enabled or survey functionality is not yet loaded`,
  Yu = `Disabled. Not loading surveys.`,
  Xu = class {
    constructor(e, t) {
      ((this._configSource = e),
        (this._initialClientState = t),
        (this.name = Jl),
        (this._surveyEventReceiver = null),
        (this._surveyManager = null),
        (this._isInitializingSurveys = !1),
        (this._surveyInitializationFailed = !1),
        (this._surveyCallbacks = []),
        (this._activeMatchingSurveyCallbacks = []),
        (this._getSurveysInFlightPromise = null),
        (this._lastSurveyRefreshFailedAt = null),
        (this._disposed = !1),
        (this._renderTimeouts = new Set()),
        (this.onRemoteConfig = (e) => {
          if (this._disposed || this._config.disableSurveys) return;
          if (!e.ok)
            return (
              (this._surveyInitializationFailed = !0),
              this._notifyActiveMatchingSurveyCallbacks({
                isLoaded: !1,
                error: `Remote config unavailable. Not loading surveys.`,
              }),
              $.warn(`Remote config unavailable. Not loading surveys.`)
            );
          let t = e.config.surveys;
          if (R(t)) return $.warn(`Flags not loaded yet. Not loading surveys.`);
          ((this._isSurveysEnabled = It(t) ? t : t.length > 0),
            $.info(`flags response received, isSurveysEnabled: ${this._isSurveysEnabled}`),
            this.loadIfEnabled());
        }),
        (this._notifyActiveMatchingSurveyCallbacks = (e) => {
          this._activeMatchingSurveyCallbacks
            .slice()
            .forEach((t) => this._notifyActiveMatchingSurveyCallback(t, e));
        }));
    }
    setup(e) {
      if (!this._disposed)
        return (
          (this._initializingClient = e),
          qu(e.kv.initialize(), () => {
            if (this._initializingClient !== e || this._disposed) return;
            ((this._initializingClient = void 0), (this._client = e));
            let t = e.onRemoteConfig(this.onRemoteConfig);
            this._disposed
              ? t.dispose()
              : ((this._remoteConfigSubscription = t), this.loadIfEnabled());
          })
        );
    }
    dispose() {
      var e, t, n, r, i;
      this._disposed ||
        ((this._disposed = !0),
        (this._initializingClient = void 0),
        (this._client = void 0),
        (e = this._remoteConfigSubscription) == null || e.dispose(),
        (this._remoteConfigSubscription = void 0),
        (t = this._surveyEventReceiver) == null || t.dispose(),
        (this._surveyEventReceiver = null),
        (n = this._surveyManager) == null || (r = n.dispose) == null || r.call(n),
        (this._surveyManager = null),
        (this._surveyCallbacks = []),
        this._activeMatchingSurveyCallbacks.forEach((e) => {
          e.active = !1;
        }),
        (this._activeMatchingSurveyCallbacks = []),
        (i = this._activeMatchingSurveyConditionsUnsubscribe) == null || i.call(this),
        (this._activeMatchingSurveyConditionsUnsubscribe = void 0),
        (this._getSurveysInFlightPromise = null),
        this._renderTimeouts.forEach((e) => clearTimeout(e)),
        this._renderTimeouts.clear());
    }
    get _config() {
      return this._configSource.get();
    }
    initialize() {
      this.loadIfEnabled();
    }
    reset() {
      var e, t;
      (e = this._surveyManager) == null ||
        (t = e.clearInMemoryInProgressSurveyState) == null ||
        t.call(e);
      try {
        var n;
        ((n = this._surveyEventReceiver) == null || n.reset(),
          localStorage.removeItem(`lastSeenSurveyDate`));
        let e = [];
        for (let t = 0; t < localStorage.length; t++) {
          let n = localStorage.key(t);
          ((n != null && n.startsWith(`seenSurvey_`)) ||
            (n != null && n.startsWith(`inProgressSurvey_`))) &&
            e.push(n);
        }
        e.forEach((e) => localStorage.removeItem(e));
      } catch {}
      this._notifyActiveMatchingSurveyCallbacks();
    }
    loadIfEnabled() {
      if (this._disposed || !this._client) return;
      let e = this._config;
      if (this._surveyManager) return;
      if (this._isInitializingSurveys)
        return void $.info(`Already initializing surveys, skipping...`);
      if (e.disableSurveys) return void $.info(Yu);
      if (e.cookielessMode && this._configSource.isOptedOut())
        return void $.info(`Not loading surveys in cookieless mode without consent.`);
      let t = this._configSource.getExtensions();
      if (!t) return void this._handleSurveyLoadError(`PostHog Extensions not found.`);
      if (F(this._isSurveysEnabled) && !e.advancedEnableSurveys) return;
      let n = this._isSurveysEnabled || e.advancedEnableSurveys;
      ((this._isInitializingSurveys = !0), (this._surveyInitializationFailed = !1));
      try {
        let e = t.generateSurveys;
        if (e)
          return (
            this._completeSurveyInitialization(e, n),
            void (this._isInitializingSurveys = !1)
          );
        let r = t.loadExternalDependency;
        if (!r) return (this._handleSurveyLoadError(at), void (this._isInitializingSurveys = !1));
        r((e) => {
          try {
            if (this._disposed) return;
            let t = this._configSource.getExtensions();
            e || !t?.generateSurveys
              ? this._handleSurveyLoadError(`Could not load surveys script`, e)
              : this._completeSurveyInitialization(t.generateSurveys, n);
          } finally {
            this._isInitializingSurveys = !1;
          }
        });
      } catch (e) {
        throw (
          (this._isInitializingSurveys = !1),
          this._handleSurveyLoadError(`Error initializing surveys`, e),
          e
        );
      }
    }
    _completeSurveyInitialization(e, t) {
      if (this._disposed) return;
      ((this._surveyManager = e(t)),
        (this._surveyEventReceiver = this._configSource.createEventReceiver(
          this._notifyActiveMatchingSurveyCallbacks,
        )));
      let n = (this._client ?? this._initialClientState)?.kv.get(Ee);
      (n && this._registerEventOrActionBasedSurveys(n),
        $.info(`Surveys loaded successfully`),
        this._startActiveMatchingSurveyConditions(),
        this._notifyActiveMatchingSurveyCallbacks(),
        this._notifySurveyCallbacks({ isLoaded: !0 }));
    }
    _handleSurveyLoadError(e, t) {
      ((this._surveyInitializationFailed = !0),
        $.error(e, t),
        this._notifyActiveMatchingSurveyCallbacks({ isLoaded: !1, error: e }),
        this._notifySurveyCallbacks({ isLoaded: !1, error: e }));
    }
    onSurveysLoaded(e) {
      return (
        this._surveyCallbacks.push(e),
        this._surveyManager && this._notifySurveyCallbacks({ isLoaded: !0 }),
        () => {
          this._surveyCallbacks = this._surveyCallbacks.filter((t) => t !== e);
        }
      );
    }
    getSurveys(e, t = !1) {
      let n = this._client ?? this._initialClientState;
      if (!n || this._disposed) return;
      if (this._config.disableSurveys) return ($.info(Yu), e([]));
      let r = n.kv.get(Ee);
      if (r && !t)
        return (
          e(r, { isLoaded: !0 }),
          void (this._shouldBackgroundRefreshSurveys() && this.getSurveys(() => {}, !0))
        );
      if (this._getSurveysInFlightPromise)
        return void this._getSurveysInFlightPromise
          .then(({ surveys: t, context: n }) => {
            this._disposed || e(t, n);
          })
          .catch((e) => $.error(`Error in survey callback`, e));
      let i = this._sendSurveysRequest(`/api/surveys/`, {
        method: `GET`,
        query: { token: n.projectToken },
        sentAt: `query`,
        timeoutMs: this._config.requestTimeoutMs,
      }).then(
        (e) => {
          try {
            return this._handleSurveyResponse(n, e);
          } catch (e) {
            return (
              $.error(`Error processing surveys response`, e),
              this._handleSurveyResponse(n, { statusCode: 0, error: e })
            );
          }
        },
        (e) => this._handleSurveyResponse(n, { statusCode: 0, error: e }),
      );
      this._getSurveysInFlightPromise = i;
      let a = () => {
        this._getSurveysInFlightPromise === i && (this._getSurveysInFlightPromise = null);
      };
      i.then((t) => {
        (a(),
          this._disposed ||
            (this._notifyActiveMatchingSurveyCallbacks(t.context), e(t.surveys, t.context)));
      }, a).catch((e) => $.error(`Error in survey callback`, e));
    }
    _sendSurveysRequest(e, t) {
      let n = this._client;
      return n ? n.sendRequest(e, t) : new Promise((e) => e({ statusCode: 0, error: Error(Ju) }));
    }
    _handleSurveyResponse(e, t) {
      if (this._disposed) return { surveys: [], context: { isLoaded: !1, error: Ju } };
      let n = t.statusCode;
      if (n !== 200 || !t.json) {
        let e = `Surveys API could not be loaded, status: ${n}`;
        return (
          n === 0 ? t.error || $.warn(e) : $.error(e),
          (this._lastSurveyRefreshFailedAt = Date.now()),
          { surveys: [], context: { isLoaded: !1, error: e } }
        );
      }
      this._lastSurveyRefreshFailedAt = null;
      let r = t.json.surveys || [];
      return (
        e.kv.set({ [Ee]: r, [De]: Date.now() }),
        this._registerEventOrActionBasedSurveys(r),
        { surveys: r, context: { isLoaded: !0 } }
      );
    }
    _registerEventOrActionBasedSurveys(e) {
      var t;
      let n = e.filter(
        (e) =>
          (function (e) {
            return !(!e.start_date || e.end_date);
          })(e) &&
          (Ol(e) ||
            (function (e) {
              var t;
              return !!(
                (t = e.conditions) != null &&
                (t = t.actions) != null &&
                (t = t.values) != null &&
                t.length
              );
            })(e)),
      );
      (t = this._surveyEventReceiver) == null || t.replace(n);
    }
    _shouldBackgroundRefreshSurveys() {
      return (
        this._isSurveyCacheStale() &&
        !this._getSurveysInFlightPromise &&
        !this._isSurveyRefreshBackingOff()
      );
    }
    _isSurveyCacheStale() {
      let e = (this._client ?? this._initialClientState)?.kv.get(De);
      return z(e) && Date.now() - e > 3e5;
    }
    _isSurveyRefreshBackingOff() {
      return (
        z(this._lastSurveyRefreshFailedAt) && 3e5 > Date.now() - this._lastSurveyRefreshFailedAt
      );
    }
    markSurveyAsSeen(e, t) {
      zl({ id: e, current_iteration: t?.iteration ?? null });
      try {
        localStorage.setItem(`lastSeenSurveyDate`, new Date().toISOString());
      } catch {}
      this._notifyActiveMatchingSurveyCallbacks();
    }
    _notifySurveyCallbacks(e) {
      for (let t of this._surveyCallbacks)
        try {
          if (!e.isLoaded) return t([], e);
          this.getSurveys(t);
        } catch (e) {
          $.error(`Error in survey callback`, e);
        }
    }
    getActiveMatchingSurveys(e, t = !1) {
      if (!R(this._surveyManager)) return this._surveyManager.getActiveMatchingSurveys(e, t);
      $.warn(`init was not called`);
    }
    onActiveMatchingSurveysChanged(e) {
      if (this._disposed) return () => {};
      let t = { callback: e, active: !0, revision: 0 };
      (this._activeMatchingSurveyCallbacks.push(t), this._startActiveMatchingSurveyConditions());
      let n = (this._client ?? this._initialClientState)?.kv.get(Ee);
      return (
        this._config.disableSurveys ||
        (!this._surveyManager &&
          this._surveyInitializationFailed &&
          !this._isInitializingSurveys) ||
        (!n && !R(this._lastSurveyRefreshFailedAt) && !this._getSurveysInFlightPromise)
          ? this._notifyActiveMatchingSurveyCallback(t, { isLoaded: !1 })
          : this._surveyManager && this._notifyActiveMatchingSurveyCallback(t),
        () => {
          var e;
          ((t.active = !1),
            (this._activeMatchingSurveyCallbacks = this._activeMatchingSurveyCallbacks.filter(
              (e) => e !== t,
            )),
            this._activeMatchingSurveyCallbacks.length === 0 &&
              ((e = this._activeMatchingSurveyConditionsUnsubscribe) == null || e.call(this),
              (this._activeMatchingSurveyConditionsUnsubscribe = void 0)));
        }
      );
    }
    _startActiveMatchingSurveyConditions() {
      var e;
      this._surveyManager &&
        this._activeMatchingSurveyCallbacks.length > 0 &&
        (this._activeMatchingSurveyConditionsUnsubscribe ??= (e =
          this._configSource).onMatchingConditionsChanged?.call(
          e,
          this._notifyActiveMatchingSurveyCallbacks,
        ));
    }
    _notifyActiveMatchingSurveyCallback(e, t) {
      if (this._disposed || !e.active) return;
      let n = ++e.revision,
        r = (r) => {
          if (!this._disposed && e.active && n === e.revision)
            try {
              let n = t ?? { isLoaded: !0 },
                i = JSON.stringify([r, n]);
              if (i === e.lastResult) return;
              ((e.lastResult = i), e.callback(r, n));
            } catch (e) {
              $.error(`Error in active matching surveys callback`, e);
            }
        };
      try {
        t && !t.isLoaded ? r([]) : this.getActiveMatchingSurveys(r);
      } catch (e) {
        $.error(`Error in active matching surveys callback`, e);
      }
    }
    _getSurveyById(e) {
      let t = null;
      return (
        this.getSurveys((n) => {
          t = n.find((t) => t.id === e) ?? null;
        }),
        t
      );
    }
    _checkSurveyEligibility(e) {
      if (R(this._surveyManager)) return { eligible: !1, reason: Ju };
      let t = typeof e == `string` ? this._getSurveyById(e) : e;
      return t
        ? this._surveyManager.checkSurveyEligibility(t)
        : { eligible: !1, reason: `Survey not found` };
    }
    _checkSurveyRenderability(e) {
      if (!this._configSource.isCapturing())
        return {
          eligible: !1,
          reason: `PostHog is not capturing, so a survey response cannot be recorded`,
        };
      if (R(this._surveyManager)) return { eligible: !1, reason: Ju };
      let t = typeof e == `string` ? this._getSurveyById(e) : e;
      return t
        ? this._surveyManager.checkSurveyRenderability(t)
        : { eligible: !1, reason: `Survey not found` };
    }
    canRenderSurvey(e) {
      if (R(this._surveyManager))
        return ($.warn(`init was not called`), { visible: !1, disabledReason: Ju });
      let t = this._checkSurveyRenderability(e);
      return { visible: t.eligible, disabledReason: t.reason };
    }
    canRenderSurveyAsync(e, t) {
      return R(this._surveyManager)
        ? ($.warn(`init was not called`), Promise.resolve({ visible: !1, disabledReason: Ju }))
        : new Promise((n) => {
            this.getSurveys((t) => {
              let r = t.find((t) => t.id === e) ?? null;
              if (r) {
                let e = this._checkSurveyRenderability(r);
                n({ visible: e.eligible, disabledReason: e.reason });
              } else n({ visible: !1, disabledReason: `Survey not found` });
            }, t);
          });
    }
    renderSurvey(e, t, n) {
      if (!this._configSource.isCapturing()) return;
      if (R(this._surveyManager)) return void $.warn(`init was not called`);
      let r = typeof e == `string` ? this._getSurveyById(e) : e;
      if (!r?.id) return void $.warn(`Survey not found`);
      if (!Bl.includes(r.type))
        return void $.warn(`Surveys of type ${r.type} cannot be rendered in the app`);
      let i = k?.querySelector(t);
      if (i) {
        if (r.appearance?.surveyPopupDelaySeconds) {
          $.info(
            `Rendering survey ${r.id} with delay of ${r.appearance.surveyPopupDelaySeconds} seconds`,
          );
          let e = setTimeout(() => {
            var t;
            (this._renderTimeouts.delete(e),
              !this._disposed &&
                this._configSource.isCapturing() &&
                ($.info(
                  `Rendering survey ${r.id} with delay of ${r.appearance?.surveyPopupDelaySeconds} seconds`,
                ),
                (t = this._surveyManager) == null || t.renderSurvey(r, i, n),
                $.info(`Survey ${r.id} rendered`)));
          }, 1e3 * r.appearance.surveyPopupDelaySeconds);
          this._renderTimeouts.add(e);
          return;
        }
        this._surveyManager.renderSurvey(r, i, n);
      } else $.warn(`Survey element not found`);
    }
    displaySurvey(e, t) {
      var n;
      if (!this._configSource.isCapturing()) return;
      if (R(this._surveyManager)) return void $.warn(`init was not called`);
      let r = this._getSurveyById(e);
      if (!r) return void $.warn(`Survey not found`);
      let i = r;
      if (
        ((n = r.appearance) != null &&
          n.surveyPopupDelaySeconds &&
          t.ignoreDelay &&
          (i = V(
            V({}, r),
            {},
            { appearance: V(V({}, r.appearance), {}, { surveyPopupDelaySeconds: 0 }) },
          )),
        t.displayType !== cc.Popover &&
          t.initialResponses &&
          $.warn(
            `initialResponses is only supported for popover surveys. prefill will not be applied.`,
          ),
        !1 === t.ignoreConditions)
      ) {
        let e = this._checkSurveyEligibility(r);
        if (!e.eligible) return void $.warn(`Survey is not eligible to be displayed: `, e.reason);
      }
      t.displayType === cc.Inline
        ? this.renderSurvey(i, t.selector, t.properties)
        : this._surveyManager.handlePopoverSurvey(i, t);
    }
    cancelPendingSurvey(e) {
      R(this._surveyManager) ? $.warn(`init was not called`) : this._surveyManager.cancelSurvey(e);
    }
    handlePageUnload() {
      var e, t;
      (e = this._surveyManager) == null || (t = e.handlePageUnload) == null || t.call(e);
    }
  };
function Zu(e, t, n) {
  if (R(e)) return !1;
  switch (n) {
    case `exact`:
      return e === t;
    case `contains`: {
      let n = t
        .replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
        .replace(/_/g, `.`)
        .replace(/%/g, `.*`);
      return new RegExp(n, `i`).test(e);
    }
    case `regex`:
      try {
        return new RegExp(t).test(e);
      } catch {
        return !1;
      }
    default:
      return !1;
  }
}
var Qu = class {
    constructor(e) {
      ((this._instance = e),
        (this._actionRegistry = new Set()),
        (this._actionEvents = new Set()),
        (this._debugEventEmitter = new xl()),
        (this._checkStep = (e, t) =>
          this._checkStepEvent(e, t) &&
          this._checkStepUrl(e, t) &&
          this._checkStepElement(e, t) &&
          this._checkStepProperties(e, t)),
        (this._checkStepEvent = (e, t) => !t?.event || e?.event === t?.event));
    }
    init() {
      F(this._instance?._addCaptureHook) ||
        (this._captureHookUnsubscribe = this._instance?._addCaptureHook((e, t) => {
          this.on(e, t);
        }));
    }
    dispose() {
      var e, t;
      ((e = this._captureHookUnsubscribe) == null || e.call(this),
        (this._captureHookUnsubscribe = void 0),
        (t = this._instance) == null ||
          (t = t.autocapture) == null ||
          t.setElementSelectors(new Set(), this),
        (this._debugEventEmitter = new xl()));
    }
    register(e) {
      if (
        !F(this._instance?._addCaptureHook) &&
        (e.forEach((e) => {
          var t;
          (this._actionRegistry.add(e),
            (t = e.steps) == null ||
              t.forEach((e) => {
                this._actionEvents.add(e?.event || ``);
              }));
        }),
        this._instance?.autocapture)
      ) {
        let e = new Set();
        (this._actionRegistry.forEach((t) => {
          var n;
          (n = t.steps) == null ||
            n.forEach((t) => {
              t != null && t.selector && e.add(t.selector);
            });
        }),
          this._instance.autocapture.setElementSelectors(e, this));
      }
    }
    replace(e) {
      (this._actionRegistry.clear(), this._actionEvents.clear(), this.register(e));
    }
    on(e, t) {
      t != null &&
        e.length != 0 &&
        (this._actionEvents.has(e) || this._actionEvents.has(t.event)) &&
        this._actionRegistry.forEach((e) => {
          this._checkAction(t, e) && this._debugEventEmitter.emit(`actionCaptured`, e.name);
        });
    }
    _addActionHook(e) {
      this.onAction(`actionCaptured`, (t) => e(t));
    }
    _checkAction(e, t) {
      if (t?.steps == null) return !1;
      for (let n of t.steps) if (this._checkStep(e, n)) return !0;
      return !1;
    }
    onAction(e, t) {
      return this._debugEventEmitter.on(e, t);
    }
    _checkStepUrl(e, t) {
      if (t?.url) {
        var n;
        let r = e == null || (n = e.properties) == null ? void 0 : n.$current_url;
        if (!r || typeof r != `string` || !Zu(r, t.url, t.url_matching || `contains`)) return !1;
      }
      return !0;
    }
    _checkStepElement(e, t) {
      return (
        !!this._checkStepHref(e, t) &&
        !!this._checkStepText(e, t) &&
        !!this._checkStepSelector(e, t)
      );
    }
    _checkStepHref(e, t) {
      var n;
      if (!t?.href) return !0;
      let r = this._getElementsList(e);
      if (r.length > 0) return r.some((e) => Zu(e.href, t.href, t.href_matching || `exact`));
      let i = (e == null || (n = e.properties) == null ? void 0 : n.$elements_chain) || ``;
      return (
        !!i &&
        Zu(
          (function (e) {
            let t = e.match(/(?::|")href="(.*?)"/);
            return t ? t[1] : ``;
          })(i),
          t.href,
          t.href_matching || `exact`,
        )
      );
    }
    _checkStepText(e, t) {
      var n;
      if (!t?.text) return !0;
      let r = this._getElementsList(e);
      if (r.length > 0)
        return r.some(
          (e) =>
            Zu(e.text, t.text, t.text_matching || `exact`) ||
            Zu(e.$el_text, t.text, t.text_matching || `exact`),
        );
      let i = (e == null || (n = e.properties) == null ? void 0 : n.$elements_chain) || ``;
      return (
        !!i &&
        ((a = (function (e) {
          let t = [],
            n = /(?::|")text="(.*?)"/g,
            r;
          for (; !R((r = n.exec(e))); ) t.includes(r[1]) || t.push(r[1]);
          return t;
        })(i)),
        (o = t.text),
        (s = t.text_matching || `exact`),
        a.some((e) => Zu(e, o, s)))
      );
      var a, o, s;
    }
    _checkStepSelector(e, t) {
      var n, r;
      if (
        !t?.selector ||
        (e == null || (n = e.properties) == null ? void 0 : n.$element_selectors)?.includes(
          t.selector,
        )
      )
        return !0;
      let i = (e == null || (r = e.properties) == null ? void 0 : r.$elements_chain) || ``;
      if (t.selector_regex && i)
        try {
          return new RegExp(t.selector_regex).test(i);
        } catch {
          return !1;
        }
      return !1;
    }
    _getElementsList(e) {
      var t;
      return (e == null || (t = e.properties) == null ? void 0 : t.$elements) == null
        ? []
        : e?.properties.$elements;
    }
    _checkStepProperties(e, t) {
      return (
        !t?.properties ||
        t.properties.length === 0 ||
        Ml(
          t.properties.reduce((e, t) => {
            let n = M(t.value) ? t.value.map(String) : t.value == null ? [] : [String(t.value)];
            return ((e[t.key] = { values: n, operator: t.operator || `exact` }), e);
          }, {}),
          e?.properties,
        )
      );
    }
  },
  $u = class {
    constructor(e, t) {
      var n, r;
      ((this._pendingActivatedItems = []),
        (this._instance = e),
        (this._onActivationChanged = t),
        (this._eventToItems = new Map()),
        (this._cancelEventToItems = new Map()),
        (this._actionToItems = new Map()),
        (this._sessionIdUnsubscribe =
          (n = this._instance) == null || (r = n.onSessionId) == null
            ? void 0
            : r.call(n, (e) => this._onSessionIdChanged(e))));
    }
    _shouldPersistArmedActivation(e) {
      return !1;
    }
    _getActivationTimestampsKey() {
      return null;
    }
    _writeActivationTimestamps(e) {}
    _clearActivationTimestampsStore() {}
    _doesEventMatchFilter(e, t) {
      return !!e && Ml(e.propertyFilters, t?.properties);
    }
    _buildEventToItemMap(e, t) {
      let n = new Map();
      return (
        e.forEach((e) => {
          var r;
          (r = e.conditions) == null ||
            (r = r[t]) == null ||
            (r = r.values) == null ||
            r.forEach((t) => {
              if (t?.name) {
                let r = n.get(t.name) || [];
                (r.push(e.id), n.set(t.name, r));
              }
            });
        }),
        n
      );
    }
    _getMatchingItems(e, t, n) {
      let r = (n === ic.Activation ? this._eventToItems : this._cancelEventToItems).get(e),
        i = [];
      return (
        this._getItems((e) => {
          i = e.filter((e) => r?.includes(e.id));
        }),
        i.filter((r) => {
          var i;
          let a =
            (i = r.conditions) == null || (i = i[n]) == null || (i = i.values) == null
              ? void 0
              : i.find((t) => t.name === e);
          return this._doesEventMatchFilter(a, t);
        })
      );
    }
    register(e) {
      this._register(e, !1);
    }
    replace(e) {
      this._register(e, !0);
    }
    _register(e, t) {
      F(this._instance?._addCaptureHook) ||
        (this._setupEventBasedItems(e, t), this._setupActionBasedItems(e, t));
    }
    _setupActionBasedItems(e, t) {
      let n = e.filter((e) => {
        var t;
        return (t = e.conditions) == null || (t = t.actions) == null || (t = t.values) == null
          ? void 0
          : t.length;
      });
      var r;
      if ((t && this._actionToItems.clear(), n.length === 0))
        return void (t && ((r = this._actionMatcher) == null || r.replace([])));
      this._actionMatcher ||
        ((this._actionMatcher = new Qu(this._instance)),
        this._actionMatcher.init(),
        this._actionMatcher._addActionHook((e) => this.onAction(e)));
      let i = [];
      (n.forEach((e) => {
        var t;
        (t = e.conditions) == null ||
          (t = t.actions) == null ||
          t.values.forEach((t) => {
            if ((i.push(t), t.name)) {
              let n = this._actionToItems.get(t.name) ?? [];
              (n.includes(e.id) || n.push(e.id), this._actionToItems.set(t.name, n));
            }
          });
      }),
        t ? this._actionMatcher.replace(i) : this._actionMatcher.register(i));
    }
    _mergeItemMaps(e, t) {
      t.forEach((t, n) => {
        let r = e.get(n) ?? [];
        (t.forEach((e) => {
          r.includes(e) || r.push(e);
        }),
          e.set(n, r));
      });
    }
    _setupEventBasedItems(e, t) {
      let n = e.filter((e) => {
          var t;
          return (
            e.conditions?.events &&
            ((t = e.conditions) == null || (t = t.events) == null || (t = t.values) == null
              ? void 0
              : t.length) > 0
          );
        }),
        r = e.filter((e) => {
          var t;
          return (
            e.conditions?.cancelEvents &&
            ((t = e.conditions) == null || (t = t.cancelEvents) == null || (t = t.values) == null
              ? void 0
              : t.length) > 0
          );
        }),
        i = this._buildEventToItemMap(e, ic.Activation),
        a = this._buildEventToItemMap(e, ic.Cancellation);
      (t
        ? ((this._eventToItems = i), (this._cancelEventToItems = a))
        : (this._mergeItemMaps(this._eventToItems, i),
          this._mergeItemMaps(this._cancelEventToItems, a)),
        (n.length !== 0 ||
          r.length !== 0 ||
          e.some((e) => {
            var t;
            return (t = e.conditions) == null || (t = t.actions) == null || (t = t.values) == null
              ? void 0
              : t.length;
          })) &&
          (this._captureHookUnsubscribe ??= this._instance?._addCaptureHook((e, t) => {
            this.onEvent(e, t);
          })));
    }
    onEvent(e, t) {
      var n, r;
      let i = this._getLogger(),
        a =
          (t == null || (n = t.properties) == null ? void 0 : n.$survey_id) ||
          (t == null || (r = t.properties) == null ? void 0 : r.$product_tour_id);
      if (a && this.getActivatedIds().includes(a)) {
        let n = this._activationOutcome(e, a, t);
        if (n === `consume`)
          return (
            i.info(`event consumed activated item, removing it`, { event: e, itemId: a }),
            void this._deactivateItems([a])
          );
        if (n === `persist`)
          return (
            i.info(`shown item promoted to persisted activation`, { event: e, itemId: a }),
            this._persistActivation(a),
            void this._clearActivationTimestamps([a])
          );
      }
      if (this._cancelEventToItems.has(e)) {
        let n = this._getMatchingItems(e, t, ic.Cancellation);
        n.length > 0 &&
          (i.info(`cancel event matched, cancelling items`, {
            event: e,
            itemsToCancel: n.map((e) => e.id),
          }),
          this._deactivateItems(n.map((e) => e.id)),
          n.forEach((e) => this._cancelPendingItem(e.id)));
      }
      if (!this._eventToItems.has(e)) return;
      i.info(`event name matched`, { event: e, eventPayload: t, items: this._eventToItems.get(e) });
      let o = this._getMatchingItems(e, t, ic.Activation);
      this._activateItems(o.map((e) => e.id));
    }
    onAction(e) {
      this._actionToItems.has(e) && this._activateItems(this._actionToItems.get(e) || []);
    }
    _activateItems(e) {
      var t, n;
      if (e.length === 0) return;
      let r = !!((t = this._instance) != null && (n = t.get_session_id) != null && n.call(t)),
        i = [];
      for (let t of e)
        r && this._shouldPersistArmedActivation(t)
          ? this._persistActivation(t) && this._recordActivationTimestamp(t)
          : i.push(t);
      (i.length > 0 &&
        (this._pendingActivatedItems = [...new Set([...this._pendingActivatedItems, ...i])]),
        this._getLogger().info(`updating activated items`, {
          activatedItems: this.getActivatedIds(),
        }),
        this._notifyActivationChanged());
    }
    _persistActivation(e) {
      this._pendingActivatedItems = this._pendingActivatedItems.filter((t) => t !== e);
      let t = this._getPersistedActivatedIds();
      return (
        !t.includes(e) && (this._setActivatedItems([...t, e]), this._stampActivationSession(), !0)
      );
    }
    _deactivateItems(e) {
      let t = new Set(e);
      this._pendingActivatedItems = this._pendingActivatedItems.filter((e) => !t.has(e));
      let n = this._getRawPersistedActivatedIds(),
        r = n.filter((e) => !t.has(e));
      (r.length !== n.length &&
        (this._setActivatedItems(r), r.length === 0 && this._clearActivationSession()),
        this._clearActivationTimestamps(e),
        this._notifyActivationChanged());
    }
    _notifyActivationChanged() {
      try {
        var e;
        (e = this._onActivationChanged) == null || e.call(this);
      } catch (e) {
        this._getLogger().error(`Error while handling activated items change`, e);
      }
    }
    _getRawActivationTimestamps() {
      var e;
      let t = this._getActivationTimestampsKey();
      if (!t) return {};
      let n = (e = this._instance) == null || (e = e.persistence) == null ? void 0 : e.props[t];
      return n && typeof n == `object` ? n : {};
    }
    _recordActivationTimestamp(e) {
      if (!this._getActivationTimestampsKey()) return;
      let t = this._getRawActivationTimestamps();
      this._writeActivationTimestamps(V(V({}, t), {}, { [e]: Date.now() }));
    }
    _clearActivationTimestamps(e) {
      if (!this._getActivationTimestampsKey()) return;
      let t = this._getRawActivationTimestamps(),
        n = {},
        r = !1;
      for (let [i, a] of Object.entries(t)) e.includes(i) ? (r = !0) : (n[i] = a);
      r && (Nt(n) ? this._clearActivationTimestampsStore() : this._writeActivationTimestamps(n));
    }
    _clearAllActivationTimestamps() {
      this._getActivationTimestampsKey() && this._clearActivationTimestampsStore();
    }
    getActivationTimestamp(e) {
      if (!this._getPersistedActivatedIds().includes(e)) return;
      let t = this._getRawActivationTimestamps()[e];
      return z(t) ? t : void 0;
    }
    _getRawPersistedActivatedIds() {
      var e;
      let t = this._getActivatedKey();
      return (
        ((e = this._instance) == null || (e = e.persistence) == null ? void 0 : e.props[t]) || []
      );
    }
    _getPersistedActivatedIds() {
      var e, t, n;
      let r = this._getRawPersistedActivatedIds();
      if (r.length === 0) return [];
      let i =
          (e = this._instance) == null || (e = e.persistence) == null
            ? void 0
            : e.props[this._getActivatedSessionKey()],
        a = (t = this._instance) == null || (n = t.get_session_id) == null ? void 0 : n.call(t);
      return a && i === a ? r : [];
    }
    _stampActivationSession() {
      var e, t;
      let n = (e = this._instance) == null || (t = e.get_session_id) == null ? void 0 : t.call(e);
      n && this._setActivatedSession(n);
    }
    _clearActivationSession() {
      this._clearActivatedSession();
    }
    _onSessionIdChanged(e) {
      var t;
      let n =
        (t = this._instance) == null || (t = t.persistence) == null
          ? void 0
          : t.props[this._getActivatedSessionKey()];
      if (n && n !== e) {
        let e = this._getRawPersistedActivatedIds(),
          t = this._getRawActivationTimestamps();
        (e.length > 0 &&
          (this._setActivatedItems([]),
          e.filter((e) => z(t[e])).forEach((e) => this._cancelPendingItem(e))),
          this._clearActivationSession(),
          this._clearAllActivationTimestamps(),
          e.length > 0 && this._notifyActivationChanged());
      }
    }
    getActivatedIds() {
      return [
        ...new Set([...this._getPersistedActivatedIds(), ...this._pendingActivatedItems]),
      ].filter((e) => !this._isItemPermanentlyIneligible(e));
    }
    dispose() {
      var e, t, n;
      ((e = this._sessionIdUnsubscribe) == null || e.call(this),
        (this._sessionIdUnsubscribe = void 0),
        (t = this._captureHookUnsubscribe) == null || t.call(this),
        (this._captureHookUnsubscribe = void 0),
        (n = this._actionMatcher) == null || n.dispose(),
        (this._actionMatcher = void 0));
    }
    reset() {
      ((this._pendingActivatedItems = []),
        this._getRawPersistedActivatedIds().length > 0 && this._setActivatedItems([]),
        this._clearActivationSession(),
        this._clearAllActivationTimestamps(),
        this._notifyActivationChanged());
    }
    getEventToItemsMap() {
      return this._eventToItems;
    }
    _getActionMatcher() {
      return this._actionMatcher;
    }
  },
  ed = class extends $u {
    constructor(e, t) {
      super(e, t);
    }
    _getActivatedKey() {
      return Oe;
    }
    _getActivatedSessionKey() {
      return ke;
    }
    _getActivationTimestampsKey() {
      return Ae;
    }
    _writeActivationTimestamps(e) {
      var t;
      (t = this._instance) == null ||
        (t = t.persistence) == null ||
        t.register({ $surveys_activated_timestamps: e });
    }
    _clearActivationTimestampsStore() {
      var e;
      (e = this._instance) == null ||
        (e = e.persistence) == null ||
        e.unregister(`$surveys_activated_timestamps`);
    }
    _shouldPersistArmedActivation(e) {
      var t;
      let n;
      this._getItems((t) => {
        n = t.find((t) => t.id === e);
      });
      let r = n == null || (t = n.appearance) == null ? void 0 : t.surveyPopupDelaySeconds;
      return z(r) && r > 0;
    }
    _getShownEventName() {
      return oc.SHOWN;
    }
    _getItems(e) {
      var t;
      (t = this._instance) == null || t.getSurveys(e);
    }
    _cancelPendingItem(e) {
      var t;
      (t = this._instance) == null || t.cancelPendingSurvey(e);
    }
    _getLogger() {
      return $;
    }
    _setActivatedItems(e) {
      var t;
      (t = this._instance) == null ||
        (t = t.persistence) == null ||
        t.register({ $surveys_activated: e });
    }
    _setActivatedSession(e) {
      var t;
      (t = this._instance) == null ||
        (t = t.persistence) == null ||
        t.register({ $surveys_activated_session: e });
    }
    _clearActivatedSession() {
      var e;
      (e = this._instance) == null ||
        (e = e.persistence) == null ||
        e.unregister(`$surveys_activated_session`);
    }
    _isItemPermanentlyIneligible() {
      return !1;
    }
    _activationOutcome(e, t, n) {
      var r;
      if (
        e === oc.SENT &&
        !1 === (n == null || (r = n.properties) == null ? void 0 : r.$survey_completed)
      )
        return `ignore`;
      let i;
      return (
        this._getItems((e) => {
          i = e.find((e) => e.id === t);
        }),
        !i ||
        (function (e) {
          var t;
          return (
            (Ol(e) &&
              !!((t = e.conditions) != null && (t = t.events) != null && t.repeatedActivation)) ||
            e.schedule === `always`
          );
        })(i)
          ? e === oc.SHOWN
            ? `consume`
            : `ignore`
          : e === oc.SHOWN
            ? `persist`
            : e === oc.DISMISSED || e === oc.SENT
              ? `consume`
              : `ignore`
      );
    }
    getSurveys() {
      return this.getActivatedIds();
    }
    getEventToSurveys() {
      return this.getEventToItemsMap();
    }
  },
  td = class {
    constructor(e) {
      this._instance = e;
    }
    initialize() {}
    get(e) {
      if (typeof e == `string`) return this._instance.get_property(e);
      let t = {};
      for (let n of e) {
        let e = this._instance.get_property(n);
        F(e) || (t[n] = e);
      }
      return t;
    }
    set(e, t) {
      this._instance.register(typeof e == `string` ? { [e]: t } : e);
    }
    remove(e) {
      typeof e == `string`
        ? this._instance.unregister(e)
        : e.forEach((e) => this._instance.unregister(e));
    }
  },
  nd = class {
    constructor(e) {
      this._instance = e;
    }
    get() {
      let e = this._instance.config;
      return {
        disableSurveys: e.disable_surveys,
        cookielessMode: !!e.cookieless_mode,
        advancedEnableSurveys: e.advanced_enable_surveys,
        requestTimeoutMs: e.surveys_request_timeout_ms,
      };
    }
    isOptedOut() {
      return this._instance.consent.isOptedOut();
    }
    isCapturing() {
      return this._instance.is_capturing();
    }
    getExtensions() {
      let e = A?.__PosthogExtensions__;
      if (!e) return;
      let { generateSurveys: t, loadExternalDependency: n } = e;
      return {
        generateSurveys: t ? (e) => t(this._instance, e) : void 0,
        loadExternalDependency: n ? (e) => n(this._instance, `surveys`, e) : void 0,
      };
    }
    createEventReceiver(e) {
      return new ed(this._instance, e);
    }
    onMatchingConditionsChanged(e) {
      let t = this._instance._addCaptureHook((t) => {
          (t !== `$pageview` && t !== oc.SHOWN && t !== oc.DISMISSED && t !== oc.SENT) || e();
        }),
        n = () => e();
      K(O, `PHSurveyShown`, n);
      let r = !1,
        i = this._instance.onFeatureFlags(() => {
          r && e();
        });
      return (
        (r = !0),
        () => {
          ((r = !1), t(), i(), O?.removeEventListener(`PHSurveyShown`, n));
        }
      );
    }
  },
  rd = O?.location ? As(O.location.hash, `__posthog`) || As(location.hash, `state`) : null,
  id = `_postHogToolbarParams`,
  ad = U(`[Toolbar]`),
  od = U(`[FeatureFlags]`),
  sd = U(`[FeatureFlags]`, { debugEnabled: !0 }),
  cd = `" failed. Feature flags didn't load in time.`,
  ld = [502, 504],
  ud = [`click`, `keydown`, `wheel`, `touchstart`, `pointerdown`],
  dd = `connection_error`,
  fd = (e) => {
    let t = {};
    for (let n = 0; e.length > n; n++) t[e[n]] = !0;
    return t;
  },
  pd = (e) => {
    let t = {};
    for (let [n, r] of za(e || {})) r && (t[n] = r);
    return t;
  },
  md = class {
    constructor(e) {
      ((this.name = `featureFlags`),
        (this._override_warning = !1),
        (this.featureFlagEventHandlers = []),
        (this._logger = od),
        (this._baseEventProperties = {}),
        (this._eventPropertiesWithFlagValues = {}),
        (this._reloadingHandlers = []),
        (this._pendingReloads = new Set()),
        (this._activeReloads = new Set()),
        (this._hasLoadedFlags = !1),
        (this._requestInFlight = !1),
        (this._requestGeneration = 0),
        (this._reloadingDisabled = !1),
        (this._additionalReloadRequested = !1),
        (this._flagsLoadedFromRemote = !1),
        (this._staleCacheRefreshTriggered = !1),
        (this._consecutiveStatusZeroFailures = 0),
        (this._hadUserInteraction = !1),
        (this._onOnline = () => {
          let e = this._hasStatusZeroCircuitBreakerTripped();
          ((this._consecutiveStatusZeroFailures = 0), e && this.reloadFeatureFlags());
        }),
        (this._refreshIfDue = () => {
          let e = this._refreshIntervalMs,
            t = this._dueRefreshIntervalMs ?? e;
          F(e) ||
            F(t) ||
            this._config.remoteRequestsDisabled ||
            !this._document ||
            this._document.visibilityState === `hidden` ||
            Date.now() - (this._lastRefreshAt ?? 0) < t ||
            ((this._dueRefreshIntervalMs =
              this._hadUserInteraction || !this._config.idleRefreshBackoff
                ? e
                : Math.min(2 * t, 36e5)),
            (this._hadUserInteraction = !1),
            this.reloadFeatureFlags(),
            this._scheduleNextRefresh());
        }),
        (this._onUserInteraction = () => {
          (this._hadUserInteraction && this._dueRefreshIntervalMs === this._refreshIntervalMs) ||
            this._resumeConfiguredInterval();
        }),
        (this._onVisibilityChange = () => {
          this._document?.visibilityState === `visible` && this._resumeConfiguredInterval();
        }),
        (this._configSource = e));
    }
    get _crossTabPersistence() {}
    _onConfigUpdated() {
      this._client && this._syncAutomaticRefresh();
    }
    setup(e) {
      try {
        ((this._window = typeof window > `u` ? void 0 : window),
          (this._document = typeof document > `u` ? void 0 : document));
      } catch {
        ((this._window = void 0), (this._document = void 0));
      }
      return (
        (this._initializingClient = e),
        (this._logger = e.logger.createLogger(`[FeatureFlags]`)),
        qu(e.kv.initialize(), () => {
          this._initializingClient === e &&
            ((this._initializingClient = void 0), (this._client = e), this._finishSetup(e));
        })
      );
    }
    _finishSetup(e) {
      if (this._client === e)
        return (
          this._window && K(this._window, `online`, this._onOnline),
          this._syncAutomaticRefresh(),
          (this._dynamicProperties = e.registerDynamicEventProperties(() =>
            this._isCacheStale() ? this._baseEventProperties : this._eventPropertiesWithFlagValues,
          )),
          (this._crossTabPersistenceUnsubscribe =
            this._crossTabPersistence?.onCrossTabFeatureFlagChange(() => {
              (this._clearBootstrapState(),
                this._rebuildEventProperties(),
                this._fireFeatureFlagsCallbacks());
            })),
          this._rebuildEventProperties(),
          this.initialize()
        );
    }
    _resumeConfiguredInterval() {
      ((this._hadUserInteraction = !0),
        (this._dueRefreshIntervalMs = this._refreshIntervalMs),
        this._refreshIfDue());
    }
    _syncAutomaticRefresh() {
      var e;
      let t = this._config.refreshIntervalMs,
        n = !this._config.remoteRequestsDisabled && this._document && !F(t) && t > 0 ? t : void 0;
      (this._config.idleRefreshBackoff || (this._dueRefreshIntervalMs = n),
        n !== this._refreshIntervalMs &&
          (this._stopAutomaticRefresh(),
          F(n) ||
            ((this._refreshIntervalMs = n),
            (this._dueRefreshIntervalMs = n),
            this._scheduleNextRefresh(),
            (e = this._document) != null &&
              e.addEventListener &&
              (K(this._document, _, this._onVisibilityChange),
              Ra(ud, (e) => {
                K(this._document, e, this._onUserInteraction, { capture: !0 });
              })))));
    }
    _scheduleNextRefresh() {
      F(this._refreshIntervalMs) ||
        (F(this._refreshInterval) || clearInterval(this._refreshInterval),
        (this._lastRefreshAt = Date.now()),
        (this._refreshInterval = setInterval(this._refreshIfDue, this._refreshIntervalMs)));
    }
    _stopAutomaticRefresh() {
      var e, t;
      (F(this._refreshInterval) ||
        (clearInterval(this._refreshInterval),
        (this._refreshInterval = void 0),
        (e = this._document) == null ||
          (t = e.removeEventListener) == null ||
          t.call(e, `visibilitychange`, this._onVisibilityChange),
        Ra(ud, (e) => {
          var t, n;
          (t = this._document) == null ||
            (n = t.removeEventListener) == null ||
            n.call(t, e, this._onUserInteraction, { capture: !0 });
        })),
        (this._refreshIntervalMs = void 0),
        (this._dueRefreshIntervalMs = void 0),
        (this._hadUserInteraction = !1),
        (this._lastRefreshAt = void 0));
    }
    destroy() {
      this._dispose();
    }
    dispose() {
      this._dispose();
    }
    _dispose() {
      var e, t, n;
      (this._stopAutomaticRefresh(),
        this._requestGeneration++,
        (this._additionalReloadRequested = !1),
        (this._initializingClient = void 0),
        this._settleReloads(this._pendingReloads, `cancelled`),
        this._settleReloads(this._activeReloads, `cancelled`),
        (this._client &&=
          (this._clearDebouncer(),
          (e = this._dynamicProperties) == null || e.dispose(),
          (this._dynamicProperties = void 0),
          (t = this._crossTabPersistenceUnsubscribe) == null || t.call(this),
          (this._crossTabPersistenceUnsubscribe = void 0),
          (this._reloadingHandlers = []),
          (n = this._window) == null || n.removeEventListener(`online`, this._onOnline),
          void 0)));
    }
    get _config() {
      return this._configSource.get();
    }
    _prop(e) {
      return this._bootstrapState && e in this._bootstrapState
        ? this._bootstrapState[e]
        : this._client?.kv.get(e);
    }
    _clearBootstrapState() {
      return !!this._bootstrapState && ((this._bootstrapState = void 0), !0);
    }
    _fallBackToPersistedFlags() {
      return !F(this._client?.kv.get(`$enabled_feature_flags`)) && this._clearBootstrapState();
    }
    _set(e) {
      this._persist(() => this._client?.kv.set(e));
    }
    _markCrossTabFeatureFlagSnapshot(e, t, n) {
      if (!this._crossTabPersistence || !e.$enabled_feature_flags) return;
      let a = this._prop(`$enabled_feature_flags`) || {},
        u = e.$enabled_feature_flags || {},
        d = t.flags || t.featureFlags,
        f = t.flags
          ? Object.entries(t.flags)
              .filter(([, e]) => !e?.failed)
              .map(([e]) => e)
          : [],
        p = !!t.errorsWhileComputingFlags && !!t.flags,
        h = p
          ? f
          : n && !M(d)
            ? Object.keys(d || {})
            : Array.from(new Set([...Object.keys(a), ...Object.keys(u)])),
        g = this._prop(`$feature_flag_payloads`) || {},
        _ = e.$feature_flag_payloads || {},
        v = p || n ? h : Array.from(new Set([...Object.keys(g), ...Object.keys(_)])),
        y = !p && !n,
        b = !!y || h,
        x = !!y || v,
        S = { [r]: b, [l]: b, [m]: x };
      e.$feature_flag_details && (S[i] = b);
      for (let t of [s, o, c]) F(e[t]) || (S[t] = !0);
      this._crossTabPersistence.markCrossTabFeatureFlagChanges(S);
    }
    _remove(e) {
      this._persist(() => this._client?.kv.remove(e));
    }
    _persist(e) {
      try {
        e();
      } catch (e) {
        this._logger.error(`Failed to update feature flag persistence`, e);
      }
    }
    _rebuildEventProperties() {
      let e = {};
      for (let t of [r, m, s, h]) {
        let n = this._prop(t);
        F(n) || (e[t] = n);
      }
      this._baseEventProperties = e;
      let t = V({}, e),
        n = this._prop(l);
      if (n) for (let [e, r] of Object.entries(n)) t[`$feature/${e}`] = r;
      this._eventPropertiesWithFlagValues = t;
    }
    _isCacheStale() {
      let e = this._config.cacheTtlMs;
      if (!e || 0 >= e) return !1;
      let t = this._prop(o);
      return typeof t != `number` || Date.now() - t > e;
    }
    _checkAndTriggerStaleRefresh() {
      return (
        !!this._isCacheStale() &&
        (this._staleCacheRefreshTriggered ||
          this._requestInFlight ||
          ((this._staleCacheRefreshTriggered = !0),
          this._logger.warn(`Feature flag cache is stale, triggering refresh...`),
          this.reloadFeatureFlags()),
        !0)
      );
    }
    _getValidEvaluationEnvironments() {
      let e = this._config.evaluationContexts;
      return e?.length
        ? e.filter((e) => {
            let t = e && typeof e == `string` && e.trim().length > 0;
            return (
              t ||
                this._logger.error(
                  `Invalid evaluation context found:`,
                  e,
                  `Expected non-empty string`,
                ),
              t
            );
          })
        : [];
    }
    _getValidFlagKeys() {
      let e = this._config.flagKeys;
      if (!F(e))
        return e.filter((e) => {
          let t = e && typeof e == `string` && e.trim().length > 0;
          return (
            t || this._logger.error(`Invalid flag key found:`, e, `Expected non-empty string`),
            t
          );
        });
    }
    initialize() {
      let e = this._config,
        t = e.bootstrap?.featureFlags ?? {};
      if (Object.keys(t).length) {
        let n = e.bootstrap?.featureFlagPayloads ?? {},
          r = Object.keys(t)
            .filter((e) => !F(t[e]))
            .reduce((e, n) => ((e[n] = t[n]), e), {}),
          i = Object.keys(n)
            .filter((e) => r[e])
            .reduce((e, t) => ((e[t] = n[t]), e), {});
        return this._receivedFeatureFlags({ featureFlags: r, featureFlagPayloads: i }, void 0, {
          persist: !1,
        });
      }
    }
    updateFlags(e, t, n) {
      var r, i;
      let a = n?.merge && (r = this._prop(`$enabled_feature_flags`)) != null ? r : {},
        o = n?.merge && (i = this._prop(`$feature_flag_payloads`)) != null ? i : {},
        s = V(V({}, a), e),
        c = V(V({}, o), t),
        l = {};
      for (let [e, t] of Object.entries(s))
        l[e] = {
          key: e,
          enabled: fi(t),
          variant: pi(t),
          reason: void 0,
          metadata: F(c?.[e])
            ? void 0
            : { id: 0, version: void 0, description: void 0, payload: c[e] },
        };
      this._receivedFeatureFlags({ flags: l });
    }
    get hasLoadedFlags() {
      return this._hasLoadedFlags;
    }
    getFlags() {
      return Object.keys(this.getFlagVariants());
    }
    getFlagsWithDetails() {
      let e = this._prop(i),
        t = this._prop(h),
        n = this._prop(g);
      if (!n && !t) return e || {};
      let r = G({}, e || {}),
        a = [...new Set([...Object.keys(n || {}), ...Object.keys(t || {})])];
      for (let e of a) {
        var o, s;
        let i = r[e],
          a = t?.[e],
          c = F(a) ? (o = i?.enabled) != null && o : !!a,
          l = F(a) ? i?.variant : typeof a == `string` ? a : void 0,
          u = n?.[e],
          d = V(V({}, i), {}, { enabled: c, variant: c ? (l ?? i?.variant) : void 0 });
        (c !== i?.enabled && (d.original_enabled = i?.enabled),
          l !== i?.variant && (d.original_variant = i?.variant),
          u &&
            (d.metadata = V(
              V({}, i?.metadata),
              {},
              {
                payload: u,
                original_payload: i == null || (s = i.metadata) == null ? void 0 : s.payload,
              },
            )),
          (r[e] = d));
      }
      return (
        (this._override_warning ||=
          (this._logger.warn(` Overriding feature flag details!`, {
            flagDetails: e,
            overriddenPayloads: n,
            finalDetails: r,
          }),
          !0)),
        r
      );
    }
    getAllFeatureFlags() {
      let e = this.getFlagVariants(),
        t = this.getFlagPayloads();
      return Object.keys(e).map((n) => {
        let r = e[n];
        return { key: n, enabled: fi(r), variant: pi(r), payload: di(t[n]) };
      });
    }
    getFlagVariants() {
      let e = this._prop(l),
        t = this._prop(h);
      if (!t) return e || {};
      let n = G({}, e || {}),
        r = Object.keys(t);
      for (let e = 0; r.length > e; e++) n[r[e]] = t[r[e]];
      return (
        (this._override_warning ||=
          (this._logger.warn(` Overriding feature flags!`, {
            enabledFlags: e,
            overriddenFlags: t,
            finalFlags: n,
          }),
          !0)),
        n
      );
    }
    getFlagPayloads() {
      let e = this._prop(m),
        t = this._prop(g);
      if (!t) return e || {};
      let n = G({}, e || {}),
        r = Object.keys(t);
      for (let e = 0; r.length > e; e++) n[r[e]] = t[r[e]];
      return (
        (this._override_warning ||=
          (this._logger.warn(` Overriding feature flag payloads!`, {
            flagPayloads: e,
            overriddenPayloads: t,
            finalPayloads: n,
          }),
          !0)),
        n
      );
    }
    reloadFeatureFlags() {
      this._reloadingDisabled ||
        this._config.featureFlagsDisabled ||
        this._hasStatusZeroCircuitBreakerTripped() ||
        (this._requestInFlight && (this._additionalReloadRequested = !0),
        (this._reloadDebouncer ||=
          (this._reloadingHandlers.slice().forEach((e) => {
            try {
              e();
            } catch (e) {
              this._logger.error(`Error while running feature flags reloading callback`, e);
            }
          }),
          setTimeout(() => {
            this._callFlagsEndpoint();
          }, 5))));
    }
    reloadFeatureFlagsAsync() {
      return !this._client ||
        this._reloadingDisabled ||
        this._config.featureFlagsDisabled ||
        this._config.remoteRequestsDisabled ||
        this._hasStatusZeroCircuitBreakerTripped()
        ? Promise.resolve({ status: `skipped` })
        : new Promise((e) => {
            (this._pendingReloads.add(e), this.reloadFeatureFlags());
          });
    }
    _settleReloads(e, t) {
      (e.forEach((e) => e({ status: t })), e.clear());
    }
    _clearDebouncer() {
      (clearTimeout(this._reloadDebouncer), (this._reloadDebouncer = void 0));
    }
    onReloading(e) {
      return (
        this._reloadingHandlers.push(e),
        () => {
          this._reloadingHandlers = this._reloadingHandlers.filter((t) => t !== e);
        }
      );
    }
    ensureFlagsLoaded() {
      this._hasLoadedFlags ||
        this._requestInFlight ||
        this._reloadDebouncer ||
        this.reloadFeatureFlags();
    }
    setAnonymousDistinctId(e) {
      this.$anon_distinct_id = e;
    }
    setReloadingPaused(e) {
      this._reloadingDisabled = e;
    }
    resetFlagCallReported() {
      this._remove(f);
    }
    _callFlagsEndpoint(e) {
      this._clearDebouncer();
      let t = this._client;
      if (!t || this._config.remoteRequestsDisabled || this._hasStatusZeroCircuitBreakerTripped())
        return void this._settleReloads(this._pendingReloads, `skipped`);
      if (this._requestInFlight) return void (this._additionalReloadRequested = !0);
      let n = {
        token: t.projectToken,
        distinct_id: t.distinctId,
        groups: t.groups,
        $anon_distinct_id: this.$anon_distinct_id,
        person_properties: V(
          V(V({}, t.initialPersonProperties), this._prop(`$stored_person_properties`) || {}),
          {},
          { $lib: t.library.name, $lib_version: t.library.version },
        ),
        group_properties: this._prop(u),
        timezone: Ss(),
      };
      (F(t.deviceId) || (n.$device_id = t.deviceId),
        ((e != null && e.disableFlags) || this._config.featureFlagsDisabled) &&
          (n.disable_flags = !0));
      let r = this._getValidEvaluationEnvironments();
      r.length && (n.evaluation_contexts = r);
      let i = this._getValidFlagKeys();
      F(i) || (n.flag_keys = i);
      let o = this._config.onlyEvaluateSurveyFeatureFlags,
        s = `/flags/?v=2` + (o ? `&only_evaluate_survey_feature_flags=true` : ``),
        c = this._requestGeneration,
        l = this._pendingReloads;
      ((this._pendingReloads = new Set()), (this._activeReloads = l), (this._requestInFlight = !0));
      let d = () => {
          this._additionalReloadRequested &&
            ((this._additionalReloadRequested = !1), this._callFlagsEndpoint());
        },
        f = (e) => {
          let t = e.json ?? {},
            r = e.statusCode !== 200;
          if (((this._requestInFlight = !1), c !== this._requestGeneration)) return void d();
          if (
            (this._trackStatusZeroReachability(e.statusCode),
            r || this._additionalReloadRequested || (this.$anon_distinct_id = void 0),
            n.disable_flags && !this._additionalReloadRequested)
          )
            return void this._settleReloads(l, `skipped`);
          this._flagsLoadedFromRemote = !r;
          let i = [];
          (e.error
            ? i.push(
                e.error instanceof Error && e.error.name === `AbortError`
                  ? `timeout`
                  : e.error instanceof Error
                    ? dd
                    : `unknown_error`,
              )
            : e.statusCode !== 200 && i.push(`api_error_${e.statusCode}`),
            t.errorsWhileComputingFlags && i.push(`errors_while_computing_flags`));
          let s = !!t.quotaLimited?.includes(`feature_flags`);
          (s && i.push(`quota_limited`),
            this._set({ [a]: i }),
            s
              ? this._logger.warn(
                  `You have hit your feature flags quota limit, and will not be able to load feature flags until the quota is reset.  Please visit https://posthog.com/docs/billing/limits-alerts to learn more.`,
                )
              : n.disable_flags || this._receivedFeatureFlags(t, r, { partialResponse: o }),
            this._settleReloads(
              l,
              n.disable_flags
                ? `skipped`
                : i.length || (!t.flags && !t.featureFlags)
                  ? `error`
                  : `loaded`,
            ),
            d());
        },
        p = (e) => {
          ((this._requestInFlight = !1),
            c === this._requestGeneration &&
              (this._set({ [a]: [dd] }),
              this._logger.error(`Feature flag request failed`, e),
              this._fallBackToPersistedFlags() && this._fireFeatureFlagsCallbacks(!0),
              this._settleReloads(l, `error`)),
            d());
        },
        m = this._config.requestMaxRetries ?? 1,
        h = () => m > 0 && c === this._requestGeneration,
        g = () => {
          if (c !== this._requestGeneration || !this._client || this._config.remoteRequestsDisabled)
            return ((this._requestInFlight = !1), this._settleReloads(l, `skipped`), void d());
          try {
            t.sendRequest(s, {
              target: `flags`,
              method: `POST`,
              body: n,
              compression: this._config.compression,
              sentAt: `body`,
              timeoutMs: this._config.requestTimeoutMs,
            })
              .then((e) => {
                if (
                  ((e) =>
                    ld.includes(e.statusCode) ||
                    ((e) =>
                      e.statusCode === 0 &&
                      e.error instanceof Error &&
                      e.error.name === `AbortError`)(e))(e) &&
                  h()
                )
                  return (m--, void setTimeout(g, 500));
                f(e);
              })
              .catch(p);
          } catch (e) {
            p(e);
          }
        };
      g();
    }
    _hasStatusZeroCircuitBreakerTripped() {
      return ws(this._consecutiveStatusZeroFailures, 3);
    }
    _trackStatusZeroReachability(e) {
      this._consecutiveStatusZeroFailures = Ts(e, this._consecutiveStatusZeroFailures, 3, () =>
        this._logger.warn(
          `Feature flag requests are failing before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped refreshing feature flags; will try again when connectivity changes.`,
        ),
      );
    }
    getFeatureFlag(e, t = {}) {
      if (t.fresh && !this._flagsLoadedFromRemote) return;
      if (!(this._hasLoadedFlags || (this.getFlags() && this.getFlags().length > 0)))
        return void this._logger.warn(`getFeatureFlag for key "` + e + cd);
      if (this._checkAndTriggerStaleRefresh()) return;
      let n = this.getFeatureFlagResult(e, t);
      return n?.variant ?? n?.enabled;
    }
    getFeatureFlagDetails(e) {
      return this.getFlagsWithDetails()[e];
    }
    getFeatureFlagPayload(e) {
      return this.getFeatureFlagResult(e, { send_event: !1 })?.payload;
    }
    getFeatureFlagResult(e, t = {}) {
      if (t.fresh && !this._flagsLoadedFromRemote) return;
      if (!(this._hasLoadedFlags || (this.getFlags() && this.getFlags().length > 0)))
        return void this._logger.warn(`getFeatureFlagResult for key "` + e + cd);
      if (this._checkAndTriggerStaleRefresh()) return;
      let n = this.getFlagVariants(),
        r = e in n,
        i = n[e],
        a = this.getFlagPayloads()[e],
        o = String(i),
        s = this._prop(`$feature_flag_request_id`) || void 0,
        c = this._prop(`$feature_flag_evaluated_at`) || void 0,
        l,
        u = this._prop(`$flag_call_reported`) || {};
      if (this._config.deduplicateCallsPerSession) {
        var d;
        let e = (d = this._client) == null || (d = d.session) == null ? void 0 : d.sessionId,
          t = this._prop(p);
        e && e !== t && ((u = {}), (l = e));
      }
      if (!t.send_event && `send_event` in t) l && this._set({ [f]: u, [p]: l });
      else if (e in u && u[e].includes(o)) l && this._set({ [f]: u, [p]: l });
      else {
        var m, h, g, _, v, y, b, x, S;
        (M(u[e]) ? u[e].push(o) : (u[e] = [o]), this._set(V({ [f]: u }, l ? { [p]: l } : {})));
        let t = this.getFeatureFlagDetails(e),
          n = [...(this._prop(`$feature_flag_errors`) ?? [])];
        F(i) && n.push(`flag_missing`);
        let r = {
          $feature_flag: e,
          $feature_flag_response: i,
          $feature_flag_payload: a ?? null,
          $feature_flag_request_id: s,
          $feature_flag_evaluated_at: c,
          $feature_flag_bootstrapped_response:
            ((m = this._config.bootstrap) == null || (m = m.featureFlags) == null
              ? void 0
              : m[e]) ?? null,
          $feature_flag_bootstrapped_payload:
            ((h = this._config.bootstrap) == null || (h = h.featureFlagPayloads) == null
              ? void 0
              : h[e]) ?? null,
          $used_bootstrap_value: !this._flagsLoadedFromRemote,
        };
        (F(t == null || (g = t.metadata) == null ? void 0 : g.has_experiment) ||
          (r.$feature_flag_has_experiment = t.metadata.has_experiment),
          F(t == null || (_ = t.metadata) == null ? void 0 : _.version) ||
            (r.$feature_flag_version = t.metadata.version));
        let d =
          (t == null || (v = t.reason) == null ? void 0 : v.description) ??
          (t == null || (y = t.reason) == null ? void 0 : y.code);
        (d && (r.$feature_flag_reason = d),
          t != null && (b = t.metadata) != null && b.id && (r.$feature_flag_id = t.metadata.id),
          (F(t?.original_variant) && F(t?.original_enabled)) ||
            (r.$feature_flag_original_response = F(t.original_variant)
              ? t.original_enabled
              : t.original_variant),
          t != null &&
            (x = t.metadata) != null &&
            x.original_payload &&
            (r.$feature_flag_original_payload =
              t == null || (S = t.metadata) == null ? void 0 : S.original_payload),
          n.length && (r.$feature_flag_error = n.join(`,`)),
          this._captureFeatureFlagCalled(r));
      }
      return r
        ? { key: e, enabled: !!i, variant: typeof i == `string` ? i : void 0, payload: di(a) }
        : void 0;
    }
    _captureFeatureFlagCalled(e) {
      try {
        var t;
        (t = this._client) == null || t.capture(`$feature_flag_called`, e);
      } catch (e) {
        this._logger.error(`Failed to capture feature flag call`, e);
      }
    }
    getRemoteConfigPayload(e, t) {
      this._getRemoteConfigPayload(e, t);
    }
    _getRemoteConfigPayload(e, t) {
      var n = this;
      return B(function* () {
        let r = n._client;
        if (!r) return;
        let i = {
            distinct_id: r.distinctId,
            token: r.projectToken,
            person_properties: { $lib: r.library.name, $lib_version: r.library.version },
          },
          a = n._getValidEvaluationEnvironments();
        a.length && (i.evaluation_contexts = a);
        let o = n._getValidFlagKeys(),
          s;
        F(o) || (i.flag_keys = o);
        try {
          s =
            (yield r.sendRequest(`/flags/?v=2`, {
              target: `flags`,
              method: `POST`,
              body: i,
              compression: n._config.compression,
              sentAt: `body`,
              timeoutMs: n._config.requestTimeoutMs,
            })).json?.featureFlagPayloads?.[e] || void 0;
        } catch (e) {
          n._logger.error(`Remote config feature flag request failed`, e);
          return;
        }
        try {
          t(s);
        } catch (e) {
          n._logger.error(`Remote config feature flag callback failed`, e);
        }
      })();
    }
    isFeatureEnabled(e, t = {}) {
      if (t.fresh && !this._flagsLoadedFromRemote) return t.defaultValue;
      if (!(this._hasLoadedFlags || (this.getFlags() && this.getFlags().length > 0)))
        return (this._logger.warn(`isFeatureEnabled for key "` + e + cd), t.defaultValue);
      let n = this.getFeatureFlag(e, t);
      return F(n) ? t.defaultValue : !!n;
    }
    addFeatureFlagsHandler(e) {
      this.featureFlagEventHandlers.push(e);
    }
    removeFeatureFlagsHandler(e) {
      this.featureFlagEventHandlers = this.featureFlagEventHandlers.filter((t) => t !== e);
    }
    receivedFeatureFlags(e, t, n) {
      this._receivedFeatureFlags(e, t, n);
    }
    _receivedFeatureFlags(e, t, n) {
      if (!this._client) return;
      this._hasLoadedFlags = !0;
      let a = ((e, t = {}, n = {}, a = {}, u, d = od) => {
        let f = ((e, t) => {
            let n = e.flags;
            if (n) {
              let t = Object.fromEntries(
                  Object.keys(n).map((e) => [e, n[e].variant ?? n[e].enabled]),
                ),
                r = Object.fromEntries(
                  Object.keys(n)
                    .filter((e) => n[e].enabled)
                    .filter((e) => !F(n[e].metadata?.payload))
                    .map((e) => [e, n[e].metadata?.payload]),
                );
              return V(V({}, e), {}, { featureFlags: t, featureFlagPayloads: r });
            }
            return (
              e.featureFlags &&
                t.warn(
                  `Using an older version of the feature flags endpoint. Please upgrade your PostHog server to the latest version`,
                ),
              e
            );
          })(e, d),
          p = f.flags,
          h = f.featureFlags,
          g = f.featureFlagPayloads;
        if (!h) return;
        let _ = e.requestId,
          v = e.evaluatedAt;
        if (M(h)) {
          d.warn(`v1 of the feature flags endpoint is deprecated. Please use the latest version.`);
          let e = {};
          if (h) for (let t = 0; h.length > t; t++) e[h[t]] = !0;
          return { [r]: h, [l]: e, [c]: !1 };
        }
        let y = h,
          b = g,
          x = p;
        if (u?.partialResponse) {
          let e = Object.keys(y),
            r = b || {};
          ((y = V(V({}, t), y)),
            (b = V(V({}, n), r)),
            e.forEach((e) => {
              e in r || b == null || delete b[e];
            }),
            (x = V(V({}, a), x)));
        } else if (e.errorsWhileComputingFlags) {
          if (p) {
            let e = new Set(Object.keys(p).filter((e) => !p[e]?.failed));
            y = V(V({}, t), Object.fromEntries(Object.entries(y).filter(([t]) => e.has(t))));
            let r = Object.fromEntries(Object.entries(b || {}).filter(([t]) => e.has(t)));
            ((b = V(V({}, n), r)),
              e.forEach((e) => {
                e in r || b == null || delete b[e];
              }),
              (x = V(
                V({}, a),
                Object.fromEntries(Object.entries(x || {}).filter(([t]) => e.has(t))),
              )));
          } else ((y = V(V({}, t), y)), (b = V(V({}, n), b)), (x = V(V({}, a), x)));
        }
        return V(
          V(
            {
              [r]: Object.keys(pd(y)),
              [l]: y || {},
              [m]: b || {},
              [i]: x || {},
              [c]: !0 === e.minimalFlagCalledEvents,
            },
            _ ? { [s]: _ } : {},
          ),
          v ? { [o]: v } : {},
        );
      })(
        e,
        this.getFlagVariants(),
        this.getFlagPayloads(),
        this.getFlagsWithDetails(),
        n,
        this._logger,
      );
      if (a) {
        if (!1 === n?.persist) {
          let e = !F(this._client.kv.get(l));
          ((this._bootstrapState = a), e || this._set(a));
        } else
          (this._clearBootstrapState(),
            this._markCrossTabFeatureFlagSnapshot(a, e, !!n?.partialResponse),
            this._set(a));
      } else t && this._fallBackToPersistedFlags();
      (t || (this._staleCacheRefreshTriggered = !1), this._fireFeatureFlagsCallbacks(t));
    }
    override(e, t = !1) {
      (this._logger.warn(`override is deprecated. Please use overrideFeatureFlags instead.`),
        this.overrideFeatureFlags({ flags: e, suppressWarning: t }));
    }
    overrideFeatureFlags(e) {
      this._overrideFeatureFlags(e);
    }
    _overrideFeatureFlags(e) {
      if (this._client) {
        if (!1 === e)
          return (
            this._remove([h, g]),
            this._fireFeatureFlagsCallbacks(),
            void sd.info(`All overrides cleared`)
          );
        if (M(e))
          return (
            this._set({ [h]: fd(e) }),
            this._fireFeatureFlagsCallbacks(),
            void sd.info(`Flag overrides set`, { flags: e })
          );
        if (e && typeof e == `object` && (`flags` in e || `payloads` in e)) {
          var t;
          let n = e;
          this._override_warning = !!((t = n.suppressWarning) != null && t);
          let r = {},
            i = n.flags,
            a = n.payloads;
          (i && (r[h] = M(i) ? fd(i) : i),
            a && (r[g] = a),
            Object.keys(r).length && this._set(r),
            !1 === i && !1 === a
              ? this._remove([h, g])
              : !1 === i
                ? this._remove(h)
                : !1 === a && this._remove(g),
            this._fireFeatureFlagsCallbacks(),
            !1 === i
              ? sd.info(`Flag overrides cleared`)
              : i && sd.info(`Flag overrides set`, { flags: i }),
            !1 === a
              ? sd.info(`Payload overrides cleared`)
              : a && sd.info(`Payload overrides set`, { payloads: a }));
          return;
        }
        if (e && typeof e == `object`)
          return (
            this._set({ [h]: e }),
            this._fireFeatureFlagsCallbacks(),
            void sd.info(`Flag overrides set`, { flags: e })
          );
        this._logger.warn(`Invalid overrideOptions provided to overrideFeatureFlags`, {
          overrideOptions: e,
        });
      } else
        this._logger.warn(
          `posthog.featureFlags.overrideFeatureFlags called before feature flags were ready`,
        );
    }
    onFeatureFlags(e) {
      if ((this.addFeatureFlagsHandler(e), this._hasLoadedFlags)) {
        let { flags: t, flagVariants: n } = this._prepareFeatureFlagsForCallbacks();
        try {
          e(t, n);
        } catch (e) {
          this._logger.error(`Error while running feature flags callback`, e);
        }
      }
      return () => this.removeFeatureFlagsHandler(e);
    }
    updateEarlyAccessFeatureEnrollment(e, t, n) {
      var i;
      let a = (this._prop(`$early_access_features`) || []).find((t) => t.flagKey === e),
        o = { [`$feature_enrollment/${e}`]: t },
        s = { $feature_flag: e, $feature_enrollment: t, $set: o };
      (a && (s.$early_access_feature_name = a.name), n && (s.$feature_enrollment_stage = n));
      let c = V(V({}, this.getFlagVariants()), {}, { [e]: t });
      ((i = this._crossTabPersistence) == null ||
        i.markCrossTabFeatureFlagChanges({
          $active_feature_flags: [e],
          $enabled_feature_flags: [e],
          $stored_person_properties: Object.keys(o),
        }),
        this._set({
          [r]: Object.keys(pd(c)),
          [l]: c,
          [d]: V(V({}, this._prop(`$stored_person_properties`) || {}), o),
        }),
        this._fireFeatureFlagsCallbacks());
      try {
        var u;
        (u = this._client) == null || u.capture(`$feature_enrollment_update`, s);
      } catch (e) {
        this._logger.error(`Failed to capture early access feature enrollment`, e);
      }
    }
    getEarlyAccessFeatures(e, t = !1, r) {
      let i = this._prop(n);
      !i || t ? this._getEarlyAccessFeatures(e, r) : e(i);
    }
    _getEarlyAccessFeatures(e, t) {
      var r = this;
      return B(function* () {
        let i = r._client;
        if (!i) return;
        let a = t ? `&${t.map((e) => `stage=${e}`).join(`&`)}` : ``,
          o;
        try {
          let e = yield i.sendRequest(`/api/early_access_features/?token=${i.projectToken}${a}`, {
            target: `api`,
            method: `GET`,
            sentAt: `query`,
          });
          if (!e.json) return;
          ((o = e.json.earlyAccessFeatures), r._set({ [n]: o }));
        } catch (e) {
          r._logger.error(`Early access feature request failed`, e);
          return;
        }
        try {
          e(o);
        } catch (e) {
          r._logger.error(`Early access feature callback failed`, e);
        }
      })();
    }
    _prepareFeatureFlagsForCallbacks() {
      let e = this.getFlags(),
        t = this.getFlagVariants();
      return {
        flags: e.filter((e) => t[e]),
        flagVariants: Object.keys(t)
          .filter((e) => t[e])
          .reduce((e, n) => ((e[n] = t[n]), e), {}),
      };
    }
    _fireFeatureFlagsCallbacks(e) {
      this._rebuildEventProperties();
      let { flags: t, flagVariants: n } = this._prepareFeatureFlagsForCallbacks();
      this.featureFlagEventHandlers.forEach((r) => {
        try {
          r(t, n, { errorsLoading: e });
        } catch (e) {
          this._logger.error(`Error while running feature flags callback`, e);
        }
      });
    }
    setPersonPropertiesForFlags(e, t = !0) {
      this._setPersonPropertiesForFlags(e, t);
    }
    _setPersonPropertiesForFlags(e, t = !0) {
      let n = this._prop(`$stored_person_properties`) || {},
        r = e?.$set || (e?.$set_once ? {} : e),
        i = e?.$set_once,
        a = {};
      if (i) for (let e in i) ({}).hasOwnProperty.call(i, e) && (e in n || (a[e] = i[e]));
      (this._set({ [d]: V(V(V({}, n), a), r) }), t && this.reloadFeatureFlags());
    }
    unsetPersonPropertiesForFlags(e, t = !0) {
      let n = V({}, this._prop(`$stored_person_properties`) || {});
      (e.forEach((e) => {
        delete n[e];
      }),
        this._set({ [d]: n }),
        t && this.reloadFeatureFlags());
    }
    resetPersonPropertiesForFlags(e = !0) {
      (this._remove(d), e && this.reloadFeatureFlags());
    }
    setGroupPropertiesForFlags(e, t = !0) {
      let n = this._prop(`$stored_group_properties`) || {},
        r = V({}, n);
      for (let t of Object.keys(e)) r[t] = V(V({}, n[t]), e[t]);
      (this._set({ [u]: r }), t && this.reloadFeatureFlags());
    }
    resetGroupPropertiesForFlags(e) {
      if (e) {
        let t = this._prop(`$stored_group_properties`) || {};
        this._set({ [u]: V(V({}, t), {}, { [e]: {} }) });
      } else this._remove(u);
    }
    reset() {
      (this._requestGeneration++,
        this._settleReloads(this._pendingReloads, `cancelled`),
        this._settleReloads(this._activeReloads, `cancelled`),
        (this._additionalReloadRequested = !1),
        (this._baseEventProperties = {}),
        (this._eventPropertiesWithFlagValues = {}),
        (this._bootstrapState = void 0),
        (this._hasLoadedFlags = !1),
        (this._reloadingDisabled = !1),
        (this._flagsLoadedFromRemote = !1),
        (this.$anon_distinct_id = void 0),
        this._clearDebouncer(),
        (this._override_warning = !1),
        (this._consecutiveStatusZeroFailures = 0));
    }
  },
  hd = U(`[FeatureFlags]`),
  gd = class {
    constructor(e, t = !1) {
      ((this._loggedEvaluationEnvironmentsDeprecation = !1), this.update(e, t));
    }
    update(e, t) {
      ((this._snapshot = ((e, t) => ({
        bootstrap: {
          featureFlags: e.bootstrap?.featureFlags ?? void 0,
          featureFlagPayloads: e.bootstrap?.featureFlagPayloads ?? void 0,
        },
        remoteRequestsDisabled: t,
        featureFlagsDisabled: !!e.advanced_disable_feature_flags,
        onlyEvaluateSurveyFeatureFlags: !!e.advanced_only_evaluate_survey_feature_flags,
        deduplicateCallsPerSession: !!e.advanced_feature_flags_dedup_per_session,
        cacheTtlMs: e.feature_flag_cache_ttl_ms,
        refreshIntervalMs: e.remote_config_refresh_interval_ms ?? 3e5,
        idleRefreshBackoff: F(e.remote_config_refresh_interval_ms),
        requestTimeoutMs: e.feature_flag_request_timeout_ms,
        requestMaxRetries: Math.max(0, e.feature_flag_request_max_retries ?? 1),
        compression: e.disable_compression ? void 0 : `best-available`,
        evaluationContexts: e.evaluation_contexts ?? e.evaluation_environments ?? [],
        flagKeys: M(e.flag_keys) ? e.flag_keys : void 0,
      }))(e, t)),
        !e.evaluation_environments ||
          e.evaluation_contexts ||
          this._loggedEvaluationEnvironmentsDeprecation ||
          (hd.warn(
            `evaluation_environments is deprecated. Use evaluation_contexts instead. evaluation_environments will be removed in a future version.`,
          ),
          (this._loggedEvaluationEnvironmentsDeprecation = !0)),
        F(e.flag_keys) ||
          M(e.flag_keys) ||
          hd.error(`Invalid flag_keys found:`, e.flag_keys, `Expected array of non-empty strings`));
    }
    get() {
      return this._snapshot;
    }
  },
  _d = (e) =>
    Vt(e) &&
    ((e.name === `RangeError` && e.message.indexOf(`Maximum call stack size exceeded`) === 0) ||
      (e.name === `InternalError` && e.message === `too much recursion`)),
  vd = U(`[Error tracking]`),
  yd = `webkit-masked-url:`,
  bd = [
    { value: `isolatedAPI.contexts.topHostname`, exact: !1 },
    { value: `No response from target`, exact: !0 },
  ],
  xd = [
    `chrome-extension://`,
    `moz-extension://`,
    `safari-extension:`,
    `safari-web-extension:`,
    yd,
  ],
  Sd = [`__firefox__`, `__gCrWeb`],
  Cd = `Refusing to render web experiment since the viewer is a likely bot`,
  wd = {
    icontains: (e, t) => t.toLowerCase().indexOf(e.toLowerCase()) > -1,
    not_icontains: (e, t) => t.toLowerCase().indexOf(e.toLowerCase()) === -1,
    regex: (e, t) => kl(t, e),
    not_regex: (e, t) => !kl(t, e),
    exact: (e, t) => t === e,
    is_not: (e, t) => t !== e,
  },
  Td = U(`[Conversations]`),
  Ed = `Conversations not available yet.`;
function Dd(e, t) {
  let n = e?.flushIntervalMs ?? 3e3,
    r = e?.maxBufferSize ?? 100,
    i = t?.consoleCapture ? void 0 : (e?.maxLogsPerInterval ?? 1e3),
    a = F(i) ? Math.max(r, 2048) : Math.max(r, i),
    o = V(
      V(
        {},
        (function () {
          let e = ``,
            t = ``;
          try {
            var n;
            let r = `u` > typeof globalThis ? globalThis : `u` > typeof window ? window : void 0,
              i = r == null || (n = r.navigator) == null ? void 0 : n.userAgent;
            i && ([e, t] = Qn(i));
          } catch {}
          return (function (e, t) {
            let n = (function (e) {
              if (e) return {}.hasOwnProperty.call(_a, e) ? _a[e] : e;
            })(e);
            return V(V({}, n ? { "os.name": n } : {}), t ? { "os.version": t } : {});
          })(e, t);
        })(),
      ),
      e?.resourceAttributes,
    );
  return {
    serviceName: o?.[`service.name`] ?? e?.serviceName ?? t?.serviceNameDefault,
    serviceVersion: o?.[`service.version`] ?? e?.serviceVersion,
    environment: o?.[`deployment.environment`] ?? e?.environment,
    resourceAttributes: o,
    beforeSend: e?.beforeSend,
    flushIntervalMs: n,
    maxBufferSize: r,
    maxQueueSize: a,
    maxBatchRecordsPerPost: 100,
    rateCapWindowMs: n,
    maxLogsPerInterval: i,
    backgroundFlushBudgetMs: 0,
    terminationFlushBudgetMs: 0,
  };
}
var Od = [`debug`, `log`, `warn`, `error`, `info`],
  kd = (e) => {
    for (; e?.__rrweb_original__; ) e = e.__rrweb_original__;
    return e;
  },
  Ad = `console`,
  jd = `__posthogHandledLogsRequestError`,
  Md = (e, t) => {
    let n = e instanceof Error ? e : Error(t);
    return ((n[jd] = !0), n);
  },
  Nd = (e) => !!e && typeof e == `object` && !0 === e[jd],
  Pd = class {
    get _coreLogger() {
      return V(
        V({}, this._logger),
        {},
        {
          error: (...e) => {
            e.some(Nd) || this._logger.error(...e);
          },
        },
      );
    }
    constructor(e, t) {
      ((this._configSource = e),
        (this._getSdkContext = t),
        (this.name = `logs`),
        (this._isLogsEnabled = !1),
        (this._isLoaded = !1),
        (this._isLoading = !1),
        (this._logger = U(`[logs]`)),
        (this._queue = []),
        (this._consoleQueue = []),
        (this._consecutiveStatusZeroFailures = 0),
        (this._setupStarted = !1),
        (this._disposed = !1),
        (this._consoleBuffer = []),
        (this._consoleRecorderUnpatchers = []),
        (this._isRecordingConsole = !1),
        (this._isRecordingConsoleEntry = !1),
        (this._listeningForReconnect = !1),
        (this._onReconnect = () => {
          var e, t;
          this._disposed ||
            ((this._consecutiveStatusZeroFailures = 0),
            (e = this._core) == null || e.onReconnect(),
            (t = this._consoleCore) == null || t.onReconnect());
        }),
        (this._isLogsEnabled = !!e.get()?.captureConsoleLogs));
    }
    get _isRequestReady() {
      return !0;
    }
    _getConsoleLoader() {}
    _listenForReconnect() {
      if (!this._listeningForReconnect) {
        try {
          this._window = typeof window > `u` ? void 0 : window;
        } catch {
          this._window = void 0;
        }
        this._window &&
          (K(this._window, `online`, this._onReconnect), (this._listeningForReconnect = !0));
      }
    }
    _buildCore(e, t, n, r) {
      this._listenForReconnect();
      let i = Dd(this._configSource.get(), n);
      return [
        new Da(
          this._createHost(e, t),
          i,
          this._coreLogger,
          () => this._getSdkContext(),
          (e) => e(),
          void 0,
          r,
        ),
        i,
      ];
    }
    _getCore() {
      let e = this._configSource.get();
      var t;
      return (
        (this._core && this._resolvedFrom === e) ||
          ((t = this._core) == null || t.reset(),
          (this._resolvedFrom = e),
          ([this._core, this._resolvedConfig] = this._buildCore(
            () => this._queue,
            (e) => {
              this._queue = e;
            },
          ))),
        this._core
      );
    }
    _getConsoleCore() {
      let e = this._configSource.get();
      var t;
      return (
        (this._consoleCore && this._consoleResolvedFrom === e) ||
          ((t = this._consoleCore) == null || t.reset(),
          (this._consoleResolvedFrom = e),
          ([this._consoleCore, this._consoleResolvedConfig] = this._buildCore(
            () => this._consoleQueue,
            (e) => {
              this._consoleQueue = e;
            },
            { serviceNameDefault: `posthog-browser-logs`, consoleCapture: !0 },
            Ad,
          ))),
        this._consoleCore
      );
    }
    setup(e) {
      if (!this._disposed && !this._setupStarted)
        return (
          (this._setupStarted = !0),
          (this._client = e),
          (this._logger = e.logger.createLogger(`[logs]`)),
          qu(e.kv.initialize(), () => {
            this._disposed || this._finishSetup(e);
          })
        );
    }
    _finishSetup(e) {
      var t;
      (this._listenForReconnect(),
        (t = this._configSource.get()) != null &&
          t.captureConsoleLogs &&
          (this._isLogsEnabled = !0),
        (this._isLogsEnabled ||
          (this._configSource.remoteConfigWillArrive &&
            e.kv.get(this._configSource.captureHintKey))) &&
          this._startConsoleRecorder());
      let n = !1,
        r = e.onRemoteConfig((e) => {
          ((n = e.ok && !0 === e.config.logs?.captureConsoleLogs), this.onRemoteConfig(e));
        });
      this._disposed
        ? r.dispose()
        : ((this._remoteConfigSubscription = r), n || this.loadIfEnabled());
    }
    dispose() {
      var e, t, n, r, i, a, o;
      this._disposed ||
        ((this._disposed = !0),
        this._stopConsoleRecorder(),
        (e = this._remoteConfigSubscription) == null || e.dispose(),
        (this._remoteConfigSubscription = void 0),
        (this._client = void 0),
        (this._isLoading = !1),
        (t = this._window) == null || t.removeEventListener(`online`, this._onReconnect),
        (n = this._consoleLogsDispose) == null || n.call(this),
        (this._consoleLogsDispose = void 0),
        (r = this._core) == null || r.clearQueue(),
        (i = this._consoleCore) == null || i.clearQueue(),
        (a = this._core) == null || a.reset(),
        (o = this._consoleCore) == null || o.reset());
    }
    onRemoteConfig(e) {
      var t;
      if (this._disposed) return;
      let n = e.ok ? e.config.logs?.captureConsoleLogs : void 0;
      R(n)
        ? this._stopRecorderStartedByPersistedHint()
        : ((t = this._client) == null || t.kv.set(this._configSource.captureHintKey, !!n),
          n
            ? ((this._isLogsEnabled = !0),
              this._isLoaded || this._startConsoleRecorder(),
              this.loadIfEnabled())
            : this._stopRecorderStartedByPersistedHint());
    }
    reset() {
      var e, t, n, r;
      (this._stopConsoleRecorder(),
        (e = this._core) == null || e.clearQueue(),
        (this._queue = []),
        (t = this._core) == null || t.reset(),
        (n = this._consoleCore) == null || n.clearQueue(),
        (this._consoleQueue = []),
        (r = this._consoleCore) == null || r.reset(),
        (this._consecutiveStatusZeroFailures = 0));
    }
    captureLog(e) {
      !this._disposed && this._client && this._getCore().captureLog(e);
    }
    captureConsoleLog(e) {
      !this._disposed && this._client && this._getConsoleCore().captureLog(e);
    }
    captureBufferedConsoleLog(e, t, n) {
      !this._disposed &&
        this._client &&
        this._getConsoleCore().captureLog(e, { context: t, occurredAtMs: n });
    }
    _onOptOut() {
      var e;
      (this._stopConsoleRecorder(),
        (e = this._consoleCore) == null || e.clearQueue(),
        (this._consoleQueue = []));
    }
    _stopRecorderStartedByPersistedHint() {
      this._isLogsEnabled || this._stopConsoleRecorder();
    }
    _startConsoleRecorder() {
      if (this._isRecordingConsole || !this._window?.console) return;
      let e = Dd(this._configSource.get()).maxBufferSize,
        t = !0;
      this._consoleRecorderUnpatchers.push(() => {
        t = !1;
      });
      for (let n of Od) {
        let r;
        try {
          r = kd(this._window.console[n]);
        } catch {
          continue;
        }
        r &&
          this._consoleRecorderUnpatchers.push(
            ku(this._window.console, n, (i) => {
              let a = (...r) => {
                try {
                  t && this._recordConsoleEntry(n, r, e);
                } catch {}
                return i.apply(this._window.console, r);
              };
              return ((a.__rrweb_original__ = r), a);
            }),
          );
      }
      ((this._isRecordingConsole = !0),
        (this._consoleRecorderTimeout = setTimeout(() => {
          this._stopConsoleRecorder();
        }, 3e4)));
    }
    _recordConsoleEntry(e, t, n) {
      if (this._isRecordingConsole && !this._isRecordingConsoleEntry && t.length !== 0) {
        if (this._client?.canCapture) {
          if (n > this._consoleBuffer.length) {
            this._isRecordingConsoleEntry = !0;
            try {
              this._consoleBuffer.push({
                level: e,
                args: t,
                occurredAtMs: Date.now(),
                context: this._getSdkContext(),
              });
            } finally {
              this._isRecordingConsoleEntry = !1;
            }
          }
        } else this._stopConsoleRecorder();
      }
    }
    _stopConsoleRecorder() {
      if (((this._consoleBuffer = []), this._isRecordingConsole)) {
        ((this._isRecordingConsole = !1),
          (this._consoleRecorderTimeout &&= (clearTimeout(this._consoleRecorderTimeout), void 0)));
        for (let e of this._consoleRecorderUnpatchers) e();
        this._consoleRecorderUnpatchers = [];
      }
    }
    _takeConsoleBuffer() {
      let e = this._consoleBuffer;
      return (this._stopConsoleRecorder(), e);
    }
    get logger() {
      return (
        (this._capture_logger ||= {
          trace: (e, t) => this.captureLog({ body: e, level: `trace`, attributes: t }),
          debug: (e, t) => this.captureLog({ body: e, level: `debug`, attributes: t }),
          info: (e, t) => this.captureLog({ body: e, level: `info`, attributes: t }),
          warn: (e, t) => this.captureLog({ body: e, level: `warn`, attributes: t }),
          error: (e, t) => this.captureLog({ body: e, level: `error`, attributes: t }),
          fatal: (e, t) => this.captureLog({ body: e, level: `fatal`, attributes: t }),
        }),
        this._capture_logger
      );
    }
    flushLogs(e) {
      this._client &&
        (e
          ? this._flushViaTransport(e)
          : (this._core && this._core.flush().catch((e) => this._logFlushError(e)),
            this._consoleCore && this._consoleCore.flush().catch((e) => this._logFlushError(e))));
    }
    flush() {
      var e = this;
      return B(function* () {
        let t = e._core?.flush().catch((t) => e._logFlushError(t)),
          n = e._consoleCore?.flush().catch((t) => e._logFlushError(t));
        (yield t, yield n);
      })();
    }
    _logFlushError(e) {
      Nd(e) || this._logger.error(`PostHog logs flush failed:`, e);
    }
    loadIfEnabled() {
      if (this._disposed || !this._isLogsEnabled || this._isLoaded || this._isLoading) return;
      let e = this._getConsoleLoader();
      if (e) {
        this._isLoading = !0;
        try {
          e((e, t) => {
            if (((this._isLoading = !1), !this._disposed && this._isLogsEnabled)) {
              if (e || !t)
                (this._logger.error(`Could not load logs script`, e), this._stopConsoleRecorder());
              else {
                let e = this._takeConsoleBuffer();
                ((this._consoleLogsDispose = t.initialize(this._client)),
                  (this._isLoaded = !0),
                  e.length > 0 && t.replay(this._client, e));
              }
            }
          });
        } catch (e) {
          throw ((this._isLoading = !1), e);
        }
      } else this._stopConsoleRecorder();
    }
    _createHost(e, t) {
      let n = this._client;
      return {
        get isDisabled() {
          return !1;
        },
        get optedOut() {
          return !n.canCapture;
        },
        getPersistedProperty: (t) => (t === Ct.LogsQueue ? e() : void 0),
        setPersistedProperty(e, n) {
          e === Ct.LogsQueue && t(n ?? []);
        },
        _sendLogsBatch: (e) => this._sendLogsBatch(e),
        getLibraryId: () => n.library.name,
        getLibraryVersion: () => n.library.version,
      };
    }
    _sendLogsBatch(e) {
      return new Promise((t) => {
        if (ws(this._consecutiveStatusZeroFailures, 3))
          return void t({
            kind: `fatal`,
            error: Md(void 0, `logs endpoint is unreachable, dropping batch`),
          });
        let n = !1,
          r = (e) => {
            n || ((n = !0), clearTimeout(i), t(e));
          },
          i = setTimeout(() => {
            (this._logger.warn(`Logs request timed out before receiving a response`),
              r({ kind: `retry-later`, error: Md(void 0, `logs request timed out`) }));
          }, 9e4),
          a = this._isRequestReady;
        this._client
          .sendRequest(`/i/v1/logs`, {
            method: `POST`,
            query: { token: this._client.projectToken },
            body: e,
            compression: `best-available`,
            timeoutMs: 6e4,
          })
          .then(
            (e) => {
              let t = e.statusCode;
              (this._trackEndpointReachability(t, a),
                t >= 200 && 300 > t
                  ? r({ kind: `ok` })
                  : t === 413
                    ? r({ kind: `too-large` })
                    : t !== 0 && t !== 408 && t !== 429 && 500 > t
                      ? r({ kind: `fatal`, error: Error(`logs request failed with status ${t}`) })
                      : t === 0
                        ? (e.error ||
                            this._logger.warn(
                              `Logs request failed before receiving an HTTP response`,
                            ),
                          r({
                            kind: `retry-later`,
                            error: Md(
                              e.error,
                              `logs request failed before receiving an HTTP response`,
                            ),
                          }))
                        : r({
                            kind: `retry-later`,
                            error: e.error ?? Error(`logs request failed with status ${t}`),
                          }));
            },
            (e) => {
              r({ kind: `retry-later`, error: e });
            },
          );
      });
    }
    _trackEndpointReachability(e, t) {
      (e !== 0 || t) &&
        (this._consecutiveStatusZeroFailures = Ts(e, this._consecutiveStatusZeroFailures, 3, () =>
          this._logger.warn(
            `Log requests are failing before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped sending logs; will try again when connectivity changes.`,
          ),
        ));
    }
    _flushViaTransport(e) {
      (this._queue.length > 0 &&
        this._drainQueueViaTransport(
          e,
          this._queue,
          this._resolvedConfig,
          this._client.library.name,
          (e) => {
            this._queue = e;
          },
        ),
        this._consoleQueue.length > 0 &&
          this._drainQueueViaTransport(
            e,
            this._consoleQueue,
            this._consoleResolvedConfig,
            Ad,
            (e) => {
              this._consoleQueue = e;
            },
          ));
    }
    _drainQueueViaTransport(e, t, n, r, i) {
      if (t.length === 0) return;
      let a = t.map((e) => e.record);
      i([]);
      let o = Ca(
        a,
        Sa(n, this._client.library.name, this._client.library.version),
        r,
        this._client.library.version,
      );
      this._client
        .sendRequest(`/i/v1/logs`, {
          method: `POST`,
          query: { token: this._client.projectToken },
          body: o,
          compression: `best-available`,
          transport: e,
          timeoutMs: 6e4,
        })
        .catch((e) => this._logFlushError(e));
    }
  },
  Fd = U(`[NetworkMetrics]`),
  Id = () => {
    var e;
    return O != null && (e = O.performance) != null && e.now ? O.performance.now() : Date.now();
  },
  Ld = { "http:": 80, "https:": 443 },
  Rd = new Set([`CONNECT`, `DELETE`, `GET`, `HEAD`, `OPTIONS`, `PATCH`, `POST`, `PUT`, `TRACE`]),
  zd = (e, t) => {
    let n = String(t);
    return { method: String(e).toUpperCase(), url: Ds(n)?.href || n };
  },
  Bd = (e, t, n, r, i, a, o = !1) => {
    try {
      var s;
      let c = i();
      if (!c) return;
      let l = n || void 0,
        u = Id() - r,
        d = Ds(t.url);
      if (d && d.protocol !== `http:` && d.protocol !== `https:`) return;
      let f = { url: d?.href || t.url, method: t.method },
        p = N(c.name) ? c.name(f) : I(c.name) ? c.name : `http.client.request.duration`;
      if (!p) return;
      let m =
          o && !l
            ? void 0
            : ((e, t) => (e ? (400 > e ? void 0 : String(e)) : t?.name || `_OTHER`))(l, a),
        h = V(
          V(
            V(
              V(
                V(
                  {},
                  ((e) => {
                    let t = Rd.has(e) ? e : `_OTHER`;
                    return V(
                      { "http.request.method": t },
                      t === `_OTHER` && e !== t ? { "http.request.method_original": e } : {},
                    );
                  })(f.method),
                ),
                d
                  ? ((e) => {
                      return {
                        "server.address":
                          e.hostname.startsWith(`[`) && e.hostname.endsWith(`]`)
                            ? e.hostname.slice(1, -1)
                            : e.hostname,
                        "server.port": Number(e.port) || Ld[e.protocol],
                        "url.scheme": e.protocol.slice(0, -1),
                        "url.template":
                          ((t = e.pathname),
                          t
                            .split(`/`)
                            .map((e) =>
                              ((e) =>
                                /^\d+$/.test(e) ||
                                (e.length >= 8 && /^[0-9a-f-]*\d[0-9a-f-]*$/i.test(e)))(e)
                                ? `:id`
                                : e,
                            )
                            .join(`/`)),
                      };
                      var t;
                    })(d)
                  : {},
              ),
              l ? { "http.response.status_code": l } : {},
            ),
            m ? { "error.type": m } : {},
          ),
          c.attributes?.call(c, f, { status: l, durationMs: u }),
        );
      (s = e.metrics) == null || s.histogram(p, u, { unit: `ms`, attributes: h });
    } catch (e) {
      Fd.error(`Failed to record network metric`, e);
    }
  },
  Vd = () => {},
  Hd = (e, t) =>
    N(O?.fetch)
      ? ku(
          O,
          `fetch`,
          (n) =>
            function (...r) {
              let i = Id(),
                a = n.apply(this, r);
              if (!t()) return a;
              try {
                let [n, o] = r,
                  s = zd(o?.method ?? n?.method ?? `GET`, n?.url ?? n);
                return a.then(
                  (n) => (Bd(e, s, n?.status, i, t, void 0, !0), n),
                  (n) => {
                    throw (Bd(e, s, void 0, i, t, n), n);
                  },
                );
              } catch (e) {
                return (Fd.error(`Failed to observe fetch`, e), a);
              }
            },
        )
      : Vd,
  Ud = (e, t) => {
    var n;
    let r = O == null || (n = O.XMLHttpRequest) == null ? void 0 : n.prototype;
    if (!r) return Vd;
    let i = new WeakMap(),
      a = ku(
        r,
        `open`,
        (e) =>
          function (...t) {
            try {
              Yc.has(this) || i.set(this, zd(t[0], t[1]));
            } catch (e) {
              Fd.error(`Failed to observe XHR open`, e);
            }
            return e.apply(this, t);
          },
      ),
      o = ku(
        r,
        `send`,
        (n) =>
          function (...r) {
            let a;
            try {
              let n = i.get(this);
              if (n && t()) {
                let r = Id();
                ((a = () => {
                  (this.removeEventListener(`loadend`, a), Bd(e, n, this.status, r, t));
                }),
                  K(this, `loadend`, a));
              }
            } catch (e) {
              Fd.error(`Failed to observe XHR send`, e);
            }
            try {
              return n.apply(this, r);
            } catch (e) {
              throw (a && this.removeEventListener(`loadend`, a), e);
            }
          },
      );
    return () => {
      (a(), o());
    };
  },
  Wd = new WeakMap(),
  Gd = new Set([
    `$comment`,
    `$defs`,
    `$id`,
    `$schema`,
    `additionalProperties`,
    `default`,
    `definitions`,
    `deprecated`,
    `description`,
    `examples`,
    `minProperties`,
    `properties`,
    `readOnly`,
    `required`,
    `title`,
    `type`,
    `writeOnly`,
  ]),
  Kd = { maxStringLength: 2048, truncationSuffix: `...` },
  qd = { maxStringLength: 2048, truncationSuffix: `...` };
function Jd(e) {
  if (e)
    return !0 === e
      ? { intent: !0, model: !0 }
      : { intent: !1 !== e.intent, model: !1 !== e.model };
}
function Yd(e, t) {
  return {}.hasOwnProperty.call(e, t);
}
function Xd(e, t) {
  let n = Object.create(e);
  return (
    t &&
      Object.defineProperty(n, "inputSchema", {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: t,
      }),
    n
  );
}
function Zd(e, t, n = !1) {
  if (!I(e)) return;
  let r = e.trim();
  return r ? (n ? oa(r, Kd) : r).slice(0, t) : void 0;
}
function Qd(e) {
  try {
    return P(e) && !0 === e.isError;
  } catch {
    return !1;
  }
}
function $d(e) {
  return oa(e || `Unknown error`, qd).slice(0, 2048);
}
function ef(e, t) {
  try {
    return $d(
      t
        ? (function (e) {
            try {
              return !P(e) || !M(e.content)
                ? void 0
                : e.content
                    .filter((e) => P(e) && e.type === `text` && I(e.text))
                    .map((e) => e.text)
                    .join(` `)
                    .trim() || void 0;
            } catch {
              return;
            }
          })(e)
        : P(e) && I(e.message)
          ? e.message
          : I(e)
            ? e
            : String(e),
    );
  } catch {
    return `Unknown error`;
  }
}
function tf(e, t, n) {
  return t.errorResult
    ? [
        {
          type: `Error`,
          value: n,
          mechanism: { type: `generic`, handled: !0, synthetic: !0, exception_id: 0 },
        },
      ]
    : e
        .buildProperties(t.error, { handled: !0 })
        .$exception_list.map((e) => V(V({}, e), {}, { value: $d(e.value) }));
}
function nf(e, t) {
  if (t) return `Error`;
  try {
    if (!P(e)) return `Error`;
    let t = I(e.name) ? e.name.trim() : ``,
      n = e.constructor;
    return (
      (t && t !== `Error`) || !N(n) || n.name === `Error` || (t = n.name),
      (t || `Error`).slice(0, 256)
    );
  } catch {
    return `Error`;
  }
}
function rf(e, t) {
  return { message: ef(e, t), type: nf(e, t) };
}
var af = {
    featureFlags: class extends md {
      constructor(e) {
        let t = new gd(e.config, e._shouldDisableFlags());
        (super(t), (this.name = Kl), (this._instance = e), (this._mutableConfigSource = t));
      }
      get _crossTabPersistence() {
        return this._instance.persistence;
      }
      updateConfig(e, t) {
        (this._mutableConfigSource.update(e, t), this._onConfigUpdated());
      }
    },
  },
  of = {
    sessionRecording: class {
      get _config() {
        return this._instance.config;
      }
      get _persistence() {
        return this._instance.persistence;
      }
      get started() {
        return !!this._lazyLoadedSessionRecording?.isStarted;
      }
      get status() {
        return this._recordingStatus === `awaiting_config` ||
          this._recordingStatus === `missing_config`
          ? this._recordingStatus
          : (this._lazyLoadedSessionRecording?.status ?? this._recordingStatus);
      }
      constructor(e) {
        if (
          ((this._instance = e),
          (this._forceAllowLocalhostNetworkCapture = !1),
          (this._recordingStatus = Iu),
          (this._persistFlagsOnSessionListener = void 0),
          (this._sessionRecordingDisposed = !1),
          (this._documentWasEverVisible = (() => {
            var e, t;
            if (!k?.visibilityState || k.visibilityState === `visible`) return !0;
            let n =
              O == null || (e = O.performance) == null || (t = e.getEntriesByType) == null
                ? void 0
                : t.call(e, `visibility-state`);
            return !n?.length || n.some((e) => e.name === `visible`);
          })()),
          (this._onVisibilityChange = () => {
            var e, t;
            k?.visibilityState === `visible` &&
              ((this._documentWasEverVisible = !0),
              (e = this._lazyLoadedSessionRecording) == null ||
                (t = e.setDocumentWasEverVisible) == null ||
                t.call(e, !0));
          }),
          !this._instance.sessionManager)
        )
          throw (
            Ru.error(`started without valid sessionManager`),
            Error(`[SessionRecording] started without valid sessionManager. This is a bug.`)
          );
        if (this._config.cookieless_mode === `always`)
          throw Error(`[SessionRecording] cannot be used with cookieless_mode="always"`);
        k != null && k.addEventListener && K(k, `visibilitychange`, this._onVisibilityChange);
      }
      initialize() {
        this.startIfEnabledOrStop();
      }
      dispose({ discardBufferedEvents: e = !1 } = {}) {
        var t;
        ((this._sessionRecordingDisposed = !0),
          k == null ||
            (t = k.removeEventListener) == null ||
            t.call(k, `visibilitychange`, this._onVisibilityChange),
          e ? this._discardRecording(!0) : this.stopRecording());
      }
      get _isRecordingEnabled() {
        let e = !!this._instance.get_property(`$session_recording_remote_config`)?.enabled,
          t = !this._config.disable_session_recording,
          n = this._config.disable_session_recording || this._instance.consent.isOptedOut();
        return O && e && t && !n;
      }
      startIfEnabledOrStop(e) {
        if (
          this._sessionRecordingDisposed ||
          (this._isRecordingEnabled && this._lazyLoadedSessionRecording?.isStarted)
        )
          return;
        let t = !F(Object.assign) && !F(Array.from);
        this._isRecordingEnabled && t
          ? (this._lazyLoadAndStart(e), Ru.info(`starting`))
          : ((this._recordingStatus = Iu), this.stopRecording());
      }
      _lazyLoadAndStart(e) {
        var t;
        if (this._isRecordingEnabled) {
          if (
            (this._recordingStatus !== `awaiting_config` &&
              this._recordingStatus !== `missing_config` &&
              (this._recordingStatus = Lu),
            A != null &&
              (t = A.__PosthogExtensions__) != null &&
              (t = t.rrweb) != null &&
              t.record &&
              A.__PosthogExtensions__?.initSessionRecording)
          )
            this._onScriptLoaded(e);
          else {
            var n, r;
            let t = this._instance.sessionManager;
            (n = A.__PosthogExtensions__) == null ||
              (r = n.loadExternalDependency) == null ||
              r.call(n, this._instance, this._scriptName, (n) => {
                if (
                  !this._sessionRecordingDisposed &&
                  this._isRecordingEnabled &&
                  this._instance.sessionManager === t
                )
                  return n
                    ? (this._instance.register_for_session({
                        $sdk_debug_recording_script_not_loaded: !0,
                      }),
                      Ru.error(`could not load recorder`, n))
                    : void this._onScriptLoaded(e);
                this._recordingStatus = `disabled`;
              });
          }
        }
      }
      stopRecording() {
        var e, t;
        ((e = this._persistFlagsOnSessionListener) == null || e.call(this),
          (this._persistFlagsOnSessionListener = void 0),
          (t = this._lazyLoadedSessionRecording) == null || t.stop());
      }
      _discardRecording(e = !1) {
        var t, n;
        ((t = this._persistFlagsOnSessionListener) == null || t.call(this),
          (this._persistFlagsOnSessionListener = void 0),
          (n = this._lazyLoadedSessionRecording) == null ||
            n.discard({ discardProducerEvents: e }));
      }
      _resetSampling() {
        var e, t;
        ((e = this._persistence) == null || e.unregister(`$session_is_sampled`),
          (t = this._persistence) == null || t.unregister(`$replay_sample_rate`));
      }
      _validateSampleRate(e, t) {
        if (R(e)) return null;
        let n = z(e) ? e : parseFloat(e);
        return typeof (r = n) != `number` || !Number.isFinite(r) || 0 > r || r > 1
          ? (Ru.warn(`${t} must be between 0 and 1. Ignoring invalid value:`, e), null)
          : n;
        var r;
      }
      _persistRemoteConfig(e) {
        if (this._persistence) {
          var t;
          let n = this._persistence,
            r = () => {
              let t = !1 === e.sessionRecording ? void 0 : e.sessionRecording,
                r = this._validateSampleRate(
                  this._config.session_recording?.sampleRate,
                  `session_recording.sampleRate`,
                ),
                i = this._validateSampleRate(t?.sampleRate, `remote config sampleRate`),
                a = r ?? i;
              R(a) && this._resetSampling();
              let o = t?.minimumDurationMilliseconds;
              n.register({
                [de]: V(
                  V({ cache_timestamp: Date.now(), enabled: !!t }, t),
                  {},
                  {
                    networkPayloadCapture: V(
                      { capturePerformance: e.capturePerformance },
                      t?.networkPayloadCapture,
                    ),
                    canvasRecording: {
                      enabled: t?.recordCanvas,
                      fps: t?.canvasFps,
                      quality: t?.canvasQuality,
                    },
                    sampleRate: a,
                    minimumDurationMilliseconds: F(o) ? null : o,
                    endpoint: t?.endpoint,
                    triggerMatchType: t?.triggerMatchType,
                    masking: t?.masking,
                    urlTriggers: t?.urlTriggers,
                    version: t?.version,
                    triggerGroups: t?.triggerGroups,
                  },
                ),
              });
            };
          (r(),
            (t = this._persistFlagsOnSessionListener) == null || t.call(this),
            (this._persistFlagsOnSessionListener = this._instance.sessionManager?.onSessionId(r)));
        }
      }
      onRemoteConfig(e) {
        let t = e.ok ? e.config : void 0;
        t && `sessionRecording` in t
          ? !1 === t.sessionRecording
            ? (this._persistRemoteConfig(t), this._discardRecording())
            : (this._persistRemoteConfig(t), this.startIfEnabledOrStop())
          : (this._recordingStatus === `awaiting_config` &&
              ((this._recordingStatus = `missing_config`),
              this._instance.register_for_session({ [Xe]: !0 }),
              Ru.warn(`config refresh failed, recording will not start until page reload`)),
            this.startIfEnabledOrStop());
      }
      log(e, t = `log`) {
        this._lazyLoadedSessionRecording?.log
          ? this._lazyLoadedSessionRecording.log(e, t)
          : Ru.warn(`log called before recorder was ready`);
      }
      get _scriptName() {
        var e, t;
        let n =
          (e = this._instance) == null || (e = e.persistence) == null ? void 0 : e.get_property(de);
        return (n == null || (t = n.scriptConfig) == null ? void 0 : t.script) || `lazy-recorder`;
      }
      _isRemoteConfigFresh() {
        let e = this._instance.get_property(de);
        if (!e) return !1;
        let t;
        try {
          t = typeof e == `object` ? e : JSON.parse(e);
        } catch (e) {
          return (
            Ru.warn(
              `persisted remote config for session recording is invalid and will be ignored`,
              e,
            ),
            !1
          );
        }
        return !R(t.cache_timestamp) && 36e5 >= Date.now() - t.cache_timestamp;
      }
      _onScriptLoaded(e) {
        var t, n;
        if (
          !this._sessionRecordingDisposed &&
          this._isRecordingEnabled &&
          this._instance.sessionManager
        ) {
          if (!A.__PosthogExtensions__?.initSessionRecording)
            return (
              Ru.warn(
                `Called on script loaded before session recording is available. This can be caused by adblockers.`,
              ),
              void this._instance.register_for_session({ [Ye]: !0 })
            );
          if (
            (this._lazyLoadedSessionRecording ||
              ((this._lazyLoadedSessionRecording = A.__PosthogExtensions__?.initSessionRecording(
                this._instance,
                this._documentWasEverVisible,
              )),
              (this._lazyLoadedSessionRecording._forceAllowLocalhostNetworkCapture =
                this._forceAllowLocalhostNetworkCapture)),
            !this._isRemoteConfigFresh())
          ) {
            if (
              this._recordingStatus === `missing_config` ||
              this._recordingStatus === `awaiting_config`
            )
              return;
            ((this._recordingStatus = `awaiting_config`),
              Ru.info(`persisted remote config is stale, requesting fresh config before starting`),
              new hc(this._instance).load());
            return;
          }
          ((this._recordingStatus = Lu),
            (t = (n = this._lazyLoadedSessionRecording).setDocumentWasEverVisible) == null ||
              t.call(n, this._documentWasEverVisible),
            this._lazyLoadedSessionRecording.start(e));
        } else this._recordingStatus = Iu;
      }
      onRRwebEmit(e) {
        var t, n;
        (t = this._lazyLoadedSessionRecording) == null ||
          (n = t.onRRwebEmit) == null ||
          n.call(t, e);
      }
      overrideLinkedFlag() {
        var e, t;
        (this._lazyLoadedSessionRecording ||
          (t = this._persistence) == null ||
          t.register({ $replay_override_linked_flag: !0 }),
          (e = this._lazyLoadedSessionRecording) == null || e.overrideLinkedFlag());
      }
      overrideSampling() {
        var e, t;
        (this._lazyLoadedSessionRecording ||
          (t = this._persistence) == null ||
          t.register({ $replay_override_sampling: !0 }),
          (e = this._lazyLoadedSessionRecording) == null || e.overrideSampling());
      }
      overrideTrigger(e) {
        var t, n;
        (this._lazyLoadedSessionRecording ||
          (n = this._persistence) == null ||
          n.register({
            [e === `url` ? `$replay_override_url_trigger` : `$replay_override_event_trigger`]: !0,
          }),
          (t = this._lazyLoadedSessionRecording) == null || t.overrideTrigger(e));
      }
      get sdkDebugProperties() {
        let e = {};
        for (let t of zu) {
          let n = this._instance.sessionPersistence?.get_property(t);
          F(n) || (e[t] = n);
        }
        return V(
          V({}, e),
          this._lazyLoadedSessionRecording?.sdkDebugProperties || {
            $recording_status: this.status,
          },
        );
      }
      tryAddCustomEvent(e, t) {
        return !!this._lazyLoadedSessionRecording?.tryAddCustomEvent(e, t);
      }
      flushBeforeIdentityReset() {
        var e, t;
        (e = this._lazyLoadedSessionRecording) == null ||
          (t = e.flushBeforeIdentityReset) == null ||
          t.call(e);
      }
    },
  },
  sf = {
    autocapture: class extends wu {
      constructor(e) {
        (super(new Tu(e)), (this.instance = e));
      }
    },
    historyAutocapture: class {
      constructor(e) {
        ((this._isFlushingPageview = !1),
          (this._instance = e),
          (this._lastLocation = this._getCurrentLocation()));
      }
      initialize() {
        this.startIfEnabled();
      }
      get isEnabled() {
        let e = this._getCaptureOptions();
        return !!(e.path || e.search || this._shouldCaptureHashChanges(e));
      }
      startIfEnabled() {
        this.isEnabled &&
          (H.info(`History API monitoring enabled, starting...`), this.monitorHistoryChanges());
      }
      startIfEnabledOrStop() {
        (this.stop(), (this._lastLocation = this._getCurrentLocation()), this.startIfEnabled());
      }
      stop() {
        (this._popstateListener && this._popstateListener(),
          (this._popstateListener = void 0),
          this._hashchangeListener && this._hashchangeListener(),
          (this._hashchangeListener = void 0),
          H.info(`History API monitoring stopped`));
      }
      monitorHistoryChanges() {
        O &&
          O.history &&
          (this._patchHistoryMethod(`pushState`),
          this._patchHistoryMethod(`replaceState`),
          this._setupPopstateListener(),
          this._shouldCaptureHashChanges() && this._setupHashchangeListener());
      }
      _patchHistoryMethod(e) {
        if (!O || O.history[e]?.__posthog_wrapped__) return;
        let t = this;
        ku(
          O.history,
          e,
          (n) =>
            function (r, i, a) {
              var o;
              (t._isUrlChanging(a) && t._flushPendingPageview(),
                n.call(this, r, i, a),
                t._capturePageview(
                  e,
                  !t._isFlushingPageview &&
                    (O == null || (o = O.event) == null ? void 0 : o.type) !== `popstate`,
                ));
            },
        );
      }
      _getCurrentLocation() {
        let e = O?.location;
        if (e?.pathname) return { pathname: e.pathname, search: e.search, hash: e.hash };
      }
      _getCaptureOptions() {
        let e = this._instance.config.capture_pageview;
        return e === `history_change` ? { path: !0 } : P(e) ? e : {};
      }
      _shouldCaptureHashChanges(e = this._getCaptureOptions()) {
        return !!e.hash && !this._instance.config.disable_capture_url_hashes;
      }
      _hasLocationChanged(e) {
        let t = this._getCaptureOptions(),
          n = this._lastLocation;
        return !(
          !n ||
          !(
            (t.path && e.pathname !== n.pathname) ||
            (t.search && e.search !== n.search) ||
            (this._shouldCaptureHashChanges(t) && e.hash !== n.hash)
          )
        );
      }
      _capturePageview(e, t = !1) {
        try {
          t || this._flushPendingPageview();
          let n = this._getCurrentLocation();
          if (!n) return;
          if (this._hasLocationChanged(n)) {
            let n = () => this._instance.capture(ut, { navigation_type: e });
            t
              ? ((this._pendingPageview = n),
                Promise.resolve().then(() => this._flushPendingPageview()))
              : n();
          }
          this._lastLocation = n;
        } catch (t) {
          H.error(`Error capturing ${e} pageview`, t);
        }
      }
      _isUrlChanging(e) {
        return !(R(e) || !O) && Ds(String(e))?.href !== O.location?.href;
      }
      _flushPendingPageview() {
        let e = this._pendingPageview;
        if (e) {
          ((this._pendingPageview = void 0), (this._isFlushingPageview = !0));
          try {
            e();
          } catch (e) {
            H.error(`Error capturing deferred pageview`, e);
          } finally {
            this._isFlushingPageview = !1;
          }
          this._lastLocation = this._getCurrentLocation();
        }
      }
      _setupPopstateListener() {
        if (this._popstateListener) return;
        let e = () => {
          this._capturePageview(`popstate`);
        };
        (K(O, `popstate`, e),
          (this._popstateListener = () => {
            O && O.removeEventListener(`popstate`, e);
          }));
      }
      _setupHashchangeListener() {
        if (this._hashchangeListener) return;
        let e = () => {
          this._capturePageview(`hashchange`);
        };
        (K(O, `hashchange`, e),
          (this._hashchangeListener = () => {
            O && O.removeEventListener(`hashchange`, e);
          }));
      }
    },
    heatmaps: class {
      get _config() {
        return this.instance.config;
      }
      constructor(e) {
        ((this._enabledServerSide = !1),
          (this._initialized = !1),
          (this._flushInterval = null),
          (this.instance = e),
          (this._enabledServerSide = !!this.instance.persistence?.props[D]),
          (this.rageclicks = new vu(e.config.rageclick)));
      }
      initialize() {
        this.startIfEnabled();
      }
      get flushIntervalMilliseconds() {
        let e = 5e3;
        return (
          P(this._config.capture_heatmaps) &&
            this._config.capture_heatmaps.flush_interval_milliseconds &&
            (e = this._config.capture_heatmaps.flush_interval_milliseconds),
          e
        );
      }
      get isEnabled() {
        return R(this._config.capture_heatmaps)
          ? R(this._config.enable_heatmaps)
            ? this._enabledServerSide
            : this._config.enable_heatmaps
          : !1 !== this._config.capture_heatmaps;
      }
      startIfEnabled() {
        if (this.isEnabled) {
          if (this._initialized) return;
          (Bu.info(`starting...`), this._setupListeners(), this._onVisibilityChange());
        } else
          (clearInterval(this._flushInterval ?? void 0),
            this._removeListeners(),
            this.getAndClearBuffer());
      }
      onRemoteConfig(e) {
        if (!e.ok) return;
        let t = e.config;
        if (!(`heatmaps` in t)) return;
        let n = !!t.heatmaps;
        (this.instance.persistence && this.instance.persistence.register({ [D]: n }),
          (this._enabledServerSide = n),
          this.startIfEnabled());
      }
      getAndClearBuffer() {
        let e = this._buffer;
        return ((this._buffer = void 0), e);
      }
      _onDeadClick(e) {
        Vu(e.originalEvent) && this._onClick(e.originalEvent, `deadclick`);
      }
      _onVisibilityChange() {
        (this._flushInterval && clearInterval(this._flushInterval),
          (this._flushInterval =
            k?.visibilityState === `visible`
              ? setInterval(this._flush.bind(this), this.flushIntervalMilliseconds)
              : null));
      }
      _setupListeners() {
        O &&
          k &&
          ((this._flushHandler = this._flush.bind(this)),
          K(O, lt, this._flushHandler),
          (this._onClickHandler = (e) => this._onClick(e || O?.event)),
          K(k, `click`, this._onClickHandler, { capture: !0 }),
          (this._onMouseMoveHandler = (e) => this._onMouseMove(e || O?.event)),
          K(k, `mousemove`, this._onMouseMoveHandler, { capture: !0 }),
          (this._deadClicksCapture = new fs(this.instance, us, this._onDeadClick.bind(this))),
          this._deadClicksCapture.startIfEnabledOrStop(),
          (this._onVisibilityChange_handler = this._onVisibilityChange.bind(this)),
          K(k, _, this._onVisibilityChange_handler),
          (this._initialized = !0));
      }
      _removeListeners() {
        var e;
        O &&
          k &&
          (this._flushHandler && O.removeEventListener(lt, this._flushHandler),
          this._onClickHandler &&
            k.removeEventListener(`click`, this._onClickHandler, { capture: !0 }),
          this._onMouseMoveHandler &&
            k.removeEventListener(`mousemove`, this._onMouseMoveHandler, { capture: !0 }),
          this._onVisibilityChange_handler &&
            k.removeEventListener(_, this._onVisibilityChange_handler),
          clearTimeout(this._mouseMoveTimeout),
          (e = this._deadClicksCapture) == null || e.stop(),
          (this._initialized = !1));
      }
      _getProperties(e, t) {
        let n = this.instance.scrollManager.scrollY(),
          r = this.instance.scrollManager.scrollX(),
          i = this.instance.scrollManager.scrollElement(),
          a = (function (e, t, n) {
            let r = e;
            for (; r && xo(r) && !So(r, `body`); ) {
              if (r === n) return !1;
              let e;
              try {
                e = (r.ownerDocument?.defaultView ?? O)?.getComputedStyle(r).position;
              } catch {
                return !1;
              }
              if (j(t, e)) return !0;
              r = Po(r);
            }
            return !1;
          })(Ao(e), [`fixed`, `sticky`], i);
        return { x: e.clientX + (a ? 0 : r), y: e.clientY + (a ? 0 : n), target_fixed: a, type: t };
      }
      _onClick(e, t = `click`) {
        var n;
        if (bo(e.target) || !Vu(e)) return;
        let r = this._getProperties(e, t);
        ((n = this.rageclicks) != null &&
          n.isRageClick(e.clientX, e.clientY, new Date().getTime()) &&
          Ko(Ao(e), this.instance.config.rageclick) &&
          this._capture(V(V({}, r), {}, { type: `rageclick` })),
          this._capture(r));
      }
      _onMouseMove(e) {
        !bo(e.target) &&
          Vu(e) &&
          (clearTimeout(this._mouseMoveTimeout),
          (this._mouseMoveTimeout = setTimeout(() => {
            this._capture(this._getProperties(e, `mousemove`));
          }, 500)));
      }
      _capture(e) {
        if (!O) return;
        let t = this._config.disable_capture_url_hashes ? fr(O.location.href) : O.location.href,
          n = this._config.custom_personal_data_properties,
          r = ks(t, this._config.mask_personal_data_properties ? [...js, ...(n || [])] : [], Ns);
        ((this._buffer = this._buffer || {}),
          this._buffer[r] || (this._buffer[r] = []),
          this._buffer[r].push(e));
      }
      _flush() {
        this._buffer &&
          !Nt(this._buffer) &&
          this.instance.capture(`$$heatmap`, { $heatmap_data: this.getAndClearBuffer() });
      }
    },
    deadClicksAutocapture: fs,
    webVitalsAutocapture: class {
      constructor(e) {
        ((this._instance = e),
          (this._enabledServerSide = !1),
          (this._initialized = !1),
          (this._buffer = {
            navigationKey: void 0,
            url: void 0,
            metrics: [],
            firstMetricTimestamp: void 0,
          }),
          (this._flushToCapture = () => {
            (clearTimeout(this._delayedFlushTimer),
              (this._delayedFlushTimer = void 0),
              this._buffer.metrics.length !== 0 &&
                (this._instance.capture(
                  `$web_vitals`,
                  V(
                    { $current_url: this._buffer.url },
                    this._buffer.metrics.reduce(
                      (e, t) =>
                        V(
                          V({}, e),
                          {},
                          {
                            [`$web_vitals_${t.name}_event`]: V({}, t),
                            [`$web_vitals_${t.name}_value`]: t.value,
                          },
                        ),
                      {},
                    ),
                  ),
                ),
                (this._buffer = {
                  navigationKey: void 0,
                  url: void 0,
                  metrics: [],
                  firstMetricTimestamp: void 0,
                })));
          }),
          (this._addToBuffer = (e) => {
            if (
              ((this._buffer = this._buffer || {
                navigationKey: void 0,
                url: void 0,
                metrics: [],
                firstMetricTimestamp: void 0,
              }),
              R(e?.name) || R(e?.value))
            )
              return void ju.error(`Invalid metric received`, e);
            let t = typeof e.navigationURL == `string` ? e.navigationURL : void 0,
              n = this._maskedURL(t);
            if (F(n)) return;
            let r =
              z(e.navigationId) || typeof e.navigationId == `string`
                ? `navigation:${e.navigationId}`
                : `url:${n}`;
            if (this._maxAllowedValue && e.value >= this._maxAllowedValue)
              return void ju.error(`Ignoring metric with value >= ` + this._maxAllowedValue, e);
            (this._buffer.navigationKey !== r &&
              (this._flushToCapture(),
              (this._delayedFlushTimer = setTimeout(
                this._flushToCapture,
                this.flushToCaptureTimeoutMs,
              ))),
              F(this._buffer.navigationKey) &&
                ((this._buffer.navigationKey = r), (this._buffer.url = n)),
              (this._buffer.firstMetricTimestamp = F(this._buffer.firstMetricTimestamp)
                ? Date.now()
                : this._buffer.firstMetricTimestamp));
            let i = this._instance.sessionManager?.checkAndGetSessionAndWindowId(!0),
              a = V(
                V(V({}, e), t ? { navigationURL: n } : {}),
                {},
                { $current_url: n, timestamp: Date.now() },
              );
            if (
              (delete a.entries, P(e.attribution) && this.attributionMetrics.indexOf(e.name) > -1)
            ) {
              let t = {};
              for (let n of Fu) {
                let r =
                  n === `url` && typeof e.attribution[n] == `string`
                    ? this._maskedURL(e.attribution[n])
                    : e.attribution[n];
                F(r) || (t[n] = r);
              }
              a.attribution = t;
            } else delete a.attribution;
            (F(i) || ((a.$session_id = i.sessionId), (a.$window_id = i.windowId)),
              this._buffer.metrics.push(a),
              this._buffer.metrics.length === this.allowedMetrics.length && this._flushToCapture());
          }),
          (this._startCapturing = () => {
            if (this._initialized) return;
            let e,
              t,
              n,
              r,
              i = !1,
              a = A.__PosthogExtensions__,
              o = a?.postHogWebVitalsCallbacksByFlavor,
              s =
                o?.[this._callbackFlavor] ||
                (this._callbackFlavor === `web-vitals` && F(o)
                  ? a?.postHogWebVitalsCallbacks
                  : void 0);
            if (!F(s)) {
              let a = s.withoutAttribution,
                o = this.attributionMetrics;
              ((i = !F(a)),
                (e = o.indexOf(`LCP`) > -1 ? s.onLCP : a?.onLCP || s.onLCP),
                (t = o.indexOf(`CLS`) > -1 ? s.onCLS : a?.onCLS || s.onCLS),
                (n = o.indexOf(`FCP`) > -1 ? s.onFCP : a?.onFCP || s.onFCP),
                (r = o.indexOf(`INP`) > -1 ? s.onINP : a?.onINP || s.onINP));
            }
            if (!(e && t && n && r))
              return void ju.error(`web vitals callbacks not loaded - not starting`);
            let c = { reportSoftNavs: this.useSoftNavs },
              l =
                i && this.attributionMetrics.indexOf(`INP`) > -1
                  ? V(V({}, c), {}, { includeProcessedEventEntries: !1 })
                  : c;
            (this.allowedMetrics.indexOf(`LCP`) > -1 && e(this._addToBuffer.bind(this), c),
              this.allowedMetrics.indexOf(`CLS`) > -1 && t(this._addToBuffer.bind(this), c),
              this.allowedMetrics.indexOf(`FCP`) > -1 && n(this._addToBuffer.bind(this), c),
              this.allowedMetrics.indexOf(`INP`) > -1 && r(this._addToBuffer.bind(this), l),
              (this._initialized = !0));
          }),
          (this._enabledServerSide = !!this._instance.persistence?.props[oe]),
          this.startIfEnabled());
      }
      get _perfConfig() {
        return this._instance.config.capture_performance;
      }
      get allowedMetrics() {
        let e = P(this._perfConfig) ? this._perfConfig?.web_vitals_allowed_metrics : void 0;
        return R(e) ? this._instance.persistence?.props.$web_vitals_allowed_metrics || Nu : e;
      }
      get flushToCaptureTimeoutMs() {
        return (P(this._perfConfig) ? this._perfConfig.web_vitals_delayed_flush_ms : void 0) || 5e3;
      }
      get attributionMetrics() {
        let e = P(this._perfConfig) ? this._perfConfig.web_vitals_attribution : void 0;
        return It(e) ? (e ? Nu : []) : M(e) ? e : Pu;
      }
      get useAttribution() {
        return this.attributionMetrics.length > 0;
      }
      get useSoftNavs() {
        let e = P(this._perfConfig) ? this._perfConfig.__preview_web_vitals_soft_navs : void 0;
        return e != null && e;
      }
      get _maxAllowedValue() {
        let e =
          P(this._perfConfig) && z(this._perfConfig.__web_vitals_max_value)
            ? this._perfConfig.__web_vitals_max_value
            : Mu;
        return e > 0 && 6e4 >= e ? Mu : e;
      }
      get isEnabled() {
        let e = gt?.protocol;
        if (e !== `http:` && e !== `https:`)
          return (ju.info(`Web Vitals are disabled on non-http/https protocols`), !1);
        let t = P(this._perfConfig)
          ? this._perfConfig.web_vitals
          : It(this._perfConfig)
            ? this._perfConfig
            : void 0;
        return It(t) ? t : this._enabledServerSide;
      }
      startIfEnabled() {
        this.isEnabled &&
          !this._initialized &&
          (ju.info(`enabled, starting...`), this._loadScript(this._startCapturing));
      }
      onRemoteConfig(e) {
        if (!e.ok) return;
        let t = e.config;
        if (!(`capturePerformance` in t)) return;
        let n = P(t.capturePerformance) && !!t.capturePerformance.web_vitals,
          r = P(t.capturePerformance) ? t.capturePerformance.web_vitals_allowed_metrics : void 0;
        (this._instance.persistence &&
          (this._instance.persistence.register({ [oe]: n }),
          this._instance.persistence.register({ [ue]: r })),
          (this._enabledServerSide = n),
          this.startIfEnabled());
      }
      get _callbackFlavor() {
        return this.useSoftNavs
          ? this.useAttribution
            ? `web-vitals-with-attribution-soft-navs`
            : `web-vitals-soft-navs`
          : this.useAttribution
            ? `web-vitals-with-attribution`
            : `web-vitals`;
      }
      _loadScript(e) {
        var t;
        let n = A.__PosthogExtensions__,
          r = this._callbackFlavor,
          i = n?.postHogWebVitalsCallbacksByFlavor;
        i?.[r] || (r === `web-vitals` && F(i) && n?.postHogWebVitalsCallbacks)
          ? e()
          : n == null ||
            (t = n.loadExternalDependency) == null ||
            t.call(n, this._instance, r, (t) => {
              t ? ju.error(`failed to load script`, t) : e();
            });
      }
      _maskedURL(e) {
        let t = e || O?.location.href;
        if (!t) return void ju.error(`Could not determine current URL`);
        let n = this._instance.config.disable_capture_url_hashes ? fr(t) : t,
          r = this._instance.config.custom_personal_data_properties;
        return ks(
          n,
          this._instance.config.mask_personal_data_properties ? [...js, ...(r || [])] : [],
          Ns,
        );
      }
    },
  },
  cf = {
    exceptionObserver: class {
      constructor(e) {
        ((this._startCapturing = () => {
          if (!O || !this.isEnabled || !A.__PosthogExtensions__?.errorWrappingFunctions) return;
          let e = A.__PosthogExtensions__.errorWrappingFunctions.wrapOnError,
            t = A.__PosthogExtensions__.errorWrappingFunctions.wrapUnhandledRejection,
            n = A.__PosthogExtensions__.errorWrappingFunctions.wrapConsoleError;
          try {
            (!this._unwrapOnError &&
              this._config.capture_unhandled_errors &&
              (this._unwrapOnError = e(this.captureException.bind(this))),
              !this._unwrapUnhandledRejection &&
                this._config.capture_unhandled_rejections &&
                (this._unwrapUnhandledRejection = t(this.captureException.bind(this))),
              !this._unwrapConsoleError &&
                this._config.capture_console_errors &&
                (this._unwrapConsoleError = n(this.captureException.bind(this))));
          } catch (e) {
            (Eu.error(`failed to start`, e), this._stopCapturing());
          }
        }),
          (this._instance = e),
          (this._remoteEnabled = !!this._instance.persistence?.props[re]),
          (this._rateLimiter = new Qt(
            V(
              V(
                {},
                (function (e = {}) {
                  return {
                    refillRate:
                      e.exceptionRateLimiterRefillRate ?? e.__exceptionRateLimiterRefillRate ?? 1,
                    bucketSize:
                      e.exceptionRateLimiterBucketSize ?? e.__exceptionRateLimiterBucketSize ?? 10,
                  };
                })(this._instance.config.error_tracking),
              ),
              {},
              { refillInterval: 1e4, _logger: Eu },
            ),
          )),
          (this._config = this._requiredConfig()),
          this.startIfEnabledOrStop());
      }
      _requiredConfig() {
        let e = this._instance.config.capture_exceptions,
          t = {
            capture_unhandled_errors: !1,
            capture_unhandled_rejections: !1,
            capture_console_errors: !1,
          };
        return (
          P(e)
            ? (t = V(V({}, t), e))
            : (F(e) ? this._remoteEnabled : e) &&
              (t = V(
                V({}, t),
                {},
                { capture_unhandled_errors: !0, capture_unhandled_rejections: !0 },
              )),
          t
        );
      }
      get isEnabled() {
        return (
          this._config.capture_console_errors ||
          this._config.capture_unhandled_errors ||
          this._config.capture_unhandled_rejections
        );
      }
      startIfEnabledOrStop() {
        this.isEnabled
          ? (Eu.info(`enabled`), this._stopCapturing(), this._loadScript(this._startCapturing))
          : this._stopCapturing();
      }
      _loadScript(e) {
        var t, n;
        A.__PosthogExtensions__?.errorWrappingFunctions
          ? e()
          : (t = A.__PosthogExtensions__) == null ||
            (n = t.loadExternalDependency) == null ||
            n.call(t, this._instance, `exception-autocapture`, (t) => {
              if (t) return Eu.error(`failed to load script`, t);
              e();
            });
      }
      _stopCapturing() {
        var e, t, n;
        ((e = this._unwrapOnError) == null || e.call(this),
          (this._unwrapOnError = void 0),
          (t = this._unwrapUnhandledRejection) == null || t.call(this),
          (this._unwrapUnhandledRejection = void 0),
          (n = this._unwrapConsoleError) == null || n.call(this),
          (this._unwrapConsoleError = void 0));
      }
      onRemoteConfig(e) {
        if (!e.ok) return;
        let t = e.config;
        `autocaptureExceptions` in t &&
          ((this._remoteEnabled = !!t.autocaptureExceptions || !1),
          this._instance.persistence &&
            this._instance.persistence.register({ [re]: this._remoteEnabled }),
          (this._config = this._requiredConfig()),
          this.startIfEnabledOrStop());
      }
      onConfigChange() {
        this._config = this._requiredConfig();
      }
      captureException(e) {
        try {
          var t, n;
          let r =
            (e == null || (t = e.$exception_list) == null || (t = t[0]) == null
              ? void 0
              : t.type) ?? `Exception`;
          if (this._rateLimiter.consumeRateLimit(r))
            return void Eu.info(`Skipping exception capture because of client rate limiting.`, {
              exception: r,
            });
          (n = this._instance.exceptions) == null || n.sendExceptionEvent(e);
        } catch {}
      }
    },
    exceptions: class {
      constructor(e) {
        ((this._suppressionRules = []),
          (this._errorPropertiesBuilder = new Er(
            [new qr(), new ri(), new Yr(), new Jr(), new ti(), new ei(), new Zr(), new ni()],
            (function (e, ...t) {
              return (n, r = 0) => {
                let i = [],
                  a = n.split(`
`),
                  o = Math.min(a.length, r + 1e3),
                  s = [];
                for (let n = r; o > n; n++) {
                  let r = a[n];
                  if (r.length > 1024) continue;
                  let o = zr.test(r) ? r.replace(zr, `$1`) : r;
                  if (!o.match(/\S*Error: /)) {
                    for (let n of t) {
                      let t = n(o, e);
                      if (t) {
                        i.push(t);
                        let e = Vr(i);
                        if (e) {
                          for (let t = s.length - 1; t >= 0; t--) {
                            let n = s[t];
                            if (e.start >= n.start + n.length) break;
                            s.pop();
                          }
                          s.push(e);
                        }
                        break;
                      }
                    }
                    if (Gr(i, s) >= 50) break;
                  }
                }
                let c = [...s].sort((e, t) => t.start - e.start),
                  l = c[c.length - 1];
                if (l) {
                  let e = Ur(i, l);
                  i.splice(l.start - e, e);
                  for (let t of c) t.start -= e;
                }
                for (let e of c) Hr(i, e);
                return (
                  s.some((e) => e.start === 0 && i.length === e.length) &&
                    (function (e) {
                      let t = e.map(
                          (e) => `${e.function}|${e.filename}|${e.lineno}|${e.colno}|${e.module}`,
                        ),
                        n = 0;
                      for (let e = 1; t.length > e; e++) Kr(t, e, n) && (n = e);
                      e.push(...e.splice(0, n));
                    })(i),
                  (function (e) {
                    if (!e.length) return [];
                    let t = Array.from(e);
                    return (
                      t.reverse(),
                      t.slice(0, 50).map((e) => {
                        return V(
                          V({}, e),
                          {},
                          {
                            filename: e.filename || ((n = t), n[n.length - 1] || {}).filename,
                            function: e.function || `?`,
                          },
                        );
                        var n;
                      })
                    );
                  })(i)
                );
              };
            })(`web:javascript`, Fr, Rr),
          )),
          (this._instance = e),
          (this._suppressionRules =
            this._instance.persistence?.get_property(`$error_tracking_suppression_rules`) ?? []),
          (this._exceptionStepsConfig = ci(this._getExceptionStepsConfig())),
          (this._exceptionStepsBuffer = new li(this._exceptionStepsConfig)));
      }
      onConfigChange() {
        ((this._exceptionStepsConfig = ci(this._getExceptionStepsConfig())),
          this._exceptionStepsBuffer.setConfig(this._exceptionStepsConfig));
      }
      onRemoteConfig(e) {
        if (!e.ok) return;
        let t = e.config;
        if (!(`errorTracking` in t)) return;
        let n = t.errorTracking?.suppressionRules ?? [],
          r = t.errorTracking?.captureExtensionExceptions;
        ((this._suppressionRules = n),
          this._instance.persistence &&
            this._instance.persistence.register({ [ie]: this._suppressionRules, [ae]: r }));
      }
      get _captureExtensionExceptions() {
        var e;
        let t = !!this._instance.get_property(ae);
        return (
          (e = this._instance.config.error_tracking.captureExtensionExceptions ?? t) != null && e
        );
      }
      buildProperties(e, t) {
        return this._errorPropertiesBuilder.buildFromUnknown(e, {
          syntheticException: t?.syntheticException,
          mechanism: { handled: t?.handled },
        });
      }
      addExceptionStep(e, t) {
        if (this._exceptionStepsConfig.enabled)
          try {
            if (!I(e) || e.trim().length === 0)
              return void vd.warn(
                `Ignoring exception step because message must be a non-empty string`,
              );
            let { sanitizedProperties: n, droppedKeys: r } = (function (e) {
              if (!e) return { sanitizedProperties: {}, droppedKeys: [] };
              let t = [];
              return {
                sanitizedProperties: Object.keys(e).reduce(
                  (n, r) => (oi.has(r) ? (t.push(r), n) : ((n[r] = e[r]), n)),
                  {},
                ),
                droppedKeys: t,
              };
            })(this._coerceExceptionStepProperties(t));
            (r.length > 0 && vd.warn(`Ignoring reserved exception step fields`, { droppedKeys: r }),
              this._exceptionStepsBuffer.add(V({ [ii]: e, [ai]: new Date().toISOString() }, n)));
          } catch (e) {
            vd.error(`Failed to add exception step. Ignoring breadcrumb.`, e);
          }
      }
      sendExceptionEvent(e) {
        try {
          let t = e.$exception_list;
          if (this._isExceptionList(t)) {
            if (this._matchesSuppressionRule(t))
              return (
                this._addDroppedExceptionStep(`Exception dropped: matched a suppression rule`),
                void vd.info(`Skipping exception capture because a suppression rule matched`)
              );
            if (!this._captureExtensionExceptions && this._isExtensionException(t))
              return (
                this._addDroppedExceptionStep(`Exception dropped: thrown by a browser extension`),
                void vd.info(`Skipping exception capture because it was thrown by an extension`)
              );
            if (!this._captureExtensionExceptions && this._isInjectedBrowserScriptException(t))
              return (
                this._addDroppedExceptionStep(
                  `Exception dropped: thrown by an injected browser script`,
                ),
                void vd.info(
                  `Skipping exception capture because it was thrown by an injected browser script`,
                )
              );
            if (
              !this._instance.config.error_tracking.__capturePostHogExceptions &&
              this._isPostHogException(t)
            )
              return (
                this._addDroppedExceptionStep(`Exception dropped: thrown by the PostHog SDK`),
                void vd.info(`Skipping exception capture because it was thrown by the PostHog SDK`)
              );
          }
          let n =
              this._exceptionStepsConfig.enabled && R(e.$exception_steps)
                ? this._addBufferedExceptionSteps(e)
                : e,
            r = (function () {
              if (`u` > typeof process) {
                let e = {}.POSTHOG_RELEASE_ID?.trim();
                if (e) return e;
              }
              let e = globalThis._posthogReleaseId;
              return typeof e == `string` && e.length > 0 ? e : void 0;
            })();
          r && (n.$release_id = r);
          try {
            let e = this._instance.capture(`$exception`, n, {
              _noTruncate: !0,
              _batchKey: `exceptionEvent`,
              _originatedFromCaptureException: !0,
            });
            return (e && this._exceptionStepsBuffer.clear(), e);
          } catch (e) {
            (_d(e) || vd.error(`Failed to capture exception event. Dropping this exception.`, e),
              this._exceptionStepsBuffer.clear());
            return;
          }
        } catch (e) {
          _d(e) || vd.error(`Failed to process exception event. Ignoring this exception.`, e);
          return;
        }
      }
      _addBufferedExceptionSteps(e) {
        try {
          let t = this._exceptionStepsBuffer.getAttachable();
          return t.length === 0 ? e : V(V({}, e), {}, { $exception_steps: t });
        } catch (t) {
          return (
            vd.error(
              `Failed to read buffered exception steps. Capturing exception without steps.`,
              t,
            ),
            e
          );
        }
      }
      _addDroppedExceptionStep(e) {
        this._exceptionStepsConfig.enabled &&
          this._exceptionStepsBuffer.add({ [ii]: e, [ai]: new Date().toISOString() });
      }
      _coerceExceptionStepProperties(e) {
        return P(e) ? V({}, e) : {};
      }
      _getExceptionStepsConfig() {
        return this._instance.config.error_tracking?.exception_steps ?? {};
      }
      _matchesSuppressionRule(e) {
        if (e.length === 0) return !1;
        try {
          let t = e.reduce(
            (e, { type: t, value: n }) => (
              I(t) && t.length > 0 && e.$exception_types.push(t),
              I(n) && n.length > 0 && e.$exception_values.push(n),
              e
            ),
            { $exception_types: [], $exception_values: [] },
          );
          return this._suppressionRules.some((e) => {
            let n = e.values.map((e) => {
              let n = jl[e.operator],
                r = t[e.key];
              if (!n || !r) return !1;
              let i = M(e.value) ? e.value : [e.value];
              return i.length > 0 && n(i, r);
            });
            return e.type === `OR` ? n.some(Boolean) : n.every(Boolean);
          });
        } catch (e) {
          return (vd.warn(`Failed to evaluate suppression rules. Capturing the exception.`, e), !1);
        }
      }
      _isExtensionException(e) {
        let t = e.flatMap((e) => e.stacktrace?.frames ?? []),
          n = t.filter(({ filename: e }) => !!e && xd.some((t) => e.startsWith(t)));
        return (
          n.length !== 0 &&
          (!n.every(({ filename: e }) => !!e && e.startsWith(yd)) ||
            (e.some(
              ({ type: e, value: t }) =>
                e === `NoResponse` ||
                (I(t) && bd.some(({ value: e, exact: n }) => (n ? t === e : t.includes(e)))),
            ) &&
              !t.some(({ in_app: e, filename: t }) => e && !t?.startsWith(yd))))
        );
      }
      _isInjectedBrowserScriptException(e) {
        return e.some(({ value: e }) => I(e) && Sd.some((t) => e.includes(t)));
      }
      _isPostHogException(e) {
        if (e.length > 0) {
          var t, n;
          let r = e[0].stacktrace?.frames ?? [],
            i = r[r.length - 1];
          return (
            (t =
              i == null || (n = i.filename) == null ? void 0 : n.includes(`posthog.com/static`)) !=
              null && t
          );
        }
        return !1;
      }
      _isExceptionList(e) {
        return !R(e) && M(e);
      }
    },
  },
  lf = V(
    {
      productTours: class {
        get _persistence() {
          return this._instance.persistence;
        }
        constructor(e) {
          ((this._productTourManager = null), (this._cachedTours = null), (this._instance = e));
        }
        initialize() {
          this.loadIfEnabled();
        }
        onRemoteConfig(e) {
          if (!e.ok) return;
          let t = e.config;
          if (`productTours` in t) {
            var n;
            if (
              (this._persistence && this._persistence.register({ [ce]: !!t.productTours }),
              !Uu(this._instance))
            )
              return (
                (!this._productTourManager && R(this._persistence?.props.ph_product_tours)) ||
                  Hu.info(`product tours disabled; stopping and clearing cached tours`),
                (n = this._productTourManager) == null || n.stop(),
                (this._productTourManager = null),
                void this.clearCache()
              );
            this.loadIfEnabled();
          }
        }
        loadIfEnabled() {
          !this._productTourManager &&
            Uu(this._instance) &&
            this._loadScript(() => this._startProductTours());
        }
        _loadScript(e) {
          var t, n;
          A.__PosthogExtensions__?.generateProductTours
            ? e()
            : (t = A.__PosthogExtensions__) == null ||
              (n = t.loadExternalDependency) == null ||
              n.call(t, this._instance, `product-tours`, (t) => {
                t ? Hu.error(`Could not load product tours script`, t) : e();
              });
        }
        _startProductTours() {
          var e;
          !this._productTourManager &&
            (e = A.__PosthogExtensions__) != null &&
            e.generateProductTours &&
            (this._productTourManager = A.__PosthogExtensions__.generateProductTours(
              this._instance,
              !0,
            ));
        }
        getProductTours(e, t = !1) {
          if (M(this._cachedTours) && !t) return void e(this._cachedTours, { isLoaded: !0 });
          let n = this._persistence;
          if (n) {
            let r = n.props[je];
            if (M(r) && !t) return ((this._cachedTours = r), void e(r, { isLoaded: !0 }));
          }
          this._instance._send_request({
            url: this._instance.requestRouter.endpointFor(
              `api`,
              `/api/product_tours/?token=${this._instance.config.token}`,
            ),
            method: `GET`,
            timestampMode: `query`,
            callback: (t) => {
              if (!Uu(this._instance)) return void e([], { isLoaded: !0 });
              let r = t.statusCode;
              if (r !== 200 || !t.json) {
                let n = `Product Tours API could not be loaded, status: ${r}`;
                (r === 0 ? t.error || Hu.warn(n) : Hu.error(n), e([], { isLoaded: !1, error: n }));
                return;
              }
              let i = M(t.json.product_tours) ? t.json.product_tours : [];
              ((this._cachedTours = i), n && n.register({ [je]: i }), e(i, { isLoaded: !0 }));
            },
          });
        }
        getActiveProductTours(e) {
          R(this._productTourManager)
            ? e([], { isLoaded: !1, error: `Product tours not loaded` })
            : this._productTourManager.getActiveProductTours(e);
        }
        showProductTour(e) {
          var t;
          (t = this._productTourManager) == null || t.showTourById(e);
        }
        previewTour(e) {
          this._productTourManager
            ? this._productTourManager.previewTour(e)
            : this._loadScript(() => {
                var t;
                (this._startProductTours(),
                  (t = this._productTourManager) == null || t.previewTour(e));
              });
        }
        dismissProductTour() {
          var e;
          (e = this._productTourManager) == null || e.dismissTour(`user_clicked_skip`);
        }
        nextStep() {
          var e;
          (e = this._productTourManager) == null || e.nextStep();
        }
        previousStep() {
          var e;
          (e = this._productTourManager) == null || e.previousStep();
        }
        clearCache() {
          var e;
          ((this._cachedTours = null),
            (e = this._persistence) == null || e.unregister(`ph_product_tours`));
        }
        resetTour(e) {
          var t;
          (t = this._productTourManager) == null || t.resetTour(e);
        }
        resetAllTours() {
          var e;
          (e = this._productTourManager) == null || e.resetAllTours();
        }
        cancelPendingTour(e) {
          var t;
          (t = this._productTourManager) == null || t.cancelPendingTour(e);
        }
      },
    },
    af,
  ),
  uf = {
    siteApps: class {
      constructor(e) {
        ((this._instance = e),
          (this._siteAppElementPatchCount = 0),
          (this._bufferedInvocations = []),
          (this.apps = {}));
      }
      get isEnabled() {
        return !!this._instance.config.opt_in_site_apps;
      }
      _eventCollector(e, t) {
        if (!t) return;
        let n = this.globalsForEvent(t);
        (this._bufferedInvocations.push(n),
          this._bufferedInvocations.length > 1e3 &&
            (this._bufferedInvocations = this._bufferedInvocations.slice(10)));
      }
      get siteAppLoaders() {
        var e;
        return (e = A._POSTHOG_REMOTE_CONFIG) == null ||
          (e = e[this._instance.config.token]) == null
          ? void 0
          : e.siteApps;
      }
      initialize() {
        if (this.isEnabled) {
          let e = this._instance._addCaptureHook(this._eventCollector.bind(this));
          this._stopBuffering = () => {
            (e(), (this._bufferedInvocations = []), (this._stopBuffering = void 0));
          };
        }
      }
      globalsForEvent(e) {
        if (!e) throw Error(`Event payload is required`);
        let t = {},
          n = this._instance.get_property(`$groups`) || [],
          r = this._instance.get_property(`$stored_group_properties`) || {};
        for (let [e, i] of Object.entries(r)) t[e] = { id: n[e], type: e, properties: i };
        let { $set_once: i, $set: a } = e;
        return {
          event: V(
            V({}, wi(e, Wu)),
            {},
            {
              properties: V(
                V(V({}, e.properties), a ? { $set: V(V({}, e.properties?.$set ?? {}), a) } : {}),
                i ? { $set_once: V(V({}, e.properties?.$set_once ?? {}), i) } : {},
              ),
              elements_chain: e.properties?.$elements_chain ?? ``,
              distinct_id: e.properties?.distinct_id,
            },
          ),
          person: { properties: this._instance.get_property(`$stored_person_properties`) },
          groups: t,
        };
      }
      _prepareElementForSiteApp(e) {
        let t = e.tagName?.toLowerCase();
        return t === `style` && this._instance.config.prepare_external_dependency_stylesheet
          ? this._instance.config.prepare_external_dependency_stylesheet(e) ||
              (Gu.error(`prepare_external_dependency_stylesheet returned null`), null)
          : t === `script` && this._instance.config.prepare_external_dependency_script
            ? this._instance.config.prepare_external_dependency_script(e) ||
              (Gu.error(`prepare_external_dependency_script returned null`), null)
            : e;
      }
      _patchSiteAppElementInsertionMethods() {
        var e;
        if (
          !this._instance.config.prepare_external_dependency_stylesheet &&
          !this._instance.config.prepare_external_dependency_script
        )
          return () => {};
        let t = k?.defaultView,
          n = t == null || (e = t.Node) == null ? void 0 : e.prototype;
        if (!t || !n) return () => {};
        if ((this._siteAppElementPatchCount++, this._restoreSiteAppElementPatches))
          return this._releaseSiteAppElementPatches();
        let r = [],
          i = this,
          a = new WeakSet(),
          o = (e, t, n) => {
            if (!e?.[t]) return;
            let i = e[t];
            ((e[t] = n(i)),
              r.push(() => {
                e[t] = i;
              }));
          },
          s = (e) => {
            if (a.has(e)) return e;
            let t = i._prepareElementForSiteApp(e);
            return (t && a.add(t), t);
          },
          c = (e) => e.map((e) => (typeof e == `string` ? e : s(e))).filter((e) => !L(e));
        return (
          o(
            n,
            `appendChild`,
            (e) =>
              function (t) {
                let n = s(t);
                return n ? e.call(this, n) : t;
              },
          ),
          o(
            n,
            `insertBefore`,
            (e) =>
              function (t, n) {
                let r = s(t);
                return r ? e.call(this, r, n) : t;
              },
          ),
          o(
            n,
            `replaceChild`,
            (e) =>
              function (t, n) {
                let r = s(t);
                return r ? e.call(this, r, n) : n;
              },
          ),
          [t.Element?.prototype, t.Document?.prototype, t.DocumentFragment?.prototype].forEach(
            (e) => {
              (o(
                e,
                `append`,
                (e) =>
                  function (...t) {
                    return e.apply(this, c(t));
                  },
              ),
                o(
                  e,
                  `prepend`,
                  (e) =>
                    function (...t) {
                      return e.apply(this, c(t));
                    },
                ));
            },
          ),
          [t.Element?.prototype, t.CharacterData?.prototype, t.DocumentType?.prototype].forEach(
            (e) => {
              (o(
                e,
                `before`,
                (e) =>
                  function (...t) {
                    return e.apply(this, c(t));
                  },
              ),
                o(
                  e,
                  `after`,
                  (e) =>
                    function (...t) {
                      return e.apply(this, c(t));
                    },
                ),
                o(
                  e,
                  `replaceWith`,
                  (e) =>
                    function (...t) {
                      let n = c(t);
                      return t.length && !n.length ? void 0 : e.apply(this, n);
                    },
                ));
            },
          ),
          o(
            t.Element?.prototype,
            `insertAdjacentElement`,
            (e) =>
              function (t, n) {
                let r = s(n);
                return r ? e.call(this, t, r) : null;
              },
          ),
          (this._restoreSiteAppElementPatches = () => {
            (r.forEach((e) => e()), (this._restoreSiteAppElementPatches = void 0));
          }),
          this._releaseSiteAppElementPatches()
        );
      }
      _releaseSiteAppElementPatches() {
        let e = !1;
        return () => {
          var t;
          e ||
            ((e = !0),
            this._siteAppElementPatchCount--,
            this._siteAppElementPatchCount === 0 &&
              ((t = this._restoreSiteAppElementPatches) == null || t.call(this)));
        };
      }
      _runWithPreparedSiteAppElements(e, t = !0) {
        let n = this._patchSiteAppElementInsertionMethods();
        try {
          let r = e(n);
          return (t && n(), r);
        } catch (e) {
          throw (n(), e);
        }
      }
      setupSiteApp(e) {
        let t = this.apps[e.id],
          n = () => {
            var n;
            (!t.errored &&
              this._bufferedInvocations.length &&
              (Gu.info(
                `Processing ${this._bufferedInvocations.length} events for site app with id ${e.id}`,
              ),
              this._bufferedInvocations.forEach((e) =>
                this._runWithPreparedSiteAppElements(() => t.processEvent?.call(t, e)),
              ),
              (t.processedBuffer = !0)),
              Object.values(this.apps).every((e) => e.processedBuffer || e.errored) &&
                ((n = this._stopBuffering) == null || n.call(this)));
          },
          r = !1,
          i = (i) => {
            ((t.errored = !i),
              (t.loaded = !0),
              Gu.info(`Site app with id ${e.id} ${i ? `loaded` : `errored`}`),
              r && n());
          };
        try {
          let { processEvent: n } = this._runWithPreparedSiteAppElements(
            (t) =>
              e.init({
                posthog: this._instance,
                callback(e) {
                  (t(), i(e));
                },
              }),
            !1,
          );
          (n && (t.processEvent = n), (r = !0));
        } catch (t) {
          (Gu.error(Ku + e.id, t), i(!1));
        }
        if (r && t.loaded)
          try {
            n();
          } catch (n) {
            (Gu.error(
              `Error while processing buffered events PostHog app with config id ${e.id}`,
              n,
            ),
              (t.errored = !0));
          }
      }
      _setupSiteApps() {
        let e = this.siteAppLoaders || [];
        for (let t of e)
          this.apps[t.id] = { id: t.id, loaded: !1, errored: !1, processedBuffer: !1 };
        for (let t of e) this.setupSiteApp(t);
      }
      _onCapturedEvent(e) {
        if (Object.keys(this.apps).length === 0) return;
        let t = this.globalsForEvent(e);
        for (let n of Object.values(this.apps))
          try {
            this._runWithPreparedSiteAppElements(() => n.processEvent?.call(n, t));
          } catch (t) {
            Gu.error(`Error while processing event ${e.event} for site app ${n.id}`, t);
          }
      }
      onRemoteConfig(e) {
        var t;
        if (this.siteAppLoaders?.length)
          return this.isEnabled
            ? (this._setupSiteApps(),
              void this._instance.on(`eventCaptured`, (e) => this._onCapturedEvent(e)))
            : void Gu.error(
                `PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.`,
              );
        if (((t = this._stopBuffering) == null || t.call(this), !e.ok)) return;
        let n = e.config;
        if (n.siteApps?.length) {
          if (this.isEnabled)
            for (let { id: e, url: t } of n.siteApps) {
              var r, i;
              ((A[`__$$ph_site_app_${e}`] = this._instance),
                (r = A.__PosthogExtensions__) == null ||
                  (i = r.loadSiteApp) == null ||
                  i.call(r, this._instance, t, (t) => {
                    if (t) return Gu.error(Ku + e, t);
                  }));
            }
          else
            Gu.error(
              `PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.`,
            );
        }
      }
    },
  },
  df = {
    tracingHeaders: class {
      constructor(e) {
        ((this._instance = e),
          (this._restoreXHRPatch = void 0),
          (this._restoreFetchPatch = void 0),
          (this._hostnamesForPatch = void 0),
          (this._startCapturing = () => {
            let e = this._syncHostnamesForPatch();
            var t, n;
            e
              ? (F(this._restoreXHRPatch) &&
                  (this._restoreXHRPatch =
                    (t = A.__PosthogExtensions__) == null || (t = t.tracingHeadersPatchFns) == null
                      ? void 0
                      : t._patchXHR(
                          e,
                          () => this._instance.get_distinct_id(),
                          this._instance.sessionManager,
                        )),
                F(this._restoreFetchPatch) &&
                  (this._restoreFetchPatch =
                    (n = A.__PosthogExtensions__) == null || (n = n.tracingHeadersPatchFns) == null
                      ? void 0
                      : n._patchFetch(
                          e,
                          () => this._instance.get_distinct_id(),
                          this._instance.sessionManager,
                        )))
              : this._stopCapturing();
          }));
      }
      initialize() {
        this.startIfEnabledOrStop();
      }
      _loadScript(e) {
        var t, n;
        A.__PosthogExtensions__?.tracingHeadersPatchFns
          ? e()
          : (t = A.__PosthogExtensions__) == null ||
            (n = t.loadExternalDependency) == null ||
            n.call(t, this._instance, `tracing-headers`, (t) => {
              if (t) return Au.error(`failed to load script`, t);
              e();
            });
      }
      _getConfiguredHostnames() {
        return (
          this._instance.config.tracing_headers ??
          this._instance.config.addTracingHeaders ??
          this._instance.config.__add_tracing_headers
        );
      }
      _syncHostnamesForPatch() {
        let e = this._getConfiguredHostnames();
        return M(e)
          ? (M(this._hostnamesForPatch)
              ? this._hostnamesForPatch.splice(0, this._hostnamesForPatch.length, ...e)
              : (this._hostnamesForPatch = [...e]),
            e.length > 0 ? this._hostnamesForPatch : void 0)
          : (M(this._hostnamesForPatch) && this._hostnamesForPatch.splice(0),
            (this._hostnamesForPatch = e || void 0),
            this._hostnamesForPatch);
      }
      _stopCapturing() {
        var e, t;
        ((e = this._restoreXHRPatch) == null || e.call(this),
          (t = this._restoreFetchPatch) == null || t.call(this),
          (this._restoreXHRPatch = void 0),
          (this._restoreFetchPatch = void 0));
      }
      startIfEnabledOrStop() {
        this._syncHostnamesForPatch()
          ? this._loadScript(this._startCapturing)
          : this._stopCapturing();
      }
    },
  },
  ff = V(
    {
      surveys: class extends Xu {
        constructor(e) {
          var t;
          (super(
            new nd(e),
            ((t = e),
            {
              get projectToken() {
                return t.config.token;
              },
              kv: new td(t),
            }),
          ),
            (this._instance = e));
        }
        _sendSurveysRequest(e, t) {
          let n = t.query ? el(e, t.query) : e;
          return new Promise((e) => {
            this._instance._send_request({
              method: t.method,
              url: this._instance.requestRouter.endpointFor(t.target ?? `api`, n),
              data: t.body,
              headers: t.headers,
              timeout: t.timeoutMs,
              fireCallbackOnDrop: !0,
              transport: t.transport,
              compression: t.compression,
              timestampMode: t.sentAt,
              callback: e,
            });
          });
        }
      },
    },
    af,
  ),
  pf = {
    toolbar: class {
      constructor(e) {
        this.instance = e;
      }
      _setToolbarState(e) {
        A.ph_toolbar_state = e;
      }
      _getToolbarState() {
        return A.ph_toolbar_state ?? 0;
      }
      initialize() {
        return this.maybeLoadToolbar();
      }
      maybeLoadToolbar(e = void 0, t = void 0, n = void 0) {
        if (Ga(this.instance.config) || !O || !k) return !1;
        ((e ??= O.location), (n ??= O.history));
        try {
          if (!t) {
            try {
              (O.localStorage.setItem(`test`, `test`), O.localStorage.removeItem(`test`));
            } catch {
              return !1;
            }
            t = O?.localStorage;
          }
          let r = rd || As(e.hash, `__posthog`) || As(e.hash, `state`),
            i,
            a = r
              ? pr(() => JSON.parse(atob(decodeURIComponent(r)))) ||
                pr(() => JSON.parse(decodeURIComponent(r)))
              : null;
          return (
            a && a.action === `ph_authorize`
              ? ((i = a),
                (i.source = `url`),
                i &&
                  Object.keys(i).length > 0 &&
                  (a.desiredHash
                    ? (e.hash = a.desiredHash)
                    : n
                      ? n.replaceState(n.state, ``, e.pathname + e.search)
                      : (e.hash = ``)))
              : ((i = JSON.parse(t.getItem(id) || `{}`)),
                (i.source = `localstorage`),
                delete i.userIntent),
            !(!i.token || this.instance.config.token !== i.token || (this.loadToolbar(i), 0))
          );
        } catch {
          return !1;
        }
      }
      _callLoadToolbar(e) {
        let t = A.ph_load_toolbar || A.ph_load_editor;
        !R(t) && N(t) ? t(e, this.instance) : ad.warn(`No toolbar load function found`);
      }
      loadToolbar(e) {
        let t = !!k?.getElementById(`__POSTHOG_TOOLBAR__`);
        if (!O || t) return !1;
        let n =
            this.instance.requestRouter.region === `custom` &&
            this.instance.config.advanced_disable_toolbar_metrics,
          r = V(
            V({ token: this.instance.config.token }, e),
            {},
            { apiURL: this.instance.requestRouter.endpointFor(`ui`) },
            n ? { instrument: !1 } : {},
          );
        if (
          (O.localStorage.setItem(id, JSON.stringify(V(V({}, r), {}, { source: void 0 }))),
          this._getToolbarState() === 2)
        )
          this._callLoadToolbar(r);
        else if (this._getToolbarState() === 0) {
          var i, a;
          (this._setToolbarState(1),
            (i = A.__PosthogExtensions__) == null ||
              (a = i.loadExternalDependency) == null ||
              a.call(i, this.instance, `toolbar`, (e) => {
                if (e)
                  return (ad.error(`[Toolbar] Failed to load`, e), void this._setToolbarState(0));
                (this._setToolbarState(2), this._callLoadToolbar(r));
              }),
            K(O, `turbolinks:load`, () => {
              (this._setToolbarState(0), this.loadToolbar(r));
            }));
        }
        return !0;
      }
      _loadEditor(e) {
        return this.loadToolbar(e);
      }
      maybeLoadEditor(e = void 0, t = void 0, n = void 0) {
        return this.maybeLoadToolbar(e, t, n);
      }
    },
  },
  mf = V(
    {
      experiments: class e {
        get _config() {
          return this._instance.config;
        }
        constructor(t) {
          ((this._instance = t),
            (this.getWebExperimentsAndEvaluateDisplayLogic = (t = !1) => {
              this.getWebExperiments((t) => {
                (e._logInfo(`retrieved web experiments from the server`),
                  (this._flagToExperiments = new Map()),
                  t.forEach((t) => {
                    if (t.feature_flag_key) {
                      var n;
                      this._flagToExperiments &&
                        (e._logInfo(
                          `setting flag key `,
                          t.feature_flag_key,
                          ` to web experiment `,
                          t,
                        ),
                        (n = this._flagToExperiments) == null || n.set(t.feature_flag_key, t));
                      let r = this._instance.getFeatureFlag(t.feature_flag_key);
                      I(r) &&
                        t.variants[r] &&
                        this._applyTransforms(t.name, r, t.variants[r].transforms);
                    } else if (t.variants)
                      for (let n in t.variants) {
                        let r = t.variants[n];
                        e._matchesTestVariant(r, this._instance) &&
                          this._applyTransforms(t.name, n, r.transforms);
                      }
                  }));
              }, t);
            }),
            this._instance.onFeatureFlags((e) => {
              this.onFeatureFlags(e);
            }));
        }
        initialize() {}
        onFeatureFlags(t) {
          if (this._is_bot()) e._logInfo(Cd);
          else if (!this._config.disable_web_experiments) {
            if (R(this._flagToExperiments))
              return (
                (this._flagToExperiments = new Map()),
                this.loadIfEnabled(),
                void this.previewWebExperiment()
              );
            (e._logInfo(`applying feature flags`, t),
              t.forEach((e) => {
                if (this._flagToExperiments && this._flagToExperiments?.has(e)) {
                  let t = this._instance.getFeatureFlag(e),
                    n = this._flagToExperiments?.get(e);
                  t &&
                    n != null &&
                    n.variants[t] &&
                    this._applyTransforms(n.name, t, n.variants[t].transforms);
                }
              }));
          }
        }
        previewWebExperiment() {
          let t = e.getWindowLocation();
          if (t?.search) {
            let n = Os(t?.search, `__experiment_id`),
              r = Os(t?.search, `__experiment_variant`);
            n &&
              r &&
              (e._logInfo(`previewing web experiments ${n} && ${r}`),
              this.getWebExperiments(
                (e) => {
                  this._showPreviewWebExperiment(parseInt(n), r, e);
                },
                !1,
                !0,
              ));
          }
        }
        loadIfEnabled() {
          this._config.disable_web_experiments || this.getWebExperimentsAndEvaluateDisplayLogic();
        }
        getWebExperiments(e, t, n) {
          if (this._config.disable_web_experiments && !n) return e([]);
          let r = this._instance.get_property(`$web_experiments`);
          if (r && !t) return e(r);
          this._instance._send_request({
            url: this._instance.requestRouter.endpointFor(
              `api`,
              `/api/web_experiments/?token=${this._config.token}`,
            ),
            method: `GET`,
            timestampMode: `query`,
            callback: (t) => e((t.statusCode === 200 && t.json && t.json.experiments) || []),
          });
        }
        _showPreviewWebExperiment(t, n, r) {
          let i = r.filter((e) => e.id === t);
          i &&
            i.length > 0 &&
            (e._logInfo(`Previewing web experiment [${i[0].name}] with variant [${n}]`),
            this._applyTransforms(i[0].name, n, i[0].variants[n].transforms));
        }
        static _matchesTestVariant(t, n) {
          return !R(t.conditions) && e._matchUrlConditions(t, n) && e._matchUTMConditions(t);
        }
        static _matchUrlConditions(t, n) {
          if (R(t.conditions) || R(t.conditions?.url)) return !0;
          let r = e.getWindowLocation();
          if (r) {
            let e = yo(n, r.href);
            return (
              !t.conditions?.url ||
              wd[t.conditions?.urlMatchType ?? `icontains`](t.conditions.url, e)
            );
          }
          return !1;
        }
        static getWindowLocation() {
          return O?.location;
        }
        static _matchUTMConditions(e) {
          if (R(e.conditions) || R(e.conditions?.utm)) return !0;
          let t = Fs();
          if (t.utm_source) {
            var n, r, i, a, o, s, c, l;
            let u =
                !((n = e.conditions) != null && (n = n.utm) != null && n.utm_campaign) ||
                ((r = e.conditions) == null || (r = r.utm) == null ? void 0 : r.utm_campaign) ==
                  t.utm_campaign,
              d =
                !((i = e.conditions) != null && (i = i.utm) != null && i.utm_source) ||
                ((a = e.conditions) == null || (a = a.utm) == null ? void 0 : a.utm_source) ==
                  t.utm_source,
              f =
                !((o = e.conditions) != null && (o = o.utm) != null && o.utm_medium) ||
                ((s = e.conditions) == null || (s = s.utm) == null ? void 0 : s.utm_medium) ==
                  t.utm_medium,
              p =
                !((c = e.conditions) != null && (c = c.utm) != null && c.utm_term) ||
                ((l = e.conditions) == null || (l = l.utm) == null ? void 0 : l.utm_term) ==
                  t.utm_term;
            return u && f && p && d;
          }
          return !1;
        }
        static _logInfo(e, ...t) {
          H.info(`[WebExperiments] ${e}`, t);
        }
        _applyTransforms(t, n, r) {
          this._is_bot()
            ? e._logInfo(Cd)
            : n === `control`
              ? e._logInfo(`Control variants leave the page unmodified.`)
              : r.forEach((r) => {
                  r.selector &&
                    (e._logInfo(`applying transform of variant ${n} for experiment ${t} `, r),
                    document?.querySelectorAll(r.selector)?.forEach((e) => {
                      let t = e;
                      (r.html && (t.innerHTML = r.html), r.css && t.setAttribute(`style`, r.css));
                    }));
                });
        }
        _is_bot() {
          return ht && this._instance ? Tl(ht, this._config.custom_blocked_useragents) : void 0;
        }
      },
    },
    af,
  ),
  hf = {
    conversations: class {
      constructor(e) {
        ((this._instance = e),
          (this._isConversationsEnabled = void 0),
          (this._conversationsManager = null),
          (this._isInitializing = !1),
          (this._remoteConfig = null),
          (this._loadFailed = !1));
      }
      initialize() {
        this.loadIfEnabled();
      }
      onRemoteConfig(e) {
        if (
          this._instance.config.disable_conversations ||
          ((this._remoteConfigSuccessful = e.ok), !e.ok)
        )
          return;
        let t = e.config.conversations;
        R(t) ||
          (It(t)
            ? (this._isConversationsEnabled = t)
            : ((this._isConversationsEnabled = t.enabled), (this._remoteConfig = t)),
          this.loadIfEnabled());
      }
      reset() {
        var e;
        ((e = this._conversationsManager) == null || e.reset(),
          (this._conversationsManager = null),
          (this._isConversationsEnabled = void 0),
          (this._remoteConfig = null),
          (this._remoteConfigSuccessful = void 0),
          (this._loadFailed = !1));
      }
      loadIfEnabled() {
        if (
          this._conversationsManager ||
          this._isInitializing ||
          this._instance.config.disable_conversations ||
          Ga(this._instance.config) ||
          (this._instance.config.cookieless_mode && this._instance.consent.isOptedOut())
        )
          return;
        let e = A?.__PosthogExtensions__;
        if (e && !F(this._isConversationsEnabled) && this._isConversationsEnabled) {
          if (this._remoteConfig && this._remoteConfig.token) {
            this._isInitializing = !0;
            try {
              let t = e.initConversations;
              if (t) return (this._completeInitialization(t), void (this._isInitializing = !1));
              let n = e.loadExternalDependency;
              if (!n) return void this._handleLoadError(at);
              n(this._instance, `conversations`, (t) => {
                (t || !e.initConversations
                  ? this._handleLoadError(`Could not load conversations script`, t)
                  : this._completeInitialization(e.initConversations),
                  (this._isInitializing = !1));
              });
            } catch (e) {
              (this._handleLoadError(`Error initializing conversations`, e),
                (this._isInitializing = !1));
            }
          } else Td.error(`Conversations enabled but missing token in remote config.`);
        }
      }
      _completeInitialization(e) {
        if (this._remoteConfig)
          try {
            ((this._conversationsManager = e(this._remoteConfig, this._instance)),
              (this._loadFailed = !1),
              Td.info(`Conversations loaded successfully`));
          } catch (e) {
            this._handleLoadError(`Error completing conversations initialization`, e);
          }
        else Td.error(`Cannot complete initialization: remote config is null`);
      }
      _handleLoadError(e, t) {
        (Td.error(e, t),
          (this._conversationsManager = null),
          (this._isInitializing = !1),
          (this._loadFailed = !0));
      }
      show() {
        this._conversationsManager
          ? this._conversationsManager.show()
          : Td.warn(`Conversations not loaded yet.`);
      }
      hide() {
        this._conversationsManager && this._conversationsManager.hide();
      }
      isAvailable() {
        return !0 === this._isConversationsEnabled && !L(this._conversationsManager);
      }
      getUnavailableReason() {
        return this.isAvailable()
          ? null
          : this._instance.config.disable_conversations
            ? `disabled_by_config`
            : Ga(this._instance.config)
              ? `disabled_for_toolbar`
              : this._instance.config.cookieless_mode && this._instance.consent.isOptedOut()
                ? `consent_opted_out`
                : !1 === this._remoteConfigSuccessful
                  ? `remote_config_failed`
                  : F(this._isConversationsEnabled)
                    ? this._remoteConfigSuccessful
                      ? `disabled_in_project`
                      : `remote_config_pending`
                    : this._isConversationsEnabled
                      ? R(this._remoteConfig) || !this._remoteConfig.token
                        ? `missing_token`
                        : A?.__PosthogExtensions__
                          ? this._isInitializing
                            ? `initializing`
                            : this._loadFailed
                              ? `load_failed`
                              : `not_loaded`
                          : `extensions_unavailable`
                      : `disabled_in_project`;
      }
      isVisible() {
        var e;
        return (e = this._conversationsManager?.isVisible()) != null && e;
      }
      sendMessage(e, t, n) {
        var r = this;
        return B(function* () {
          return r._conversationsManager
            ? r._conversationsManager.sendMessage(e, t, n)
            : (Td.warn(Ed), null);
        })();
      }
      getMessages(e, t) {
        var n = this;
        return B(function* () {
          return n._conversationsManager
            ? n._conversationsManager.getMessages(e, t)
            : (Td.warn(Ed), null);
        })();
      }
      markAsRead(e) {
        var t = this;
        return B(function* () {
          return t._conversationsManager
            ? t._conversationsManager.markAsRead(e)
            : (Td.warn(Ed), null);
        })();
      }
      getTickets(e) {
        var t = this;
        return B(function* () {
          return t._conversationsManager
            ? t._conversationsManager.getTickets(e)
            : (Td.warn(Ed), null);
        })();
      }
      requestRestoreLink(e) {
        var t = this;
        return B(function* () {
          return t._conversationsManager
            ? t._conversationsManager.requestRestoreLink(e)
            : (Td.warn(Ed), null);
        })();
      }
      restoreFromToken(e) {
        var t = this;
        return B(function* () {
          return t._conversationsManager
            ? t._conversationsManager.restoreFromToken(e)
            : (Td.warn(Ed), null);
        })();
      }
      restoreFromUrlToken() {
        var e = this;
        return B(function* () {
          return e._conversationsManager
            ? e._conversationsManager.restoreFromUrlToken()
            : (Td.warn(Ed), null);
        })();
      }
      getCurrentTicketId() {
        return this._conversationsManager?.getCurrentTicketId() ?? null;
      }
      getWidgetSessionId() {
        return this._conversationsManager?.getWidgetSessionId() ?? null;
      }
      _onIdentityChanged() {
        var e;
        (e = this._conversationsManager) == null || e.setIdentity();
      }
      _onIdentityCleared() {
        var e;
        (e = this._conversationsManager) == null || e.clearIdentity();
      }
    },
  },
  gf = {
    logs: class extends Pd {
      constructor(e) {
        (super(
          {
            get() {
              var t;
              return e == null || (t = e.config) == null ? void 0 : t.logs;
            },
            captureHintKey: le,
            get remoteConfigWillArrive() {
              var t;
              return (
                !e._shouldDisableFlags?.call(e) ||
                !!(
                  (t = A._POSTHOG_REMOTE_CONFIG) != null &&
                  (t = t[e.config.token]) != null &&
                  t.config
                )
              );
            },
          },
          () =>
            (function (e) {
              var t;
              let n = {};
              if (((n.distinctId = e.get_distinct_id()), e.sessionManager)) {
                let {
                  sessionId: t,
                  windowId: r,
                  sessionStartTimestamp: i,
                  lastActivityTimestamp: a,
                } = e.sessionManager.checkAndGetSessionAndWindowId(!0);
                ((n.sessionId = t),
                  (n.windowId = r),
                  R(i) || (n.sessionStartTimestamp = i),
                  R(a) || (n.lastActivityTimestamp = a));
              }
              if (
                (A != null &&
                  (t = A.location) != null &&
                  t.href &&
                  (n.currentUrl = e.config.disable_capture_url_hashes
                    ? fr(A.location.href)
                    : A.location.href),
                e.featureFlags)
              ) {
                let t = e.featureFlags.getFlags();
                t && t.length > 0 && (n.activeFeatureFlags = t);
              }
              return n;
            })(e),
        ),
          (this._instance = e),
          (this.name = ql),
          this._listenForReconnect());
      }
      get _isRequestReady() {
        return this._instance.__loaded;
      }
      _getConsoleLoader() {
        let e = U(`[logs]`),
          t = A?.__PosthogExtensions__;
        if (!t) return void e.error(`PostHog Extensions not found.`);
        let n = t.loadExternalDependency;
        if (n)
          return (e) => {
            n(this._instance, `logs`, (n) => {
              let r = t.logs;
              e(
                n,
                r?.initializeLogs
                  ? {
                      initialize: (e) => r.initializeLogs(e),
                      replay(e, t) {
                        return r.replayConsoleBuffer?.call(r, e, t);
                      },
                    }
                  : void 0,
              );
            });
          };
        e.error(at);
      }
    },
  },
  _f = {
    metrics: class {
      constructor(e) {
        ((this._instance = e), (this._logger = U(`[metrics]`)), (this._disposed = !1));
      }
      initialize() {
        this.onConfigChange();
      }
      onConfigChange() {
        if (this._disposed) return;
        let e = !!this._instance.config.metrics?.network;
        e && !this._stopNetworkMetrics
          ? (this._stopNetworkMetrics = ((e) => {
              let t = !0,
                n = () =>
                  t
                    ? ((e) => {
                        let t = e.config.metrics?.network;
                        return !0 === t ? {} : t || void 0;
                      })(e)
                    : void 0,
                r = Hd(e, n),
                i = Ud(e, n);
              return () => {
                ((t = !1), r(), i());
              };
            })(this._instance))
          : !e &&
            this._stopNetworkMetrics &&
            (this._stopNetworkMetrics(), (this._stopNetworkMetrics = void 0));
      }
      _getCore() {
        var e;
        let t = (e = this._instance) == null || (e = e.config) == null ? void 0 : e.metrics;
        var n;
        return (
          (this._core && this._resolvedFrom === t) ||
            ((n = this._core) == null || n.reset(),
            (this._resolvedFrom = t),
            (this._core = new Fa(
              this._createHost(),
              (function (e) {
                let t = e?.resourceAttributes;
                return {
                  serviceName: t?.[`service.name`] ?? e?.serviceName,
                  serviceVersion: t?.[`service.version`] ?? e?.serviceVersion,
                  environment: t?.[`deployment.environment`] ?? e?.environment,
                  resourceAttributes: t,
                  beforeSend: e?.beforeSend,
                  flushIntervalMs: e?.flushIntervalMs ?? 1e4,
                  maxSeriesPerFlush: e?.maxSeriesPerFlush ?? 1e3,
                };
              })(t),
              this._logger,
            ))),
          this._core
        );
      }
      count(e, t = 1, n) {
        this._getCore().count(e, t, n);
      }
      gauge(e, t, n) {
        this._getCore().gauge(e, t, n);
      }
      histogram(e, t, n) {
        this._getCore().histogram(e, t, n);
      }
      flush(e) {
        if (!this._core) return Promise.resolve();
        if (e) {
          let t = this._core.drainWindow();
          return (t && this._sendMetricsBatch(t, e), Promise.resolve());
        }
        return this._core
          .flush()
          .catch((e) => this._logger.error(`PostHog metrics flush failed:`, e));
      }
      reset() {
        var e;
        (e = this._core) == null || e.reset();
      }
      dispose() {
        var e, t;
        ((this._disposed = !0),
          (e = this._stopNetworkMetrics) == null || e.call(this),
          (this._stopNetworkMetrics = void 0),
          (t = this._core) == null || t.reset());
      }
      _createHost() {
        let e = this._instance,
          n = this;
        return {
          get isDisabled() {
            return !1;
          },
          get optedOut() {
            return !e.is_capturing();
          },
          _sendMetricsBatch: (e) => n._sendMetricsBatch(e),
          getLibraryId: () => t.LIB_NAME,
          getLibraryVersion: () => t.LIB_VERSION,
        };
      }
      _sendMetricsBatch(e, t) {
        return new Promise((n) => {
          let r = !1,
            i = (e) => {
              r || ((r = !0), clearTimeout(a), n(e));
            },
            a = setTimeout(
              () => i({ kind: `retry-later`, error: Error(`metrics request timed out`) }),
              9e4,
            );
          this._instance._send_request(
            V(
              V(
                {
                  method: `POST`,
                  url: this._metricsUrl(),
                  data: e,
                  compression: `best-available`,
                  batchKey: `metrics`,
                },
                t && { transport: t },
              ),
              {},
              {
                fireCallbackOnDrop: !0,
                callback(e) {
                  let t = e.statusCode;
                  i(
                    t >= 200 && 300 > t
                      ? { kind: `ok` }
                      : t === 413
                        ? { kind: `too-large` }
                        : t !== 0 && t !== 408 && t !== 429 && 500 > t
                          ? {
                              kind: `fatal`,
                              error: Error(`metrics request failed with status ${t}`),
                            }
                          : {
                              kind: `retry-later`,
                              error: e.error ?? Error(`metrics request failed with status ${t}`),
                            },
                  );
                },
              },
            ),
          );
        });
      }
      _metricsUrl() {
        return (
          this._instance.requestRouter.endpointFor(`api`, `/i/v1/metrics`) +
          `?token=` +
          encodeURIComponent(this._instance.config.token)
        );
      }
    },
  },
  vf = {
    webMCP: class {
      constructor(e) {
        ((this._instance = e), (this._isPatched = !1));
      }
      initialize() {
        this.startIfEnabled();
      }
      startIfEnabled() {
        if (!this._instance.config.capture_webmcp || this._isPatched) return;
        let e = k?.modelContext;
        if (!e || !N(e.registerTool)) return;
        let t = Wd.get(e);
        if (t) return (t.instances.add(this._instance), void (this._isPatched = !0));
        let n = { instances: new Set([this._instance]) },
          r = e.registerTool,
          i = this;
        (ku(e, `registerTool`, (e) => {
          let t = e;
          return function (e, ...r) {
            let a = e;
            try {
              a = i._wrapTool(e, n);
            } catch {
              return t.call(this, e, ...r);
            }
            return t.call(this, a, ...r);
          };
        }),
          e.registerTool !== r && (Wd.set(e, n), (this._isPatched = !0)));
      }
      _wrapTool(e, t) {
        if (!e || !N(e.execute)) return e;
        let n = e.execute,
          r = this,
          { tool: i, injected: a } = (function (e, t) {
            let n = { intent: !1, model: !1 },
              r = e.inputSchema;
            if (
              !(function (e) {
                return (
                  !!F(e) ||
                  (P(e) &&
                    Object.keys(e).every((e) => Gd.has(e) || e.startsWith(`x-`)) &&
                    !0 !== e.additionalProperties &&
                    !P(e.additionalProperties) &&
                    (!e.type || e.type === `object`) &&
                    (!e.properties || P(e.properties)) &&
                    (!e.required || M(e.required)))
                );
              })(r)
            )
              return { tool: Xd(e), injected: n };
            let i = r?.properties || {},
              a = (e) => Yd(i, e) || (M(r?.required) && r.required.includes(e));
            if (
              ((n.intent = t.intent && !a(`context`)),
              (n.model = t.model && !a(`llm_model`)),
              !n.intent && !n.model)
            )
              return { tool: Xd(e), injected: n };
            let o = V({}, i),
              s = M(r?.required) ? [...r.required] : [];
            return (
              n.intent &&
                ((o.context = {
                  type: `string`,
                  description: `Explain why this tool is called and how it supports the user's goal. Describe the abstract purpose only. Do not include personal or identifying information. Generalize specific entities as roles such as "a customer".`,
                }),
                s.includes(`context`) || s.push(`context`)),
              n.model &&
                ((o.llm_model = {
                  type: `string`,
                  description: `The exact model identifier you are running as, taken from your system prompt or environment. Pass "unknown" if you do not know it. Never guess.`,
                }),
                s.includes(`llm_model`) || s.push(`llm_model`)),
              {
                tool: Xd(
                  e,
                  V(V({}, r), {}, { type: r?.type || `object`, properties: o, required: s }),
                ),
                injected: n,
              }
            );
          })(
            e,
            (function (e) {
              let t = { intent: !1, model: !1 };
              for (let n of e.instances) {
                let e = Jd(n.config.capture_webmcp);
                ((t.intent ||= !0 === e?.intent), (t.model ||= !0 === e?.model));
              }
              return t;
            })(t),
          );
        return (
          Object.defineProperty(i, "execute", {
            configurable: !0,
            enumerable: !0,
            writable: !0,
            value(...o) {
              let s = new Date(),
                c = (function (e, t) {
                  if (!P(e)) return {};
                  try {
                    let n = t.intent ? Zd(e.context, 2048, !0) : void 0,
                      r = t.model ? Zd(e.llm_model, 256) : void 0;
                    return V(
                      V({}, n && n !== `{}` ? { intent: n } : {}),
                      r && r.toLowerCase() !== `unknown` ? { model: r } : {},
                    );
                  } catch {
                    return {};
                  }
                })(o[0], a),
                l = (function (e, t) {
                  let n = e[0];
                  if (!P(n)) return e;
                  try {
                    let r = t.intent && Yd(n, `context`),
                      i = t.model && Yd(n, `llm_model`);
                    if (!r && !i) return e;
                    let a = V({}, n);
                    return (r && delete a.context, i && delete a.llm_model, [a, ...e.slice(1)]);
                  } catch {
                    return e;
                  }
                })(o, a),
                u;
              try {
                u = n.apply(this === i ? e : this, l);
              } catch (e) {
                throw (r._captureToolCall(t, i, s, { error: e, errorResult: !1 }, c), e);
              }
              if ((d = u) && typeof d.then == `function`)
                return Promise.resolve(u).then(
                  (e) => {
                    let n = Qd(e) ? { error: e, errorResult: !0 } : void 0;
                    return (r._captureToolCall(t, i, s, n, c), e);
                  },
                  (e) => {
                    throw (r._captureToolCall(t, i, s, { error: e, errorResult: !1 }, c), e);
                  },
                );
              var d;
              let f = Qd(u) ? { error: u, errorResult: !0 } : void 0;
              return (r._captureToolCall(t, i, s, f, c), u);
            },
          }),
          i
        );
      }
      _captureToolCall(e, t, n, r, i) {
        let a = Date.now() - n.getTime(),
          o;
        for (let s of e.instances) {
          let e = Jd(s.config.capture_webmcp);
          if (e) {
            r && !o && (o = rf(r.error, r.errorResult));
            try {
              s.capture(
                `$mcp_tool_call`,
                V(
                  V(
                    V(
                      {
                        $mcp_source: `posthog_mcp_analytics`,
                        $mcp_interface: `webmcp`,
                        $mcp_tool_name: t.name,
                        $mcp_resource_name: t.name,
                        $mcp_tool_description: t.description,
                        $mcp_server_name: gt?.hostname,
                        $mcp_duration_ms: a,
                        $mcp_is_error: !!r,
                      },
                      o ? { $mcp_error_type: o.type, $mcp_error_message: o.message } : {},
                    ),
                    e.intent && i.intent
                      ? { $mcp_intent: i.intent, $mcp_intent_source: `context_parameter` }
                      : {},
                  ),
                  e.model && i.model
                    ? { $mcp_llm_model: i.model, $mcp_llm_model_source: `self_reported` }
                    : {},
                ),
                { timestamp: n },
              );
            } catch {
              continue;
            }
            if (r && o && s.exceptions && s.exceptionObserver?.isEnabled)
              try {
                let e = {
                  $exception_list: tf(s.exceptions, r, o.message),
                  $exception_level: `error`,
                  $exception_source: `mcp.tool_call`,
                  $mcp_interface: `webmcp`,
                  $mcp_tool_name: t.name,
                  $mcp_resource_name: t.name,
                  $mcp_tool_description: t.description,
                  $mcp_server_name: gt?.hostname,
                };
                s.exceptionObserver.captureException(e);
              } catch {}
          }
        }
      }
    },
  };
_u.__defaultExtensionClasses = V(
  {},
  V(
    V(V(V(V(V(V(V(V(V(V(V(V(V({}, af), of), sf), cf), lf), uf), ff), df), pf), mf), hf), gf), _f),
    vf,
  ),
);
var yf = (function () {
  t.SDK_DIST_CHANNEL = `npm`;
  let e = (Zl[du] = new _u());
  return (
    (function () {
      function e() {
        e.done ||
          ((e.done = !0),
          (pl = !1),
          W(Zl, function (e) {
            e._dom_loaded();
          }));
      }
      k?.addEventListener
        ? k.readyState === `complete`
          ? e()
          : K(k, `DOMContentLoaded`, e, { capture: !1 })
        : O &&
          H.error(
            "Browser doesn't support `document.addEventListener` so PostHog couldn't be initialized",
          );
    })(),
    e
  );
})();
export { yf as default, yf as posthog };
