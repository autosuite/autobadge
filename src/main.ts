import replace from 'replace-in-file';

import * as autolib from '@teaminkling/autolib';

/**
 * API endpoint Shields URL base to which the Action sends GET queries.
 */
const BASE_BADGE_URL: string = "https://img.shields.io/static/v1";

/**
 * The path to the file that will be read and replaced.
 */
const TARGET_FILE: string = "README.md";

/**
 * The key to find in the stable release regular expression.
 */
const STABLE_RELEASE_KEY: string = "stable-release";

/**
 * The key to find in the development release regular expression.
 */
const DEVELOPMENT_RELEASE_KEY: string = "development-release";

/**
 * The stable release regular expression. Targets only first occurrence.
 */
const STABLE_RELEASE_REGEXP: RegExp = /\[stable-release]: (.*)/;

/**
 * The development release regular expression. Targets only first occurrence.
 */
const DEVELOPMENT_RELEASE_REGEXP: RegExp = /\[development-release]: (.*)/;

/**
 * Form a version URL from the SemVer representation.
 *
 * @param version The version string.
 * @param color The text for the colour of the badge.
 */
async function formVersionUrl(version: string, color: string): Promise<string> {
    return `${BASE_BADGE_URL}?label=latest&message=${version}&color=${color}`;
}

/**
 * Run the Action.
 */
async function runAction() {
    const latestStableVersion: string = await autolib.findLatestVersionFromGitTags(true);
    const latestDevelopmentVersion: string = await autolib.findLatestVersionFromGitTags(false);

    replace.sync({
        files: TARGET_FILE,
        from: [STABLE_RELEASE_REGEXP, DEVELOPMENT_RELEASE_REGEXP],
        to: [
            `[${STABLE_RELEASE_KEY}]: ${await formVersionUrl(latestStableVersion, "green")}`,
            `[${DEVELOPMENT_RELEASE_KEY}]: ${await formVersionUrl(latestDevelopmentVersion, "purple")}`
        ],
    });
}

const actionRunner: Promise<void> = runAction();

/* Promise handlers. */

actionRunner.then(() => {});
