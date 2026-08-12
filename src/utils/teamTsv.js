const FILE_VERSION_MARKER = 'file_version';

const parseRows = (text) => text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line, index) => ({
        columns: line.split('\t').map(value => value.trim()),
        rowNumber: index + 1,
    }))
    .filter(row => row.columns.some(Boolean));

export const parseTeamTsv = (text) => {
    const rows = parseRows(text);
    const teamRows = rows.filter(row => row.columns[0].toLowerCase() !== FILE_VERSION_MARKER);

    if (teamRows.length === 0) {
        throw new Error('The TSV does not contain any team rows.');
    }

    const seenSeats = new Set();
    return teamRows.map(({ columns, rowNumber }) => {
        if (columns.length < 5) {
            throw new Error(`Row ${rowNumber} must contain at least five tab-separated columns.`);
        }

        const seatNumber = columns[0];
        const teamName = columns[3];
        const university = columns[4];

        if (!seatNumber || !teamName) {
            throw new Error(`Row ${rowNumber} must include a seat number in column 1 and team name in column 4.`);
        }

        const normalizedSeat = seatNumber.toLowerCase();
        if (seenSeats.has(normalizedSeat)) {
            throw new Error(`Seat number "${seatNumber}" appears more than once in the TSV.`);
        }
        seenSeats.add(normalizedSeat);

        return { seatNumber, teamName, university, rowNumber };
    });
};
