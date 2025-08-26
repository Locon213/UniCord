# Publishing

1. Set `NPM_TOKEN` secret in GitHub repository settings.
2. Create a tag `vX.Y.Z` and push: `git tag v0.2.0 && git push --tags`.
3. GitHub Actions will build, test and publish to npm.
