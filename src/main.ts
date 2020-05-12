import * as fs from 'fs';

import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 * API endpoint Shields URL base to add our GET queries to.
 */
const BASE_BADGE_URL: string = "https://img.shields.io/static/v1";

/**
 * The path to the file that will be read and replaced.
 */
const TARGET_FILE: string = "README.md";


/**
 * Given a SemVer representation determine the stability string to place in the repository stability badge's contents
 * and a colour.
 *
 * @param tag the SemVer representation as [MAJOR, MINOR, PATCH, INFO]
 * @returns a 2-ary [[Tuple]] of [STABILITY, COLOUR]
 */
function determineStability(tag: [Number, Number, Number, string | null]): [string, string] {
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
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH, INFO]
 */
function formVersionUrl(versionTuple: [Number, Number, Number, string | null]): string {
    return `${BASE_BADGE_URL}?label=latest&message=${versionTuple.join('.')}&color=purple`;
}

/**
 * Form a stability URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH, INFO]
 */
function formStabilityUrl(versionTuple: [Number, Number, Number, string | null]): string {
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
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH, INFO]
 */
function replaceAndWrite(fileContents: string, versionTuple: [Number, Number, Number, string | null]) {
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
                const versionTuple: [Number, Number, Number, string | null] = determineLatestVersion(data.toString());

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
