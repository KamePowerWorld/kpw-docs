# kpw-docs

かめぱわぁ〜るど公開ガイドのMarkdownと画像を管理するリポジトリです。

## 編集

- 1ページにつき `pages/<slug>/index.md` を1つ置きます。
- 画像は同じページの `assets/` に置き、`./assets/example.png` のように参照します。
- `npm ci && npm test` で公開前の検証を実行できます。
- KamePowerWorldメンバーはWYSIWYGエディターから直接更新できます。外部の方はPull Requestで提案できます。

サイト本体と編集画面は [KamePowerWorld/kpw-web](https://github.com/KamePowerWorld/kpw-web) で管理します。
