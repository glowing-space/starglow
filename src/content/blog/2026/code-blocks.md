---
title: Writing code blocks
description: Syntax highlighting, the language label, the copy button and how long lines behave.
pubDatetime: 2026-11-16T10:00:00+01:00
tags: [writing, code]
---

Fenced code blocks are highlighted by Shiki at build time, so no highlighting script runs in the browser. Each block gets a small label with its language and a copy button. Write the language after the opening fence:

````md
```rust
fn main() {}
```
````

A block without a language, or with `text`, gets the label `text`.

## Shell

```bash
#!/usr/bin/env bash
set -euo pipefail

for f in ./*.log; do
  gzip -9 "$f"
done
```

## TypeScript

```ts
type Post = { slug: string; title: string; draft?: boolean };

export function visible(posts: Post[]): Post[] {
  return posts.filter(post => !post.draft);
}
```

## Rust

```rust
fn main() {
    let words = ["alpha", "beta", "gamma"];
    for (i, w) in words.iter().enumerate() {
        println!("{i}: {w}");
    }
}
```

## Python

```python
from pathlib import Path


def count_lines(path: Path) -> int:
    with path.open(encoding="utf-8") as handle:
        return sum(1 for _ in handle)
```

## YAML

```yaml
services:
  dev:
    image: example-dev:local
    ports:
      - "4321:4321"
```

## Long lines

Long lines scroll inside their block instead of wrapping or widening the page. Try this one on a phone:

```text
This is one very long line of text that keeps going well past two hundred characters, so that horizontal scrolling inside the code block can be checked on a phone, a tablet and a desktop browser alike.
```

A long shell pipeline:

```bash
find /var/log -type f -name '*.log' -mtime -7 -print0 | xargs -0 grep -h 'ERROR' | sed -E 's/^[0-9-]+ [0-9:]+ //' | sort | uniq -c | sort -rn | head -n 20 | awk '{ printf "%-6s %s\n", $1, substr($0, index($0, $2)) }'
```

Inline code such as `pnpm build` uses the same monospace font at body size.
