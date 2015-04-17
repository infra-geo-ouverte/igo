/*global describe: true, env: true, expect: true, it: true, jasmine: true */
describe("railsTemplate plugin", function() {
    var parser = jasmine.createParser();
    var path = require('jsdoc/path');

    var pluginPath = path.join(env.dirname, 'plugins/railsTemplate');
    var plugin = require(pluginPath);

    require('jsdoc/plugins').installPlugins([pluginPath], parser);
    require('jsdoc/src/handlers').attachTo(parser);

    it("should remove <% %> rails template tags from the source of *.erb files", function() {
        var docSet = parser.parse([path.join(env.dirname, "plugins/test/fixtures/railsTemplate.js.erb")]);

        expect(docSet[2].description).toEqual("Remove rails tags from the source input (e.g. )");
    });
});