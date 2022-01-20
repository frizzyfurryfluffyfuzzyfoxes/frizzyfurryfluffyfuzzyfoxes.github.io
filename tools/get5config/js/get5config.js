/**
 * Fab5 Get5 config generator.
 */

// Copied from https://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object?page=1&tab=votes#tab-top
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd].join('');
};

let fab5team = {
    "name": "Fab5",
    "flag": "DK",
    "players": [
        "STEAM_1:1:141078",   // "Cywin",
        "STEAM_1:0:18204824", // "EcM4",
        "STEAM_1:0:1619888",  // "karstn",
        "STEAM_1:1:4160840",  // "Neth",
        "STEAM_1:1:18685528", // "Pardina",
        "STEAM_0:1:19872352", // "runtyrobot",
        "STEAM_0:0:3541981",  // "Rövbitaren",
        "STEAM_1:0:16184259", // "SGUU",
        "STEAM_1:0:12230325", // "TrophicMonkey11",
        "STEAM_1:0:540333376",// "UpLinQ",
        "STEAM_1:0:2796426"   // "zarGoth"
    ]
};

let opposingTeam = {
    "name": "",
    "flag": "DK",
    "players": []
};

let get5MatchConfig = {
    "matchid": "",
    "num_maps": 1,
    "players_per_team": 5,
    "min_players_to_ready": 1,
    "min_spectators_to_ready": 0,
    "spectators": {},
    "side_type": "standard",
    "skip_veto": true,
    "map_sides": [],
    "maplist": [],
    "team1": {},
    "team2": {},

};

const GitHub = (function() {
    function createFile(filename, content) {
        const url = "https://github.com/frizzyfurryfluffyfuzzyfoxes/foxhole-server-configs/new/main/match/?filename=" + filename + "&value=" + content;
        window.open(url, "_blank");
        return;
    }
    return { 'createFile' : createFile };
})();


function sanitiseFilenameString(str) {
    return str.replace(/[^\x30-\x39\x41-\x5A\x61-\x7A\x5F]/g, "");
}

function suggestConfigFilename() {
    let homeAwayStatus = document.querySelector('input[name="match-home-away"]:checked');
    if (homeAwayStatus === null) return;
    homeAwayStatus = homeAwayStatus.value;

    let opposingTeamName = document.getElementById("opposing-team-name").value;
    if (opposingTeamName == "") return;
    opposingTeamName = sanitiseFilenameString(opposingTeamName);

    let suggestion = new Date().yyyymmdd() + "_" + (homeAwayStatus == "home"
                                                    ? "Fab5v" + opposingTeamName + ".json"
                                                    : opposingTeamName + "vFab5.json");
    document.getElementById("config-filename").value = suggestion;
    return;
}

function validateInputs() {
    let homeAway = document.querySelector('input[name="match-home-away"]:checked');
    if (homeAway === null) {
        console.error("home-away is null");
        return false;
    }

    homeAway = homeAway.value;
    if (homeAway !== "home" && homeAway !== "away") {
        console.error("Invalid home-away value" + homeAway);
        return false;
    }

    let opposingTeamName = document.getElementById("opposing-team-name");
    if (opposingTeamName === null) {
        console.error("Opposing team name is null");
        return false;
    }
    opposingTeamName = opposingTeamName.value;
    if (sanitiseFilenameString(opposingTeamName) == "") {
        console.error("Sanitised opposing team name is empty");
        return false;
    }

    let configFilename = document.getElementById("config-filename").value;
    if (configFilename === null
        || sanitiseFilenameString(configFilename) == ""
        || !configFilename.endsWith(".json")) {
        console.error("Invalid config filename");
        return false;
    }

    let map = document.getElementById("maps");
    if (map === null || (map = map.value) === null) {
        console.error("map is null");
        return false;
    }
    switch (map) {
    case "de_ancient":
    case "de_dust2":
    case "de_inferno":
    case "de_mirage":
    case "de_nuke":
    case "de_overpass":
    case "de_vertigo":
        break;
    default:
        console.error("Invalid map name")
        return false;
    }

    let fab5StartingSide = document.querySelector('input[name="starting-side"]:checked');
    if (fab5StartingSide === null) {
        console.error("starting side is null");
        return false;
    }
    fab5StartingSide = fab5StartingSide.value;
    if (fab5StartingSide != "ct" && fab5StartingSide != "t") {
        console.error("Invalid starting side value");
        return false;
    }

    return true;
}

function assembleConfig() {
    let matchConfig = Object.assign({}, get5MatchConfig);
    matchConfig.maplist = [];
    matchConfig.map_sides = [];
    let otherTeam = Object.assign({}, opposingTeam);

    let homeAway = document.querySelector('input[name="match-home-away"]:checked').value;
    let team1 = null, team2 = null;
    let teamStartingCT = document.querySelector('input[name="starting-side"]:checked').value;
    if (homeAway == "home") {
        team1 = fab5team;
        team2 = otherTeam;
        teamStartingCT = teamStartingCT == "ct" ? "team1_ct" : "team2_ct";
    } else {
        team1 = otherTeam;
        team2 = fab5team;
        teamStartingCT = teamStartingCT == "ct" ? "team2_ct" : "team1_ct";
    }

    let map = document.getElementById("maps").value;
    let configFilename = document.getElementById("config-filename").value;
    let matchId = configFilename.replace(/\.[^/.]+$/, "");

    matchConfig.matchid = matchId;
    matchConfig.team1 = team1;
    matchConfig.team2 = team2;
    matchConfig.maplist.push(map);
    matchConfig.map_sides.push(teamStartingCT);

    return matchConfig;
}

function generateConfig() {
    // Validate inputs.
    if (!validateInputs()) return;

    // Assemble JSON object.
    let matchConfig = assembleConfig();

    // Serialise JSON object.
    matchConfig = encodeURI(JSON.stringify(matchConfig, undefined, 2));

    // Create new file on the GitHub repository.
    let filename = document.getElementById("config-filename").value;
    GitHub.createFile(filename, matchConfig);
    return;
}
