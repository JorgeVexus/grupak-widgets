(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";

    var baseURL = isLocalhost
        ? "widgets/formulario"
        : "https://grupak-widgets.vercel.app/widgets/formulario";

    var CFG = {
        contacto: "https://formspree.io/f/TU_ID_CONTACTO",
        proveedor: "https://formspree.io/f/TU_ID_PROVEEDOR"
    };

    var MX_STATES = "Aguascalientes,Baja California,Baja California Sur,Campeche,Chiapas,Chihuahua,Ciudad de Mexico,Coahuila,Colima,Durango,Estado de Mexico,Guanajuato,Guerrero,Hidalgo,Jalisco,Michoacan,Morelos,Nayarit,Nuevo Leon,Oaxaca,Puebla,Queretaro,Quintana Roo,San Luis Potosi,Sinaloa,Sonora,Tabasco,Tamaulipas,Tlaxcala,Veracruz,Yucatan,Zacatecas".split(",");
    var US_STATES = "Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming".split(",");

    var MINIMUMS_NOTE = "Trabajamos con volumenes industriales. La cantidad minima para cotizacion de cajas de carton corrugado es de 1 tonelada. Si tu requerimiento es menor, te recomendamos contactar a un distribuidor local.";

    var PRODUCT_SPECS = {
        papel: {
            label: "Rollos de papel",
            title: "Especificaciones de papel",
            note: true,
            fields: [
                field("select", "papel_tipo", "Tipo de papel", ["Kraft reciclado", "Liner", "Medium", "Otro"]),
                field("text", "papel_gramaje", "Gramaje requerido (gr/m2)"),
                field("number", "papel_toneladas", "Cantidad estimada en toneladas *", null, true),
                field("text", "papel_uso_final", "Uso final del papel"),
                field("textarea", "papel_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        lamina: {
            label: "Lamina de carton corrugado",
            title: "Especificaciones de lamina",
            note: true,
            fields: [
                field("select", "lamina_tipo_corrugado", "Tipo de corrugado", ["Sencillo", "Doble", "Otro"]),
                field("select", "lamina_flauta", "Flauta preferida", ["B", "C", "E", "BC", "Otra"]),
                field("text", "lamina_ancho", "Ancho requerido"),
                field("select", "lamina_resistencia", "Resistencia requerida", ["ECT", "Mullen", "Otra"]),
                field("number", "lamina_toneladas", "Cantidad estimada en toneladas *", null, true),
                field("textarea", "lamina_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        cajas: {
            label: "Cajas de carton corrugado",
            title: "Especificaciones de cajas",
            note: true,
            fields: [
                field("select", "cajas_tipo", "Tipo de caja", ["Regular ranurada", "Suajada", "Charola", "Otro"]),
                field("select", "cajas_color_liner", "Color de liner", ["Kraft", "Blanco", "Otro"]),
                field("select", "cajas_flauta", "Flauta", ["B", "C", "E", "BC", "Otra"]),
                field("select", "cajas_numero_tintas", "Numero de tintas", ["1", "2", "3", "4 o mas"]),
                field("text", "cajas_largo_cm", "Largo (cm)", null, false, "third"),
                field("text", "cajas_ancho_cm", "Ancho (cm)", null, false, "third"),
                field("text", "cajas_alto_cm", "Alto (cm)", null, false, "third"),
                field("number", "cajas_toneladas", "Cantidad estimada en toneladas *", null, true),
                field("text", "cajas_uso", "Uso / producto que se va a empacar"),
                field("textarea", "cajas_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        grabado: {
            label: "Grabado y flexografia",
            title: "Especificaciones de grabado",
            note: true,
            fields: [
                field("text", "grabado_sustrato", "Tipo de sustrato"),
                field("select", "grabado_arte_listo", "¿Cuentas con arte listo?", ["Si", "No", "En proceso"]),
                field("text", "grabado_numero_tintas", "Numero de tintas"),
                field("text", "grabado_tiraje", "Cantidad estimada de piezas o tiraje"),
                field("file", "grabado_archivo", "Subir archivo (pdf, docx, referencia)", null, false, "full"),
                field("text", "grabado_formatos", "Formato aceptado: ai, pdf, png, jpg", null, false, "full", true),
                field("textarea", "grabado_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        impresion: {
            label: "Impresion digital (WowPak)",
            title: "Especificaciones de impresion digital",
            note: true,
            fields: [
                field("text", "impresion_tipo_pieza", "Tipo de pieza"),
                field("text", "impresion_formato", "Formato aproximado", null, false, null, false, "ej. 60 x 40 cm"),
                field("number", "impresion_tiraje", "Tiraje estimado (numero de piezas) *", null, true),
                field("select", "impresion_arte_listo", "¿Cuentas con arte listo?", ["Si", "No", "En proceso"]),
                field("text", "impresion_resolucion", "Resolucion de interes"),
                field("file", "impresion_archivo", "Subir archivo", null, false, "full"),
                field("text", "impresion_formatos", "Formatos aceptados: ai, pdf, png, jpg", null, false, "full", true),
                field("textarea", "impresion_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        seguimiento: {
            label: "Seguimiento de pedido",
            title: "Seguimiento de pedido",
            fields: [
                field("text", "seguimiento_numero_pedido", "Numero de pedido / orden de compra *", null, true),
                field("text", "seguimiento_empresa", "Empresa *", null, true),
                field("textarea", "seguimiento_comentarios", "Comentarios o consulta especifica", null, false, "full")
            ],
            portal: true
        }
    };

    function field(type, name, label, options, required, width, readonly, placeholder) {
        return {
            type: type,
            name: name,
            label: label,
            options: options || [],
            required: !!required,
            width: width || "",
            readonly: !!readonly,
            placeholder: placeholder || ""
        };
    }

    ensureStyles();
    mountWidget();

    function ensureStyles() {
        if (document.getElementById("gpk-formulario-styles")) return;
        var link = document.createElement("link");
        link.id = "gpk-formulario-styles";
        link.rel = "stylesheet";
        link.href = baseURL + "/formulario.css";
        document.head.appendChild(link);
    }

    function mountWidget() {
        var root =
            document.getElementById("gpk-formulario-widget-root") ||
            document.getElementById("grupak-formulario-root");

        if (root) {
            fetch(baseURL + "/formulario.html")
                .then(function (res) {
                    if (!res.ok) throw new Error("Error loading Formulario widget HTML");
                    return res.text();
                })
                .then(function (html) {
                    root.innerHTML = html;
                    initWidget(root.querySelector("#gpk-formulario-widget"));
                })
                .catch(function (err) {
                    console.error("[gpk-formulario]", err);
                });
            return;
        }

        initWidget(document.getElementById("gpk-formulario-widget"));
    }

    function initWidget(widget) {
        if (!widget || widget.dataset.gpkReady === "true") return;
        widget.dataset.gpkReady = "true";

        bindTabs(widget);
        bindProducts(widget);
        widget.querySelectorAll(".gpk-form-panel").forEach(function (form) {
            bindCountryState(form);
            bindSubmit(form);
        });
    }

    function bindTabs(widget) {
        var tabs = widget.querySelectorAll(".gpk-form-tab");
        var panels = widget.querySelectorAll(".gpk-form-panel");

        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.getAttribute("data-gpk-tab");
                tabs.forEach(function (item) {
                    var active = item === tab;
                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-selected", active ? "true" : "false");
                });
                panels.forEach(function (panel) {
                    panel.classList.toggle("is-active", panel.getAttribute("data-gpk-panel") === target);
                });
            });
        });
    }

    function bindProducts(widget) {
        var form = widget.querySelector('[data-gpk-form="contacto"]');
        var grid = form && form.querySelector("[data-product-grid]");
        var spec = form && form.querySelector("[data-product-spec]");
        if (!form || !grid || !spec) return;

        grid.addEventListener("change", function (event) {
            var radio = event.target;
            if (!radio || radio.type !== "radio") return;

            grid.querySelectorAll(".gpk-product-card").forEach(function (card) {
                card.classList.toggle("is-selected", card.contains(radio));
            });

            renderProductSpec(spec, radio.value);
        });
    }

    function renderProductSpec(container, key) {
        var config = PRODUCT_SPECS[key];
        container.innerHTML = "";
        if (!config) return;

        var title = document.createElement("h3");
        title.className = "gpk-spec-title";
        title.textContent = config.title;
        container.appendChild(title);

        var hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "producto_interes_nombre";
        hidden.value = config.label;
        container.appendChild(hidden);

        if (config.note) {
            var note = document.createElement("p");
            note.className = "gpk-spec-note";
            note.innerHTML = "<strong>Nota importante sobre minimos:</strong> " + MINIMUMS_NOTE;
            container.appendChild(note);
        }

        var grid = document.createElement("div");
        grid.className = "gpk-spec-grid";
        if (config.fields.some(function (item) { return item.width === "third"; })) {
            grid.classList.add("is-three");
        }

        config.fields.forEach(function (item) {
            grid.appendChild(createField(item));
        });

        if (config.portal) {
            var portalWrap = document.createElement("div");
            portalWrap.className = "gpk-field gpk-full";
            var portal = document.createElement("a");
            portal.className = "gpk-portal-link";
            portal.href = "/portal-clientes";
            portal.textContent = "Acceso a portal de clientes";
            portalWrap.appendChild(portal);
            grid.appendChild(portalWrap);
        }

        container.appendChild(grid);
    }

    function createField(config) {
        var wrap = document.createElement("div");
        wrap.className = "gpk-field";
        if (config.width === "full") wrap.classList.add("gpk-full");

        var id = "gpk-" + config.name;
        var label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = config.label;
        wrap.appendChild(label);

        var input;
        if (config.type === "select") {
            input = document.createElement("select");
            var placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = "Selecciona una opcion";
            input.appendChild(placeholder);
            config.options.forEach(function (optionText) {
                var option = document.createElement("option");
                option.value = optionText;
                option.textContent = optionText;
                input.appendChild(option);
            });
        } else if (config.type === "textarea") {
            input = document.createElement("textarea");
        } else {
            input = document.createElement("input");
            input.type = config.type;
            if (config.type === "file") {
                input.accept = ".ai,.pdf,.png,.jpg,.jpeg,.doc,.docx";
            }
        }

        input.id = id;
        input.name = config.name;
        input.required = config.required;
        if (config.readonly) input.readOnly = true;
        if (config.placeholder) input.placeholder = config.placeholder;
        wrap.appendChild(input);

        return wrap;
    }

    function bindCountryState(form) {
        var country = form.querySelector('select[name="pais"]');
        var stateSelect = form.querySelector(".gpk-estado-select");
        var stateText = form.querySelector(".gpk-estado-text");
        if (!country || !stateSelect || !stateText) return;

        country.addEventListener("change", function () {
            if (country.value === "Otro") {
                stateSelect.style.display = "none";
                stateSelect.disabled = true;
                stateSelect.required = false;
                stateSelect.name = "estado_select";

                stateText.style.display = "block";
                stateText.disabled = false;
                stateText.required = true;
                stateText.name = "estado";
                stateText.value = "";
                return;
            }

            stateText.style.display = "none";
            stateText.disabled = true;
            stateText.required = false;
            stateText.name = "estado_texto";
            stateText.value = "";

            stateSelect.style.display = "block";
            stateSelect.disabled = false;
            stateSelect.required = true;
            stateSelect.name = "estado";
            fillStateOptions(stateSelect, country.value === "Mexico" ? MX_STATES : US_STATES);
        });
    }

    function fillStateOptions(select, list) {
        select.innerHTML = "";
        var placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = "Selecciona una opcion";
        select.appendChild(placeholder);

        list.forEach(function (state) {
            var option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            select.appendChild(option);
        });
    }

    function resetDynamicState(form) {
        form.querySelectorAll(".gpk-product-card").forEach(function (card) {
            card.classList.remove("is-selected");
        });
        var spec = form.querySelector("[data-product-spec]");
        if (spec) spec.innerHTML = "";

        var stateSelect = form.querySelector(".gpk-estado-select");
        var stateText = form.querySelector(".gpk-estado-text");
        if (stateSelect) {
            stateSelect.style.display = "block";
            stateSelect.disabled = false;
            stateSelect.required = true;
            stateSelect.name = "estado";
            fillStateOptions(stateSelect, []);
        }
        if (stateText) {
            stateText.style.display = "none";
            stateText.disabled = true;
            stateText.required = false;
            stateText.name = "estado_texto";
            stateText.value = "";
        }
    }

    function bindSubmit(form) {
        var formType = form.getAttribute("data-gpk-form");
        var endpoint = CFG[formType];
        var status = form.querySelector(".gpk-status");
        var button = form.querySelector(".gpk-submit");

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (endpoint.indexOf("TU_ID") !== -1) {
                showStatus(status, "error", "Falta configurar el endpoint de Formspree en widgets/formulario/formulario.js.");
                return;
            }

            var label = button.textContent;
            button.disabled = true;
            button.textContent = "Enviando...";
            status.className = "gpk-status";
            status.textContent = "";

            var data = new FormData(form);
            Array.from(data.keys()).forEach(function (key) {
                var value = data.get(key);
                if (value && value.size === 0) data.delete(key);
            });

            fetch(endpoint, {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" }
            })
                .then(function (res) {
                    if (res.ok) {
                        form.reset();
                        resetDynamicState(form);
                        showStatus(status, "ok", "Gracias. Tu informacion fue enviada correctamente. Nuestro equipo te contactara muy pronto.");
                        return;
                    }
                    return res.json()
                        .then(function (data) {
                            var msg = data && data.errors && data.errors.length
                                ? data.errors.map(function (err) { return err.message; }).join(". ")
                                : "Hubo un problema al enviar el formulario. Por favor intentalo de nuevo.";
                            showStatus(status, "error", msg);
                        })
                        .catch(function () {
                            showStatus(status, "error", "Hubo un problema al enviar el formulario. Por favor intentalo de nuevo.");
                        });
                })
                .catch(function () {
                    showStatus(status, "error", "No se pudo conectar con el servidor. Revisa tu conexion e intentalo de nuevo.");
                })
                .finally(function () {
                    button.disabled = false;
                    button.textContent = label;
                });
        });
    }

    function showStatus(status, type, message) {
        status.className = "gpk-status " + (type === "ok" ? "is-ok" : "is-error");
        status.textContent = message;
        status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
})();
