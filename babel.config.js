module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'babel-plugin-transform-inline-environment-variables',
                {
                    include: ['EXPO_ROUTER_APP_ROOT'],
                },
            ],
        ],
    };
};