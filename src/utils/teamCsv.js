const ID_HEADERS = new Set(['id', 'teamid', 'teamidentifier', 'teamnumber']);
const NAME_HEADERS = new Set(['name', 'teamname', 'displayname']);

const normalizeHeader = (value) => value.trim().toLowerCase().replace(/[\s_-]+/g, '');

export const parseCsvRows = (text) => {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];

        if (inQuotes) {
            if (character === '"' && text[index + 1] === '"') {
                field += '"';
                index += 1;
            } else if (character === '"') {
                inQuotes = false;
            } else {
                field += character;
            }
            continue;
        }

        if (character === '"') {
            inQuotes = true;
        } else if (character === ',') {
            row.push(field);
            field = '';
        } else if (character === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (character !== '\r') {
            field += character;
        }
    }

    if (inQuotes) {
        throw new Error('The CSV contains an unclosed quoted value.');
    }

    if (field || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows.filter(values => values.some(value => value.trim()));
};

export const parseTeamCsv = (text) => {
    const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
    if (rows.length < 2) {
        throw new Error('The CSV must contain a header and at least one team.');
    }

    const headers = rows[0].map(normalizeHeader);
    const idIndex = headers.findIndex(header => ID_HEADERS.has(header));
    const nameIndex = headers.findIndex(header => NAME_HEADERS.has(header));

    if (idIndex === -1 || nameIndex === -1 || idIndex === nameIndex) {
        throw new Error('Use CSV columns named "id" and "team name".');
    }

    const seenIds = new Set();
    return rows.slice(1).map((values, index) => {
        const id = (values[idIndex] || '').trim();
        const displayName = (values[nameIndex] || '').trim();
        const rowNumber = index + 2;

        if (!id || !displayName) {
            throw new Error(`Row ${rowNumber} must include both an ID and a team name.`);
        }

        const normalizedId = id.toLowerCase();
        if (seenIds.has(normalizedId)) {
            throw new Error(`Team ID "${id}" appears more than once in the CSV.`);
        }
        seenIds.add(normalizedId);

        return { id, displayName, rowNumber };
    });
};

const numericIdentifier = (value) => {
    const match = value.trim().match(/^(?:team\s*)?(\d+)$/i);
    return match?.[1].replace(/^0+(?=\d)/, '');
};

export const matchCsvTeams = (csvTeams, teams) => {
    const matchedTeamIds = new Set();

    return csvTeams.map(csvTeam => {
        const normalizedCsvId = csvTeam.id.toLowerCase();
        const csvNumber = numericIdentifier(csvTeam.id);
        const matches = teams.filter(team => {
            if (team.id.toLowerCase() === normalizedCsvId || team.name.toLowerCase() === normalizedCsvId) {
                return true;
            }
            return csvNumber !== undefined && numericIdentifier(team.name) === csvNumber;
        });

        if (matches.length === 0) {
            throw new Error(`Row ${csvTeam.rowNumber}: no created team matches ID "${csvTeam.id}".`);
        }
        if (matches.length > 1) {
            throw new Error(`Row ${csvTeam.rowNumber}: ID "${csvTeam.id}" matches more than one team.`);
        }
        if (matchedTeamIds.has(matches[0].id)) {
            throw new Error(`Row ${csvTeam.rowNumber}: ${matches[0].name} was already matched by another CSV row.`);
        }
        if (matches[0].displayName?.trim()) {
            throw new Error(`Row ${csvTeam.rowNumber}: ${matches[0].name} already has a team name and cannot be updated.`);
        }

        matchedTeamIds.add(matches[0].id);
        return { teamId: matches[0].id, displayName: csvTeam.displayName };
    });
};
