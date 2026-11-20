# Isolated portfolio framework hardening

20 November 2026. Local candidate based on `f1e9787`, on `codex/portfolio-framework-hardening`. This is an isolated migration, not an adopted deployment or a redesign. The current primary review branch and its later case-study work remain separate.

## Result

Next 15.5.29, React/React DOM 19.2.5 and matching Next ESLint configuration now pass the existing portfolio checks. The test tooling deliberately moves to Vitest 4.1.12 and Vite 7.3.8. All 135 existing tests are retained; two meaningful asynchronous blog-route regressions bring Vitest to 137 tests. The eleven canonical icon regressions and embedded-study coverage regression remain unchanged and pass. Strict normal lint has zero errors and warnings, TypeScript passes, and the complete production build succeeds. The full audit moves from the baseline 21 findings, including three critical findings, to zero. The installed dependency tree reports no peer problems.

## Compatibility fixes

- Await the remaining promised route parameters in the public blog slug API and exploration page/metadata. Tests verify real NextResponse status/body/cache headers with mocked public post IO, draft withholding and an empty sanitised slug. No real content-provider request is made.
- Make existing 600-second segment configuration statically analysable, including the sitemap, and explicitly retain public read-only GET caching after Next 15's default change. Keep the individual slug API request-time, with its existing public CDN response header. Existing POST revalidation behaviour is untouched and was not invoked.
- Preserve ten internal navigation links' exact existing attributes and children while replacing their tag with Next Link. Prefetch is disabled, retaining the previous absence of eager navigation requests. This is a framework integration change; no layout, content, class, style or hero artwork changed.
- Update three React type/ref annotations without changing runtime chart/model logic. Client directives remain before imports. The JSX transform remains automatic in tests and is handled by Next in the build.
- Update react-snap-carousel from 0.4.1 to 0.5.1, whose declared peers include React 19. Its existing hook interface is retained. No carousel redesign or package peer bypass was used.
- Move normal lint to the existing ESLint CLI with a zero-warning limit, preserving App source coverage and the separate public/embedded icon scan. No rule was disabled.

The Node engine requirement follows Vite 7's supported range. Verification used Node 24.21.0. The normal build uses the existing ISR/App Router configuration; it does not switch to static-export mode or force Next 16.

## Narrow dependency repairs

The current Next 15 PostCSS dependency is overridden to patched PostCSS 8.5.23. Tailwind typography's selector parser is patched within its version-six line to 6.1.5. Sucrase is patched to 3.35.1, which replaces its vulnerable Glob dependency with tinyglobby. Tailwind stays on version three. These repairs are represented for both the existing npm overrides and Yarn resolutions/locks. No `--force` or legacy peer override was used.

## Route and cache evidence

The compiled manifest comparison retains all 69 route patterns, with no public URL added or removed. Every one of the baseline 413 prerendered paths remains, with exactly the same revalidation interval. Dynamic fallbacks are unchanged. The new manifest adds only Next 15's internal `/_not-found` page. Next's build log reports 417 generation tasks; that number is not a newly invented count of public pages.

The final complete build ran with Node fetch and HTTP/HTTPS request functions blocked, Vercel/GitHub credential environment inputs unset, and Next telemetry disabled. It still completed. This proves the local content and self-hosted assets are sufficient for that build. It does not test remote GitHub ISR updates or the production hosting configuration.

Machine-readable versions, check counts and public route parity are in `framework-hardening-20261120.json`. No private source paths are included.

## References and limits

Reviewed the official [Next 15 migration guide](https://nextjs.org/docs/app/guides/upgrading/version-15), [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Vitest 4 migration guide](https://v4.vitest.dev/guide/migration.html) and [Vite 7 migration guide](https://v7.vite.dev/guide/migration.html). The component review retained event handlers, server/client boundaries, accessible labels and stable styles; it did not use this migration to introduce unrelated refactors.

Browser checks on the new React/Next runtime remain open, including hydration, client navigation and the carousel. Previous screenshots show the earlier reviewed runtime, not this migration. No new screenshot or whole-site browser certification is claimed. No provider, database, account, analytics write, remote blog operation, revalidation mutation, push or deployment ran. Package registry and official-documentation lookups were used for dependency verification.
