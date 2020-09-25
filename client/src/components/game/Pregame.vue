<template>
  <div id="pregame" class="text-center">
    <h3>Game starting!</h3>
    <h4>{{ this.self.name }}, you are: <strong>{{ this.self.character }}</strong>.</h4>
    <h5>{{ characterDescription }}</h5>
    <v-divider/>
    <h4>Special Characters:</h4>
    <h5>(Evil) <strong>Assassin</strong>: Attempts to kill Merlin at the end of the game.</h5>
    <h5>(Good) <strong>Percival</strong>: Can see Merlin.</h5>
    <v-btn x-large v-on:click="btnPressReady" v-if="!isDone">Ready</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'Pregame',
  computed: {
    characterDescription: function() {
      if(this.self.character === 'Merlin') {
        return 'See Evil players, but lose the game if killed by Assassin.';
      }
      else if(this.self.character === 'Percival') {
        return 'See Merlin.  If Morgana is in play, see both but not who is who.';
      }
      else if(this.self.character === 'Assassin') {
        return 'If three quests succeed, Merlin may be killed to steal the win.';
      }
      else if(this.self.character === 'Mordred') {
        return 'Unseen by Merlin.';
      }
      else if(this.self.character === 'Morgana') {
        return 'Percival will see you and Merlin, but not know who is who.';
      }
      else if(this.self.character === 'Oberon') {
        return 'You are not revealed to other Evil players, nor they to you.';
      }
      else if(this.self.character === 'Agent of Evil') {
        return 'A minion of Mordred.  No special abilities.';
      }
      else {
        return 'A loyal servant of Arthur.  No special abilities.';
      }
    },
  },
  props: {
    self: Object
  },
  methods: {
    btnPressReady: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressReady', {
        roomNum: this.roomNum,
        self: this.self
      });
    },
  }
};
</script>

<style>

</style>
