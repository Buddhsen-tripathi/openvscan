# Contributing to OpenVScan

Thank you for your interest in contributing to OpenVScan! We welcome contributions from the community and are grateful for your support in making vulnerability scanning more accessible and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **Docker** and **Docker Compose** (for local development)
- **Git**
- **PostgreSQL** (v14 or higher, or use Docker)
- **Redis** (or use Docker)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/openvscan.git
cd openvscan
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/Buddhsen-tripathi/openvscan.git
```

## Development Setup

### 1. Install Dependencies

OpenVScan uses pnpm workspaces for monorepo management:

```bash
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure service-specific environment files:

**API Configuration** (`api/.env`):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/openvscan
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Web Configuration** (`web/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Environment

#### Option A: Using Docker (Recommended)

Start all services with Docker Compose:

```bash
docker compose up --build
```

- **UI**: http://localhost:3000
- **API**: http://localhost:5000
- **API Docs** (Swagger): http://localhost:5000/docs

#### Option B: Manual Setup

Start individual services:

**Terminal 1 - API Server:**
```bash
pnpm --filter api start:dev
```

**Terminal 2 - Web Server:**
```bash
pnpm --filter web dev
```

**Terminal 3 - Database (if not using Docker):**
```bash
# Start PostgreSQL and Redis locally
```

## Project Structure

```
openvscan/
├── api/              # NestJS 11 backend service
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Shared utilities
│   │   └── main.ts   # Application entry
│   ├── test/         # API tests
│   └── package.json
├── web/              # Next.js 15 / React 19 frontend
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and hooks
│   └── package.json
├── deploy/           # Deployment manifests
├── docker/           # Docker configurations
├── packages/         # Shared libraries (future)
├── scripts/          # Automation scripts
└── tests/            # E2E and integration tests
```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

- `feature/your-feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring
- `test/test-description` - Test additions or updates

### Making Changes

1. **Create a new branch** from `main`:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following our coding guidelines

3. **Commit your changes** with clear, descriptive messages:

```bash
git commit -m "feat: add vulnerability deduplication logic"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

4. **Keep your branch updated**:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** rules configured in the project
- Use **async/await** instead of callbacks or raw promises
- Prefer **functional programming** patterns where appropriate
- Write **self-documenting code** with clear variable and function names

### API (NestJS)

- Follow NestJS best practices and conventions
- Use **dependency injection** for services
- Implement **DTOs** for request/response validation
- Add **Swagger decorators** for API documentation
- Handle errors with appropriate **HTTP status codes**
- Use **TypeORM** for database operations
- Write **unit tests** for services and **e2e tests** for controllers

Example controller:

```typescript
@Controller('scans')
@ApiTags('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scan' })
  @ApiResponse({ status: 201, type: ScanDto })
  async create(@Body() createScanDto: CreateScanDto): Promise<ScanDto> {
    return this.scansService.create(createScanDto);
  }
}
```

### Web (Next.js/React)

- Use **React Server Components** where possible
- Follow **Next.js 15 App Router** conventions
- Use **Tailwind CSS** for styling (avoid inline styles)
- Create **reusable components** in the `components/` directory
- Use **TypeScript interfaces** for props
- Implement **proper error boundaries**
- Follow **accessibility best practices** (ARIA labels, semantic HTML)

Example component:

```typescript
interface ScanResultProps {
  scanId: string;
  findings: Finding[];
}

export function ScanResult({ scanId, findings }: ScanResultProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold">Scan Results</h2>
      {/* Component content */}
    </div>
  );
}
```

### Code Formatting

Run the formatter before committing:

```bash
pnpm format
```

Ensure linting passes:

```bash
pnpm lint
```

Fix auto-fixable issues:

```bash
pnpm lint --fix
```

## Testing

### Running Tests

**All tests:**
```bash
pnpm test
```

**API tests only:**
```bash
pnpm --filter api test
```

**Web tests only:**
```bash
pnpm --filter web test
```

**E2E tests:**
```bash
pnpm test:e2e
```

**Worker tests:**
```bash
pytest tests/workers
```

### Writing Tests

- Write **unit tests** for business logic
- Write **integration tests** for API endpoints
- Write **E2E tests** for critical user flows
- Aim for **meaningful test coverage**, not just high percentages
- Use **descriptive test names** that explain what is being tested

Example test:

```typescript
describe('ScansService', () => {
  it('should create a scan with valid configuration', async () => {
    const createScanDto: CreateScanDto = {
      projectId: '123',
      targetUrl: 'https://example.com',
      scanners: ['zap', 'trivy'],
    };

    const result = await service.create(createScanDto);

    expect(result.id).toBeDefined();
    expect(result.status).toBe('pending');
  });
});
```

### Test Coverage

Ensure your changes maintain or improve test coverage:

```bash
pnpm test:coverage
```

## Submitting Changes

### Before Submitting a Pull Request

1. **Run all checks** locally:

```bash
pnpm lint
pnpm test
pnpm build
```

2. **Update documentation** if you've changed APIs or added features

3. **Add tests** for new functionality

4. **Update CHANGELOG.md** if applicable

### Creating a Pull Request

1. **Push your branch** to your fork:

```bash
git push origin feature/your-feature-name
```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** describing the change
   - **Detailed description** of what was changed and why
   - **Screenshots or recordings** for UI changes
   - **Reference to related issues** (e.g., "Fixes #123")
   - **Testing instructions** for reviewers

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## How Has This Been Tested?
Description of testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Code Review Process

- All PRs require **at least one approval** from maintainers
- Address all review comments promptly
- Keep PRs **focused and reasonably sized** (< 500 lines when possible)
- Be **responsive to feedback** and willing to iterate

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node version, browser, etc.)
- **Screenshots or logs** if applicable
- **Possible solution** if you have one

### Feature Requests

When suggesting features, please include:

- **Clear use case** and motivation
- **Proposed solution** or implementation ideas
- **Alternatives considered**
- **Additional context** or examples

## Community

### Getting Help

- **GitHub Discussions** - Ask questions and share ideas
- **GitHub Issues** - Report bugs and request features
- **Pull Requests** - Review and discuss code changes

### Recognition

Contributors will be recognized in:
- Release notes for significant contributions
- The project README
- Our contributors page

## License

By contributing to OpenVScan, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to OpenVScan! Your efforts help make security testing more accessible to everyone. 🎉