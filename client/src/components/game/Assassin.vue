<template>
  <div class="text-center">
    <h3>Assassin Phase</h3>
    <h4>If Merlin is assassinated, you win!</h4>
    <p/>
    <v-btn x-large v-on:click="btnPressAssassinSubmit(name)" block v-for="name in this.targets" :key="name">{{ name }}</v-btn>
    <p/>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'Assassin',
  computed: {
    targets() {
      const targets = [];
      const room = this.$store.state.room;
      for(let i = 0; i < room.length; i++) {
        if(room[i].character === 'Assassin' || room[i].character === 'Mordred' || room[i].character === 'Morgana' || room[i].character === 'Oberon' || room[i].character.includes('Evil')) {
          continue;
        }
        targets.push(room[i].name);
      }
      return targets;
    }
  },
  methods: {
    btnPressAssassinSubmit: function(assassinatedName) {
      console.log(assassinatedName);
      this.$socket.emit('btnPressAssassinSubmit', {
        roomNum: this.$store.state.roomNum,
        assassinatedName: assassinatedName
      });
    }
  },
};
</script>

<style>

</style>
