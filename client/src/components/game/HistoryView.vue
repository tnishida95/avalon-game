<template>
  <div class="text-center">
    <v-expansion-panels>
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
      questTracker: []
    };
  },
  computed: {
    tableHeaders() {
      const game = this.$store.state.game;
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
      const game = this.$store.state.game;
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
      const game = this.$store.state.game;
      if(game.phase === 16) {
        // if it's the end game history, need to offset by one because
        //   of the extra character column
        index--;
      }
      return this.partyTracker[rowsIndex].includes(index);
    },
    isSuccess: function(index) {
      const game = this.$store.state.game;
      if(game.phase === 16) {
        index--;
      }
      if(this.questTracker.includes(index)) {
        if(game.quests[this.questTracker.indexOf(index)] === 1) {
          return true;
        }
      }
    },
    isFail: function(index) {
      const game = this.$store.state.game;
      if(game.phase === 16) {
        index--;
      }
      if(this.questTracker.includes(index)) {
        if(game.quests[this.questTracker.indexOf(index)] === 2) {
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
