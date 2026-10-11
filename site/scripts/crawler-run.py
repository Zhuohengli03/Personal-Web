"""Runs the dynamic web crawler (~/Cursor/Crawler_c) once against juejin.cn and writes the aggregates behind the
"Dynamic web crawler" case exhibits to src/data/figures/crawler.json.

    <python with streamlit+selenium> scripts/crawler-run.py [crawler repo] [--need 60]

The crawler's own WebCrawler class does the work (scroll loop, link collection, detail-page extraction); this script
only instruments it: one record per scroll round, the stop reason, field fill rates, and the MySQL schema the tool
would create. No page content is written — titles, bodies and URLs stay out of the repo.
"""
import argparse, json, logging, statistics, sys, time
from datetime import datetime, timezone
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("repo", nargs="?", default=str(Path.home() / "Cursor" / "Crawler_c"))
ap.add_argument("--need", type=int, default=60)
ap.add_argument("--url", default="https://juejin.cn/")
args = ap.parse_args()

repo = Path(args.repo)
sys.path.insert(0, str(repo)); sys.path.insert(0, str(repo / "web_dynamic_files"))
logging.getLogger("streamlit").setLevel(logging.ERROR)   # st.* calls outside a Streamlit session are no-ops
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from config import DEFAULT_CRAWLER_CONFIG, generate_table_schema, get_webdriver_options
from result_web import WebCrawler

options = Options()
for opt in get_webdriver_options(headless=True):
    options.add_argument(opt)
driver = webdriver.Edge(options=options)   # Selenium Manager fetches a matching msedgedriver
cfg = DEFAULT_CRAWLER_CONFIG
driver.set_page_load_timeout(cfg["page_load_timeout"]); driver.implicitly_wait(cfg["implicit_wait"]); driver.set_script_timeout(cfg["script_timeout"])

MAIN = (By.CSS_SELECTOR, ".title-row a.title")
crawler = WebCrawler(
    driver=driver, url=args.url, wait_time=cfg["wait_time"], time_sleep=cfg["time_sleep"],
    main_locator=MAIN,
    title_locator=(By.CSS_SELECTOR, "h1.article-title"),
    content_locator=(By.CSS_SELECTOR, "#article-root"),
    image_locator=(By.CSS_SELECTOR, "#article-root img"),
    total_need=args.need,
    custom_fields=[
        {"name": "author", "type": "文本", "by": "CSS选择器", "selector": ".author-name .name"},
        {"name": "published", "type": "文本", "by": "CSS选择器", "selector": ".meta-box time"},
        {"name": "views", "type": "文本", "by": "CSS选择器", "selector": ".views-count"},
    ],
    main_key_words="", header="", main_tag="", main_url_key_words="", main_url_key_elements="", higher_requests=True,
)

# --- instrumentation: one record per scroll round, plus the detail phase ---
t0 = time.time()
rounds, scrolls = [], 0
orig_collect, orig_exec, orig_content = crawler.collect, driver.execute_script, crawler.content
def exec_script(script, *a):
    global scrolls
    if "scrollTo" in str(script): scrolls += 1
    return orig_exec(script, *a)
driver.execute_script = exec_script
def collect():
    # timed at the start of the round: the last round also runs the detail-page phase inside collect()
    on_page, t = len(driver.find_elements(*MAIN)), round(time.time() - t0, 1)
    orig_collect()
    rounds.append({"round": len(rounds), "scrolls": scrolls, "elements": on_page, "collected": len(crawler.collected_urls), "t": t})
    print(f"round {len(rounds) - 1}: scrolls={scrolls} elements={on_page} collected={len(crawler.collected_urls)} t={rounds[-1]['t']}s", flush=True)
crawler.collect = collect
detail = {}
def content():
    t1 = time.time(); out = orig_content(); detail["seconds"] = round(time.time() - t1, 1); return out
crawler.content = content

crawler.result_()
try: driver.quit()
except Exception: pass

res = crawler.results
fields = ["title", "content", "image", "author", "published", "views"]
fill = {f: round(sum(1 for r in res if str(r.get(f, "")).strip()) / len(res), 3) if res else 0 for f in fields}
chars = [len(r.get("content", "")) for r in res if r.get("content")]
imgs = [len([x for x in r.get("image", "").split("\n") if x]) for r in res]
schema = generate_table_schema([{k: v for k, v in r.items()} for r in res])
if len(crawler.collected_urls) >= args.need: stopped = "enough"
elif len(rounds) > 1 and rounds[-1]["elements"] == rounds[-2]["elements"]: stopped = "no-growth"
else: stopped = "max-scrolls"
out = {
    "run": {"url": args.url, "at": datetime.now(timezone.utc).isoformat(timespec="minutes"), "need": args.need,
            "collected": len(crawler.collected_urls), "pages": len(res), "seconds": round(time.time() - t0, 1), "scrollSeconds": rounds[-1]["t"] if rounds else 0, "stop": stopped},
    "params": {"wait": cfg["wait_time"], "sleep": cfg["time_sleep"], "maxScroll": cfg["max_scroll_attempts"], "noGrowthStop": 3, "pageLoadTimeout": cfg["page_load_timeout"]},
    "rounds": rounds,
    "detail": {**detail, "fill": fill, "contentChars": {"median": int(statistics.median(chars)) if chars else 0, "max": max(chars) if chars else 0},
               "imagesPerPage": round(sum(imgs) / len(imgs), 1) if imgs else 0},
    "schema": [{"column": c, "type": t} for c, t in sorted(schema.items(), key=lambda kv: (["title", "url", "content", "image", "HTML"].index(kv[0]) if kv[0] in ["title", "url", "content", "image", "HTML"] else 9, kv[0]))],
}
dst = Path(__file__).resolve().parent.parent / "src" / "data" / "figures" / "crawler.json"
dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(out, ensure_ascii=False, indent=1))
