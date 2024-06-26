/**
 * Application configuration.
 * @module
 */

import dashify from 'dashify'

/**
 * Loads configuration parameter values from specified URL.
 *
 * For now, only boolean flags are supported.
 *
 * To enable a configuration parameter, declare an URL parameter named after the
 * dash-case version of its name. To disable it, prepend 'no-' to its name.
 *
 * @example
 *  config = {
 *    database: true,
 *    urlRewriting: false,
 *  }
 *
 *  // To disable database and enable URL rewriting:
 * '?no-database&url-rewriting'
 *
 * @param {object} config the config to setup values
 * @param {string} the URL to load values from
 */
export function configureFromUrl (config, url) {
  const parameters = new URL(url).searchParams

  for (const name in config) {
    const paramName = dashify(name)

    if (parameters.has(paramName)) {
      config[name] = true
    } else if (parameters.has(`no-${paramName}`)) {
      config[name] = false
    }
  }
}
