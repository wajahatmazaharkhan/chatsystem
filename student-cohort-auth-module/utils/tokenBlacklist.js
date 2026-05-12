// utils/tokenBlacklist.js
let blacklistedTokens = [];

function addToBlacklist(token) {
    blacklistedTokens.push(token);
}

function isBlacklisted(token) {
    return blacklistedTokens.includes(token);
}

function removeFromBlacklist(token) {
    const index = blacklistedTokens.indexOf(token);
    if (index > -1) {
        blacklistedTokens.splice(index, 1);
    }
}

module.exports = { addToBlacklist, isBlacklisted, removeFromBlacklist };