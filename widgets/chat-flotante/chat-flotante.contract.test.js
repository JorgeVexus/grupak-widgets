"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");

var widgetDirectory = __dirname;
var html = fs.readFileSync(path.join(widgetDirectory, "chat-flotante.html"), "utf8");
var script = fs.readFileSync(path.join(widgetDirectory, "chat-flotante.js"), "utf8");
var states = ["greeting", "main", "contact", "products", "information"];

test("declares the five exact chat views with only greeting initially visible", function () {
    states.forEach(function (state) {
        assert.match(html, new RegExp('data-view="' + state + '"'));
    });

    assert.equal((html.match(/\sdata-view="/g) || []).length, states.length);
    assert.match(html, /data-view="greeting"(?![^>]*\shidden)[^>]*>/);

    states.slice(1).forEach(function (state) {
        assert.match(
            html,
            new RegExp('data-view="' + state + '"[^>]*\\shidden')
        );
    });
});

test("renders required actions and final choices as inert buttons", function () {
    [
        "Cotizar cajas",
        "Hablar con un asesor",
        "Informaci\u00f3n de productos",
        "WhatsApp",
        "Tel\u00e9fono",
        "Papel",
        "Cajas y empaques",
        "L\u00e1mina de cart\u00f3n corrugado",
        "Grabados para impresi\u00f3n",
        "Nuestra historia",
        "Sustentabilidad",
        "Noticias",
        "Contacto"
    ].forEach(function (label) {
        assert.ok(html.includes(label), "Missing action: " + label);
    });

    assert.doesNotMatch(html, /<a\b/i);
    assert.equal(
        (html.match(/<button\b(?=[^>]*\btype="button")(?=[^>]*\bdata-final-action(?:\s|>))/g) || [])
            .length,
        10
    );
    assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}]/u);
});

test("implements the required state, accessibility, keyboard, and focus contract", function () {
    [
        "aria-expanded",
        "aria-hidden",
        "hidden",
        "Escape",
        ".focus()",
        "greeting",
        "main",
        "contact",
        "products",
        "information"
    ].forEach(function (token) {
        assert.ok(script.includes(token), "Missing behavior token: " + token);
    });
});
