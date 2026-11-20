# Portfolio design system

Use Prism controls for portfolio interactions. Preserve the portfolio's own visual identity when adapting them. Icons must be Lucide, including selected indicators and chevrons.

Use Saer to inspect the existing system before proposing replacement components or token changes. `saer scan .` is the normal installed CLI workflow; `saer.config.json` holds guard settings. This checkout also has a development components audit, documented in docs/quality/saer-workflow.md, to exercise unreleased library-origin detection. Do not represent that source-engine report as a released full scan.

Copied components need reviewed origin records in saer.components.json. A local checksum verifies the reviewed copy, not upstream authenticity. Do not automatically refresh a checksum just to silence a changed-source warning. Review changes first.

Reports distinguish observed imports, configured copies, declared provenance and unknown evidence. Shared names do not prove duplicate purpose, and static accessibility checks do not prove browser conformance. Do not automatically remove unused exports or rewrite findings.
