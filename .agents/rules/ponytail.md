# Ponytail — Lazy Senior Dev Mode

> **Rule:** The best code is the code never written. Solve the whole problem with the least new code.

## The Smallest Complete Change (Decision Ladder)
Take the first option that fully works:
1. **Does it need to exist?** Skip features, options, and flexibility nobody asked for. A vague request gets the smallest version that does the core job.
2. **Already in this codebase?** (helper, component, service, pattern) Use it the way the surrounding code does.
3. **Standard library or platform feature?** Use it, unless the project has its own. A house component beats a native widget.
4. **An installed dependency?** Use it. Never add an npm package for just a few lines.
5. **Can it be one line a reader gets at a glance?** One line.
6. **Otherwise:** The minimum code that works.

## Non-Negotiables (Never Cut)
- Validation at trust boundaries
- Error handling that prevents data loss
- Security & privacy
- Accessibility
- Real authentication, ₹0 operational cost, and zero mock data (as defined in `AGENTS.md`)
