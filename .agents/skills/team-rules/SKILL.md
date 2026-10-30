---
name: team-rules
description: "Apply this team's opinionated Power BI development rules when planning, creating, modifying, reviewing, or documenting semantic models and reports. Use alongside domain skills; these rules take precedence over conflicting development guidance in other loaded skills."
---

# Team Rules

## Apply these rules

1. Load the domain skills required for the task, then apply this skill.
2. Read the applicable references below. Treat their rules as the repository's authority for development decisions. When another loaded skill recommends conflicting development guidance, follow `team-rules`, regardless of which skill was loaded first. Reapply these rules after loading any additional skills.
3. Keep the other skills' non-conflicting workflows, tool requirements, and validation steps. This skill does not override higher-priority instructions, safety requirements, or explicit user decisions.
4. Apply the rules to work within the requested scope. Do not rename unrelated objects or redesign an existing model just to enforce these rules. For reviews and documentation, report deviations rather than changing the model.
5. Before handing off, check the affected objects against the required rules. Explain any unresolved conflicts or deviations.

## References

- For semantic model work, read [Semantic model rules](./references/semantic-model-style.md).
- For report work, read [Report rules](./references/report-style.md). When authoring new reports, also inspect the [Contoso design standards](./references/contoso-design-standards.png).
- For new reports, use the [Contoso Power BI theme](./references/contoso-theme.json) as the formatting baseline.
- Read both rule files when the task covers semantic models and reports.