# scripts/verify_wxml.py
# -*- coding: utf-8 -*-
import os
import re

wxml_dir = "E:/WeChatProjects/just-one-smoke"
self_closing = {'image', 'input', 'custom-toast', 'switch'}

errors = []
for root, dirs, files in os.walk(wxml_dir):
    if any(k in root for k in ['node_modules', '.git', 'scratch']): continue
    for f in files:
        if f.endswith('.wxml'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            # check simple tag matching
            # remove comments
            content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
            tokens = re.findall(r'<(/?[a-zA-Z0-9\-_]+)[^>]*?(/?)>', content)
            stack = []
            for tag, closing in tokens:
                if closing == '/' or tag in self_closing:
                    continue
                if tag.startswith('/'):
                    tag_name = tag[1:]
                    if not stack:
                        errors.append(f"{f}: Unexpected closing tag </{tag_name}>")
                    elif stack[-1] != tag_name:
                        errors.append(f"{f}: Mismatched tag </{tag_name}>, expected </{stack[-1]}>")
                    else:
                        stack.pop()
                else:
                    stack.append(tag)
            if stack:
                errors.append(f"{f}: Unclosed tags: {stack}")

if errors:
    print(f"Found {len(errors)} WXML errors:")
    for e in errors:
        print(" -", e)
    exit(1)
else:
    print("All WXML files are strictly balanced with zero syntax errors!")
