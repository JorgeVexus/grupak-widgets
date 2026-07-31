"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");

var directory = __dirname;
var html = fs.readFileSync(path.join(directory, "formulario.html"), "utf8");
var styles = fs.readFileSync(path.join(directory, "formulario.css"), "utf8");
var script = fs.readFileSync(path.join(directory, "formulario.js"), "utf8");

test("starts with three choices and no active form", function () {
    assert.doesNotMatch(html, />Formularios Grupak</);
    assert.doesNotMatch(html, /¿Qué deseas hacer\?/);
    assert.match(html, /Selecciona una opción para mostrar el formulario correspondiente\./);
    assert.equal((html.match(/class="gpk-form-tab"/g) || []).length, 3);
    assert.doesNotMatch(html, /gpk-form-tab is-active/);
    assert.doesNotMatch(html, /gpk-form-panel is-active/);
});

test("uses the approved labels and descriptions", function () {
    assert.match(html, />Solicitar cotización</);
    assert.match(html, /Productos y soluciones/);
    assert.match(html, /Registro comercial/);
    assert.match(html, /Talento y vacantes/);
});

test("defines selected, responsive, focus and reduced-motion states", function () {
    assert.match(styles, /\.gpk-form-tabs\.has-selection/);
    assert.match(styles, /\.gpk-form-tab:focus-visible/);
    assert.match(styles, /@media \(max-width: 719px\)[\s\S]*grid-template-columns: 1fr/);
    assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("compacts only after a valid selection and scrolls to the panel", function () {
    assert.match(script, /if \(!found\) return false;[\s\S]*classList\.add\("has-selection"\)/);
    assert.match(script, /activePanel\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
});
