module.exports = (api) => {
  // Cache configuration is a required option
  api.cache(false);

  const presets = [
    [
      "@babel/preset-env",
      {
        useBuiltIns: false,
      },
    ],
  ];

  const plugins = ["istanbul"];
  return { presets, plugins };
};
