# 将棋 - Shogi

ブラウザで遊べる将棋アプリです。GitHub Pagesで公開しています。

## 機能

- 9x9の将棋盤と全駒種の表示（漢字テキスト + CSS五角形描画）
- 2人対戦（ローカル）
- 全将棋ルール対応
  - 駒の移動・成り（強制成り / 任意成り）
  - 駒の取得と持ち駒の打ち
  - 王手・詰み判定
  - 禁じ手防止（二歩、打ち歩詰め、行き所のない駒）
- 移動可能マスのハイライト表示
- レスポンシブデザイン（PC・スマートフォン対応）

## 技術スタック

- HTML / CSS / JavaScript（ビルド不要）
- CSS Grid + clip-path による盤面・駒の描画
- ES Modules
- GitHub Actions による GitHub Pages 自動デプロイ

## ローカルでの実行

ES Modulesを使用しているため、ローカルサーバーが必要です。

```bash
# Python 3
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8000` を開いてください。
