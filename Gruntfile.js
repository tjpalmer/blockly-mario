module.exports = function(grunt) {
  grunt.initConfig({

    // TODO Source maps for typescript and uglify???
    typescript: {
      blockly_mario: {
        options: {base_path: "src"},
        src: ["src/main.ts"],
        dest: "build/blockly-mario.js",
      },
    },

    uglify: {
      blockly_mario: {
        src: ["<%= typescript.blockly_mario.dest %>"],
        dest: "blockly-mario.min.js",
      },
    },

  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-typescript");

  grunt.registerTask('default', ['typescript', 'uglify']);

};
