import * as fs from 'fs';

import * as core from '@actions/core';
import * as exec from '@actions/exec';

// TODO: Write acceptance tests using an appropriate framework.

/**
 * API endpoint Shields URL base to add our GET queries to.
 */
const BASE_BADGE_URL: string = "https://img.shields.io/static/v1";

/**
 * The path to the file that will be read and replaced.
 */
const TARGET_FILE: string = "README.md";

/**
 * Given an [[Array]] of tags, find the latest SemVer tag and return it.
 *
 * We need to iterate all anyway to ignore all the useless values, so let's not define a comparator.
 *
 * @param tags the tags from which to find the latest SemVer version
 * @returns a SemVer representation as a 3-ary [[Tuple]] of [[Number]]s
 */
function determineLatestVersion(tags: string): [Number, Number, Number] {
    let largestSeen: [Number, Number, Number] = [0, 0, 0];

    tags.split("\n").forEach((tag: string) => {
        if (!tag.match(/.*\d\.\d\.\d.*/)) {
            /* If it's not SemVer (or doesn't contain SemVer), continue. */

            return;
        }

        const semVerParts: Array<string> = tag.split(".");

        const major: Number = parseInt(semVerParts[0]);
        const minor: Number = parseInt(semVerParts[1]);
        const patch: Number = parseInt(semVerParts[2]);

        if (major > largestSeen[0]) {
            /* A bigger major number is found. */

            largestSeen = [major, minor, patch];
        } else if (major == largestSeen[0]) {
            if (minor > largestSeen[1] || minor == largestSeen[1] && patch > largestSeen[2]) {
                /* Major is the same. Minor is larger or the same and the patch is greater. */

                largestSeen = [major, minor, patch];
            }
        }
    });

    return largestSeen;
}

/**
 * Given a SemVer representation determine the stability string to place in the repository stability badge's contents
 * and a colour.
 *
 * @param tag 3-ary [[Tuple]] of [[Number]]s, SemVer representation as [MAJOR, MINOR, PATCH]
 * @returns a 2-ary [[Tuple]] of [STABILITY, COLOUR]
 */
function determineStability(tag: [Number, Number, Number]): [string, string] {
    if (tag[0] > 0) {
        return ["stable", "green"];
    } else if (tag[1] > 0) {
        return ["prerelease", "yellow"];
    }

    return ["unusable", "red"];
}

/**
 * Form a version URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function formVersionUrl(versionTuple: [Number, Number, Number]): string {
    return `${BASE_BADGE_URL}?label=latest&message=${versionTuple.join('.')}&color=purple`;
}

/**
 * Form a stability URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function formStabilityUrl(versionTuple: [Number, Number, Number]): string {
    const stabilityTuple = determineStability(versionTuple);
    const stabilityString = stabilityTuple[0];
    const stabilityColour = stabilityTuple[1];

    return `${BASE_BADGE_URL}?label=stability&message=${stabilityString}&color=${stabilityColour}`;
}

/**
 * Read the target file, read it, and return a [[string]] representation of the file.
 *
 * @returns the file's contents
 */
function readFileContents(): string {
    let fileContents: string = fs.existsSync(TARGET_FILE) ? fs.readFileSync(TARGET_FILE).toString() : "";

    if (fileContents == "") {
        core.warning(`${TARGET_FILE} is empty!`);
    }

    return fileContents;
}

/**
 * Perform the substituation and writing of the target file.
 *
 * @param fileContents the existing contents of the file
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function replaceAndWrite(fileContents: string, versionTuple: [Number, Number, Number]) {
    /* Perform the replacement and write the file. */

    const replacements: Array<[RegExp, string]> = [
        [/\[release-stability]: (.*)/, `[release-stability]: ${formVersionUrl(versionTuple)}`],
        [/\[latest-release]: (.*)/, `[latest-release]: ${formStabilityUrl(versionTuple)}`],
    ];

    for (const replacementTuple of replacements) {
        fileContents = fileContents.replace(replacementTuple[0], replacementTuple[1]);
    }

    fs.writeFile(TARGET_FILE, fileContents, () => {
        core.info("File successfully saved!");
    });
}

/**
 * Run the Action.
 */
async function run() {
    await exec.exec('git fetch --tags');
    await exec.exec('git tag', [], {
        listeners: {
            stdout: (data: Buffer) => {
                const versionTuple: [Number, Number, Number] = determineLatestVersion(data.toString())
                core.info(`Largest seen tag was: ${versionTuple.toString().replace(",", ".")}`);

                replaceAndWrite(readFileContents(), versionTuple);
            },
            stderr: (data: Buffer) => {
                core.error(data.toString());
            },
        }
    });
};

run();
