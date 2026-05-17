#!/usr/bin/env node

/**
 * BeritaKarya SMTP Email Verification Script
 * 
 * This script reads SMTP configuration from the running environment / .env file
 * and runs Nodemailer's verify() method to establish a connection and check authentication credentials.
 * 
 * Usage:
 *   node apps/api/verify-smtp.js
 */

const { join } = require('path')
const existsSync = require('fs').existsSync

// Load dotenv
try {
  require('dotenv').config()
} catch (e) {
  // If dotenv isn't installed globally, try monorepo's node_modules
  try {
    require(join(__dirname, 'node_modules', 'dotenv')).config()
  } catch (err) {
    console.log('💡 Note: Unable to load dotenv, checking system environment variables directly.')
  }
}

const nodemailer = require('nodemailer')

console.log('🔍 **BeritaKarya SMTP Email Verification**\n')

const host = process.env.SMTP_HOST
const port = parseInt(process.env.SMTP_PORT || '587')
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS

console.log('📋 Loaded SMTP Configurations:')
console.log(`  SMTP Host: ${host || '❌ MISSING'}`)
console.log(`  SMTP Port: ${port || '❌ MISSING'}`)
console.log(`  SMTP User: ${user || '❌ MISSING'}`)
console.log(`  SMTP Pass: ${pass ? '•••••••• (SET)' : '❌ MISSING'}`)
console.log(`  Email Enabled: ${process.env.EMAIL_ENABLED || 'false'}\n`)

if (!host || !user || !pass) {
  console.error('❌ Error: Missing required SMTP environment variables in your .env file!')
  console.log('Please ensure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are correctly set.')
  process.exit(1)
}

console.log('🔌 Connecting to SMTP server and validating credentials...')

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false // Allow checking self-signed certs in test
  }
})

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ **CONNECTION FAILED!**')
    console.error('Could not authenticate or establish a secure handshake with your mail server.')
    console.error('Error Details:', error.message)
    console.log('\n💡 Troubleshooting tips:')
    console.log('  1. Check if SMTP_HOST is correct.')
    console.log('  2. Check if SMTP_PORT matches (465 is for SSL, 587 is for TLS).')
    console.log('  3. Double check your username (email) and password.')
    console.log('  4. If using Gmail/Outlook, make sure you created an "App Password" (Sandi Aplikasi) rather than using your primary account password.')
    console.log('  5. Ensure your hosting provider or VPS firewall allows outbound connections on that port.')
    process.exit(1)
  } else {
    console.log('\n✅ **SUCCESS! Connection & credentials are 100% correct!**')
    console.log('Your mail server is ready to send automatic notifications to your team.')
    process.exit(0)
  }
})
