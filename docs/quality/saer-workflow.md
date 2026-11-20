# Saer on the portfolio

The portfolio now has Saer guard configuration, copied-component provenance and a repeatable development component audit. The Saer CLI library-origin extension is local and has not been released.

Normal installed CLI workflow: `saer scan .`. Full-scan access follows Saer's normal account checks. No account or release setting was changed for this work.

To reproduce the development component audit, use a Python environment with Saer's development dependencies (`pathspec`, `tinycss2`, `pyyaml`) and run:

```sh
python scripts/audit-saer.py --engine /path/to/saer/packages/saer-cli/engine
```

This calls the same components analyser that the CLI uses. It respects this checkout's gitignore rules, does not render the website, and writes JSON plus Markdown/HTML under ignored `.saer/components`. It is a component-domain development report, not the full colour/typography/foundations/accessibility scan. Dated checked-in evidence is in saer-components-20261120.json and .md.

The reviewed Prism Reserved Select copy is recorded in saer.components.json with its original repository, revision, source path and current local checksum. A scan confirms that LabLibrary imports and renders that export. The observed code is an adaptation; its upstream attribution is an explicit declaration. Local integrity is verified independently of that attribution.

Radix detection is exercised with imported primitives. shadcn/ui detection is exercised with its official components.json schema, resolved ui alias and actual JSX uses of copied components. Neither kit is currently in use on this portfolio. The real scan also sees Lucide imports. Saer does not infer a kit from a directory or component name alone.

The initial component audit found two shared export names (Breadcrumbs and LensPhrase) and five apparently unused exports. These remain review items. Breadcrumbs includes a route wrapper around the shared renderer, so its same-name finding alone is not proof of duplicated behaviour. No source was removed.
