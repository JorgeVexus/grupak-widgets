"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");
var vm = require("node:vm");
var parseHTML = require("linkedom").parseHTML;

var widgetDirectory = __dirname;
var html = fs.readFileSync(path.join(widgetDirectory, "chat-flotante.html"), "utf8");
var script = fs.readFileSync(path.join(widgetDirectory, "chat-flotante.js"), "utf8");

function flushPromises() {
    return new Promise(function (resolve) { setImmediate(resolve); });
}

function click(window, element) {
    element.dispatchEvent(new window.Event("click", { bubbles: true }));
}

function escape(window, document) {
    var event = new window.Event("keydown", { bubbles: true });
    Object.defineProperty(event, "key", { value: "Escape" });
    document.dispatchEvent(event);
}

function visibleViews(document) {
    return Array.from(document.querySelectorAll("[data-view]"))
        .filter(function (view) { return !view.hidden; })
        .map(function (view) { return view.getAttribute("data-view"); });
}

async function createHarness() {
    var dom = parseHTML("<!doctype html><html><head></head><body><div id=\"gpk-floating-chat-root\"></div></body></html>");
    var window = dom.window;
    var document = window.document;
    var activeElement = document.body;
    Object.defineProperty(document, "activeElement", {
        configurable: true,
        get: function () { return activeElement; }
    });
    window.HTMLElement.prototype.focus = function () {
        activeElement = this;
    };
    if (!window.location) {
        Object.defineProperty(window, "location", {
            value: { hostname: "localhost", protocol: "http:" }
        });
    }
    var fetchCount = 0;
    var keydownListeners = new Set();
    var originalAdd = document.addEventListener.bind(document);
    var originalRemove = document.removeEventListener.bind(document);

    document.addEventListener = function (type, listener, options) {
        if (type === "keydown") keydownListeners.add(listener);
        return originalAdd(type, listener, options);
    };
    document.removeEventListener = function (type, listener, options) {
        if (type === "keydown") keydownListeners.delete(listener);
        return originalRemove(type, listener, options);
    };

    var context = vm.createContext({
        console: console,
        document: document,
        fetch: function () {
            fetchCount += 1;
            return Promise.resolve({ ok: true, text: function () { return Promise.resolve(html); } });
        },
        setTimeout: setTimeout,
        window: window
    });

    function runScript() {
        vm.runInContext(script, context);
        return flushPromises().then(flushPromises);
    }

    await runScript();
    return {
        document: document,
        fetchCount: function () { return fetchCount; },
        keydownCount: function () { return keydownListeners.size; },
        root: document.getElementById("gpk-floating-chat-root"),
        runScript: runScript,
        window: window
    };
}

test("renders the complete five-view specification with inert final choices", async function () {
    var app = await createHarness();
    var document = app.document;
    var viewNames = Array.from(document.querySelectorAll("[data-view]")).map(function (view) {
        return view.getAttribute("data-view");
    });
    var renderedText = document.body.textContent;

    assert.deepEqual(viewNames, ["greeting", "main", "contact", "products", "information"]);
    assert.deepEqual(visibleViews(document), ["greeting"]);
    [
        "Cotizar cajas",
        "Hablar con un asesor",
        "Información de productos",
        "WhatsApp",
        "Teléfono",
        "Papel",
        "Cajas y empaques",
        "Lámina de cartón corrugado",
        "Grabados para impresión",
        "Nuestra historia",
        "Sustentabilidad",
        "Noticias",
        "Contacto"
    ].forEach(function (label) {
        assert.ok(renderedText.includes(label), "Missing action: " + label);
    });
    assert.equal(document.querySelectorAll("a").length, 0);
    assert.equal(document.querySelectorAll("button[type=\"button\"][data-final-action]").length, 10);
    assert.doesNotMatch(renderedText, /[\u{1F300}-\u{1FAFF}]/u);
});

test("supports the complete accessible navigation contract", { timeout: 2000 }, async function () {
    var app = await createHarness();
    var document = app.document;
    var launcher = document.querySelector("[data-gpk-chat-launcher]");
    var panel = document.querySelector("[data-gpk-chat-panel]");

    assert.equal(panel.hidden, true);
    assert.equal(panel.getAttribute("aria-hidden"), "true");
    assert.equal(launcher.getAttribute("aria-expanded"), "false");

    click(app.window, launcher);
    assert.deepEqual(visibleViews(document), ["greeting"]);
    assert.equal(panel.hidden, false);
    assert.equal(panel.getAttribute("aria-hidden"), "false");
    assert.equal(launcher.getAttribute("aria-expanded"), "true");
    assert.equal(document.activeElement, document.querySelector("[data-gpk-chat-close]"));

    click(app.window, document.querySelector('[data-view="greeting"] [data-action="main"]'));
    assert.deepEqual(visibleViews(document), ["main"]);
    assert.equal(document.activeElement, document.querySelector('[data-view="main"] [data-action]'));

    click(app.window, document.querySelector('[data-view="main"] [data-action="products"]'));
    assert.deepEqual(visibleViews(document), ["products"]);
    assert.equal(document.activeElement, document.querySelector('[data-view="products"] .gpk-chat__back'));

    Array.from(document.querySelectorAll("[data-final-action]")).forEach(function (finalButton) {
        var stateBeforeFinal = document.querySelector("[data-gpk-chat-widget]").getAttribute("data-state");
        click(app.window, finalButton);
        assert.equal(document.querySelector("[data-gpk-chat-widget]").getAttribute("data-state"), stateBeforeFinal);
        assert.deepEqual(visibleViews(document), ["products"]);
    });

    click(app.window, document.querySelector('[data-view="products"] .gpk-chat__back'));
    assert.deepEqual(visibleViews(document), ["main"]);
    assert.equal(document.activeElement, document.querySelector('[data-view="main"] [data-action]'));

    escape(app.window, document);
    assert.equal(panel.hidden, true);
    assert.equal(panel.getAttribute("aria-hidden"), "true");
    assert.equal(launcher.getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, launcher);

    click(app.window, launcher);
    click(app.window, document.querySelector("[data-gpk-chat-close]"));
    assert.equal(panel.hidden, true);
    assert.equal(document.activeElement, launcher);
});

test("mounting is idempotent and SPA reinitialization cleans global listeners", { timeout: 2000 }, async function () {
    var app = await createHarness();

    assert.equal(app.fetchCount(), 1);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.root.getAttribute("data-gpk-chat-ready"), "true");

    await app.runScript();
    assert.equal(app.fetchCount(), 1);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.root.querySelectorAll("[data-gpk-chat-widget]").length, 1);

    app.root.innerHTML = "";
    await app.runScript();
    assert.equal(app.fetchCount(), 2);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.root.querySelectorAll("[data-gpk-chat-widget]").length, 1);
});
