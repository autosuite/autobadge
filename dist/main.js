"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
/**
 * Read the target file, read it, and return a [[string]] representation of the file.
 *
 * @returns the file's contents
 */
function readFileContents() {
    var fileContents = fs.existsSync(TARGET_FILE) ? fs.readFileSync(TARGET_FILE).toString() : "";
    if (fileContents == "") {
        core.warning(TARGET_FILE + " is empty!");
    }
    return fileContents;
}
/**
 * Perform the substituation and writing of the target file.
 *
 * @param fileContents the existing contents of the file
 * @param versionTuple the SemVer representation as [MAJOR, MINOR, PATCH]
 */
function replaceAndWrite(fileContents, versionTuple) {
    /* Perform the replacement and write the file. */
    var replacements = [
        [/\[release-stability]: (.*)/, "[release-stability]: " + formVersionUrl(versionTuple)],
        [/\[latest-release]: (.*)/, "[latest-release]: " + formStabilityUrl(versionTuple)],
    ];
    for (var _i = 0, replacements_1 = replacements; _i < replacements_1.length; _i++) {
        var replacementTuple = replacements_1[_i];
        fileContents = fileContents.replace(replacementTuple[0], replacementTuple[1]);
    }
    fs.writeFile(TARGET_FILE, fileContents, function () {
        core.info("File successfully saved!");
    });
}
/**
 * Run the Action.
 */
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exec.exec('git fetch --tags')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, exec.exec('git tag', [], {
                            listeners: {
                                stdout: function (data) {
                                    var versionTuple = determineLatestVersion(data.toString());
                                    core.info("Largest seen tag was: " + versionTuple.toString().replace(",", "."));
                                    replaceAndWrite(readFileContents(), versionTuple);
                                },
                                stderr: function (data) {
                                    core.error(data.toString());
                                },
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
;
run();
