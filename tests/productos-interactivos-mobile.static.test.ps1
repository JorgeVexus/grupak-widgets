$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.html")
$css = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.css")
$js = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.js")
$finalGuardMarker = "/* MOBILE EDITORIAL REDESIGN - FINAL CASCADE GUARD */"
$finalGuardIndex = $css.IndexOf($finalGuardMarker)
$finalGuard = if ($finalGuardIndex -ge 0) { $css.Substring($finalGuardIndex) } else { "" }

function Assert-Match([string]$Text, [string]$Pattern, [string]$Message) {
    if ($Text -notmatch $Pattern) {
        throw $Message
    }
}

Assert-Match $html 'id="mobile-section-name"' "Missing mobile section label"
Assert-Match $html 'id="mobile-slide-count"' "Missing mobile slide count"
Assert-Match $html 'id="mobile-progress-fill"' "Missing mobile progress fill"
Assert-Match $html 'data-mobile-kpi="plantas"' "Missing Plantas mobile KPI"
Assert-Match $html 'data-mobile-kpi="abastecedoras"' "Missing Abastecedoras mobile KPI"
Assert-Match $css '#gpk-products-widget \.mobile-nav-progress\s*\{\s*display:\s*none' "Mobile progress must stay hidden on desktop"
Assert-Match $css '/\* MOBILE EDITORIAL REDESIGN - AUTHORITATIVE LAYER \*/' "Missing authoritative mobile layer"
Assert-Match $css '@media\s*\(max-width:\s*768px\)' "Mobile rules are not breakpoint-scoped"
Assert-Match $css '--mobile-nav-button:\s*44px' "Touch target token must be 44px"
Assert-Match $css 'min-height:\s*100dvh' "Dynamic viewport minimum is missing"
Assert-Match $css 'overflow-x:\s*clip' "Horizontal overflow protection is missing"
Assert-Match $css '(?s)#gpk-products-widget \.products-board\s*\{[^}]*overflow-y:\s*hidden' "The mobile board must pin its navigation"
Assert-Match $css 'prefers-reduced-motion:\s*reduce' "Reduced-motion handling is missing"
Assert-Match $js 'mobileSectionNames' "JavaScript mobile section map is missing"
Assert-Match $js 'activePane\?\.scrollTo\(\{\s*top:\s*0' "Active pane scroll reset is missing"
Assert-Match $finalGuard '(?s)\.overview-grid-new\s*\{[^}]*grid-auto-columns:\s*min\(82vw,\s*330px\)' "Final guard must size overview cards"
Assert-Match $finalGuard '(?s)\.overview-col-new\s*\{[^}]*min-width:\s*min\(82vw,\s*330px\)' "Final guard must protect overview card width"
Assert-Match $finalGuard '(?s)\.products-board\.mode-3 \.papel-products-grid\s*\{[^}]*grid-template-columns:\s*1fr[^}]*grid-auto-rows:\s*max-content[^}]*height:\s*max-content' "Mode 3 guard must stack and size Papel cards by content"
Assert-Match $finalGuard '(?s)\.products-board\.mode-3 \.product-card\s*\{[^}]*height:\s*auto' "Mode 3 guard must allow Papel card content to grow"
Assert-Match $finalGuard '(?s)\.products-board\.mode-14 \.energia-row\s*\{[^}]*display:\s*grid[^}]*height:\s*max-content' "Mode 14 guard must allow Energía rows to grow"

$modeCount = ([regex]::Matches($js, 'const totalSlides = 15')).Count
if ($modeCount -ne 1) {
    throw "The 15-slide navigation contract changed"
}

Write-Host "Productos Interactivos mobile contract: PASS"
