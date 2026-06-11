import streamlit as st
import os
import re

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
section[data-testid="stSidebar"] * { color: #00ff41 !important; font-family: 'Share Tech Mono', monospace !important; }
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
.stTextInput label { color: rgba(0,255,65,.6) !important; font-family: 'Share Tech Mono', monospace !important; }
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

# ── Auth helper ────────────────────────────────────────────────
def check_credentials(username: str, password: str) -> bool:
    try:
        return st.secrets["users"].get(username) == password
    except Exception:
        return False

# ── Asset inliner ──────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))

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

    # Hide the site's own sidebar — Streamlit handles navigation
    hide = ("<style>"
            "nav.sidebar{display:none!important}"
            ".main{margin-left:0!important;padding:0!important}"
            "body,html{overflow:auto}"
            "</style>")
    html = html.replace("<head>", "<head>" + hide, 1)
    return html

# ── Session defaults ───────────────────────────────────────────
if "auth"     not in st.session_state: st.session_state.auth     = False
if "username" not in st.session_state: st.session_state.username = ""
if "page"     not in st.session_state: st.session_state.page     = "🌊  Wave Creator"

# ══════════════════════════════════════════════════════════════
#  LOGIN SCREEN
# ══════════════════════════════════════════════════════════════
if not st.session_state.auth:
    _, col, _ = st.columns([1, 1.1, 1])
    with col:
        st.markdown("""
        <div style="text-align:center;margin-top:90px;margin-bottom:36px">
          <div style="font-family:VT323,monospace;font-size:62px;color:#00ff41;
                      text-shadow:0 0 24px #00ff41,0 0 50px rgba(0,255,65,.3);
                      letter-spacing:4px;line-height:1">MyWorld</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;
                      color:rgba(0,255,65,.45);letter-spacing:3px;margin-top:6px">
            SECURE ACCESS TERMINAL
          </div>
        </div>
        """, unsafe_allow_html=True)

        username = st.text_input("USERNAME", placeholder="enter username")
        password = st.text_input("PASSWORD", type="password", placeholder="••••••••••")

        st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

        if st.button("[ ENTER SYSTEM ]", use_container_width=True):
            if check_credentials(username, password):
                st.session_state.auth     = True
                st.session_state.username = username
                st.rerun()
            else:
                st.error("⛔  ACCESS DENIED — invalid credentials")

        st.markdown("""
        <div style="text-align:center;margin-top:20px;font-family:'Share Tech Mono',monospace;
                    font-size:10px;color:rgba(0,255,65,.25);letter-spacing:1.5px">
          AUTHORISED USERS ONLY
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════
#  MAIN APP  (authenticated)
# ══════════════════════════════════════════════════════════════
else:
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
            active = st.session_state.page == label
            prefix = "> " if active else "  "
            if st.button(prefix + label, key=f"nav_{label}", use_container_width=True):
                st.session_state.page = label
                st.rerun()

        st.markdown("<hr style='border-color:rgba(0,255,65,.15)'>", unsafe_allow_html=True)

        if st.button("[ LOGOUT ]", use_container_width=True):
            st.session_state.auth = False
            st.rerun()

    # ── Render page ───────────────────────────────────────────
    page_file = PAGES[st.session_state.page]
    height    = PAGE_HEIGHTS.get(page_file, 950)

    try:
        with open(os.path.join(BASE, page_file), "r", encoding="utf-8") as f:
            html = f.read()
        html = inline_assets(html)
        st.components.v1.html(html, height=height, scrolling=False)
    except Exception as exc:
        st.error(f"Could not load {page_file}: {exc}")
