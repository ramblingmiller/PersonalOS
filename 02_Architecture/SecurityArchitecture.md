---
title: PersonalOS Security Architecture
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, security, architecture]
---

# PersonalOS Security Architecture

## Security Principles

1. **Local-First Security**: All sensitive data stays on user's machine
2. **Least Privilege**: Minimum permissions required
3. **Defense in Depth**: Multiple layers of security
4. **Secure by Default**: Security is not opt-in
5. **Privacy First**: No telemetry, no phone-home

## Threat Model

### Assets to Protect
1. **User Files**: Markdown documents with potentially sensitive information
2. **API Keys**: OpenAI, Anthropic, or other AI provider keys
3. **Configuration**: User settings and preferences
4. **Index Database**: Cached file contents and metadata

### Threat Actors
1. **Malicious Applications**: Other apps trying to access PersonalOS data
2. **File System Attacks**: Path traversal, symlink attacks
3. **Network Attacks**: Man-in-the-middle on AI API calls
4. **Physical Access**: Unauthorized physical access to machine

### Out of Scope Threats
- **State-level actors**: Not defending against nation-state attacks
- **Hardware attacks**: No protection against compromised hardware
- **OS vulnerabilities**: Rely on OS security

## Security Layers

### 1. File System Security

#### Path Validation

```rust
/// Validates path is within vault and prevents traversal attacks
fn validate_path(vault_root: &Path, requested_path: &Path) -> Result<PathBuf> {
    // Resolve to canonical path (follows symlinks)
    let canonical = requested_path.canonicalize()?;
    
    // Ensure path is within vault
    if !canonical.starts_with(vault_root) {
        return Err(SecurityError::PathTraversal);
    }
    
    // Check for suspicious patterns
    if requested_path.to_string_lossy().contains("..") {
        return Err(SecurityError::InvalidPath);
    }
    
    Ok(canonical)
}
```

#### File Operation Security

```rust
pub enum FileOperation {
    Read,
    Write,
    Delete,
    Execute,  // Never allowed
}

/// Check if operation is allowed on path
fn is_operation_allowed(path: &Path, op: FileOperation) -> bool {
    match op {
        FileOperation::Execute => false,  // Never execute files
        FileOperation::Delete => {
            // Require confirmation for destructive ops
            confirm_with_user(&format!("Delete {}?", path.display()))
        },
        _ => true
    }
}
```

#### Symlink Handling

```rust
/// Resolve symlinks safely
fn resolve_symlink(path: &Path, vault_root: &Path) -> Result<PathBuf> {
    let target = fs::read_link(path)?;
    
    // Ensure symlink target is within vault
    validate_path(vault_root, &target)?;
    
    Ok(target)
}
```

### 2. Data Storage Security

#### API Key Storage

**Platform-specific secure storage**:

```rust
use keyring::Entry;

pub struct SecureStorage {
    service: String,  // "PersonalOS"
}

impl SecureStorage {
    /// Store API key in OS keyring
    pub fn store_api_key(&self, provider: &str, key: &str) -> Result<()> {
        let entry = Entry::new(&self.service, provider)?;
        entry.set_password(key)?;
        Ok(())
    }
    
    /// Retrieve API key from OS keyring
    pub fn get_api_key(&self, provider: &str) -> Result<String> {
        let entry = Entry::new(&self.service, provider)?;
        let password = entry.get_password()?;
        Ok(password)
    }
}
```

**Platform implementations**:
- **Linux**: `libsecret` (GNOME Keyring, KDE Wallet)
- **macOS**: Keychain Services
- **Windows**: Credential Manager

#### Configuration File Security

```rust
/// Configuration with security considerations
#[derive(Serialize, Deserialize)]
pub struct Config {
    pub vault_path: PathBuf,
    pub theme: Theme,
    
    #[serde(skip)]  // Never serialize API keys
    pub api_key: Option<String>,
}

/// Save config with restricted permissions
fn save_config(config: &Config, path: &Path) -> Result<()> {
    let json = serde_json::to_string_pretty(config)?;
    
    // Write with 0600 permissions (owner read/write only)
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create(true)
        .mode(0o600)  // Unix permissions
        .open(path)?;
    
    file.write_all(json.as_bytes())?;
    Ok(())
}
```

