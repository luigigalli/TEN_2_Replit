# Branch Structure Documentation

## Current Branch Structure

### Main Branches
- `main`: Production-ready code, protected and requires pull request review
- `develop`: Main development branch, all feature branches merge here first

### Feature Branches
Feature branches follow the naming convention: `feat/<feature-name>`
Current feature branches:
- `feat/validation-messages`: Enhanced validation message system and user feedback
- `feat/db-sync`: Database synchronization and consistency checks
- `feat/windsurf-compatibility`: Cross-environment compatibility features

### Fix Branches
Fix branches follow the naming convention: `fix/<fix-name>`
Current fix branches:
- `fix/type-safety-and-security`: TypeScript type safety improvements

### Environment Branches
Environment-specific branches follow the naming convention: `env/<environment-name>`
Current environment branches:
- `env/validation-messages`: Environment-specific validation configurations

## Branch Protection Rules

### Protected Branches
- `main`: Requires pull request review and passing CI checks
- `develop`: Requires pull request review

### Merge Strategy
1. Feature branches merge into `develop`
2. `develop` merges into `main` for releases
3. Pull request required for all merges
4. Rebase preferred over merge commits

## Environment-Specific Considerations

### Replit Environment
- Uses rebase strategy for pulls
- Maintains development environment configurations
- Branch: `develop` is the default working branch
- Automated environment detection via `REPL_ID`
- Database sync verification before merges
- Automated schema validation using `verify-env.ts`

### Windsurf Environment
- Uses fast-forward only strategy for clean history
- Maintains production environment configurations
- Branch: `main` is the deployment branch
- Strict type checking and validation
- Database sync verification after merges
- Requires manual schema verification

## Sync Process
1. Regular sync between environments using `git-sync.sh`
   - Automated environment detection
   - Safe stashing of local changes
   - Branch-specific pull strategies
   - Automatic conflict detection and handling
2. Post-pull verification with `post-pull.sh`
   - Environment validation
   - Database schema checks
   - Branch integrity verification
   - Environment variable validation
3. Conflict Resolution Process
   - Automatic stashing of local changes
   - Environment-specific merge strategy application
   - Validation of database state post-merge
   - Automated rollback on sync failure

## Branch Management Tools
- `scripts/git-sync.sh`: Handles branch synchronization
- `scripts/post-pull.sh`: Post-sync environment validation
- `scripts/verify-env.ts`: Environment configuration verification

## Maintenance
- Regular cleanup of merged feature branches
- Environment-specific branches preserved
- Protected branches never deleted
- Automated validation after branch operations
- Periodic sync status checks

## Database Considerations
- Schema changes require database sync verification
- Migrations must be committed with related feature branches
- Cross-environment data consistency checks
- Automated schema validation on sync
- Rollback procedures for failed migrations