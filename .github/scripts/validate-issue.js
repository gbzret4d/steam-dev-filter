const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
    const issueBody = context.payload.issue.body;
    const issueTitle = context.payload.issue.title;

    if (!issueBody) {
        console.log("No issue body to parse.");
        return;
    }

    // Load database.json
    const dbPath = path.resolve('database.json');
    let database = {};
    try {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        database = JSON.parse(fileContent);
    } catch (error) {
        core.setFailed(`Failed to read database.json: ${error.message}`);
        return;
    }

    // Extract Developer Name and Steam ID (crude regex parsing based on template)
    // Looking for headings or just checking if string exists in body
    // Template uses "Dateien" or headings. Let's try to find headers.

    // Regex defaults for the report-developer.yml template
    const nameRegex = /### Developer Name\s*\n\s*([^\n]+)/;
    const idRegex = /### Steam Developer ID \(Optional\)\s*\n\s*([^\n]+)/;

    const nameMatch = issueBody.match(nameRegex);
    const idMatch = issueBody.match(idRegex);

    const devName = nameMatch ? nameMatch[1].trim() : null;
    let steamId = idMatch ? idMatch[1].trim() : null;

    // Handle "None" or empty fields
    if (steamId && (steamId.toLowerCase() === '_no_response_' || steamId.toLowerCase() === 'none')) {
        steamId = null;
    }

    console.log(`Extracted: Name="${devName}", ID="${steamId}"`);

    const failures = [];

    // Check for Duplicates in database
    if (steamId && database[steamId]) {
        failures.push(`❌ **Duplicate Steam ID**: \`${steamId}\` is already in the database as **${database[steamId].name}**.`);
    }

    // Check by Name (fuzzy check or exact match on existing names/aliases)
    if (devName) {
        const lowerName = devName.toLowerCase();
        for (const [key, entry] of Object.entries(database)) {
            if (entry.name.toLowerCase() === lowerName || entry.aliases.some(a => a.toLowerCase() === lowerName)) {
                failures.push(`❌ **Duplicate Name**: Developer **"${entry.name}"** is already listed.`);
            }
        }
    }

    // Post comment if failures found
    if (failures.length > 0) {
        const commentBody = `Thanks for the report! \n\nI found some potential issues:\n\n${failures.join('\n')}\n\nPlease check if this is a duplicate.`;

        await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: commentBody
        });

        // Optionally label as duplicate
        await github.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            labels: ['duplicate']
        });
    } else {
        console.log("No duplicates found.");
    }
};
