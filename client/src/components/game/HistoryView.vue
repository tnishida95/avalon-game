<template>
  <div class="text-center">
    <v-expansion-panels v-bind:value='panel'>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <h3 class="text-center">Game History</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content>

          <v-simple-table>
            <thead>
              <tr>
                <th v-for='(header, index) in this.tableHeaders' :key='index'>{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowsIndex) in this.playerRows" :key="rowsIndex">
                <td v-for='(cell, index) in row' :key='index'
                    v-bind:class="{ 'partyBackground': onParty(rowsIndex, index),
                                    'good-blue': isSuccess(index),
                                    'evil-red': isFail(index) }">{{ cell }}</td>
              </tr>
            </tbody>
          </v-simple-table>

        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-divider/>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'HistoryView',
  data() {
    return {
      partyTracker: [],
      questTracker: [],
      panel: 0,
      game: {
        "room": [{
          "sid": "EQTNzNt383ilObnfAAAF",
          "name": "1test",
          "character": "?"
        }, {
          "sid": "VNRX4DeRopPWtDubAAAG",
          "name": "fzsebf",
          "character": "?"
        }, {
          "sid": "oVbSBiWRVGzZPiWIAAAH",
          "name": "xrdhncfd",
          "character": "?"
        }, {
          "sid": "fvn9ZaId4U7K69wpAAAI",
          "name": "xerdnfv",
          "character": "Assassin"
        }, {
          "sid": "zefL5oH604umvgZYAAAJ",
          "name": "xerthdfn",
          "character": "Agent of Evil"
        }],
        "playerCount": 5,
        "partyHistories": [
        [{
          "partyLeader": 4,
          "selectedParty": [0, 4, -1, -1, -1, -1],
          "votes": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
          "isApproved": true
        }],
        [{
          "partyLeader": 0,
          "selectedParty": [0, 1, 2, -1, -1, -1],
          "votes": [2, 1, 1, 1, 1, 0, 0, 0, 0, 0],
          "isApproved": true
        }],
        [{
          "partyLeader": 1,
          "selectedParty": [0, 1, -1, -1, -1, -1],
          "votes": [2, 2, 2, 1, 1, 0, 0, 0, 0, 0],
          "isApproved": false
        }, {
          "partyLeader": 2,
          "selectedParty": [1, 0, -1, -1, -1, -1],
          "votes": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
          "isApproved": true
        }],
        [{
          "partyLeader": 3,
          "selectedParty": [0, 1, 3, -1, -1, -1],
          "votes": [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
          "isApproved": true
        }]
        ],
        "questHistories": [{
          "partyActions": [1, 0, 0, 0, 2, 0, 0, 0, 0, 0],
          "isSuccessful": false
        }, {
          "partyActions": [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
          "isSuccessful": true
        }, {
          "partyActions": [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          "isSuccessful": true
        }, {
          "partyActions": [1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
          "isSuccessful": true
        }],
        "goodNum": 3,
        "evilNum": 2,
        "questSize": [2, 3, 2, 3, 3],
        "phase": 16,
        "quests": [2, 1, 1, 1, 0],
        "votes": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "partyActions": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "winningTeam": 2,
        "successes": 3,
        "failures": 0,
        "partiesRejected": 0,
        "actionsTaken": 3,
        "partyLeader": 4,
        "assassinated": 0,
        "selectedParty": [0, 1, 3, -1, -1, -1],
        "approvalHistory": [
        [
        [1, 1, 1, 1, 1]
        ],
        [
        [2, 1, 1, 1, 1]
        ],
        [
        [2, 2, 2, 1, 1],
        [1, 1, 1, 1, 1]
        ],
        [
        [1, 1, 1, 1, 1]
        ]
        ],
        "partyHistory": [
        [
        [0, 4]
        ],
        [
        [0, 1, 2]
        ],
        [
        [0, 1],
        [1, 0]
        ],
        [
        [0, 1, 3]
        ]
        ],
        "waitingOnList": ["xerdnfv"]
      }
    };
  },
  computed: {
    tableHeaders() {
      const game = this.game;
      // const game = this.$store.state.game;
      const headers = ['Player'];
      if(game.phase === 16) {
        headers.push('Character');
      }
      for(let i = 0; i < game.partyHistories.length; i++) {
        for(let j = 0; j < game.partyHistories[i].length; j++) {
          headers.push(`Q${i+1}-P${j+1}`);
        }
        if(game.questHistories[i] != null) {
          headers.push(`Q${i+1}`);
        }
      }
      return headers;
    },
    playerRows() {
      const game = this.game;
      // const game = this.$store.state.game;
      const rows = [];
      for(let i = 0; i < game.playerCount; i++) {
        const row = [];

        // partyTracker[playerRow][x,y,z] where
        //   where x,y,z are the indexes of <td> elements in the row that will
        //   show that player was on that party
        this.partyTracker[i] = [];

        row.push(game.room[i].name);

        if(game.phase === 16) {
          row.push(game.room[i].character);
        }

        // trackerIndex starts at Q1-P1 (adjust for extra charcter column later)
        //   and moves down the row through each party and quest
        let trackerIndex = 1;
        // for each quest
        for(let j = 0; j < game.partyHistories.length; j++) {
          // for party histories in the quest
          for(let k = 0; k < game.partyHistories[j].length; k++) {
            // TODO: used to add style here if player was in the party:
            // style="background-color: #FFE164"
            if(game.partyHistories[j][k].selectedParty.includes(i)) {
              this.partyTracker[i].push(trackerIndex);
            }
            let cell = '';
            if(game.partyHistories[j][k].partyLeader === i) {
              cell += "👑 - ";
            }
            // if player approved the party
            if(game.partyHistories[j][k].votes[i] === 1) {
              cell += `✔`;
            }
            else {
              cell += `❌`;
            }
            row.push(cell);
            trackerIndex++;
          }
          if(game.questHistories[j] != null) {
            // questTracker[x,y,z] where x,y,z are the indexes that a quest is shown
            this.questTracker[j] = trackerIndex;
            if(game.phase === 16) {
              if(game.questHistories[j].partyActions[i] === 1) {
                row.push(`🔵`);
              }
              else if(game.questHistories[j].partyActions[i] === 2) {
                row.push(`🔴`);
              }
              else {
                row.push(' ');
              }
            }
            else {
              // if it's not the end of the game, do not reveal the quest action
              if(game.questHistories[j].partyActions[i] === 0) {
                row.push(' ');
              }
              else {
                row.push(`⚫`);
              }
            }
            trackerIndex++;
          }
        }
        rows.push(row);
      } // end for playerCount
      return rows;
    }
  },
  methods: {
    onParty: function(rowsIndex, index) {
      if(this.game.phase === 16) {
        // if it's the end game history, need to offset by one because
        //   of the extra character column
        index--;
      }
      return this.partyTracker[rowsIndex].includes(index);
    },
    isSuccess: function(index) {
      if(this.game.phase === 16) {
        index--;
      }
      if(this.questTracker.includes(index)) {
        if(this.game.quests[this.questTracker.indexOf(index)] === 1) {
          return true;
        }
      }
    },
    isFail: function(index) {
      if(this.game.phase === 16) {
        index--;
      }
      if(this.questTracker.includes(index)) {
        if(this.game.quests[this.questTracker.indexOf(index)] === 2) {
          return true;
        }
      }
    }
  }
};
</script>

<style>
th, td {
  border: 1px solid #ccc;
}
.partyBackground {
  background-color: #FFE164;
}
.good-blue {
  background-color: #C8C8FF !important;
}

.evil-red {
  background-color: #FFC8C8 !important;
}
</style>
