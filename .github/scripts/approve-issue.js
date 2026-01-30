const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = async ({ github, context, core }) => {
    const issue = await github.rest.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
    });

    const issueBody = issue.data.body;
    const issueTitle = issue.data.title;

    console.log(`Processing approval for Issue #${context.issue.number}`);

    // Regex capture for fields (Adapt as needed based on exact template output)
    const nameMatch = issueBody.match(/### Developer Name\s*\n\s*([^\n]+)/);
    const idMatch = issueBody.match(/### Steam Developer ID \(Optional\)\s*\n\s*([^\n]+)/);
    const categoryMatch = issueBody.match(/### Category\s*\n\s*([^\n]+)/);
    const proofMatch = issueBody.match(/### Proof URL\s*\n\s*([^\n]+)/);
    const notesMatch = issueBody.match(/### Additional Notes\s*\n\s*([\s\S]+)/); // Multiline capture

    const devName = nameMatch ? nameMatch[1].trim() : null;
    let steamId = idMatch ? idMatch[1].trim() : null;
    let category = categoryMatch ? categoryMatch[1].trim() : null;
    const proofUrl = proofMatch ? proofMatch[1].trim() : null;
    const notes = notesMatch ? notesMatch[1].trim() : "";

    // Clean up category (remove description in parens)
    if (category && category.includes('(')) {
        category = category.split('(')[0].trim();
    }

    // Handle "None" or empty fields for Steam ID
    if (!steamId || steamId.toLowerCase() === '_no_response_' || steamId.toLowerCase() === 'none') {
        // Fallback: Generate ID from Name if missing
        if (devName) {
            steamId = devName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            console.log(`Steam ID missing, generated slug: ${steamId}`);
        } else {
            core.setFailed("Could not parse Developer Name or Steam ID.");
            return;
        }
    }

    if (!devName || !category || !proofUrl) {
        await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: `❌ **Approval Failed**: Missing required fields. \n\nParses:\n- Name: ${devName}\n- ID: ${steamId}\n- Category: ${category}\n- Proof: ${proofUrl}`
        });
        core.setFailed("Missing required fields.");
        return;
    }

    // Update database.json
    const dbPath = path.resolve('database.json');
    let database = {};
    try {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        database = JSON.parse(fileContent);
    } catch (error) {
        core.setFailed(`Failed to read database.json: ${error.message}`);
        return;
    }

    if (database[steamId]) {
        await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: `⚠️ **Warning**: ID \`${steamId}\` already exists. Overwriting...`
        });
    }

    database[steamId] = {
        name: devName,
        aliases: [],
        type: category,
        proof_url: proofUrl,
        severity: "warning", // Default severity, can be adjusted manually
        notes: notes
    };

    fs.writeFileSync(dbPath, JSON.stringify(database, null, 4));

    // Git Commit & Push
    try {
        execSync('git config user.name "github-actions[bot]"');
        execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
        execSync('git add database.json');
        execSync(`git commit -m "feat: add ${devName} (${steamId}) to database"`);
        execSync('git push');
        console.log("Database updated and pushed.");
    } catch (error) {
        core.setFailed(`Git commit failed: ${error.message}`);
        return;
    }

    // Close Issue
    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: `✅ **Approved**: Developer **"${devName}"** has been added to the database.\n\nClosing issue.`
    });

    await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        state: 'closed',
        labels: ['approved', 'developer-added']
    });
};
