#!/usr/bin/env node
/**
 * sync-clean.cjs
 * Ensures single source of truth for the React SPA by removing duplicate static HTML
 * that could drift from the JSX-based implementation.
 *
 * Actions:
 * - If public/index.html exists, delete it (React app mounts via root index.html + src/*).
 * - Remove any standalone .html files in dist except index.html (SPA fallback will be used).
 */

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const pub = path.join(root, 'public')
const dist = path.join(root, 'dist')

function removeIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      log(`Removed duplicate: ${path.relative(root, filePath)}`)
    }
  } catch (e) {
    warn(`Failed to remove ${filePath}: ${e.message}`)
  }
}

function log(msg) { console.log(`[sync-clean] ${msg}`) }
function warn(msg) { console.warn(`[sync-clean] ${msg}`) }

// 1) Delete public/index.html to avoid drift with React App.jsx landing
try {
  const pubIndex = path.join(pub, 'index.html')
  removeIfExists(pubIndex)
} catch (e) {
  // ignore if public missing
}

// 2) Clean dist HTML duplicates, keeping index.html only
try {
  if (fs.existsSync(dist)) {
    const entries = fs.readdirSync(dist)
    for (const name of entries) {
      const full = path.join(dist, name)
      const stat = fs.statSync(full)
      if (stat.isFile() && path.extname(name).toLowerCase() === '.html' && name.toLowerCase() !== 'index.html') {
        removeIfExists(full)
      }
    }
  }
} catch (e) {
  warn(`Failed to scan dist: ${e.message}`)
}
