<template>
  <div id="Header">
    <h2 id="topText">{{headerText}}</h2>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'Header',
  components: {

  },
  data: function() {
    return {

    };
  },
  methods: {
  },
  props: {
    headerText: String
  }
};
</script>

<style>
#topText {
    text-align: center;
}

#nameInput,
#roomInput {
    text-align: center;
    height: auto;
    width: 40%;
    outline-width: 0px;
    outline-style: solid;
}

#footer {
    text-align: center;
}
</style>
