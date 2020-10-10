<template>
  <div class="text-center">
    <v-expansion-panels v-bind:value='panel'>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <h3 class="text-center">Players</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-simple-table dense>
            <thead>
              <tr>
                <th class="text-center">Player</th>
                <th class="text-center">Character</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in this.$store.state.room" :key="player.name">
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
  data() {
    return {
      panel: 0
    };
  }
};
</script>

<style>
</style>
