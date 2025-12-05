## Blackletter Compass

Blackletter Compass is a lightweight legal research companion tuned to Black's Law Dictionary terminology, historical writ practice, and obscure statutes that occasionally linger in modern codes. It runs entirely client-side with a curated knowledge base and deterministic retrieval heuristics—no external API keys or LLM calls required.

### Features

- Conversational interface for practitioners to pose questions about legacy doctrines, archaic writs, and foundational definitions.
- Curated knowledge base referencing Black's Law Dictionary editions, early American case law, and notable obscure statutes.
- Transparent citations with era, jurisdiction, and matched keyword context for each response.
- Built with the Next.js App Router, styled via Tailwind CSS, and deployable to Vercel with zero additional configuration.

### Getting Started

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Testing the Agent

Try questions such as:

- `Explain the writ of scire facias and where it might still apply.`
- `Summarize Black's Law definition of consideration and its modern significance.`
- `What is the doctrine of ancient lights and does it have U.S. relevance?`

### Disclaimer

Blackletter Compass is a research assistant only. Always validate cited authorities, confirm current statutory status, and consult licensed counsel before relying on any output.
