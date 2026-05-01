export function LlmUsageInfo() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-dev-text mb-2">
        LLM Pricing Comparison
      </h1>
      <p className="text-dev-text-secondary mb-6">
        Compare costs across LLM providers. Find the right model for your budget.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-dev-text mb-3">
          Why It Matters
        </h2>
        <p className="text-dev-text-secondary mb-3">
          The same prompt can cost $0.002 on one model and $0.15 on another.
          One switch can cut your bill by 10x.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-dev-border p-4 bg-dev-surface">
            <h3 className="text-sm font-semibold text-dev-text mb-2">
              Prices Vary Wildly
            </h3>
            <p className="text-xs text-dev-text-secondary">
              Prompt tokens: free to $15/1M. Completion tokens: $0.06 to $75/1M.
              Expensive doesn&apos;t always mean better.
            </p>
          </div>
          <div className="rounded-md border border-dev-border p-4 bg-dev-surface">
            <h3 className="text-sm font-semibold text-dev-text mb-2">
              Caching Saves 90%
            </h3>
            <p className="text-xs text-dev-text-secondary">
              Anthropic and Google discount cached tokens by 80-90%. A $3/1M
              prompt becomes $0.30.
            </p>
          </div>
          <div className="rounded-md border border-dev-border p-4 bg-dev-surface">
            <h3 className="text-sm font-semibold text-dev-text mb-2">
              New Models Drop Often
            </h3>
            <p className="text-xs text-dev-text-secondary">
              Providers release models weekly. This page tracks live data from
              OpenRouter so you always see current prices.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-dev-text mb-3">
          How Tokens Turn Into Cost
        </h2>
        <p className="text-dev-text-secondary mb-3">
          Providers charge per token (~4 characters each). Every API call has
          three cost components:
        </p>
        <ul className="list-disc list-inside text-dev-text-secondary space-y-2 mb-3">
          <li>
            <strong className="text-dev-text">Prompt tokens</strong> &mdash;
            What you send (system prompt, context, message). Cheapest part.
          </li>
          <li>
            <strong className="text-dev-text">Cache read tokens</strong> &mdash;
            Repeated content that hits the provider&apos;s cache. Heavily
            discounted.
          </li>
          <li>
            <strong className="text-dev-text">Completion tokens</strong> &mdash;
            The model&apos;s response. Typically 2-5x the prompt price.
          </li>
        </ul>
        <p className="text-dev-text-secondary">
          Prices are per 1M tokens. 10K prompt tokens at $3/1M = $0.03. 2K
          completion tokens at $15/1M = $0.03. One request = $0.06. A thousand
          requests = $60.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-dev-text mb-3">
          Track Usage Automatically
        </h2>
        <p className="text-dev-text-secondary mb-4">
          Want to see your real spend without manual math?{" "}
          <a
            href="https://github.com/sweetim/token-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dev-link hover:underline"
          >
            Token Lens
          </a>{" "}
          is a VS Code extension that tracks your LLM token usage and estimated
          costs as you code.
        </p>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=timx.token-lens"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-dev-link px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-link/90"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          Install Token Lens
        </a>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dev-text mb-3">
          Cost Calculator
        </h2>
        <p className="text-dev-text-secondary">
          Use the Cost Calculator button to plug in your token counts and compare
          total cost across every model. Data sourced live from{" "}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dev-link hover:underline"
          >
            OpenRouter
          </a>
          , updated hourly.
        </p>
      </section>
    </div>
  )
}
