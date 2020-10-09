<template>
  <div id="pregame" class="text-center">
    <h3>Game starting!</h3>
    <br/>
    <h4>{{ self.name }}, you are: <strong>{{ self.character }}</strong>.</h4>
    <h5>{{ characterDescription }}</h5>
    <br/>
    <h4>Special Characters:</h4>
    <h5>{{ specialCharacters }}</h5>
    <br/>
    <v-btn x-large v-on:click="btnPressReady" v-if="!isDone">Ready</v-btn>
    <h3 v-if="isDone">Readied.</h3>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'Pregame',
  data: function() {
    return {
      isDone: false
    };
  },
  computed: {
    self() {
      return this.$store.state.self;
    },
    specialCharacters() {
      const specialCharacters = ['merlin', 'assassin'];

      if(this.$store.state.characterSelections.length > 0) {
        specialCharacters.push(...this.$store.state.characterSelections);
      }
      // TODO: use the pretty string
      return specialCharacters.join(', ').toUpperCase();
    },
    characterDescription: function() {
      const self = this.$store.state.self;
      if(self.character === 'Merlin') {
        return 'See Evil players, but lose the game if killed by Assassin.';
      }
      else if(self.character === 'Percival') {
        return 'See Merlin.  If Morgana is in play, see both but not who is who.';
      }
      else if(self.character === 'Assassin') {
        return 'If three quests succeed, Merlin may be killed to steal the win.';
      }
      else if(self.character === 'Mordred') {
        return 'Unseen by Merlin.';
      }
      else if(self.character === 'Morgana') {
        return 'Percival will see you and Merlin, but not know who is who.';
      }
      else if(self.character === 'Oberon') {
        return 'You are not revealed to other Evil players, nor they to you.';
      }
      else if(self.character === 'Agent of Evil') {
        return 'A minion of Mordred.  No special abilities.';
      }
      else {
        return 'A loyal servant of Arthur.  No special abilities.';
      }
    },
  },
  methods: {
    btnPressReady: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressReady', {
        roomNum: this.$store.state.roomNum,
        self: this.$store.state.self
      });
    },
  }
};
</script>

<style>

</style>
