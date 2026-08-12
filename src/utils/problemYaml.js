import { parse } from 'yaml';

const requireText = (problem, key, index) => {
    const value = problem?.[key];
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`Problem ${index + 1} must include a non-empty "${key}" value.`);
    }
    return value.trim();
};

export const parseProblemYaml = (text) => {
    let config;
    try {
        config = parse(text);
    } catch (error) {
        throw new Error(`Invalid YAML: ${error.message}`);
    }

    if (!config || !Array.isArray(config.problems) || config.problems.length === 0) {
        throw new Error('The YAML must contain a non-empty "problems" list.');
    }

    const seenLetters = new Set();
    const seenShortNames = new Set();
    const seenColors = new Set();

    return config.problems.map((problem, index) => {
        const letter = requireText(problem, 'letter', index);
        const shortName = requireText(problem, 'short-name', index);
        const fullName = requireText(problem, 'name', index);
        const colorName = requireText(problem, 'color', index);
        const color = requireText(problem, 'rgb', index).toLowerCase();

        if (!/^#[0-9a-f]{6}$/i.test(color)) {
            throw new Error(`Problem ${index + 1} has invalid rgb "${color}". Use a quoted value such as '#0000ff'.`);
        }

        const normalizedLetter = letter.toLowerCase();
        const normalizedShortName = shortName.toLowerCase();
        if (seenLetters.has(normalizedLetter)) {
            throw new Error(`Problem letter "${letter}" appears more than once.`);
        }
        if (seenShortNames.has(normalizedShortName)) {
            throw new Error(`Problem short-name "${shortName}" appears more than once.`);
        }
        if (seenColors.has(color)) {
            throw new Error(`Balloon color "${color}" appears more than once.`);
        }

        seenLetters.add(normalizedLetter);
        seenShortNames.add(normalizedShortName);
        seenColors.add(color);

        return { letter, shortName, fullName, colorName, color };
    });
};
