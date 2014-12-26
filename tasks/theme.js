module.exports = function(grunt) {

  /**
   * Define "Compass" tasks.
   *
   * Dynamically adds Compass compile tasks based on configuration sets in the
   * package.json file.
   *
   * Example:
   *
   * "themes": {
   *   "viking": {
   *     "path": "<%= config.srcPaths.drupal %>/themes/viking",
   *     "compass": true
   *   },
   *   "spartan": {
   *     "path": "<%= config.srcPaths.drupal %>/themes/spartan",
   *     "compass": {
   *       "environment": "development",
   *       "sourcemap": true
   *     }
   *   },
   *   "trojan": {
   *     "path": "<%= config.srcPaths.drupal %>/themes/trojan"
   *   }
   * }
   */

  var config = grunt.config.get('config'),
    _ = require('lodash'),
    steps = [],
    parallelTasks = [];

  if (config.themes) {
    grunt.loadNpmTasks('grunt-contrib-compass');
    for (var key in config.themes) {
      if (config.themes.hasOwnProperty(key) && config.themes[key].compass) {
        var theme = config.themes[key],
          options = (theme.compass && typeof theme.compass === 'object') ? theme.compass : {};

        grunt.config(['compass', key], {
          options: _.extend({
            basePath: theme.path,
            config: theme.path + '/config.rb',
            bundleExec: true
          }, options)
        });

        steps.push('compass:' + key);

        // Provide a watch handler
        grunt.config(['watch', 'compass-' + key], {
          files: [
            theme.path + '/**/*.scss'
          ],
          tasks: ['compass:' + key]
        });

        // Add this watch to the parallel watch-theme task
        parallelTasks.push({
          grunt: true,
          args: ['watch:compass-' + key]
        });
      }
    }

    grunt.config(['parallel', 'watch-theme'], {
      options: {
        stream: true
      },
      tasks: parallelTasks
    });

    grunt.registerTask('compile-theme', steps);
    grunt.registerTask('watch-theme', ['parallel:watch-theme']);

    grunt.config('help.compile-theme', {
      group: 'Asset & Code Compilation',
      description: 'Run compilers for the theme, such as Compass.'
    });
    grunt.config('help.watch-theme', {
      group: 'Real-time Tooling',
      description: "Watch for changes that should rebuild frontend assets, such as CSS."
    });
  }
};
