import jetEnv, { num, str } from 'jet-env';
import { isEnumVal } from 'jet-validators';

import { NodeEnvs } from '.';


/******************************************************************************
                                 Setup
******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  JwtSecret: str,
  JwtExpiration: str,
  // Add other environment variables as needed
});

// Set default values for development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  ENV.JwtSecret = ENV.JwtSecret || 'your-dev-secret-key'; // Never use this in production!
  ENV.JwtExpiration = ENV.JwtExpiration || '1h'; // 1 hour expiration for dev
}


// Set default values for development
if (ENV.NodeEnv === NodeEnvs.Test) {
  ENV.Port = ENV.Port || 4000;
  ENV.JwtSecret = ENV.JwtSecret || 'your-dev-secret-key'; // Never use this in production!
  ENV.JwtExpiration = ENV.JwtExpiration || '1h'; // 1 hour expiration for dev
}
/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;