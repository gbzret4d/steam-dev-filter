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

    // Check if this is a Removal Request (Appeal)
    const isAppeal = context.payload.issue.labels.some(l => l.name === 'appeal') || issueTitle.startsWith('[APPEAL]');

    if (isAppeal) {
        console.log("Processing Removal Request...");

        // Regex for Removal Request
        const devNameRegex = /### Developer Name\s*\n\s*([^\n]+)/;
        const reasonRegex = /### Reason for Removal\s*\n\s*([\s\S]+?)(?=\n###|$)/; // Multiline
        const proofRegex = /### Proof \/ Evidence\s*\n\s*([^\n]+)/;

        const devNameMatch = issueBody.match(devNameRegex);
        const reasonMatch = issueBody.match(reasonRegex);
        const proofMatch = issueBody.match(proofRegex);

        const devName = devNameMatch ? devNameMatch[1].trim() : null;
        const reason = reasonMatch ? reasonMatch[1].trim() : null;
        const proof = proofMatch ? proofMatch[1].trim() : null;

        const failures = [];

        // 1. Check if developer exists in DB
        let foundRequest = false;
        if (devName) {
            const lowerName = devName.toLowerCase();
            for (const [key, entry] of Object.entries(database)) {
                if (entry.name.toLowerCase() === lowerName || entry.aliases.some(a => a.toLowerCase() === lowerName)) {
                    foundRequest = true;
                    break;
                }
            }
            if (!foundRequest) {
                failures.push(`❌ **Developer Not Found**: Could not find "**${devName}**" in the database. Please check the spelling.`);
            }
        } else {
            failures.push(`❌ **Missing Name**: Developer Name is required.`);
        }

        // 2. Check Reason
        if (!reason || reason.length < 20 || reason === '_no_response_') {
            failures.push(`❌ **Insufficient Reason**: Please provide a detailed explanation (at least 20 characters).`);
        }

        // 3. Check Proof
        if (!proof || !proof.startsWith('http') || proof === '_no_response_') {
            failures.push(`❌ **Invalid Proof**: Please provide a valid URL as evidence.`);
        }

        if (failures.length > 0) {
            const commentBody = `Thanks for the appeal. \n\nI found some issues with your request:\n\n${failures.join('\n')}\n\nPlease edit your issue to address these.`;
            await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: commentBody
            });
            // Remove 'triage' label if invalid? Or keep it. 
        } else {
            console.log("Appeal seems valid.");
            await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `✅ **Appeal Validated**: The developer "**${devName}**" was found in the database. A maintainer will review your evidence shortly.`
            });
        }
        return; // Stop processing regular report logic
    }

    // --- Legacy Report Logic (for new additions) ---

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
