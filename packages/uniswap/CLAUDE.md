# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the `packages/uniswap` directory within the Uniswap Universe monorepo. It contains shared TypeScript code used across all Uniswap frontend applications (Web, Mobile, and Extension). The package provides core business logic, components, utilities, and data layers that enable cross-platform consistency.

## Key Commands

### Development Commands

```bash
# Build the package
yarn build
# Run tests in watch mode
# Run tests in watch mode
yarn test --watch  # Using Jest's watch flag
# Type checking
yarn typecheck

# Linting
yarn lint
yarn lint:fix

# Testing
yarn test
yarn test --testPathPattern=ComponentName  # Run specific test
yarn snapshots  # Update Jest snapshots

# GraphQL code generation
yarn graphql:generate

# Contract types generation
yarn contracts
```

### Monorepo Commands (run from root)

```bash
# Install dependencies
yarn install

# Run development checks
yarn local:check

# Initial setup for local development
yarn lfg

# Run specific app
yarn mobile ios
yarn web start
yarn extension start

# Run all checks
yarn g:run-all-checks

# Type check changed files only
yarn g:typecheck:changed

# Lint changed files only
yarn g:lint:changed
```

## Architecture Overview

### Package Structure

- **`src/abis/`** - Smart contract ABIs and TypeChain-generated types
- **`src/components/`** - Shared React components (platform-agnostic)
- **`src/features/`** - Feature modules organized by domain (auth, transactions, tokens, etc.)
- **`src/data/`** - Data layer with Apollo GraphQL and REST API clients
- **`src/hooks/`** - Shared React hooks
- **`src/state/`** - Redux state management with RTK
- **`src/utils/`** - Utility functions

### Platform Support

This package supports multiple platforms through conditional file extensions:

- `.native.ts` - React Native specific (mobile)
- `.web.ts` - Web-specific implementations
- `.ts` - Shared cross-platform code

### Key Technologies

- **TypeScript** with strict typing
- **Redux Toolkit** for state management
- **Apollo Client** for GraphQL
- **React Query (TanStack Query)** for server state
- **Ethers.js & Viem** for blockchain interactions
- **i18next** for internationalization (30+ languages)

### Testing Strategy

- Jest with React Native preset
- Test files use `.test.ts(x)` pattern
- Snapshot testing for components
- Run single test: `yarn test --testPathPattern=ComponentName`

### Code Generation

The package uses several code generation tools:

- **GraphQL Codegen** - Generates TypeScript types from GraphQL schema
- **TypeChain** - Generates TypeScript types from smart contract ABIs
- **Trading API Codegen** - Generates types from OpenAPI spec

## Important Development Notes

1. **Multi-platform Support**: Always consider platform differences when modifying code. Use platform-specific files when necessary.

2. **Type Safety**: This package enforces strict TypeScript. Always run `yarn typecheck` before committing.

3. **State Management**: Redux state is shared across platforms. Changes to reducers affect all apps.

4. **Generated Files**: Don't manually edit files in:
   - `src/abis/types/` (run `yarn contracts`)
   - `src/data/graphql/__generated__/` (run `yarn graphql:generate`)
   - `src/data/tradingApi/__generated__/` (run `yarn tradingapi:generate`)

5. **Testing**: When adding new components or features, include tests. The package uses Jest with React Native preset.

6. **Internationalization**: All user-facing strings must use i18next. Use the `t` function from `react-i18next`.

7. **Analytics**: Use the centralized analytics service for tracking events across platforms.

## Workspace Integration

This package is consumed by:

- `apps/web` - Uniswap web interface
- `apps/mobile` - React Native mobile app
- `apps/extension` - Browser extension

It depends on workspace packages:

- `packages/ui` - Tamagui-based UI components
- `packages/utilities` - Pure utility functions

## Performance Considerations

1. **Bundle Size**: This is a shared package - be mindful of dependencies that might bloat app bundles.
2. **Platform-Specific Code**: Use conditional imports and platform extensions to avoid including unnecessary code.
3. **Memoization**: Use React.memo and useMemo appropriately for expensive computations.
