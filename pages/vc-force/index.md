---
id: 2649951c-9453-808c-b4c1-d82d2c208198
title: "VC強制機能の使い方"
draft: false
heroLead: "VC参加を促す機能を安全に使うための案内。"
---
# VC強制機能の使い方

## イベント時などにVCに必ず入ってから参加してほしいときなど

---

### **Minecraftからコマンドを実行する場合**

このコマンドは本日の主役（イベント主催者）に許可しています．

**`/proxyenforce enable <server> <vc>`**

- `<server>` → 制限の対象とするMinecraftサーバー
- `<vc>` → 対象のMinecraftサーバーにログインする条件となるVC
    - 現在は以下のVCを条件指定することが可能です
        - フリーVC1
        - フリーVC2
        - フリーVC3
        - カスタムVC1
        - カスタムVC2
        - カスタムVC3
        - カスタムVC4

**`/proxyenforce disable <server>`**

- `<server>` → 制限を解除するMinecraftサーバー

### Discordからコマンドを実行する場合

このコマンドは本日の主役（イベント主催者）に許可しています．

**`/enforce-vc <status> <server> [vc]`** 

- `<status>` → 制限と解除
    - True → 制限
    - False → 解除
- `<server>` → 制限の対象とするMinecraftサーバー
- `<vc>` → 対象のMinecraftサーバーにログインする条件となるVC
    - 現在は以下のVCを条件指定することが可能です
        - フリーVC1
        - フリーVC2
        - フリーVC3
        - カスタムVC1
        - カスタムVC2
        - カスタムVC3
        - カスタムVC4

### [Warning]: 制限サーバーにhubを設定しないでください

### イベント参加者以外がMinecraftにログインできなくなります