#### Database Security

```rust
/// SQLite database with security settings
fn open_database(path: &Path) -> Result<Connection> {
    let conn = Connection::open(path)?;
    
    // Enable Write-Ahead Logging for better concurrency
    conn.execute("PRAGMA journal_mode=WAL", [])?;
    
    // Secure delete (overwrite deleted data)
    conn.execute("PRAGMA secure_delete=ON", [])?;
    
    Ok(conn)
}
```

### 3. Inter-Process Communication (IPC) Security

#### Tauri Permission System

```json
{
  "permissions": {
    "fs": {
      "scope": ["$VAULT/**"],
      "deny": [
        "/etc/**",
        "/sys/**",
        "/proc/**",
        "$HOME/.ssh/**"
      ]
    },
    "http": {
      "scope": [
        "https://api.openai.com/**",
        "https://api.anthropic.com/**"
      ]
    }
  }
}
```

#### Command Validation

```rust
#[tauri::command]
async fn read_file(path: String, state: State<'_, AppState>) -> Result<String, String> {
    // 1. Validate path
    let safe_path = validate_path(&state.vault_root, Path::new(&path))
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    // 2. Check file size (prevent loading huge files)
    let metadata = fs::metadata(&safe_path)
        .map_err(|e| format!("Cannot read file: {}", e))?;
    
    if metadata.len() > MAX_FILE_SIZE {
        return Err("File too large".to_string());
    }
    
    // 3. Read file
    let content = fs::read_to_string(&safe_path)
        .map_err(|e| format!("Cannot read file: {}", e))?;
    
    // 4. Sanitize content (remove null bytes, etc.)
    let sanitized = sanitize_content(&content);
    
    Ok(sanitized)
}
```

#### Input Sanitization

```rust
/// Sanitize user input to prevent injection attacks
fn sanitize_input(input: &str) -> String {
    input
        .replace('\0', "")           // Remove null bytes
        .replace('\u{FEFF}', "")     // Remove BOM
        .trim()
        .to_string()
}

/// Sanitize SQL LIKE patterns
fn sanitize_like_pattern(pattern: &str) -> String {
    pattern
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}
```

### 4. Network Security

#### HTTPS-Only AI API Calls

```rust
pub struct AIClient {
    client: reqwest::Client,
}

impl AIClient {
    pub fn new() -> Result<Self> {
        let client = reqwest::Client::builder()
            .https_only(true)                    // Only HTTPS connections
            .timeout(Duration::from_secs(30))    // Prevent hanging
            .use_rustls_tls()                    // Use Rustls for TLS
            .build()?;
        
        Ok(Self { client })
    }
    
    pub async fn send_request(&self, url: &str, body: &str, api_key: &str) -> Result<String> {
        // Validate URL
        if !url.starts_with("https://") {
            return Err(Error::InsecureConnection);
        }
        
        let response = self.client
            .post(url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .body(body.to_string())
            .send()
            .await?;
        
        // Validate response
        if !response.status().is_success() {
            return Err(Error::ApiError(response.status()));
        }
        
        let text = response.text().await?;
        Ok(text)
    }
}
```

#### Certificate Pinning (Optional Future Enhancement)

```rust
// For extra security, pin certificates for known APIs
const OPENAI_CERT_PINS: &[&str] = &[
    "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
];

fn verify_certificate(cert: &Certificate) -> bool {
    let digest = sha256(cert.der());
    OPENAI_CERT_PINS.contains(&digest.as_str())
}
```

### 5. Frontend Security

#### Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               connect-src 'self' https://api.openai.com https://api.anthropic.com;
               font-src 'self';
               object-src 'none';
               base-uri 'self';
               form-action 'self';
               frame-ancestors 'none';">
```

#### XSS Prevention

```typescript
// Sanitize HTML in markdown rendering
import DOMPurify from 'dompurify';

