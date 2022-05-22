/**
 * Fab5 Get5 analyser.
 */

const BO2 = "BO2"; // matchCategory "a"
const BO3 = "BO3"; // matchCategory "c"

class Match {
    constructor(esportligaMatch, matchDetails) {
        this.id = esportligaMatch.id;
        this.time = esportligaMatch.time;
        this.matchDetails = matchDetails;
        this.teamA = esportligaMatch.matchTeams[0].team;
        this.teamAScore = esportligaMatch.matchTeams[0].score;
        this.teamB = esportligaMatch.matchTeams[1].team;
        this.teamBScore = esportligaMatch.matchTeams[1].score;
        this.type = esportligaMatch.matchCategory === "a" ? BO2 : BO3;
        this.esportligaMatch = esportligaMatch;
    }

    matchCount() {
        if (this.type === BO2) {
            return 1;
        }

        return this.getSubScores().length;
    }

    getMatchTeams() {
        return this.esportligaMatch.matchTeams;
    }

    toBo2Match() {
        console.log(this.teamA)
        console.log(this.teamB)
        let match = {
            id: this.id,
            time: this.time,
            map: this.matchDetails.mapName,
            teamA: this.teamA.name + " (" + this.teamA.id + ")",
            teamAelo: this.teamA.teamRankBeforeGame,
            teamAScore: this.teamAScore,
            teamBScore: this.teamBScore,
            teamBelo: this.teamB.teamRankBeforeGame,
            teamB: this.teamB.name + " (" + this.teamB.id + ")",
        }

        return match;
    }

    toBo3Matches() {
        let matches = [];
        let teams = this.getMatchTeams();
        let scores = teams[0].subScores;
        for(var i = 0; i < teams[0].subScores.length; i++) {
            let match = {
                id: this.id + "(" + scores[i].no + ")",
                time: this.time,
                map: this.matchDetails.maps[i].mapName,
                teamA: this.teamA.name + " (" + this.teamA.id + ")",
                teamAId: this.teamA.id,
                teamAelo: this.teamA.teamRankBeforeGame,
                teamAScore: teams[0].subScores[i].score,
                teamBScore: teams[1].subScores[i].score,
                teamBelo: this.teamB.teamRankBeforeGame,
                teamB: this.teamB.name + " (" + this.teamB.id + ")",
                teamBId: this.teamB.id
            };
            matches.push(match);
        }

        return matches;
    }

    addToTable(table) {    
        var matches = [];
        if (this.type === BO2) {
            let match = this.toBo2Match();
            matches.push(match);
        } else { // BO3
            matches = this.toBo3Matches();
        }

        for (var i = 0; i < matches.length; i++) {
            let row = createTableRow(matches[i]);
            table.appendChild(row);
        }
    }
}

