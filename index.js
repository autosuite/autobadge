const exec = require('@actions/exec');
const core = require('@actions/core');

const fs = require('fs');
const path = process.cwd();

// TODO: Rewrite entire module in Typescript for the next major release.
// TODO: Write acceptance tests using an appropriate framework.
// TODO: Adopt more of the Autosuite.
// TODO: Use more of the official modules provided by GitHub.
// TODO: Allow controlling badged file.

/**
 * API endpoint Shields URL base to add our GET queries to.
 */
const BASE_BADGE_URL = "https://img.shields.io/static/v1";

/**
 * Comparator: given an array of tags, find the latest SemVer tag and return it.
 *
 * @param array tags the tags to find the latest SemVer version from
 */
async function determineLatestVersion(tags) {
    /* We need to iterate all anyway to ignore all the useless values, so let's not define a comparator. */

    let largestSeen = [0, 0, 0];

    core.info("Tags found: " + tags);

    tags.split("\n").forEach(tag => {
        /* If it's not SemVer (or doesn't contain SemVer), continue. */

        if (!tag.match(/.*\d\.\d\.\d.*/)) {
            return;
        }

        const segmentedSemVer = tag.split(".");

        const major = parseInt(segmentedSemVer[0]);
        const minor = parseInt(segmentedSemVer[1]);
        const patch = parseInt(segmentedSemVer[2]);

        if (major > largestSeen[0]) {
            largestSeen = [major, minor, patch];
        } else if (major == largestSeen[0]) {
            if (minor > largestSeen[1] || minor == largestSeen[1] && patch > largestSeen[2]) {
                largestSeen = [major, minor, patch];
            }
        }
    });

    core.info("Largest seen tag was: " + largestSeen.toString().replace(",", "."));

    return largestSeen;
}

/**
 * Given a 3-ary array of ints as a SemVer representation, determine the stability string to place in the repository
 * stability badge's contents and a colour.
 *
 * @param array tag 3-ary array of ints, SemVer representation as [MAJOR, MINOR, PATCH]
 */
async function determineStability(tag) {
    if (tag[0] > 0) {
        return ["stable", "green"];
    } else if (tag[1] > 0) {
        return ["prerelease", "yellow"];
    }

    return ["unusable", "red"];
}

exec.exec('git fetch');
exec.exec('git tag', [], {
    stdout: (data) => {
        const versionArray = determineLatestVersion(data.toString());
        const stabilityArray = determineStability(versionArray);
        const stabilityString = stabilityArray[0];
        const stabilityColour = stabilityArray[1];

        /* Build the URLs. */

        const stabilityUrl = BASE_BADGE_URL + "?label=stability&message=" + stabilityString +
            "&color=" + stabilityColour;
        const versionUrl = BASE_BADGE_URL + "?label=latest&message=" + versionArray.join('.') +
            "&color=purple";

        /* Place them in the README.md file using sed. */

        const absPath = path + "/README.md";
        const existingContents = fs.existsSync(absPath) ?
            fs.readFileSync(absPath).toString() : "";

        newContents = existingContents.replace(
            /\[release-stability]: (.*)/,
            "[release-stability]: " + stabilityUrl
        ).replace(
            /\[latest-release]: (.*)/,
            "[latest-release]: " + versionUrl
        );

        core.info("Writing changes, if there are any.");

        fs.writeFileSync(absPath, newContents);
    },
    stderr: (data) => {
        core.error(data.toString());
    },
});
