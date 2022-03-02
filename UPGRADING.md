<strong>There have been global changes in the new global version 2.0.0 that you need to be aware of.</strong>

1. <strong>Starting from this version, the module does not require discord.js.</strong>
2. <strong>The module is completely rewritten in TypeScript.</strong>
3. <strong>The module stops supporting JSON and MongoDB database types.</strong>
4. <strong>All methods have been moved to their managers.</strong>

```diff
- <Leveling>.addXP(...)
+ <Leveling>.xp.add(...)

- <Leveling>.addLevel(...)
+ <Leveling>.level.add(...)
```
