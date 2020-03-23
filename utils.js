// utils.js

/**
 * Validates the character selections for a lobby is correct.
 * @param {Array} characterSelections - The array with the user-selected fields.
 * @param {Array} room - The array of the Players
 * @return {boolean} isValid - true if the selection is valid
 * @return {string} message - reason given for deeming a selection invalid
 * @return {Array} charArray - the character array used to populate the player board
 */
exports.assignCharacters = function(characterSelections, room) {
  if(characterSelections.length !== room.length) {
    const message = `Selected ${characterSelections.length} characters but need ${room.length}!`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message
    };
  }
  let goodCount = 0;
  let evilCount = 0;
  const charArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  // console.log("getting characters:");
  // populate the charArray, showing which characters are in the game
  for(let i = 0; i < characterSelections.length; i++) {
    const characters = characterSelections[i];
    // console.log("\t" + characters);
    const charIndex = exports.getCharacterIndexFromCharacterName(characters);
    if(charIndex === -1) {
      const message = `Unmatched character names!`;
      console.error("invalid character selection: " + message);
      return {
        isValid: false,
        message: message,
        charArray: null
      };
    }
    else if(charIndex >= 0 && charIndex < 7) {
      goodCount++;
    }
    else {
      evilCount++;
    }
    charArray[charIndex] = 1;
  }

  /*
  rules check:
    merlin and assassin must be selected
    morgana must be selected with percival
    good and evil player numbers align with the rules
  */
  if(charArray[0] == 0 || charArray[7] == 0) {
    const message = `Merlin and Assassin must be selected!`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message,
      charArray: null
    };
  }

  if(charArray[8] == 1 && charArray[1] == 0) {
    const message = `Morgana cannot be selected without Percival!`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message,
      charArray: null
    };
  }

  console.log("\tGood: " + goodCount + ", Evil: " + evilCount);
  if(((characterSelections.length == 5) && ((goodCount != 3) || (evilCount != 2))) ||
    ( (characterSelections.length == 6) && ((goodCount != 4) || (evilCount != 2))) ||
    ( (characterSelections.length == 7) && ((goodCount != 4) || (evilCount != 3))) ||
    ( (characterSelections.length == 8) && ((goodCount != 5) || (evilCount != 3))) ||
    ( (characterSelections.length == 9) && ((goodCount != 6) || (evilCount != 3))) ||
    ( (characterSelections.length == 10) && ((goodCount != 6) || (evilCount != 4)))
  ) {
    const message = `The count of Good/Evil players is incorrect!`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message,
      charArray: null
    };
  }

  // remove reserved characters from the pool; only handles a single reservation
  for(let i = 0; i < room.length; i++) {
    if(room[i].character != "none") {
      if(room[i].character == "mordred") {
        if(charArray[9] == 1) {
          charArray[9] = 0;
          console.log("fulfilling mordred reservation to " + room[i].name);
          break; // remove this if more reservations added
        }
        console.log("modred not selected, cannot fulfill reservation");
        room[i].character = "none";
      }
      // add more cases here as necessary
    }
  }

  // this is to help buildGameScreen()
  const charArrayCopy = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for(let i = 0; i < 14; i++) {
    if(charArray[i] == 1) {charArrayCopy[i] = 1;}
  }

  // assign players a random character
  let randomNum;
  // console.log("\tthere are " + room.length + " players in the room");
  for(let i = 0; i < room.length; i++) {
    if(room[i].character == "none") {
      // process.stdout.write("getting randomNum: ");
      do {
        /*
        consider reducing the range of values every iteration somehow,
          not a big deal though
        maybe create another array with the indexes of available
          characters in charArray, then splice out elements as they
          are selected
        */
        randomNum = Math.floor(Math.random() * 14);
      }
      while(charArray[randomNum] != 1);
      if(randomNum == 0) {room[i].character = "merlin";}
      else if(randomNum == 1) {room[i].character = "percival";}
      else if(randomNum == 2) {room[i].character = "goodOne";}
      else if(randomNum == 3) {room[i].character = "goodTwo";}
      else if(randomNum == 4) {room[i].character = "goodThree";}
      else if(randomNum == 5) {room[i].character = "goodFour";}
      else if(randomNum == 6) {room[i].character = "goodFive";}
      else if(randomNum == 7) {room[i].character = "assassin";}
      else if(randomNum == 8) {room[i].character = "morgana";}
      else if(randomNum == 9) {room[i].character = "mordred";}
      else if(randomNum == 10) {room[i].character = "oberon";}
      else if(randomNum == 11) {room[i].character = "evilOne";}
      else if(randomNum == 12) {room[i].character = "evilTwo";}
      else if(randomNum == 13) {room[i].character = "evilThree";}
      charArray[randomNum] = 0;
    }
  }
  /*
  console.log("assigned characters:");
  for(let i = 0; i < room.length; i++) {
    console.log("\t[" + room[i].name + "] is " + room[i].character);
  }
  */

  return {
    isValid: true,
    message: "Valid character selection!",
    charArray: charArrayCopy
  };
};

exports.getCharacterIndexFromCharacterName = function(characterName) {
  if(characterName === "merlin") {
    return 0;
  }
  if(characterName === "percival") {
    return 1;
  }
  if(characterName === "goodOne") {
    return 2;
  }
  if(characterName === "goodTwo") {
    return 3;
  }
  if(characterName === "goodThree") {
    return 4;
  }
  if(characterName === "goodFour") {
    return 5;
  }
  if(characterName === "goodFive") {
    return 6;
  }
  if(characterName === "assassin") {
    return 7;
  }
  if(characterName === "morgana") {
    return 8;
  }
  if(characterName === "mordred") {
    return 9;
  }
  if(characterName === "oberon") {
    return 10;
  }
  if(characterName === "evilOne") {
    return 11;
  }
  if(characterName === "evilTwo") {
    return 12;
  }
  if(characterName === "evilThree") {
    return 13;
  }
  return -1;
};
