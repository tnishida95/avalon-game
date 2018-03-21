//gameStrBuilder.js

var buildGameBoardDiv = function(qSize1, qSize2, qSize3, qSize4, qSize5) {
    return `<div id="gameBoardDiv" class="text-center">
        <h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${qSize1}</button>
            <button type="button" class="btn btn-default">${qSize2}</button>
            <button type="button" class="btn btn-default">${qSize3}</button>
            <button type="button" class="btn btn-default">${qSize4}</button>
            <button type="button" class="btn btn-default">${qSize5}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 1</p>
            <p id="rejectedDisplay">Rejected Parties: 0</p>
            <p id="successesDisplay">Successes: 0, Failures: 0</p>
            <hr>
            <p id="currentPartyDisplay">Current party: none</p>
        </div>
        <hr>
    </div>`
}

module.exports = {
    buildGameBoardDiv: buildGameBoardDiv
}
