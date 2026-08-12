# kpw-docs

かめぱわぁ〜るど公開ガイドのMarkdownと画像を管理するリポジトリです。

## 編集

- トップページは `pages/index/index.md`、通常ページは `pages/<slug>/index.md` に置きます。
- 通常ページの階層と順番は `navigation.yml` で管理します。GitHub上の配置は階層に関係なくフラットです。
- 画像は同じページの `assets/` に置き、`./assets/example.png` のように参照します。
- `npm ci && npm test` で公開前の検証を実行できます。
- KamePowerWorldメンバーはWYSIWYGエディターから直接更新できます。外部の方はPull Requestで提案できます。

サイト本体と編集画面は [KamePowerWorld/kpw-web](https://github.com/KamePowerWorld/kpw-web) で管理します。
