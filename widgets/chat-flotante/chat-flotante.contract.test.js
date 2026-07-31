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
var styles = fs.readFileSync(path.join(widgetDirectory, "chat-flotante.css"), "utf8");

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

async function createHarness(location, options) {
    options = options || {};
    var rootMarkup = options.withRoot === false ? "" : "<div id=\"gpk-floating-chat-root\"></div>";
    var scriptSrc = options.scriptSrc || "http://localhost/widgets/chat-flotante/chat-flotante.js";
    var dom = parseHTML("<!doctype html><html><head><script src=\"" + scriptSrc + "\"></script></head><body>" + rootMarkup + "</body></html>");
    var window = dom.window;
    var runtimeWindow = Object.create(window);
    var document = window.document;
    var activeElement = document.body;
    Object.defineProperty(document, "activeElement", {
        configurable: true,
        get: function () { return activeElement; }
    });
    window.HTMLElement.prototype.focus = function () {
        activeElement = this;
    };
    Object.defineProperty(runtimeWindow, "location", {
        value: location || { hostname: "localhost", protocol: "http:" }
    });
    Object.defineProperty(runtimeWindow, "gpkFloatingChatRuntime", {
        configurable: true,
        writable: true,
        value: null
    });
    Object.defineProperty(runtimeWindow, "gpkFloatingChatController", {
        configurable: true,
        writable: true,
        value: null
    });
    Object.defineProperty(document, "currentScript", {
        configurable: true,
        value: { src: scriptSrc }
    });
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
        console: options.silentErrors ? { error: function () {} } : console,
        document: document,
        fetch: function () {
            fetchCount += 1;
            if (options.fetchRejects) return Promise.reject(new Error("Network error"));
            if (options.fetchStatus) {
                return Promise.resolve({
                    ok: false,
                    status: options.fetchStatus,
                    text: function () { return Promise.resolve(""); }
                });
            }
            return Promise.resolve({ ok: true, text: function () { return Promise.resolve(html); } });
        },
        MutationObserver: window.MutationObserver,
        URL: URL,
        setTimeout: setTimeout,
        window: runtimeWindow
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
        root: function () { return document.getElementById("gpk-floating-chat-root"); },
        runScript: runScript,
        window: runtimeWindow
    };
}

test("renders the complete five-view specification with inert final choices", async function () {
    var app = await createHarness();
    var document = app.document;
    var mainActions = Array.from(document.querySelectorAll('[data-view="main"] .gpk-chat__option'));
    var viewNames = Array.from(document.querySelectorAll("[data-view]")).map(function (view) {
        return view.getAttribute("data-view");
    });
    var renderedText = document.body.textContent;

    assert.deepEqual(viewNames, ["greeting", "main", "contact", "products", "information"]);
    assert.deepEqual(visibleViews(document), ["greeting"]);
    assert.equal(mainActions.length, 3);
    assert.deepEqual(mainActions.map(function (action) {
        return action.querySelector("strong").textContent;
    }), [
        "Cotizar cajas",
        "Hablar con un asesor",
        "Información de productos"
    ]);
    var informationFooter = document.querySelector('.gpk-chat__footer [data-action="information"]');
    assert.ok(informationFooter);
    assert.equal(informationFooter.tagName, "BUTTON");
    assert.equal(informationFooter.getAttribute("type"), "button");
    assert.ok(document.querySelector('[data-view="information"]'));
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

test("loads and safely crops the footer portrait as the header avatar", async function () {
    var app = await createHarness();
    var avatar = app.document.querySelector("[data-gpk-chat-avatar]");

    assert.ok(avatar);
    assert.equal(avatar.tagName, "IMG");
    assert.match(
        avatar.getAttribute("src"),
        /^http:\/\/localhost\/widgets\/chat-flotante\/Images\/valeria\.webp\?v=/
    );
    assert.match(styles, /\.gpk-chat__avatar\s*\{[^}]*overflow:\s*hidden;/s);
    assert.match(styles, /\.gpk-chat__avatar\s*\{[^}]*pointer-events:\s*none;/s);
    assert.match(styles, /\.gpk-chat__avatar img\s*\{[^}]*pointer-events:\s*none;/s);

    var productionApp = await createHarness({
        hostname: "www.grupak.com",
        protocol: "https:"
    });
    var productionAvatar = productionApp.document.querySelector("[data-gpk-chat-avatar]");
    assert.match(
        productionAvatar.getAttribute("src"),
        /^https:\/\/grupak-widgets\.vercel\.app\/widgets\/chat-flotante\/Images\/valeria\.webp\?v=/
    );
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

    click(app.window, document.querySelector('[data-action="information"]'));
    assert.deepEqual(visibleViews(document), ["information"]);
    assert.equal(document.activeElement, document.querySelector('[data-view="information"] .gpk-chat__back'));

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
    assert.equal(app.root().getAttribute("data-gpk-chat-ready"), "true");

    await app.runScript();
    assert.equal(app.fetchCount(), 1);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.root().querySelectorAll("[data-gpk-chat-widget]").length, 1);

    app.root().innerHTML = "";
    await flushPromises();
    await flushPromises();
    assert.equal(app.fetchCount(), 2);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.root().querySelectorAll("[data-gpk-chat-widget]").length, 1);
});

