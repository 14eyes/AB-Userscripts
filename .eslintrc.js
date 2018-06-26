module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 6
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "off",
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": [
            "off"
        ]
    },
    "globals": {
        "GM_getValue": true,
        "GM_setValue": true,
        "initGM": true,
        "importDeliciousCommon": true
    }
};