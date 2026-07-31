$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.html")
$css = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.css")
$js = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.js")

function Assert-Match([string]$Text, [string]$Pattern, [string]$Message) {
    if ($Text -notmatch $Pattern) { throw $Message }
}

function Assert-NotMatch([string]$Text, [string]$Pattern, [string]$Message) {
    if ($Text -match $Pattern) { throw $Message }
}

Assert-Match $html 'class="mobile-continuous-flow"' "Missing continuous mobile flow"
Assert-Match $html 'class="mobile-scroll-status"' "Missing sticky scroll status"
Assert-Match $html 'data-scroll-target="mobile-products-index"' "Missing return-to-products control"
Assert-Match $html 'class="intro-kpis-grid-new"' "Slide 0 production KPIs must be shared by desktop and mobile"
Assert-Match $html '\+300,000' "Slide 0 paper-recycling KPI is missing"
Assert-Match $html '\+234,000' "Slide 0 corrugated-cardboard KPI is missing"
Assert-Match $html '(?s)gpk-hero-home.*?>3<.*?>6<.*?>1957<.*?>100%<' "Hero KPIs must remain unchanged"
Assert-Match $html '(?s)gpk-hero-home-video[^>]*autoplay[^>]*loop[^>]*muted[^>]*playsinline' "Hero video needs mobile autoplay attributes"
Assert-Match $html 'class="intro-mobile-video"' "Mobile intro must use its own video"
Assert-Match $html '(?s)intro-mobile-video[^>]*autoplay[^>]*loop[^>]*muted[^>]*playsinline' "Mobile intro video needs autoplay attributes"
Assert-Match $html 'class="mobile-hero-kpis mobile-only"' "Mobile four-card KPI layout is missing"
Assert-Match $html '(?s)mobile-hero-kpis.*?>3<.*?>6<.*?>1957<.*?>100%<' "Mobile KPI cards must keep the approved values"
Assert-Match $css '--mobile-desktop-grey:\s*#d9d9d9' "Hero background must match desktop"
Assert-Match $css '--mobile-hero-background:\s*#383838' "Mobile hero must use #383838"
Assert-Match $css '(?s)#mobile-intro \.products-intro-pane,.*?\{[^}]*background:\s*transparent' "Legacy intro panel must be transparent inside dark hero"
Assert-Match $css '/\* MOBILE CONTINUOUS FLOW - FINAL LAYER \*/' "Missing final continuous-flow layer"
Assert-Match $css '/\* MOBILE VISUAL REFINEMENT - FINAL LAYER \*/' "Missing final visual refinement layer"
Assert-Match $css '(?s)\.mobile-continuous-flow\s*\{[^}]*display:\s*block' "Continuous flow is not enabled on mobile"
Assert-Match $css '(?s)\.products-nav-footer\s*\{[^}]*display:\s*none' "Legacy arrows must be hidden on mobile"
Assert-Match $css 'prefers-reduced-motion:\s*reduce' "Reduced-motion handling is missing"
Assert-Match $css 'grid-template-areas:\s*"title"\s*"copy"\s*"media"\s*"action"' "Product cards must use non-overlapping rows"
Assert-Match $css '(?s)#mobile-papel \.papel-products-grid\s*\{[^}]*margin-top:\s*28px' "Papel cards need separation from intro copy"
Assert-Match $css '(?s)#mobile-papel \.uses-bubble\s*\{[^}]*align-items:\s*center' "Papel use pill must center its label"
Assert-Match $css '(?s)#mobile-lamina \.laminas-bottom-layout\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)' "Lamina images must form a horizontal row"
Assert-Match $css '(?s)#mobile-lamina \.laminas-stack-img\s*\{[^}]*max-height:\s*none' "Legacy Lamina image cap must be removed"
Assert-Match $css '(?s)#mobile-lamina \.laminas-spec-group\s*\{[^}]*grid-template-columns:\s*1fr' "Lamina specification must stack text and image"
Assert-Match $css '(?s)#mobile-lamina \.spec-image-box,.*?\{[^}]*position:\s*static' "Lamina technical image must stay in flow"
Assert-Match $css '(?s)#mobile-lamina \.laminas-spec-group\s*\{[^}]*margin:\s*0 0 24px' "Lamina specification groups need separation"
Assert-Match $css '(?s)#mobile-cajas \.cajas-convencionales-content,.*?\{[^}]*gap:\s*28px' "Conventional Cajas media needs separation"
Assert-Match $css '(?s)#mobile-cajas \.digital-content-wrapper\s*\{[^}]*gap:\s*28px|#mobile-cajas \.cajas-convencionales-content,\s*#gpk-products-widget #mobile-cajas \.digital-content-wrapper\s*\{[^}]*gap:\s*28px' "Digital Cajas media needs separation"
Assert-Match $css '(?s)#mobile-cajas \.digital-text-content\s*\{[^}]*order:\s*1' "Digital Cajas text must precede its image"
Assert-Match $css '(?s)#mobile-cajas \.digital-image-container\s*\{[^}]*order:\s*2' "Digital Cajas image must follow its text"
Assert-Match $html 'energia-eficiencia\.webp' "Missing efficiency image"
Assert-Match $html 'energia-impacto\.webp' "Missing impact image"
Assert-Match $html 'energia-suministro\.webp' "Missing supply image"
Assert-Match $css '(?s)#mobile-energia \.energia-mobile-image-container\s*\{[^}]*display:\s*block' "Energy images must be visible"
Assert-Match $css '(?s)#mobile-cajas \.digital-content-wrapper\s*\{[^}]*gap:\s*44px' "Digital Cajas needs 44px media separation"
Assert-Match $css '(?s)#mobile-products-index \.overview-mobile-img\s*\{[^}]*max-width:\s*180px' "Overview images need the approved scale"
Assert-Match $css '(?s)#mobile-products-index \.overview-mobile-img\s*\{[^}]*height:\s*148px' "Overview image zone needs the approved height"
Assert-Match $css '(?s)#mobile-products-index \.overview-mobile-img\s*\{[^}]*max-height:\s*none' "Legacy overview image cap must be removed"
Assert-Match $css '(?s)#mobile-intro \.intro-mobile-desc\s*\{[^}]*padding:\s*18px 20px' "Hero copy card needs lateral padding"
Assert-Match $js 'mobileContinuousSections' "Missing continuous section registry"
Assert-Match $js 'IntersectionObserver' "Missing section observer"
Assert-Match $js 'target\.getBoundingClientRect\(\)\.top' "Anchor navigation must calculate a document scroll target"
Assert-Match $js 'window\.scrollTo' "Anchor navigation must scroll the document"
Assert-Match $js 'event\.stopPropagation\(\)' "Legacy slide click handler can interrupt continuous navigation"
Assert-Match $js '\},\s*true\);' "Continuous navigation must capture clicks before legacy handlers"
Assert-Match $js 'mobileSlideTargets' "Missing overview target map"
Assert-Match $js 'board\.querySelectorAll\("\.overview-col-btn"\)' "Legacy overview handlers must stay inside the desktop board"
Assert-Match $js 'wrapper\.querySelectorAll\("\[data-target-slide\]"\)' "Cloned overview buttons need direct continuous navigation"
Assert-Match $js 'document\.createElement\("a"\)' "Mobile overview controls must use resilient native anchors"
Assert-Match $js 'link\.addEventListener\("click"' "Mobile overview anchors need explicit navigation"
Assert-Match $js 'scrollToMobileTarget\(targetId\)' "Mobile overview anchors must use the section scroller"
Assert-Match $js 'window\.requestAnimationFrame\(\(\)\s*=>\s*\{\s*window\.scrollTo' "Mobile anchor scrolling must run after click processing"
Assert-Match $js 'window\.location\.hash\s*=\s*targetId' "Mobile navigation must resolve the native section anchor"
Assert-Match $css '(?s)\.mobile-scroll-status\s*\{[^}]*z-index:\s*100' "Sticky bar needs the top mobile layer"
Assert-Match $css '(?s)\.mobile-scroll-status\s*\{[^}]*isolation:\s*isolate' "Sticky bar needs an isolated stacking context"
Assert-Match $css '(?s)#mobile-papel\s*\{[^}]*padding-bottom:\s*100px' "Papel needs sticky-bar clearance"
Assert-Match $css '(?s)#mobile-products-index \.overview-col-btn\s*\{[^}]*pointer-events:\s*auto' "Mobile overview anchors must accept pointer input"
Assert-Match $js 'root\.appendChild\(heroHome\)' "Desktop hero must retain its original mount"
Assert-NotMatch $js 'root\.insertBefore\(heroHome, tracker\)' "Desktop hero must not be injected into the mobile flow"
Assert-Match $js 'wrapper\.querySelectorAll\("video\[autoplay\]"\)' "Cloned mobile autoplay videos must be initialized"
Assert-Match $js '(?s)id:\s*"mobile-intro".*?id:\s*"mobile-slide-zero".*?id:\s*"mobile-products-index"' "Mobile flow must keep hero, slide 0 and products as separate consecutive sections"
Assert-Match $js 'querySelector\("\.gpk-hero-home-banner h1"\)' "Mobile hero must source its title from the desktop hero"
Assert-Match $js 'mobile-hero-title' "Mobile hero title clone is missing"
Assert-Match $js 'video\.style\.webkitMaskImage\s*=\s*maskURL' "Cloned mobile video must receive the desktop mask"
Assert-Match $css '--mobile-site-header-clearance:\s*88px' "Mobile hero needs live-menu clearance"
Assert-Match $css '(?s)#mobile-intro\.mobile-flow-section\s*\{[^}]*padding-top:\s*calc\(var\(--mobile-site-header-clearance\)' "Mobile intro needs live-menu clearance"
Assert-Match $css '(?s)\.intro-mobile-video\s*\{[^}]*object-fit:\s*cover' "Mobile intro video needs a stable media crop"
Assert-Match $css '(?s)MOBILE INTRO HERO.*?\.mobile-hero-kpis\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)' "Mobile hero KPIs must remain in two columns"
Assert-Match $css '(?s)MOBILE INTRO HERO.*?#mobile-intro \.intro-mobile-desc\s*\{[^}]*margin-bottom:\s*24px' "Mobile description needs clearance before KPI cards"
Assert-Match $css '(?s)MOBILE INTRO HERO.*?\.mobile-hero-kpi\s*\{[^}]*min-height:\s*132px' "Mobile KPI cards need enough height for their copy"
Assert-Match $css '(?s)SLIDE 0 PRODUCTION KPIS.*?\.intro-kpis-grid-new\s*\{[^}]*display:\s*flex\s*!important[^}]*flex-wrap:\s*nowrap' "Desktop slide 0 production KPIs must stay in one horizontal row"
Assert-Match $css '(?s)SLIDE 0 PRODUCTION KPIS.*?@media \(max-width:\s*1024px\).*?\.intro-kpis-grid-new\s*\{[^}]*display:\s*grid\s*!important[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)' "Mobile slide 0 production KPIs must remain visible in two columns"
Assert-Match $css '(?s)MOBILE SLIDE 0 SEPARATION.*?#mobile-intro \.intro-kpis-grid-new\s*\{[^}]*display:\s*none\s*!important' "Production KPIs must not be rendered inside the mobile hero"
Assert-Match $css '(?s)MOBILE SLIDE 0 SEPARATION.*?#mobile-slide-zero \.intro-title-new\s*\{[^}]*display:\s*block\s*!important' "Mobile slide 0 must show the desktop intro text"
Assert-Match $css '(?s)MOBILE SLIDE 0 SEPARATION.*?#mobile-slide-zero \.intro-kpis-grid-new\s*\{[^}]*display:\s*grid\s*!important' "Mobile slide 0 must show the two production KPIs"
Assert-Match $css '(?s)SLIDE 0 PRODUCTION KPIS - FINAL SHARED LAYOUT.*?MOBILE SLIDE 0 VISIBILITY OVERRIDE.*?#mobile-intro \.intro-kpis-grid-new\s*\{[^}]*display:\s*none\s*!important' "The final cascade must keep production KPIs out of the mobile hero"
Assert-Match $css '(?s)MOBILE HERO INITIAL STABILITY.*?#mobile-intro \.products-intro-pane\s*\{[^}]*display:\s*flex\s*!important[^}]*flex-direction:\s*column\s*!important' "Mobile hero must use stable normal flow from first render"
Assert-Match $css '(?s)MOBILE HERO INITIAL STABILITY.*?#mobile-intro \.intro-mobile-desc\s*\{[^}]*position:\s*static\s*!important[^}]*transform:\s*none\s*!important' "Mobile hero description must not depend on scroll positioning"
Assert-Match $css '(?s)MOBILE HERO INITIAL STABILITY.*?\.intro-mobile-video\s*\{[^}]*-webkit-mask-size:\s*100% 100%' "Mobile hero video must preserve the desktop mask geometry"
Assert-Match $css '(?s)SLIDE 0 PRODUCTION KPIS - FINAL SHARED LAYOUT.*?MOBILE SLIDE 0 VISIBILITY OVERRIDE.*?MOBILE HERO INITIAL STABILITY - CASCADE OVERRIDE.*?#mobile-intro \.intro-mobile-desc\s*\{[^}]*position:\s*static\s*!important' "Stable hero flow must be the final mobile cascade"
Assert-Match $css '(?s)MOBILE HERO INITIAL STABILITY - CASCADE OVERRIDE.*?#mobile-intro \.intro-mobile-img-container\s*\{[^}]*aspect-ratio:\s*auto\s*!important' "Mobile video container must not retain the legacy aspect ratio"

$requiredIds = @(
    "mobile-intro",
    "mobile-products-index",
    "mobile-papel",
    "mobile-lamina",
    "mobile-cajas",
    "mobile-grabados",
    "mobile-energia"
)
foreach ($id in $requiredIds) {
    Assert-Match $js ([regex]::Escape($id)) "Missing section registry entry: $id"
}

Write-Host "Productos Interactivos continuous mobile contract: PASS"
