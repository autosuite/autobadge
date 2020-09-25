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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var replace_in_file_1 = __importDefault(require("replace-in-file"));
var autolib = __importStar(require("@teaminkling/autolib"));
/**
 * API endpoint Shields URL base to which the Action sends GET queries.
 */
var BASE_BADGE_URL = "https://img.shields.io/static/v1";
/**
 * The path to the file that will be read and replaced.
 */
var TARGET_FILE = "README.md";
/**
 * The key to find in the stable release regular expression.
 */
var STABLE_RELEASE_KEY = "stable-release";
/**
 * The key to find in the development release regular expression.
 */
var DEVELOPMENT_RELEASE_KEY = "development-release";
/**
 * The stable release regular expression. Targets only first occurrence.
 */
var STABLE_RELEASE_REGEXP = /\[stable-release]: (.*)/;
/**
 * The development release regular expression. Targets only first occurrence.
 */
var DEVELOPMENT_RELEASE_REGEXP = /\[development-release]: (.*)/;
/**
 * Form a version URL from the SemVer representation.
 *
 * @param version The version string.
 * @param color The text for the colour of the badge.
 */
function formVersionUrl(version, color) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, BASE_BADGE_URL + "?label=latest&message=" + version + "&color=" + color];
        });
    });
}
/**
 * Run the Action.
 */
function runAction() {
    return __awaiter(this, void 0, void 0, function () {
        var latestStableVersion, latestDevelopmentVersion, _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, autolib.findLatestVersionFromGitTags(true)];
                case 1:
                    latestStableVersion = _g.sent();
                    return [4 /*yield*/, autolib.findLatestVersionFromGitTags(false)];
                case 2:
                    latestDevelopmentVersion = _g.sent();
                    _b = (_a = replace_in_file_1.default).sync;
                    _c = {
                        files: TARGET_FILE,
                        from: [STABLE_RELEASE_REGEXP, DEVELOPMENT_RELEASE_REGEXP]
                    };
                    _d = "[" + STABLE_RELEASE_KEY + "]: ";
                    return [4 /*yield*/, formVersionUrl(latestStableVersion, "green")];
                case 3:
                    _e = [
                        _d + (_g.sent())
                    ];
                    _f = "[" + DEVELOPMENT_RELEASE_KEY + "]: ";
                    return [4 /*yield*/, formVersionUrl(latestDevelopmentVersion, "purple")];
                case 4:
                    _b.apply(_a, [(_c.to = _e.concat([
                            _f + (_g.sent())
                        ]),
                            _c)]);
                    return [2 /*return*/];
            }
        });
    });
}
var actionRunner = runAction();
/* Promise handlers. */
actionRunner.then(function () { });
