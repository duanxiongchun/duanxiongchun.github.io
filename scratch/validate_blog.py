import os
import sys
from html.parser import HTMLParser

class SimpleHTMLParser(HTMLParser):
    def handle_error(self, message):
        print(f"HTML Parse Error: {message}")
        sys.exit(1)

def validate():
    path = "blog/network/new_proxy_architecture.html"
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        sys.exit(1)
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse HTML to check for syntax validity
    parser = SimpleHTMLParser()
    try:
        parser.feed(content)
    except Exception as e:
        print(f"HTML Parse Error: {e}")
        sys.exit(1)

    # Check for old terms (must be removed/realigned)
    # Note: We keep "TPROXYPort 是旧 TPROXY 路径遗留配置" but check if the main architecture text still relies on TPROXY.
    # So we check if the word "TPROXY 捕获" or "被 TPROXY" is present.
    if "被 TPROXY 捕获" in content or "内核态的三层" in content:
        print("Fail: Obsolete terms/concepts still exist in the blog post!")
        sys.exit(1)

    # Check for new concepts
    required_terms = ["boringtun", "smoltcp", "Run-to-Completion", "Multiqueue", "Deref", "OnceLock"]
    for term in required_terms:
        if term not in content:
            print(f"Fail: Missing required new concept '{term}' in the blog post!")
            sys.exit(1)

    print("Pass: HTML validation checks completed successfully.")

if __name__ == "__main__":
    validate()