test("mounts a late root and replaces its controller without reexecuting the script", async function () {
    var app = await createHarness(undefined, { withRoot: false });
    var document = app.document;
    var lateRoot = document.createElement("div");
    lateRoot.id = "gpk-floating-chat-root";
    document.body.appendChild(lateRoot);
    await flushPromises();
    await flushPromises();

    assert.equal(app.fetchCount(), 1);
    assert.equal(lateRoot.querySelectorAll("[data-gpk-chat-widget]").length, 1);
    assert.equal(app.keydownCount(), 1);

    var currentRoot = document.createElement("div");
    currentRoot.id = "gpk-floating-chat-root";
    lateRoot.replaceWith(currentRoot);
    await flushPromises();
    await flushPromises();

    assert.equal(app.fetchCount(), 2);
    assert.equal(currentRoot.querySelectorAll("[data-gpk-chat-widget]").length, 1);
    assert.equal(app.keydownCount(), 1);
    assert.equal(app.window.gpkFloatingChatController.root, currentRoot);
});

test("resolves preview assets from the script URL", async function () {
    var app = await createHarness(
        { hostname: "localhost", protocol: "http:" },
        { scriptSrc: "http://localhost:8026/subruta/widgets/chat-flotante/chat-flotante.js" }
    );
    var stylesheet = app.document.getElementById("gpk-floating-chat-styles");
    var avatar = app.document.querySelector("[data-gpk-chat-avatar]");

    assert.match(stylesheet.href, /^http:\/\/localhost:8026\/subruta\/widgets\/chat-flotante\/chat-flotante\.css\?v=/);
    assert.match(avatar.src, /^http:\/\/localhost:8026\/subruta\/widgets\/chat-flotante\/Images\/valeria\.webp\?v=/);
});

test("keeps a failed fetch terminal until an explicit script retry", async function () {
    var app = await createHarness(undefined, { fetchStatus: 404, silentErrors: true });
    var root = app.root();

    await flushPromises();
    await flushPromises();
    assert.equal(app.fetchCount(), 1);
    assert.equal(root.getAttribute("data-gpk-chat-ready"), "error");
    assert.equal(root.hasAttribute("data-gpk-chat-loading"), false);
    assert.match(root.textContent, /No fue posible cargar el chat/);

    root.appendChild(app.document.createElement("span"));
    await flushPromises();
    await flushPromises();
    await flushPromises();

    assert.equal(app.fetchCount(), 1);
    assert.equal(root.getAttribute("data-gpk-chat-ready"), "error");
    assert.match(root.textContent, /No fue posible cargar el chat/);

    await app.runScript();
    assert.equal(app.fetchCount(), 2);
    assert.equal(root.getAttribute("data-gpk-chat-ready"), "error");
    assert.equal(root.hasAttribute("data-gpk-chat-loading"), false);
});
