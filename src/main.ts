import * as autolib from '@teaminkling/autolib';

/**
 * API endpoint Shields URL base to add our GET queries to.
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
 * The stable release regular expression.
 */
const STABLE_RELEASE_REGEXP: RegExp = /\[stable-release]: (.*)/;

/**
 * The development release regular expression.
 */
const DEVELOPMENT_RELEASE_REGEXP: RegExp = /\[development-release]: (.*)/;

/**
 * Form a version URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH, INFO]
 * @param color the colour of the badge
 */
async function formVersionUrl(versionTuple: autolib.SemVer, color: string): Promise<string> {
    return `${BASE_BADGE_URL}?label=latest&message=${versionTuple.toString()}&color=${color}`;
}

/**
 * Run the Action.
 */
async function run() {
    const latestStableVersion: autolib.SemVer = await autolib.findLatestVersionFromGitTags(true);
    const latestDevelopmentVersion: autolib.SemVer = await autolib.findLatestVersionFromGitTags(false);

    const replacements: Array<autolib.ReplacementMap> = [
        new autolib.ReplacementMap(
            STABLE_RELEASE_REGEXP,
            `[${STABLE_RELEASE_KEY}]: ${formVersionUrl(latestStableVersion, "green")}`
        ),
        new autolib.ReplacementMap(
            DEVELOPMENT_RELEASE_REGEXP,
            `[${DEVELOPMENT_RELEASE_KEY}]: ${formVersionUrl(latestDevelopmentVersion, "purple")}`
        ),
    ];

    autolib.rewriteFileContentsWithReplacements(TARGET_FILE, replacements);
};

run();