function renderMarkdown(markdown: string): string {
    const html = markdownToHTML(markdown);
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'class'],
        ALLOW_DATA_ATTR: false,
    });
    return clean;
}
```

#### Secure Event Handling

```typescript
// Prevent event injection
function safeEventHandler(handler: (event: Event) => void) {
    return (event: Event) => {
        // Prevent event bubbling to untrusted contexts
        event.stopPropagation();
        
        // Call handler
        handler(event);
    };
}
```

## Security Best Practices

### Code Practices

#### Rust Backend
```rust
// ✅ DO: Use Result types for all operations
fn read_file(path: &Path) -> Result<String, Error> { ... }

// ✅ DO: Validate all inputs
fn process_path(path: &str) -> Result<PathBuf> {
    if path.is_empty() {
        return Err(Error::EmptyPath);
    }
    // ... more validation
}

// ❌ DON'T: Use unwrap() in production code
let content = fs::read_to_string(path).unwrap();  // BAD

// ✅ DO: Handle errors explicitly
let content = fs::read_to_string(path)
    .map_err(|e| Error::FileRead(e))?;  // GOOD
```

#### TypeScript Frontend
```typescript
// ✅ DO: Validate data from backend
interface FileResponse {
    path: string;
    content: string;
}

function handleFileData(data: unknown): FileResponse {
    if (!isFileResponse(data)) {
        throw new Error('Invalid file data');
    }
    return data;
}

// ✅ DO: Use TypeScript strict mode
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
    }
}
```

### Secrets Management

```rust
// ❌ DON'T: Log sensitive data
error!("API call failed with key: {}", api_key);  // BAD

// ✅ DO: Redact sensitive data in logs
error!("API call failed with key: [REDACTED]");  // GOOD

// ✅ DO: Clear sensitive data from memory when done
fn use_api_key(key: String) {
    // Use key
    // ...
    
    // Clear from memory
    let mut key = key;
    key.zeroize();  // Using zeroize crate
}
```

### Error Messages

```rust
// ❌ DON'T: Expose internal paths in errors
Err(format!("Cannot read /home/user/.secret/file.txt"))  // BAD

// ✅ DO: Provide generic error messages
Err("Cannot read file".to_string())  // GOOD

// ✅ DO: Log detailed errors, show generic to user
error!("Cannot read {:?}: {}", path, e);  // To log
Err("Cannot read file".to_string())       // To user
```

## Security Testing

### Automated Security Checks

```bash
# Rust security audit
cargo audit

# Dependency vulnerability scanning
cargo deny check

# Lint for security issues
cargo clippy -- -D warnings

# Frontend security audit
npm audit
```

### Manual Security Testing

**Test Cases**:
1. **Path Traversal**: Try accessing `../../../../etc/passwd`
2. **Symlink Attack**: Create symlink outside vault, try to follow
3. **Large Files**: Try to open 1GB file
4. **Injection**: Try SQL injection in search queries
5. **API Key Exposure**: Check network traffic, logs, error messages
6. **XSS**: Try injecting `<script>` tags in markdown

## Incident Response

### Data Breach Response

If API keys are compromised:
1. Revoke old API keys at provider
2. Generate new API keys
3. Update keys in PersonalOS
4. Rotate any affected credentials

### Vulnerability Disclosure

**Contact**: [Your contact method]

**Response Timeline**:
- Acknowledgment: 48 hours
- Initial assessment: 7 days
- Fix timeline: Depends on severity
- Public disclosure: After fix released

## Security Updates

### Update Strategy
- **Critical**: Release patch immediately
- **High**: Release within 1 week
- **Medium**: Include in next release
- **Low**: Address opportunistically

### Dependency Updates
- Monitor security advisories
- Update dependencies monthly
- Test thoroughly before release

## Compliance

### Data Privacy
- **No data collection**: App doesn't collect user data
- **No analytics**: No telemetry or usage tracking
- **GDPR compliant**: By design (no data leaves machine)

### Open Source Security
- **Transparent**: All code open source
- **Auditable**: Anyone can review security
- **Community**: Accept security reports

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial security architecture | Kris |



