"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var core = __importStar(require("@actions/core"));
var exec = __importStar(require("@actions/exec"));
// TODO: Write acceptance tests using an appropriate framework.
// TODO: Adopt more of the Autosuite.
/**
 * API endpoint Shields URL base to add our GET queries to.
 */
var BASE_BADGE_URL = "https://img.shields.io/static/v1";
/**
 * The path to the file that will be read and replaced.
 */
var TARGET_FILE = "README.md";
/**
 * Given an [[Array]] of tags, find the latest SemVer tag and return it.
 *
 * We need to iterate all anyway to ignore all the useless values, so let's not define a comparator.
 *
 * @param tags the tags from which to find the latest SemVer version
 * @returns a SemVer representation as a 3-ary [[Tuple]] of [[Number]]s
 */
function determineLatestVersion(tags) {
    var largestSeen = [0, 0, 0];
    tags.split("\n").forEach(function (tag) {
        if (!tag.match(/.*\d\.\d\.\d.*/)) {
            /* If it's not SemVer (or doesn't contain SemVer), continue. */
            return;
        }
        var semVerParts = tag.split(".");
        var major = parseInt(semVerParts[0]);
        var minor = parseInt(semVerParts[1]);
        var patch = parseInt(semVerParts[2]);
        if (major > largestSeen[0]) {
            /* A bigger major number is found. */
            largestSeen = [major, minor, patch];
        }
        else if (major == largestSeen[0]) {
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
function determineStability(tag) {
    if (tag[0] > 0) {
        return ["stable", "green"];
    }
    else if (tag[1] > 0) {
        return ["prerelease", "yellow"];
    }
    return ["unusable", "red"];
}
/**
 * Form a version URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function formVersionUrl(versionTuple) {
    return BASE_BADGE_URL + "?label=latest&message=" + versionTuple.join('.') + "&color=purple";
}
/**
 * Form a stability URL from the SemVer representation.
 *
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function formStabilityUrl(versionTuple) {
    var stabilityTuple = determineStability(versionTuple);
    var stabilityString = stabilityTuple[0];
    var stabilityColour = stabilityTuple[1];
    return BASE_BADGE_URL + "?label=stability&message=" + stabilityString + "&color=" + stabilityColour;
}
exec.exec('git fetch');
exec.exec('git tag', [], {
    listeners: {
        stdout: function (data) {
            /* Read the file. */
            var fileContents = "";
            fs.access(TARGET_FILE, function () {
                fs.readFile(TARGET_FILE, function (_, data) {
                    fileContents += data.toString();
                });
            });
            /* Find the latest version. */
            var versionTuple = determineLatestVersion(data.toString());
            core.info("Largest seen tag was: " + versionTuple.toString().replace(",", "."));
            /* Perform the replacement and write the file. */
            var replacements = [
                [/\[release-stability]: (.*)/, "[release-stability]: " + formVersionUrl(versionTuple)],
                [/\[latest-release]: (.*)/, "[latest-release]: " + formStabilityUrl(versionTuple)],
            ];
            replacements.forEach(function (replacementTuple) {
                fileContents = fileContents.replace(replacementTuple[0], replacementTuple[1]);
            });
            fs.writeFile(TARGET_FILE, fileContents, function () {
                core.info("File successfully saved!");
            });
        },
        stderr: function (data) {
            core.error(data.toString());
        },
    }
});
