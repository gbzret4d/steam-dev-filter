# Steam Dev Filter 🛡️

**Steam Dev Filter** is a userscript that warns you about potentially fraudulent developers on Steam (Rug pulls, Asset Flips, Hostile Developers, etc.) directly on the store page.

## Features

- **Community Driven**: Powered by a public `database.json` of verified reports.
- **Visual Warnings**: Adds color-coded badges to store pages (Rug Pull, Asset Flip, etc.).
- **Evidence Based**: Every entry requires a public proof link.
- **Privacy Friendly**: Runs entirely in your browser. Data is cached locally to minimize traffic.

## Installation

1. Install a Userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click here to install the script: [**Install Steam Dev Filter**](steam_dev_filter.user.js) (or manually load `steam_dev_filter.user.js`).
3. Visit any Steam store page to see it in action.

## Categories

| Badge | Type | Description |
|:---:|:---|:---|
| 💸 | **RUG_PULL** | Took money and stopped development/vanished. |
| 🗑️ | **ASSET_FLIP** | Low-effort game using primarily store assets. |
| ☣️ | **MALICIOUS** | Malware, Crypto miners, or banned by Valve. |
| 🕸️ | **ABANDONWARE** | Early Access with no updates for >1 year. |
| 🤐 | **HOSTILE_DEV** | Legal threats, banning critics, toxicity. |
| 🚧 | **BROKEN_PROMISES** | Features promised (Roadmap/Kickstarter) never delivered. |


## ⚖️ Appeals / Removal Requests

If you believe a developer has been incorrectly listed, or if the situation has changed (e.g. proof of unban, change of ownership, remediation):

1. Go to the [Issues](https://github.com/gbzret4d/steam-dev-filter/issues) tab.
2. Click **New Issue** and select **Removal Request (Appeal)**.
3. Fill out the form with your relationship to the developer, the reason for removal, and **verifiable proof**.
4. Our automated bot will check if the developer is in our database and if your request contains the necessary proof.
5. A maintainer will review the appeal and remove the entry if the evidence is sufficient.

## How to Contribute

This project relies on the community to report bad actors.

- **Found a scammer?** [Submit a Report](https://github.com/gbzret4d/steam-dev-filter/issues/new/choose)
- **Found a mistake?** Open an issue to request a correction.
- **Developer?** Check out [CONTRIBUTING.md](CONTRIBUTING.md) to help with the code.

## Legal Disclaimer

**Not Affiliated with Valve:** This project is a community-driven initiative and is **not** affiliated, associated, authorized, endorsed by, or in any way officially connected with **Valve Corporation** or **Steam**, or any of its subsidiaries or its affiliates. The official Steam website can be found at [http://store.steampowered.com](http://store.steampowered.com).

**No Warranty:** This tool is provided "as is" and represents the opinions and research of the community contributors. The maintainers make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.

**Fair Use:** All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
