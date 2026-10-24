import type { Configuration } from 'webpack';
import webpack from 'webpack';
import { merge } from 'webpack-merge';

import grafanaConfig, { type Env } from './.config/webpack/webpack.config';

/**
 * create-plugin SWC emits classic JSX (React.createElement) without importing React.
 * Grafana provides React as an AMD external — inject the identifier so panels load.
 */
const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    plugins: [
      new webpack.ProvidePlugin({
        React: 'react',
      }),
    ],
  });
};

export default config;
