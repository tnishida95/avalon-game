// utils.js

/**
 * Validates the character selections for a lobby is correct.
 * @param {Array} characterSelections - list of characters selected by the host
 * @param {Array} room - the array of Players
 * @return {boolean} isValid - true if the selection is valid
 * @return {string} message - reason given for deeming a selection invalid
 */
exports.assignCharacters = function(characterSelections, room) {
  if(room === undefined) {
    console.error('lost room, restart client side');
  }
  if(room.length < 5 || room.length > 10) {
    const message = `${room.length} player(s) in lobby, must have 5-10.`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message
    };
  }

  characterSelections.push('merlin');
  characterSelections.push('assassin');
  let goodCount = 1;
  let evilCount = 1;

  if(characterSelections.includes('percival')) {
    console.log("found percival");
    goodCount++;
  }
  if(characterSelections.includes('mordred')) {
    evilCount++;
  }
  if(characterSelections.includes('morgana')) {
    evilCount++;
  }
  if(characterSelections.includes('oberon')) {
    evilCount++;
  }

  const goodNeeded = room.length === 5 ? 3
                   : room.length === 6 ? 4
                   : room.length === 7 ? 4
                   : room.length === 8 ? 5
                   : 6;
  let evilNeeded = room.length - goodNeeded;

  // fill in Good
  switch(goodNeeded - goodCount) {
    case 5:
      characterSelections.push('goodFive');
    case 4:
      characterSelections.push('goodFour');
    case 3:
      characterSelections.push('goodThree');
    case 2:
      characterSelections.push('goodTwo');
    case 1:
      characterSelections.push('goodOne');
  }

  // fill in Evil
  switch(evilNeeded - evilCount) {
    case 3:
      characterSelections.push('evilThree');
    case 2:
      characterSelections.push('evilTwo');
    case 1:
      characterSelections.push('evilOne');
    case 0:
      break;
    default:
      const message = `Cannot select more than ${evilNeeded - 1} Evil characters for a ${room.length} player game!`;
      console.error("invalid character selection: " + message);
      return {
        isValid: false,
        message: message
      };
  }

  // console.log("characterSelections:", characterSelections);

  if(characterSelections.includes('morgana') && !characterSelections.includes('percival')) {
    const message = `Morgana cannot be selected without Percival!`;
    console.error("invalid character selection: " + message);
    return {
      isValid: false,
      message: message
    };
  }

  // fulfill a single reservation
  for(let i = 0; i < room.length; i++) {
    if(room[i].character != "none") {
      if(characterSelections.includes(room[i].character)) {
        characterSelections.splice(characterSelections.indexOf(room[i].character), 1);
        console.log(`fulfilling ${room[i].character} reservation to ${room[i].name}`);
      }
      console.log(`${room[i].character} not selected by host (or taken), cannot fulfill reservation`);
      room[i].character = "none";
    }
  }

  // assign players a random character
  // need to do this in a separate loop from reservations so to no give away
  // a character beforehand
  for(let i = 0; i < room.length; i++) {
    if(room[i].character === "none") {
      let randomIndex = Math.floor(Math.random() * characterSelections.length);
      room[i].character = characterSelections[randomIndex];
      characterSelections.splice(randomIndex, 1);
    }
  }

  console.log("assigned characters:");
  for(let i = 0; i < room.length; i++) {
    console.log(`\t[${room[i].name}] is ${room[i].character}`);
  }

  return {
    isValid: true,
    message: "Valid character selection!"
  };
};

/**
 * Determines what a player should see given their character.
 * @param {Array} characterSelections - list of characters selected by the host
 * @param {Array} room - the array of Players
 * @param {string} givenCharacter - the character to determine the reveals from
 * @return {Array} - list of objects with player socket, name, and revealable character
 */
exports.getRevealedRoom = function(characterSelections, room, givenCharacter) {
  let reveals = [];
  for(let i = 0; i < room.length; i++) {
    let character;
    if(givenCharacter === room[i].character) {
      character = exports.getPrettyName(givenCharacter);
    }
    else if(givenCharacter === 'merlin') {
      if(room[i].character === 'assassin' || room[i].character === 'morgana' || room[i].character === 'oberon') {
        character = 'Agent of Evil';
      }
      else {
        if(characterSelections.includes('mordred')) {
          character = '?';
        }
        else {
          character = 'Agent of Good';
        }
      }
    }
    else if(givenCharacter === 'percival') {
      if(room[i].character === 'merlin') {
        if(characterSelections.includes('morgana')) {
          character = 'Merlin or Morgana';
        }
        else {
          character = 'Merlin';
        }
      }
      else if(room[i].character === 'morgana') {
        character = 'Merlin or Morgana';
      }
      else {
        character = '?';
      }
    }
    else if(givenCharacter.includes('good') || givenCharacter === 'oberon') {
      character = '?';
    }
    else {
      // if givenCharacter is any Evil but Oberon
      if(room[i].character === 'merlin' || room[i].character === 'percival' ||
         room[i].character === 'oberon' || room[i].character.includes('good')) {
          character = '?';
      }
      else {
        character = exports.getPrettyName(room[i].character);
      }
    }
    reveals.push({
      sid: room[i].sid,
      name: room[i].name,
      character: character
    });
  } // end iteration over players
  return reveals;
};

/**
 * Returns the pretty, formatted name string for a given character
 */
exports.getPrettyName = function(character) {
  switch (character) {
    case 'merlin':
    case 'percival':
    case 'assassin':
    case 'mordred':
    case 'morgana':
    case 'oberon':
      return character[0].toUpperCase() + character.slice(1);
    case 'evilThree':
    case 'evilTwo':
    case 'evilOne':
      return 'Agent of Evil';
    default:
      return 'Agent of Good';
  }
};

exports.getTileStringFromQuestResult = function(result) {
  if(result === 1) {
    return "S";
  }
  else if(result === 2) {
    return "F";
  }
  else {
    return "-";
  }
};

exports.getStyleClassFromQuestResult = function(result) {
  if(result === 1) {
    return "good-blue";
  }
  else if(result === 2) {
    return "evil-red";
  }
  else {
    return "";
  }
};
