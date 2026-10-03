vendored from TheoOliveira/pi-jev@94169cf (v0.7.0), MIT

Local changes:
- `src/skills.ts`: strip the host's `skill:` command prefix so `/skill:<name>` renders once.
- `src/types.ts` `queryTerms`: tool/skill shortlists drop stop words and turn raw URLs into web terms
  (previously "https"/"com"/"the" matched everything and pushed browser skills out of the Jev candidates).
- `src/model-router.ts`: URL input no longer excludes models (no omp model declares `url` input; URLs are
  fetched with tools), and bare "page"/"website" no longer classifies design prompts as URL tasks.
