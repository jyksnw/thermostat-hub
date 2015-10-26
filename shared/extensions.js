/**
 * Created by jasonsnow on 10/23/15.
 */

/**
 * Checks if a strings ends with the given suffix
 * @param suffix - The suffix to look for
 * @returns {boolean} - true if string ends with suffix, otherwise false
 */
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * Extracts the string value between the start token and end token
 * @param startToken
 * @param endToken
 * @returns the value between the start and end tokens or returns null
 */
String.prototype.extractString = function (startToken, endToken) {
    if (!this) {
        return null;
    }

    var idx = this.indexOf(startToken);
    if (idx < 0) {
        return null;
    }

    var endIdx = this.indexOf(endToken);
    if (endIdx < 0) {
        return null;
    }

    return this.substring(idx + startToken.length, endIdx);
};