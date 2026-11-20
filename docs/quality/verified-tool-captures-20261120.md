# Verified local tool captures, 20 November 2026

These are actual local release candidates. None establishes what is deployed. The original screenshots remain available; no assets were deleted or transformed.

## Prism

Source 871fd10 plus correction 6b0a415. The browser agent observed 44px navigation targets in a 390px viewport, a 101px header with the sticky category list below it, no horizontal overflow and eight installable results. Its command palette now hides a closed panel from the accessibility tree, isolates the background while open, keeps keyboard focus in the search control and restores launcher focus on close. Pointer/keyboard submenu selection, search and reopening/reset were checked. Changed lint, 54-route build and 8 icon tests pass. Cross-browser and assistive-technology certification remain open.

- [Desktop registry gallery](/assets/images/refresh-20261120/prism-registry-gallery.jpg),1144x926: actual local gallery filtered to 8 installs.
- [Phone gallery](/assets/images/refresh-20261120/prism-gallery-phone.jpg),390x844: the new navigation at a measured phone width.

## ScapeStudio

Source 3d586d1, documented by 3943569. The actual editor changed orientation 1200x900→675x900, accepted exact 600x400 crop values, added/edited/removed a curve point and changed a crop handle at 390px with no overflow. A locally saved preset survived reload. This was pointer input at a phone-sized layout, not a physical-touch test.

A post-crop ZIP decoded three 2953x1969 PNGs at approximately 299.9994 DPI. This bright crop's apparel output stayed opaque; the earlier full-study export separately contained alpha 0-255. Transparency follows luminance/threshold rather than recognising a background. Existing 5 crop/export tests,8 icon guard tests,lint,TypeScript,build and audit 0 passed before the browser-only pass. Large-source memory, HEIC/cross-browser, physical touch, AT and native delivery remain open.

- [Desktop editor](/assets/images/refresh-20261120/scapestudio-editor.jpg),1144x926: real Print view of the labelled synthetic tonal study, before cropping.
- [Phone editor](/assets/images/refresh-20261120/scapestudio-editor-phone.jpg),390x844: actual edited crop.

The synthetic study is clearly identified in the case study. It is a fixture exercising the real image pipeline, not a claim that the program generated a photograph.

## Saer

The owner explicitly confirmed Saer's own component registry. Local bef31ea contains seven installable components, real catalogue previews, customised theme export and a source-only public repository candidate under packages/saer-registry. It excludes the paid scanner. Root verified the visible custom Hex colour export against the generator; an earlier attempted purple-control change that retained green is superseded and is not used as proof. The registry has 35 Loom checks; the separate web security 2b283f8 batch reports 186 checks/build and audit 0. The follow-up a4b05b8 replaces both connection-dialogue custom SVG icons with Lucide and runs the shared guard plus eight regression tests through normal web lint/test scripts. Focused checks and TypeScript pass, with zero blocking shared icon findings; four installer CLI content symbols still require contextual review.

- [Own registry catalogue](/assets/images/refresh-20261120/saer-own-registry.jpg),1138x921: root's actual local catalogue capture with default system previews. It is not the custom-colour export proof.

No public component repository, distribution licence, @saer namespace registration or registry deployment was created in this batch. The source-only folder is prepared for review. The connected Saer surface and the scanner-origin extension remain distinct evidence.

## Portfolio validation

The case studies and screenshot overrides now use these current local captures with explicit captions. Portfolio gallery frames keep the existing shared aspect ratio; source screenshots retain their original dimensions. Source reads, images and agent receipts close the named local checks only. The remaining catalogue, Labs scientific accuracy and actual tool design passes remain open in the ledger.
