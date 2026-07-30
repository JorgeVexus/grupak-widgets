(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";

    var isDirectFile = isLocalhost && (window.location.pathname.indexOf("widgets/formulario") >= 0 || window.location.pathname.indexOf("formulario.html") >= 0);
    var baseURL = isLocalhost
        ? (isDirectFile ? "." : "widgets/formulario")
        : "https://grupak-widgets.vercel.app/widgets/formulario";

    var WEBHOOK_URL = "https://infinity-mind.app.n8n.cloud/webhook/grupak-landing-consent";
    var WEBHOOK_SOURCE = "landing-grupak-whatsapp";
    var WEBHOOK_CAMPAIGN_ID = "grupak-sitio-web";
    var WEBHOOK_CAMPAIGN_NAME = "Formulario sitio web Grupak";
    var WHATSAPP_CONSENT_TEXT = "Acepto recibir mensajes de WhatsApp de Grupak relacionados con mi solicitud de cotización y entiendo que puedo solicitar dejar de recibirlos.";

    var MX_STATES = "Aguascalientes,Baja California,Baja California Sur,Campeche,Chiapas,Chihuahua,Ciudad de Mexico,Coahuila,Colima,Durango,Estado de Mexico,Guanajuato,Guerrero,Hidalgo,Jalisco,Michoacan,Morelos,Nayarit,Nuevo Leon,Oaxaca,Puebla,Queretaro,Quintana Roo,San Luis Potosi,Sinaloa,Sonora,Tabasco,Tamaulipas,Tlaxcala,Veracruz,Yucatan,Zacatecas".split(",");
    var US_STATES = "Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming".split(",");

    var MINIMUMS_NOTE = "Trabajamos con volúmenes industriales. La cantidad mínima para cotización de cajas de cartón corrugado es de 1 tonelada. Si tu requerimiento es menor, te recomendamos contactar a un distribuidor local.";

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
            label: "Lámina de cartón corrugado",
            title: "Especificaciones de lámina",
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
            label: "Cajas de cartón corrugado",
            title: "Especificaciones de cajas",
            note: true,
            fields: [
                field("select", "cajas_tipo", "Tipo de caja", ["Regular ranurada", "Suajada", "Charola", "Otro"]),
                field("select", "cajas_color_liner", "Color de liner", ["Kraft", "Blanco", "Otro"]),
                field("select", "cajas_flauta", "Flauta", ["B", "C", "E", "BC", "Otra"]),
                field("select", "cajas_numero_tintas", "Número de tintas", ["1", "2", "3", "4 o más"]),
                field("text", "cajas_largo_cm", "Largo (cm)", null, false, "third"),
                field("text", "cajas_ancho_cm", "Ancho (cm)", null, false, "third"),
                field("text", "cajas_alto_cm", "Alto (cm)", null, false, "third"),
                field("number", "cajas_toneladas", "Cantidad estimada en toneladas *", null, true),
                field("text", "cajas_uso", "Uso / producto que se va a empacar"),
                field("textarea", "cajas_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
        grabado: {
            label: "Grabado y flexografía",
            title: "Especificaciones de grabado",
            note: true,
            fields: [
                field("text", "grabado_sustrato", "Tipo de sustrato"),
                field("select", "grabado_arte_listo", "¿Cuentas con arte listo?", ["Sí", "No", "En proceso"]),
                field("text", "grabado_numero_tintas", "Número de tintas"),
                field("text", "grabado_tiraje", "Cantidad estimada de piezas o tiraje"),
                field("file", "grabado_archivo", "Subir archivo (pdf, docx, referencia)", null, false, "full"),
                field("text", "grabado_formatos", "Formato aceptado: ai, pdf, png, jpg", null, false, "full", true),
                field("textarea", "grabado_comentarios", "Comentarios adicionales", null, false, "full")
            ]
        },
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
            var existingWidget = root.querySelector("#gpk-formulario-widget");
            if (existingWidget) {
                initWidget(existingWidget);
                return;
            }

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
        exposePublicApi(widget);
        bindProducts(widget);
        widget.querySelectorAll(".gpk-form-panel").forEach(function (form) {
            bindCountryState(form);
            bindSubmit(form);
        });
        openRequestedTab(widget);
    }

    function bindTabs(widget) {
        var tabs = widget.querySelectorAll(".gpk-form-tab");

        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.getAttribute("data-gpk-tab");
                selectTab(widget, target, false);
            });
        });
    }

    function selectTab(widget, target, shouldScroll) {
        var tabs = widget.querySelectorAll(".gpk-form-tab");
        var panels = widget.querySelectorAll(".gpk-form-panel");
        var found = false;

        tabs.forEach(function (item) {
            var active = item.getAttribute("data-gpk-tab") === target;
            found = found || active;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
        });

        if (!found) return false;

        panels.forEach(function (panel) {
            panel.classList.toggle("is-active", panel.getAttribute("data-gpk-panel") === target);
        });

        if (shouldScroll) {
            widget.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        return true;
    }

    function exposePublicApi(widget) {
        window.gpkOpenFormulario = function (target) {
            return selectTab(widget, target || "contacto", true);
        };
    }

    function openRequestedTab(widget) {
        var params = new URLSearchParams(window.location.search);
        var target = params.get("gpkForm");

        if (!target && window.location.hash) {
            var hash = window.location.hash.replace("#", "");
            if (hash === "proveeduria" || hash === "proveedor") {
                target = "proveedor";
            } else if (hash === "ventas" || hash === "contacto") {
                target = "contacto";
            }
        }

        if (target) {
            selectTab(widget, target, false);
        }
    }

    function bindProducts(widget) {
        var form = widget.querySelector('[data-gpk-form="contacto"]');
        var grid = form && form.querySelector("[data-product-grid]");
        var spec = form && form.querySelector("[data-product-spec]");
        if (!form || !grid || !spec) return;

        function adjustPosition() {
            var checkedRadio = grid.querySelector('input[name="producto_interes"]:checked');
            if (!checkedRadio) return;
            var card = checkedRadio.closest(".gpk-product-card");
            if (window.innerWidth <= 719) {
                if (card && card.nextSibling !== spec) {
                    card.parentNode.insertBefore(spec, card.nextSibling);
                }
            } else {
                if (grid.nextSibling !== spec) {
                    grid.parentNode.insertBefore(spec, grid.nextSibling);
                }
            }
        }

        grid.addEventListener("change", function (event) {
            var radio = event.target;
            if (!radio || radio.type !== "radio") return;

            grid.querySelectorAll(".gpk-product-card").forEach(function (card) {
                card.classList.toggle("is-selected", card.contains(radio));
            });

            adjustPosition();
            renderProductSpec(spec, radio.value);
        });

        window.addEventListener("resize", adjustPosition);
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
            placeholder.textContent = "Selecciona una opción";
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
            fillStateOptions(stateSelect, country.value === "México" ? MX_STATES : US_STATES);
        });
    }

    function fillStateOptions(select, list) {
        select.innerHTML = "";
        var placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = "Selecciona una opción";
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

    function fieldValue(form, name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
    }

    function buildPayload(form) {
        var formType = form.getAttribute("data-gpk-form");
        var isProveedor = formType === "proveedor";

        var nombreCompleto = (fieldValue(form, "nombre") + " " + fieldValue(form, "apellido")).trim();
        var empresa = isProveedor ? fieldValue(form, "nombre_empresa") : fieldValue(form, "empresa");
        var producto = isProveedor ? "" : fieldValue(form, "producto_interes_nombre");

        var cantidadField = form.querySelector('[name$="_toneladas"], [name$="_tiraje"]');
        var comentariosField = isProveedor
            ? form.querySelector('[name="comentarios"]')
            : form.querySelector('[name$="_comentarios"]');
        var comentariosTexto = comentariosField ? comentariosField.value.trim() : "";

        if (isProveedor) {
            var contexto = [];
            var categoria = fieldValue(form, "categoria");
            var especialidad = fieldValue(form, "especialidad");
            if (categoria) contexto.push("Categoría: " + categoria);
            if (especialidad) contexto.push("Especialidad: " + especialidad);
            if (contexto.length) {
                comentariosTexto = contexto.join(" | ") + (comentariosTexto ? " — " + comentariosTexto : "");
            }
        }

        var consentCheckbox = form.querySelector("[data-gpk-consent-whatsapp]");
        var params = new URLSearchParams(window.location.search);

        var payload = {
            source: WEBHOOK_SOURCE,
            campaign_id: WEBHOOK_CAMPAIGN_ID,
            campaign_name: WEBHOOK_CAMPAIGN_NAME,
            nombre: nombreCompleto,
            empresa: empresa,
            telefono: fieldValue(form, "telefono_principal"),
            correo: fieldValue(form, "correo_principal"),
            producto: producto,
            cantidad: cantidadField ? cantidadField.value.trim() : "",
            ciudad: "",
            medidas: "",
            comentarios: comentariosTexto,
            consent_whatsapp: !!(consentCheckbox && consentCheckbox.checked),
            consent_text: WHATSAPP_CONSENT_TEXT,
            landing_url: window.location.href,
            referrer_url: document.referrer || "",
            utm_source: params.get("utm_source") || "",
            utm_medium: params.get("utm_medium") || "",
            utm_campaign: params.get("utm_campaign") || "",
            utm_content: params.get("utm_content") || "",
            utm_term: params.get("utm_term") || ""
        };

        Object.keys(payload).forEach(function (key) {
            if (payload[key] === "") delete payload[key];
        });

        return payload;
    }

    function bindSubmit(form) {
        var status = form.querySelector(".gpk-status");
        var button = form.querySelector(".gpk-submit");

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var honeypot = form.querySelector('[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                form.reset();
                resetDynamicState(form);
                showStatus(status, "ok", "Gracias. Tu información fue enviada correctamente. Nuestro equipo te contactará muy pronto.");
                return;
            }

            var label = button.textContent;
            button.disabled = true;
            button.textContent = "Enviando...";
            status.className = "gpk-status";
            status.textContent = "";

            var payload = buildPayload(form);

            function applyStatus(type, message) {
                if (type === "ok") {
                    form.reset();
                    resetDynamicState(form);
                }
                showStatus(status, type, message);
            }

            function restoreButton() {
                button.disabled = false;
                button.textContent = label;
            }

            if (form.querySelector('input[type="file"]')) {
                var formData = new FormData();
                Object.keys(payload).forEach(function (key) {
                    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
                        formData.append(key, String(payload[key]));
                    }
                });
                (function () {
                    var fileInputs = form.querySelectorAll('input[type="file"]');
                    fileInputs.forEach(function (input) {
                        if (input.files && input.files[0]) formData.append(input.name, input.files[0]);
                    });
                })();

                fetch(WEBHOOK_URL, {
                    method: "POST",
                    body: formData
                })
                    .then(function (res) {
                        if (res.ok) {
                            applyStatus("ok", "Gracias. Tu información fue enviada correctamente. Nuestro equipo te contactará muy pronto.");
                            return;
                        }
                        applyStatus("error", "Hubo un problema al enviar el formulario. Por favor inténtalo de nuevo.");
                    })
                    .catch(function () {
                        applyStatus("error", "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
                    })
                    .finally(function () {
                        restoreButton();
                    });
            } else {
                fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                    .then(function (res) {
                        if (res.ok) {
                            applyStatus("ok", "Gracias. Tu información fue enviada correctamente. Nuestro equipo te contactará muy pronto.");
                            return;
                        }
                        applyStatus("error", "Hubo un problema al enviar el formulario. Por favor inténtalo de nuevo.");
                    })
                    .catch(function () {
                        applyStatus("error", "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
                    })
                    .finally(function () {
                        restoreButton();
                    });
            }
        });
    }

    function showStatus(status, type, message) {
        status.className = "gpk-status " + (type === "ok" ? "is-ok" : "is-error");
        status.textContent = message;
        status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
})();
