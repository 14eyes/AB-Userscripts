module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "greasemonkey": true,
    },
    "parserOptions": {
        "ecmaVersion": 6
    },
    "globals": {
        "delicious": false
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-unused-vars": [
            0
        ],
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
        ],
        "no-cond-assign": [
            1
        ],
        "no-useless-escape":[
            1
        ]
    },
    "globals": {
        "delicious": true,
        "importDeliciousCommon": true,
        "injectScript": true,
        "$j": true,
        "$": true,
        "jQuery": true,
        "_debug": true,
        "XPCNativeWrapper":true
    }
};