import streamlit as st
import os, re, hashlib, json, secrets as _sec
from typing import Optional

try:
    import gspread
    from google.oauth2.service_account import Credentials
    GSHEETS_OK = True
except ImportError:
    GSHEETS_OK = False

st.set_page_config(
    page_title="MyWorld",
    page_icon="🌟",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Hide Streamlit chrome ──────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');
#MainMenu, header, footer, .stAppDeployButton { display: none !important; }
.block-container { padding: 0 !important; max-width: 100% !important; }
/* Narrow the sidebar so the Wave Creator has more room */
section[data-testid="stSidebar"] { min-width: 180px !important; max-width: 180px !important; width: 180px !important; }
/* Kill all gap/padding around the iframe */
.element-container, .stHtml { padding: 0 !important; margin: 0 !important; }
section[data-testid="stSidebar"] > div {
    background: #000 !important;
    border-right: 1px solid rgba(0,255,65,.2) !important;
}
section[data-testid="stSidebar"] * {
    color: #00ff41 !important;
    font-family: 'Share Tech Mono', monospace !important;
}
div[data-testid="stButton"] > button {
    background: rgba(0,255,65,.06) !important;
    border: 1px solid rgba(0,255,65,.35) !important;
    color: #00ff41 !important;
    font-family: 'Share Tech Mono', monospace !important;
    letter-spacing: .5px !important;
    border-radius: 0 !important;
}
div[data-testid="stButton"] > button:hover {
    background: rgba(0,255,65,.18) !important;
    box-shadow: 0 0 10px rgba(0,255,65,.3) !important;
}
.stTextInput > div > div > input {
    background: rgba(0,255,65,.04) !important;
    border: 1px solid rgba(0,255,65,.3) !important;
    border-radius: 0 !important;
    color: #00ff41 !important;
    font-family: 'Share Tech Mono', monospace !important;
}
.stTextInput label {
    color: rgba(0,255,65,.6) !important;
    font-family: 'Share Tech Mono', monospace !important;
    letter-spacing: 1px !important;
}
.stTabs [data-baseweb="tab"] {
    font-family: 'Share Tech Mono', monospace !important;
    color: rgba(0,255,65,.5) !important;
    border-radius: 0 !important;
    background: transparent !important;
}
.stTabs [aria-selected="true"] {
    color: #00ff41 !important;
    border-bottom: 2px solid #00ff41 !important;
}
.stTabs [data-baseweb="tab-list"] {
    background: transparent !important;
    border-bottom: 1px solid rgba(0,255,65,.2) !important;
    gap: 0 !important;
}
.stAlert { border-radius: 0 !important; font-family: 'Share Tech Mono', monospace !important; }
.stApp { background: #000 !important; }
</style>
""", unsafe_allow_html=True)

# ── Page registry ──────────────────────────────────────────────
PAGES = {
    "🌊  Wave Creator":  "wave-creator.html",
    "🏠  Home":          "index.html",
    "🎮  Games":         "games.html",
    "♟️  Chess":         "chess.html",
    "📚  School Life":   "school-life.html",
    "🎉  Fun Zone":      "fun-zone.html",
    "👋  About":         "about.html",
}
PAGE_HEIGHTS = {
    "wave-creator.html": 760,
    "index.html":        1200,
    "games.html":        1200,
    "chess.html":        1200,
    "school-life.html":  1200,
    "fun-zone.html":     1200,
    "about.html":        1200,
}

# ── Base path ──────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
GUEST_DB = os.path.join(BASE, "guest_accounts.json")

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

# ── JSON fallback (used when Google Sheets is not configured) ───
def _json_read() -> dict:
    try:
        with open(GUEST_DB) as f:
            return json.load(f)
    except Exception:
        return {}

def _json_write(store: dict):
    try:
        with open(GUEST_DB, "w") as f:
            json.dump(store, f, indent=2)
    except Exception:
        pass

# ══════════════════════════════════════════════════════════════
#  SESSION TOKEN STORE
# ══════════════════════════════════════════════════════════════
@st.cache_resource
def _sessions() -> dict:
    return {}

def _new_token(username: str) -> str:
    tok = _sec.token_urlsafe(24)
    _sessions()[tok] = username
    return tok

def _validate_token(tok: str) -> Optional[str]:
    return _sessions().get(tok)

def _revoke_token(tok: str):
    _sessions().pop(tok, None)

# ══════════════════════════════════════════════════════════════
#  GOOGLE SHEETS — persistent guest account storage
# ══════════════════════════════════════════════════════════════
def _get_worksheet():
    """Return (worksheet, error_str). No caching — credentials auto-refresh."""
    if not GSHEETS_OK:
        return None, "gspread not installed"
    try:
        info  = dict(st.secrets["gcp_service_account"])
        creds = Credentials.from_service_account_info(
            info,
            scopes=[
                "https://spreadsheets.google.com/feeds",
                "https://www.googleapis.com/auth/drive",
            ],
        )
        client   = gspread.authorize(creds)
        sheet_id = st.secrets["sheets"]["guest_accounts_id"]
        return client.open_by_key(sheet_id).sheet1, None
    except KeyError as e:
        return None, f"Missing secret key: {e}"
    except Exception as e:
        return None, str(e)

def _read_guests() -> dict:
    ws, err = _get_worksheet()
    if ws is not None:
        try:
            rows = ws.get_all_values()
            # skip header row if present
            data = [r for r in rows if len(r) >= 2 and r[0].lower() != "username"]
            return {r[0]: r[1] for r in data if r[0]}
        except Exception:
            pass
    # Fallback: local JSON
    return _json_read()

def _append_guest(username: str, pw_hash: str) -> Optional[str]:
    """Returns None on success, error string on failure."""
    ws, err = _get_worksheet()
    if ws is not None:
        try:
            ws.append_row([username, pw_hash], value_input_option="RAW")
            return None
        except Exception as e:
            err = str(e)
    # Fallback: local JSON
    store = _json_read()
    store[username] = pw_hash
    _json_write(store)
    return f"Sheets unavailable ({err}), saved locally instead"

def _get_score_worksheet():
    """Return (worksheet, error) for the scores tab — creates tab if missing."""
    if not GSHEETS_OK:
        return None, "gspread not installed"
    try:
        info  = dict(st.secrets["gcp_service_account"])
        creds = Credentials.from_service_account_info(
            info,
            scopes=[
                "https://spreadsheets.google.com/feeds",
                "https://www.googleapis.com/auth/drive",
            ],
        )
        client   = gspread.authorize(creds)
        sheet_id = st.secrets["sheets"]["guest_accounts_id"]
        sh = client.open_by_key(sheet_id)
        try:
            return sh.worksheet("scores"), None
        except Exception:
            ws = sh.add_worksheet(title="scores", rows=1000, cols=4)
            ws.append_row(["username", "game", "score", "timestamp"], value_input_option="RAW")
            return ws, None
    except KeyError as e:
        return None, f"Missing secret key: {e}"
    except Exception as e:
        return None, str(e)

def _save_score(username: str, game: str, score: int):
    ws, _ = _get_score_worksheet()
    if ws is None:
        return
    try:
        from datetime import datetime
        ws.append_row([username, game, score, datetime.utcnow().isoformat()], value_input_option="RAW")
    except Exception:
        pass

def _get_player_high_scores(username: str) -> dict:
    ws, _ = _get_score_worksheet()
    if ws is None:
        return {}
    try:
        rows = ws.get_all_values()
        best: dict = {}
        for r in rows[1:]:  # skip header row
            if len(r) >= 3 and r[0] == username:
                try:
                    s = int(r[2])
                    if s > best.get(r[1], 0):
                        best[r[1]] = s
                except (ValueError, IndexError):
                    pass
        return best
    except Exception:
        return {}

def _get_leaderboard_worksheet():
    """Return (worksheet, error) for the leaderboard tab — creates tab if missing."""
    if not GSHEETS_OK:
        return None, "gspread not installed"
    try:
        info  = dict(st.secrets["gcp_service_account"])
        creds = Credentials.from_service_account_info(
            info,
            scopes=[
                "https://spreadsheets.google.com/feeds",
                "https://www.googleapis.com/auth/drive",
            ],
        )
        client   = gspread.authorize(creds)
        sheet_id = st.secrets["sheets"]["guest_accounts_id"]
        sh = client.open_by_key(sheet_id)
        try:
            return sh.worksheet("leaderboard"), None
        except Exception:
            ws = sh.add_worksheet(title="leaderboard", rows=500, cols=3)
            ws.append_row(["username", "xp", "last_updated"], value_input_option="RAW")
            return ws, None
    except KeyError as e:
        return None, f"Missing secret key: {e}"
    except Exception as e:
        return None, str(e)

def _save_leaderboard_xp(username: str, xp: int):
    ws, _ = _get_leaderboard_worksheet()
    if ws is None:
        return
    try:
        from datetime import datetime
        ts = datetime.utcnow().isoformat()
        rows = ws.get_all_values()
        for i, r in enumerate(rows[1:], start=2):   # 1-indexed, skip header
            if r and r[0] == username:
                ws.update(f"B{i}:C{i}", [[xp, ts]])
                return
        ws.append_row([username, xp, ts], value_input_option="RAW")
    except Exception:
        pass

def _get_leaderboard_data() -> list:
    """Return list of {username, xp} sorted by xp desc."""
    ws, _ = _get_leaderboard_worksheet()
    if ws is None:
        return []
    try:
        rows = ws.get_all_values()
        result = []
        for r in rows[1:]:   # skip header
            if len(r) >= 2 and r[0]:
                try:
                    result.append({"username": r[0], "xp": int(r[1])})
                except (ValueError, IndexError):
                    pass
        return sorted(result, key=lambda x: -x["xp"])
    except Exception:
        return []

def register_guest(username: str, password: str):
    if len(username) < 3:
        return False, "Username must be at least 3 characters."
    if len(password) < 6:
        return False, "Password must be at least 6 characters."
    try:
        for stored in st.secrets["users"]:
            if stored.lower() == username.lower():
                return False, "That username is already taken."
    except Exception:
        pass
    guests = _read_guests()
    if username.lower() in {k.lower() for k in guests}:
        return False, "Username already exists — choose another."
    warn = _append_guest(username, _hash(password))
    if warn:
        return True, f"Account created! (Warning: {warn})"
    return True, "Account created! [saved to Google Sheets]"

# ══════════════════════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════════════════════
def check_credentials(username: str, password: str) -> bool:
    # Owner accounts — case-insensitive
    try:
        for stored_user, stored_pass in st.secrets["users"].items():
            if stored_user.lower() == username.lower() and stored_pass == password:
                return True
    except Exception:
        pass
    # Guest accounts — from Google Sheets
    guests = _read_guests()
    return guests.get(username) == _hash(password)

# ══════════════════════════════════════════════════════════════
#  ASSET INLINER
# ══════════════════════════════════════════════════════════════
def inline_assets(html: str, is_wave: bool = False) -> str:
    def sub_css(m):
        path = os.path.join(BASE, m.group(1))
        try:
            return f"<style>{open(path, encoding='utf-8').read()}</style>"
        except Exception:
            return m.group(0)

    def sub_js(m):
        path = os.path.join(BASE, m.group(1))
        try:
            return f"<script>{open(path, encoding='utf-8').read()}</script>"
        except Exception:
            return m.group(0)

    html = re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',        sub_css, html)
    html = re.sub(r'<script[^>]+src="([^"]+\.js)"[^>]*></script>', sub_js,  html)

    # Hide the site's own nav sidebar (Streamlit handles navigation).
    # For the Wave Creator keep overflow:hidden so the canvas layout works;
    # for regular pages allow scrolling so tall content isn't clipped.
    overflow = "hidden" if is_wave else "auto"
    patch = (f"<style>"
             f"nav.sidebar{{display:none!important}}"
             f".main{{margin-left:0!important;padding:0!important}}"
             f"body,html{{overflow:{overflow}}}"
             f"</style>")
    return html.replace("<head>", "<head>" + patch, 1)

# ══════════════════════════════════════════════════════════════
#  SESSION STATE DEFAULTS
# ══════════════════════════════════════════════════════════════
for k, v in [("auth", False), ("username", ""), ("token", ""), ("page", "🌊  Wave Creator")]:
    if k not in st.session_state:
        st.session_state[k] = v

# ══════════════════════════════════════════════════════════════
#  AUTO-LOGIN: from URL token (set by localStorage JS on prev load)
# ══════════════════════════════════════════════════════════════
_tok_param = st.query_params.get("_t", "")
if _tok_param and not st.session_state.auth:
    _user = _validate_token(_tok_param)
    if _user:
        st.session_state.auth     = True
        st.session_state.username = _user
        st.session_state.token    = _tok_param
        st.rerun()
    else:
        # Token expired or invalid — wipe it from URL so we don't loop
        st.query_params.clear()

# ══════════════════════════════════════════════════════════════
#  SCORE SAVE: from ?_score=game:value sent by JS listener
# ══════════════════════════════════════════════════════════════
_score_param = st.query_params.get("_score", "")
_xp_param    = st.query_params.get("_xp", "")
if _score_param and st.session_state.auth:
    parts = _score_param.split(":", 1)
    if len(parts) == 2:
        try:
            _save_score(st.session_state.username, parts[0], int(parts[1]))
        except Exception:
            pass
    if _xp_param:
        try:
            _save_leaderboard_xp(st.session_state.username, int(_xp_param))
        except Exception:
            pass
    del st.query_params["_score"]
    if "_xp" in st.query_params:
        del st.query_params["_xp"]
    st.session_state.page = "🎮  Games"
    st.rerun()
elif _xp_param and st.session_state.auth:
    # Home page XP sync (no game score, just XP update)
    try:
        _save_leaderboard_xp(st.session_state.username, int(_xp_param))
    except Exception:
        pass
    del st.query_params["_xp"]
    st.rerun()

# ══════════════════════════════════════════════════════════════
#  LOGIN / REGISTER SCREEN
# ══════════════════════════════════════════════════════════════
if not st.session_state.auth:
    # Inject JS that reads localStorage and redirects with the token
    # so the auto-login block above can handle it on next render
    st.components.v1.html("""
    <script>
    (function(){
        var t = localStorage.getItem('mw_tok');
        if (t) {
            var u = new URL(window.parent.location.href);
            if (!u.searchParams.has('_t')) {
                u.searchParams.set('_t', t);
                window.parent.location.replace(u.toString());
            }
        }
    })();
    </script>
    """, height=0, scrolling=False)

    _, col, _ = st.columns([1, 1.1, 1])
    with col:
        st.markdown("""
        <div style="text-align:center;margin-top:70px;margin-bottom:30px">
          <div style="font-family:VT323,monospace;font-size:64px;color:#00ff41;
                      text-shadow:0 0 24px #00ff41,0 0 50px rgba(0,255,65,.25);
                      letter-spacing:4px;line-height:1">MyWorld</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:11px;
                      color:rgba(0,255,65,.4);letter-spacing:3px;margin-top:6px">
            SECURE ACCESS TERMINAL
          </div>
        </div>
        """, unsafe_allow_html=True)

        login_tab, register_tab = st.tabs(["[ LOGIN ]", "[ CREATE ACCOUNT ]"])

        with login_tab:
            st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
            u  = st.text_input("USERNAME", placeholder="username",  key="li_user")
            p  = st.text_input("PASSWORD", type="password", placeholder="••••••••", key="li_pass")
            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
            if st.button("[ ENTER SYSTEM ]", use_container_width=True, key="li_btn"):
                if check_credentials(u, p):
                    # Use canonical casing from secrets if owner account
                    display_name = u
                    try:
                        for stored_user in st.secrets["users"]:
                            if stored_user.lower() == u.lower():
                                display_name = stored_user
                                break
                    except Exception:
                        pass
                    tok = _new_token(display_name)
                    st.session_state.auth     = True
                    st.session_state.username = display_name
                    st.session_state.token    = tok
                    st.rerun()
                else:
                    st.error("⛔  ACCESS DENIED — invalid credentials")

        with register_tab:
            st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
            st.markdown(
                "<div style='font-family:Share Tech Mono,monospace;font-size:11px;"
                "color:rgba(0,255,65,.45);margin-bottom:14px'>"
                "Create a guest account to access the site.</div>",
                unsafe_allow_html=True,
            )
            new_u  = st.text_input("CHOOSE USERNAME", placeholder="min. 3 characters", key="reg_user")
            new_p  = st.text_input("CHOOSE PASSWORD", type="password",
                                   placeholder="min. 6 characters", key="reg_pass")
            new_p2 = st.text_input("CONFIRM PASSWORD", type="password",
                                   placeholder="repeat password", key="reg_pass2")
            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
            if st.button("[ CREATE ACCOUNT ]", use_container_width=True, key="reg_btn"):
                if new_p != new_p2:
                    st.error("⛔  Passwords do not match.")
                else:
                    ok, msg = register_guest(new_u, new_p)
                    if ok:
                        st.success(f"✅  {msg}")
                    else:
                        st.error(f"⛔  {msg}")

        st.markdown("""
        <div style="text-align:center;margin-top:22px;font-family:'Share Tech Mono',monospace;
                    font-size:10px;color:rgba(0,255,65,.2);letter-spacing:1.5px">
          AUTHORISED USERS ONLY
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════
#  MAIN APP  (authenticated)
# ══════════════════════════════════════════════════════════════
else:
    # Keep token alive in URL + save to localStorage so refresh auto-logs in
    if st.session_state.token:
        st.query_params["_t"] = st.session_state.token
        st.components.v1.html(
            f"<script>localStorage.setItem('mw_tok','{st.session_state.token}');</script>",
            height=0, scrolling=False,
        )

    # Listener: same-origin iframe attaches to parent window.
    # Handles game score saves AND XP-only syncs from the home page.
    st.components.v1.html("""
    <script>
    (function(){
      if(window.parent._mwListenerActive) return;
      window.parent._mwListenerActive = true;
      window.parent.addEventListener('message', function(e){
        if(!e.data) return;
        var tok = localStorage.getItem('mw_tok') || '';
        var url = new URL(window.parent.location.href);
        if(e.data.type === 'mw_score'){
          url.searchParams.set('_score', e.data.game + ':' + e.data.score);
          if(e.data.xp !== undefined) url.searchParams.set('_xp', e.data.xp);
          if(tok) url.searchParams.set('_t', tok);
          window.parent.location.replace(url.toString());
        } else if(e.data.type === 'mw_xp_sync'){
          url.searchParams.set('_xp', e.data.xp);
          if(tok) url.searchParams.set('_t', tok);
          window.parent.location.replace(url.toString());
        }
      });
    })();
    </script>
    """, height=0, scrolling=False)

    # ── Sidebar navigation ────────────────────────────────────
    with st.sidebar:
        st.markdown(f"""
        <div style="font-family:VT323,monospace;font-size:26px;color:#00ff41;
                    text-shadow:0 0 12px #00ff41;letter-spacing:2px;padding:8px 0 2px">
          🌟 MyWorld
        </div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:11px;
                    color:rgba(0,255,65,.45);letter-spacing:1.5px;margin-bottom:18px">
          [{st.session_state.username}@myworld]
        </div>
        """, unsafe_allow_html=True)

        for label in PAGES:
            prefix = "> " if st.session_state.page == label else "  "
            if st.button(prefix + label, key=f"nav_{label}", use_container_width=True):
                st.session_state.page = label
                st.rerun()

        st.markdown("<hr style='border-color:rgba(0,255,65,.15)'>", unsafe_allow_html=True)

        if st.button("[ LOGOUT ]", use_container_width=True):
            _revoke_token(st.session_state.token)
            st.session_state.auth     = False
            st.session_state.token    = ""
            st.session_state.username = ""
            # JS clears localStorage AND redirects to clean URL (no token)
            st.components.v1.html(
                "<script>"
                "localStorage.removeItem('mw_tok');"
                "window.parent.location.replace(window.parent.location.pathname);"
                "</script>",
                height=0, scrolling=False,
            )

    # ── Restore personal bests from Sheets into localStorage ──
    if st.session_state.page == "🎮  Games":
        bests = _get_player_high_scores(st.session_state.username)
        if bests:
            bests_json = json.dumps(bests)
            st.components.v1.html(f"""
            <script>
            (function(){{
              var server = {bests_json};
              var local  = JSON.parse(localStorage.getItem('mw_highscores') || '{{}}');
              var merged = {{}};
              var games  = new Set([...Object.keys(server), ...Object.keys(local)]);
              games.forEach(function(g){{ merged[g] = Math.max(server[g]||0, local[g]||0); }});
              localStorage.setItem('mw_highscores', JSON.stringify(merged));
            }})();
            </script>
            """, height=0, scrolling=False)

    # ── Render current page ───────────────────────────────────
    page_file = PAGES[st.session_state.page]
    is_wave   = page_file == "wave-creator.html"
    height    = PAGE_HEIGHTS.get(page_file, 1200)

    try:
        with open(os.path.join(BASE, page_file), "r", encoding="utf-8") as f:
            html = inline_assets(f.read(), is_wave=is_wave)

        # Inject real leaderboard data + XP sync trigger into Home page
        if page_file == "index.html":
            lb_data = _get_leaderboard_data()
            lb_json = json.dumps(lb_data)
            inject = (
                f"<script>window._mwLeaderboard={lb_json};</script>"
                # Sync XP to server once per change (debounced via mw_xp_synced key)
                "<script>(function(){"
                "  var xp=JSON.parse(localStorage.getItem('mw_xp')||'0');"
                "  var synced=JSON.parse(localStorage.getItem('mw_xp_synced')||'-1');"
                "  if(xp>0 && xp!==synced){"
                "    localStorage.setItem('mw_xp_synced',JSON.stringify(xp));"
                "    window.parent.postMessage({type:'mw_xp_sync',xp:xp},'*');"
                "  }"
                "})();</script>"
            )
            html = html.replace("</head>", inject + "</head>", 1)

        # Wave Creator must not scroll (canvas layout) — other pages can scroll freely
        st.components.v1.html(html, height=height, scrolling=not is_wave)
    except Exception as exc:
        st.error(f"Could not load {page_file}: {exc}")
