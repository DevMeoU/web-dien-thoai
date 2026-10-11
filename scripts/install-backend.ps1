param([string]$ComposerPath = 'C:\xampp\php\composer')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$env:COMPOSER_HOME = Join-Path $projectRoot '.tool-cache/composer'
$env:COMPOSER_CACHE_DIR = Join-Path $projectRoot '.tool-cache/composer-cache'
Set-Location $projectRoot
if (Test-Path -LiteralPath (Join-Path $projectRoot 'backend/composer.json')) {
    Set-Location (Join-Path $projectRoot 'backend')
    & php -d extension=zip $ComposerPath install --no-interaction --prefer-dist
} else {
    & php -d extension=zip $ComposerPath create-project laravel/laravel backend '^12.0' --no-interaction --prefer-dist
}
exit $LASTEXITCODE
