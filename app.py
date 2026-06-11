import streamlit as st
import os, re, hashlib, json

st.set_page_config(
    page_title="MyWorld",
    page_icon="🌟",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hide Streamlit chrome ──────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');
#MainMenu, header, footer, .stAppDeployButton { display: none !important; }
.block-container { padding: 0 !important; max-width: 100% !important; }
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
    "wave-creator.html": 820,
    "index.html":        950,
    "games.html":        950,
    "chess.html":        950,
    "school-life.html":  950,
    "fun-zone.html":     950,
    "about.html":        950,
}

# ── Guest account store ────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
GUEST_DB = os.path.join(BASE, "guest_accounts.json")

@st.cache_resource
def _guest_store() -> dict:
    """Shared in-memory store, pre-loaded from file on first call."""
    try:
        with open(GUEST_DB, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def _save_guests(store: dict):
    try:
        with open(GUEST_DB, "w") as f:
            json.dump(store, f, indent=2)
    except Exception:
        pass   # read-only filesystem on some hosts — still works in-memory

def register_guest(username: str, password: str) -> tuple[bool, str]:
    if len(username) < 3:
        return False, "Username must be at least 3 characters."
    if len(password) < 6:
        return False, "Password must be at least 6 characters."
    store = _guest_store()
    # Prevent overwriting the owner account
    try:
        if st.secrets["users"].get(username):
            return False, "That username is already taken."
    except Exception:
        pass
    if username in store:
        return False, "Username already exists — choose another."
    store[username] = _hash(password)
    _save_guests(store)
    return True, "Account created!"

# ── Auth check ─────────────────────────────────────────────────
def check_credentials(username: str, password: str) -> bool:
    # Owner account (from Streamlit secrets)
    try:
        if st.secrets["users"].get(username) == password:
            return True
    except Exception:
        pass
    # Guest accounts (hashed)
    store = _guest_store()
    return store.get(username) == _hash(password)

# ── Asset inliner ──────────────────────────────────────────────
def inline_assets(html: str) -> str:
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

    # Hide the site's own nav sidebar — Streamlit handles navigation
    patch = ("<style>"
             "nav.sidebar{display:none!important}"
             ".main{margin-left:0!important;padding:0!important}"
             "body,html{overflow:auto}"
             "</style>")
    return html.replace("<head>", "<head>" + patch, 1)

# ── Session defaults ───────────────────────────────────────────
for k, v in [("auth", False), ("username", ""), ("page", "🌊  Wave Creator")]:
    if k not in st.session_state:
        st.session_state[k] = v

# ══════════════════════════════════════════════════════════════
#  LOGIN / REGISTER SCREEN
# ══════════════════════════════════════════════════════════════
if not st.session_state.auth:
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

        # ── Login tab ────────────────────────────────────────
        with login_tab:
            st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
            u = st.text_input("USERNAME", placeholder="username", key="li_user")
            p = st.text_input("PASSWORD", type="password", placeholder="••••••••", key="li_pass")
            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
            if st.button("[ ENTER SYSTEM ]", use_container_width=True, key="li_btn"):
                if check_credentials(u, p):
                    st.session_state.auth     = True
                    st.session_state.username = u
                    st.rerun()
                else:
                    st.error("⛔  ACCESS DENIED — invalid credentials")

        # ── Register tab ─────────────────────────────────────
        with register_tab:
            st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
            st.markdown(
                "<div style='font-family:Share Tech Mono,monospace;font-size:11px;"
                "color:rgba(0,255,65,.45);margin-bottom:14px'>"
                "Create a guest account to access the site.</div>",
                unsafe_allow_html=True,
            )
            new_u = st.text_input("CHOOSE USERNAME", placeholder="min. 3 characters", key="reg_user")
            new_p = st.text_input("CHOOSE PASSWORD", type="password", placeholder="min. 6 characters", key="reg_pass")
            new_p2 = st.text_input("CONFIRM PASSWORD", type="password", placeholder="repeat password", key="reg_pass2")
            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
            if st.button("[ CREATE ACCOUNT ]", use_container_width=True, key="reg_btn"):
                if new_p != new_p2:
                    st.error("⛔  Passwords do not match.")
                else:
                    ok, msg = register_guest(new_u, new_p)
                    if ok:
                        st.success(f"✅  Account created! You can now log in as **{new_u}**.")
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
            st.session_state.auth = False
            st.rerun()

    page_file = PAGES[st.session_state.page]
    height    = PAGE_HEIGHTS.get(page_file, 950)

    try:
        with open(os.path.join(BASE, page_file), "r", encoding="utf-8") as f:
            html = inline_assets(f.read())
        st.components.v1.html(html, height=height, scrolling=False)
    except Exception as exc:
        st.error(f"Could not load {page_file}: {exc}")
