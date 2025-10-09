---
title: PersonalOS Build and Deployment
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, build, deployment, operations]
---

# PersonalOS Build and Deployment

## Build Process

### Development Build

```bash
# Start development server
npm run tauri dev

# What happens:
# 1. Vite starts dev server on port 3000
# 2. Rust backend compiles in debug mode
# 3. Tauri opens development window
# 4. Hot module reloading enabled
```

**First build**: 5-10 minutes (Rust compilation)  
**Subsequent builds**: 10-30 seconds

### Production Build

```bash
# Build for production
npm run tauri build

# What happens:
# 1. Vite builds frontend (dist/)
# 2. Rust compiles in release mode (optimized)
# 3. Tauri bundles everything
# 4. Creates platform-specific installer
```

**Build time**: 10-20 minutes (first time), 5-10 minutes (subsequent)

**Output location**: `src-tauri/target/release/bundle/`

## Platform-Specific Builds

### Linux

**Supported Formats**:
- `.deb` - Debian/Ubuntu package
- `.AppImage` - Universal Linux application
- `.rpm` - Fedora/RHEL package (future)

**Build Commands**:
```bash
# Build all Linux formats
npm run tauri build

# Build specific format
npm run tauri build -- --bundles deb
npm run tauri build -- --bundles appimage
```

**Output**:
```
src-tauri/target/release/bundle/
├── deb/
│   └── personalos_0.1.0_amd64.deb
└── appimage/
    └── personalos_0.1.0_amd64.AppImage
```

**Installation**:
```bash
# .deb
sudo dpkg -i personalos_0.1.0_amd64.deb

# .AppImage
chmod +x personalos_0.1.0_amd64.AppImage
./personalos_0.1.0_amd64.AppImage
```

### macOS (Future)

**Supported Formats**:
- `.dmg` - Disk image
- `.app` - Application bundle

**Requirements**:
- macOS machine or CI runner
- Apple Developer account (for signing)
- Code signing certificate

**Build Commands**:
```bash
npm run tauri build -- --target universal-apple-darwin
```

### Windows (Future)

**Supported Formats**:
- `.msi` - Windows Installer
- `.exe` - Portable executable

**Requirements**:
- Windows machine or CI runner
- Code signing certificate (optional but recommended)

**Build Commands**:
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Build Configuration

### Version Management

**Update version** in multiple files:

```json
// package.json
{
  "version": "0.1.0"
}
```

```toml
# src-tauri/Cargo.toml
[package]
version = "0.1.0"
```

```json
// src-tauri/tauri.conf.json
{
  "version": "0.1.0"
}
```

**Script to sync versions** (create `scripts/update-version.js`):
```javascript
const fs = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node update-version.js 0.2.0');
  process.exit(1);
}

// Update package.json
const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.version = version;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// Update Cargo.toml
let cargo = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
cargo = cargo.replace(/^version = ".*"$/m, `version = "${version}"`);
fs.writeFileSync('src-tauri/Cargo.toml', cargo);

// Update tauri.conf.json
const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json'));
tauri.version = version;
fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(tauri, null, 2));

console.log(`✅ Updated version to ${version}`);
```

**Usage**:
```bash
node scripts/update-version.js 0.2.0
```

### Build Optimization

**Optimize Rust binary** (`src-tauri/Cargo.toml`):
```toml
[profile.release]
opt-level = "z"      # Optimize for size
lto = true           # Link-time optimization
codegen-units = 1    # Better optimization
strip = true         # Strip symbols
panic = "abort"      # Smaller binary
```

**Bundle size reduction**:
- Frontend: Code splitting, tree shaking (Vite handles this)
- Backend: Release profile optimization
- Assets: Compress images, minimize icons

## Release Process

### Pre-Release Checklist

- [ ] All tests pass
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] No debug code or console.logs
- [ ] Performance tested
- [ ] Security audit passed
- [ ] Manually tested on target platform

### Release Steps

1. **Update Version**
```bash
node scripts/update-version.js 0.2.0
```

2. **Update Changelog**
```markdown
## [0.2.0] - 2025-10-20

### Added
- Feature A
- Feature B

### Fixed
- Bug X
- Bug Y

### Changed
- Improvement Z
```

3. **Commit Changes**
```bash
git add .
git commit -m "chore: bump version to 0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

4. **Build Release**
```bash
npm run tauri build
```

5. **Test Build**
- Install on clean machine
- Run through test plan
- Verify all features work

6. **Create GitHub Release**
- Go to GitHub → Releases → New Release
- Tag: v0.2.0
- Title: PersonalOS v0.2.0
- Description: Copy from CHANGELOG
- Upload binaries from `src-tauri/target/release/bundle/`

7. **Announce Release**
- Update documentation
- Notify users (if any)

## Distribution

### GitHub Releases (Current Plan)

**Pros**:
- Free hosting
- Simple process
- Version control built-in

**Cons**:
- Manual downloads
- No auto-updates initially

**Download Instructions for Users**:
```
1. Go to: https://github.com/[username]/personalos/releases
2. Download latest release for your platform:
   - Linux: .deb or .AppImage
   - macOS: .dmg
   - Windows: .msi
3. Install and run
```

### Future Distribution Options

#### Option 1: Auto-Updates (Tauri Updater)
```json
// tauri.conf.json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/[user]/personalos/releases/latest/download/latest.json"
    ],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY"
  }
}
```

#### Option 2: Package Managers
- **Linux**: Submit to Snap Store, Flatpak
- **macOS**: Submit to Homebrew
- **Windows**: Submit to Winget, Chocolatey

#### Option 3: Self-Hosted
- Host binaries on own server
- Provide download page
- Implement analytics

## Continuous Integration (Future)

### GitHub Actions Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.0-dev \
            build-essential \
            curl \
            wget \
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: linux-builds
          path: src-tauri/target/release/bundle/**/*

  create-release:
    needs: [build-linux]
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            linux-builds/**/*.deb
            linux-builds/**/*.AppImage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Deployment Checklist

### For Each Release

- [ ] Version bumped
- [ ] Changelog updated
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Install test on clean machine
- [ ] GitHub release created
- [ ] Binaries uploaded
- [ ] Release notes published
- [ ] Documentation updated

### Major Release (1.0, 2.0, etc.)

- [ ] Full regression testing
- [ ] Security audit
- [ ] Performance benchmarks
- [ ] Migration guide (if needed)
- [ ] Announcement prepared

## Troubleshooting Builds

### Build Fails on Fresh Machine

**Problem**: Missing dependencies

**Solution**:
```bash
# Linux
sudo apt-get install -y libwebkit2gtk-4.0-dev

# Verify Rust
rustc --version

# Verify Node
node --version
```

### Build Fails with "cannot find -lssl"

**Problem**: Missing OpenSSL

**Solution**:
```bash
sudo apt-get install -y libssl-dev
```

### AppImage Doesn't Run

**Problem**: Missing execute permission

**Solution**:
```bash
chmod +x personalos.AppImage
```

### Large Binary Size

**Problem**: Debug symbols included

**Solution**: Ensure `strip = true` in `Cargo.toml` release profile

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial build/deployment docs | Kris |

