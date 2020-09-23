# Avalon/avalon-game

### Introduction

**Avalon** is a web adaption of *The Resistance: Avalon* board game by Don Eskridge and published by Indie Boards & Cards.  It is not endorsed by or affiliated with the designer or publisher.  The original GitHub repository can be found [here](https://github.com/tnishida95/avalon-game).

The current branch contains an in-progress rewrite of the source code using the Vue and Vuetify frameworks.

### Gameplay

Avalon is game of hidden identities.  Each round, players must agree on a questing party.  Good players will work together to make three quests succeed, while a single Evil player will be enough to end a quest in failure.  With the exception of Merlin, no agents of Good know which players are Evil.  But Merlin must careful to protect his identity, as even if Good succeeds three quests, the Assassin player has a chance to kill Merlin and Evil will win instead.

This instance of **Avalon** attempts to play in accordance to the original board game's rules.  Though this web version removes some of the difficulties of managing game pieces and cards, it is still meant to be played with all players in the same room.

Currently no support for Lancelot or Lady of the Lake.

### Dev Setup

Node.js and npm are prerequisites.

Call `npm i` from the client/ and server/ directories to download the needed packages.

To start the server, call `node server.js` from the server/ folder.  To start the client, call `npm start` from the client folder/.  You should then be able to view the app in a browser at http://localhost:8080/.

Note: Your port may vary, and can be adjusted by setting the `$PORT` environment variable.
