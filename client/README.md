# Avalon/avalon-game

### Introduction

**Avalon** is a web adaption of *The Resistance: Avalon* board game by Don Eskridge and published by Indie Boards & Cards.  It is not endorsed by or affiliated with the designer or publisher.  The original GitHub repository can be found [here](https://github.com/tnishida95/avalon-game).

### Gameplay

Avalon is game of hidden identities.  Each round, players must agree on a questing party.  Good players will work together to make three quests succeed, while a single Evil player will be enough to end a quest in failure.  With the exception of Merlin, no agents of Good know which players are Evil.  But Merlin must careful to protect his identity, as even if Good succeeds three quests, the Assassin player has a chance to kill Merlin and Evil will win instead.

This instance of **Avalon** attempts to play in accordance to the original board game's rules.  Though this web version removes some of the difficulties of managing game pieces and cards, it is still meant to be played with all players in the same room.

Currently no support for Lancelot or Lady of the Lake.

### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
