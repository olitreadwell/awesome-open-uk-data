# Reports

`public-apis-candidates.md` lists entries from
[public-apis/public-apis](https://github.com/public-apis/public-apis) that
mention a UK topic and are not already in this repo's readme. It comes from the
`awesome-list-sources` command in
[awesome-list-template](https://github.com/olitreadwell/awesome-list-template),
which also reports stars and a last-push date for any candidate that is a
repository.

Nothing in this folder is an entry and nothing here is verified. A human reads a
candidate, checks the source, then writes the entry or the scraper. Regenerate
with:

```bash
uvx --from git+https://github.com/olitreadwell/awesome-list-template \
  awesome-list-sources --config reports/sources.toml
```
