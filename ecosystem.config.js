module.exports = {
    apps: [
      {
        name: 'backend',
        script: './main.js', // Ruta al archivo principal de tu aplicación
        env: {
          NODE_ENV: 'development',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  