// Copied from https://stackoverflow.com/a/21149072
var camelCaseToWords = function(str){
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function(x){
        return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
};

function fetchTeam(teamId, callback) {
    console.debug("Fetching team with id " + teamId);
    $.get("https://app.esportligaen.dk/api/team/" + teamId + "?includeViewInfo=true", function(data, status) {
        if (status === "success") {
            callback(data);
        } else {
            console.error("Could not fetch team with id " + teamId + ". result=" + status);
        }
    })
}

function fetchMatch(matchId, callback) {
    console.debug("Fetching match with id " + matchId);
    $.get("https://app.esportligaen.dk/api/match/details/" + matchId, function(data, status) {
        if (status === "success") {
            callback(data);
        } else {
            console.error("Could not fetch match with id " + matchId + ". result=" + status);
        }
    })
}

function createTable(id) {
    let table = document.createElement("table");
    table.id = id;

    return table;
}

function createTableHeader(tableContentValue) {
    return createTableRow(tableContentValue, true);
}

function createTableRow(tableContentValue) {    
    return createTableRow(tableContentValue, false);
}

function createTableRow(tableContentValue, isHeader) {
    let columnNames = Array.isArray(tableContentValue) ? tableContentValue : getKeys(tableContentValue);
    let headerRowElement = document.createElement("tr");
    columnNames.forEach(function (columnName) {
        var column;
        if (isHeader) {
            column = document.createElement("th");
            column.textContent = Array.isArray(tableContentValue) ? columnName : camelCaseToWords(columnName);
        } else {
            column = document.createElement("td");
            column.textContent = tableContentValue[columnName]
        }

        headerRowElement.appendChild(column);
    });

    return headerRowElement;
}

function createSection(id, titleSize, title) {
    if (titleSize === null || titleSize <= 0) {
        console.error("titleSize must be greater than 0");
    }

    removeExistingElement(id);

    let section = document.createElement("div");
    section.id = id;
    let titleElement = document.createElement("h" + titleSize);
    titleElement.textContent = title;
    section.appendChild(titleElement);

    return section
}

function removeExistingElement(id) {
    let element = document.getElementById(id);
    if (element === null) {
        return;
    } 
    
    element.remove();
}

function getKeys(map) {
    let keys = []
    for (var key in map) {
        keys.push(key)
    }
    return keys;
}

function createMembers(members) {
    if (members === null || members.length == 0) {
        return null;
    }

    let section = createSection("members", 2, "Members")    
    let tableHeader = null;

    let membersTable = createTable("members-table")
    for (var i in members) {
        console.log(i)
        let user = members[i].user;
        if (tableHeader === null) {
            tableHeader = createTableHeader(user);
            membersTable.appendChild(tableHeader);
        }

        let row = createTableRow(user);
        membersTable.appendChild(row);
    }

    section.appendChild(membersTable);
    return section;
}

function createMapStats(team) {
    if (team === null) {
        return null;
    }

    let matchDtos = team.matches;
    if (matchDtos === null || matchDtos.length == 0) {
        return null;
    }

    let section = createSection("map-stats", 2, "Map Stats")

    let table = createTable("map-stats-table")
    let columnNames = [
        "Map",
        "Played",
        "Win Rate",
        "Pick Rate"
    ];
    let headerRow = createTableHeader(columnNames);
    table.appendChild(headerRow);

    let stats = {
        totalMaps: matchDtos.length + 1,
        totalPicks: 0,
        picks: {} // { map: "map", wins: 0, pickCount: 0 }
    }
    let detailedMatches = [];
    for (var i in matchDtos) {
        let matchDto = matchDtos[i];
        fetchMatch(matchDto.id, function(matchDetails) {
            let match = new Match(matchDto, matchDetails)
            detailedMatches.push({team: team, match: match});

            //console.warn(detailedMatches)
            if (detailedMatches.length === matchDtos.length) {
                for (var j in detailedMatches) {
                    addPick(stats, detailedMatches[j])
                }
                console.warn(stats)

                var statRows = compileStats(stats);
                console.warn(statRows)

                statRows.forEach(function (row) {
                    table.appendChild(createTableRow(row))
                })
            }
        })
    }

    section.appendChild(table);
    return section;
}

function compileStats(stats) {
    let rows = [];
    let mapNames = getKeys(stats.picks);
    for (var i in mapNames) {
        let mapStats = stats.picks[mapNames[i]];
        let row = {
            map: mapNames[i],
            played: mapStats.count,
            winRate: (mapStats.wins / mapStats.count * 100).toFixed(2),
            pickRate: (mapStats.pickCount / stats.totalPicks * 100).toFixed(2)
        };

        rows.push(row)
    }

    return rows;
}

function addPick(stats, detailedMatch) {
    let match = detailedMatch.match
    console.warn(match)
    if (match.type === BO2) {
        let bo2Match = match.toBo2Match();
        let didAnalysedTeamPickedMap = detailedMatch.team.id == match.teamA.id;
        handleSingleMatch(didAnalysedTeamPickedMap, stats, bo2Match);
    } else if (match.type === BO3) {
        let bo3Match = match.toBo3Matches();
        for(var i in bo3Match) {
            let subMatch = bo3Match[i];
            let didAnalysedTeamPickedMap = detailedMatch.team.id == subMatch.teamAId;
            handleSingleMatch(didAnalysedTeamPickedMap, stats, subMatch);
        }
    }
}

function handleSingleMatch(didAnalysedTeamPickedMap, stats, match) {
    let map = stats.picks[match.map];
    console.warn(map)
    if (map == undefined || map == null) {
        stats.picks[match.map] = { count: 0, wins: 0, pickCount: 0 };
    }

    if (didAnalysedTeamPickedMap) {
        stats.totalPicks++;
        stats.picks[match.map].pickCount++;
        if (match.teamAScore > match.teamBScore) {
            stats.picks[match.map].wins++;
        }
    }

    if (match.teamBScore > match.teamAScore) {
        stats.picks[match.map].wins++;
    }

    stats.picks[match.map].count++;
}

function createMatches(matchDtos) {
    if (matchDtos === null || matchDtos.length == 0) {
        return null;
    }

    let section = createSection("matches", 2, "Matches")

    let table = createTable("matches-table")
    let columnNames = [
        "Id",
        "Time",
        "Map",
        "Team A",
        "Team A ELO",
        "Team A Score",
        "Team B Score",
        "Team B ELO",
        "Team B",
    ];
    let headerRow = createTableHeader(columnNames);
    table.appendChild(headerRow);

    for (var i in matchDtos) {
        let matchDto = matchDtos[i];
        fetchMatch(matchDto.id, function(matchDetails) {
            let match = new Match(matchDto, matchDetails)
            match.addToTable(table);
        })
    }

    section.appendChild(table);
    return section;
}

function addMatchRow(table, matchDomain, mustCreateTableHeader) {
    if (mustCreateTableHeader) {
        tableHeader = createTableHeader(matchDomain);
        table.appendChild(tableHeader);
    }

    let row = createTableRow(matchDomain);
    table.appendChild(row);
}

function handleResults(team) {
    let results = document.getElementById("results")
    console.log(team);

    results.appendChild(createMembers(team.members));
    results.appendChild(createMapStats(team));
    results.appendChild(createMatches(team.matches));

}

function doAnalyse(teamId) {
    fetchTeam(teamId, handleResults)
}

function submit() {
    let teamId = document.getElementById("team-id").value;

    if (teamId === null) {
        return false;
    }

    let results = document.getElementById("results")
    let childNodes = results.childNodes;
    childNodes.forEach(function (childNode) {
        results.removeChild(childNode);
    })
    doAnalyse(teamId);

}