import cron from 'node-cron'
import { syncJobsFromDataGoKr, geocodePendingCompanies } from './sync'

/**
 * Scheduler service for periodic data synchronization
 *
 * Runs:
 * - Data sync from data.go.kr: Daily at 3:00 AM KST
 * - Geocoding retry for failed addresses: Every 6 hours
 */

console.log('Starting scheduler service...')

// Daily sync at 3:00 AM KST (UTC+9 -> 18:00 UTC previous day)
cron.schedule('0 18 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Starting scheduled data sync...`)
  try {
    const result = await syncJobsFromDataGoKr()
    console.log(`[${new Date().toISOString()}] Sync completed:`, result)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sync failed:`, error)
  }
})

// Geocoding retry every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Starting geocoding retry...`)
  try {
    const count = await geocodePendingCompanies()
    console.log(`[${new Date().toISOString()}] Geocoded ${count} companies`)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Geocoding retry failed:`, error)
  }
})

// Initial sync on startup (after 10 seconds delay)
setTimeout(async () => {
  console.log('Running initial sync...')
  try {
    const result = await syncJobsFromDataGoKr()
    console.log('Initial sync completed:', result)
  } catch (error) {
    console.error('Initial sync failed:', error)
  }
}, 10000)

console.log('Scheduler service started. Waiting for scheduled tasks...')

// Keep process running
process.on('SIGINT', () => {
  console.log('Scheduler service shutting down...')
  process.exit(0)
})
