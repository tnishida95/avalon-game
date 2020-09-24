<template>
  <div>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Players
        </v-expansion-panel-header>
        <v-expansion-panel-content>
    <v-simple-table dense>
      <thead>
        <tr>
          <th>Player</th>
          <th>Character</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in this.room" :key="player.name">
          <td>{{ player.name }}</td>
          <td>{{ player.character }}</td>
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
export default {
  name: 'PlayerView',
  props: {
    room: Array
  }
};
</script>

<style>
</style>
