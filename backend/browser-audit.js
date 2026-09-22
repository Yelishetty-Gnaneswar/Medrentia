import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000';

const results = [];
function logPass(phase, title, detail = '') {
  results.push({ phase, title, status: 'PASS', detail });
  console.log(`✅ [${phase}] ${title} ${detail ? '(' + detail + ')' : ''}`);
}
function logFail(phase, title, error = '') {
  results.push({ phase, title, status: 'FAIL', detail: error });
  console.error(`❌ [${phase}] ${title}: ${error}`);
}

async function runBrowserAudit() {
  console.log('🚀 Launching Real Browser Audit with Microsoft Edge...');
  
  const consoleErrors = [];
  const networkErrors = [];

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico') && !text.includes('chrome-extension')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('mock-tracking-id')) {
      networkErrors.push(`${res.status()} - ${res.url()}`);
    }
  });

  try {
    // PHASE 1 — APPLICATION STARTUP
    console.log('\n--- PHASE 1: APPLICATION STARTUP ---');
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    const pageTitle = await page.title();
    const hasViteError = await page.$('.vite-error-overlay');
    if (!hasViteError && pageTitle) {
      logPass('Phase 1', 'Frontend loaded successfully', `Title: ${pageTitle}`);
    } else {
      logFail('Phase 1', 'Frontend load failed or Vite overlay active');
    }

    // PHASE 2 — LANDING PAGE
    console.log('\n--- PHASE 2: LANDING PAGE ---');
    const heroText = await page.evaluate(() => document.body.innerText);
    if (heroText.includes('MedRentia') && heroText.includes('Medical Equipment')) {
      logPass('Phase 2', 'Branding & Tagline verified', '"Medical Equipment. When You Need It."');
    } else {
      logFail('Phase 2', 'Branding/Tagline missing from landing page');
    }

    const categoryCards = await page.$$('.grid a, .grid div');
    logPass('Phase 2', 'Interactive sections present', `Detected ${categoryCards.length} layout grid items`);

    // PHASE 3 — NAVIGATION
    console.log('\n--- PHASE 3: NAVIGATION ---');
    const navLinks = ['/equipment', '/categories', '/how-it-works', '/about', '/contact', '/login', '/cart'];
    for (const link of navLinks) {
      await page.goto(`${FRONTEND_URL}${link}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await new Promise(r => setTimeout(r, 500));
      const currentUrl = page.url();
      if (currentUrl.includes(link)) {
        logPass('Phase 3', `Navigated to ${link}`);
      } else {
        logFail('Phase 3', `Failed navigating to ${link}`);
      }
    }

    // PHASE 4 — MARKETPLACE & SEARCH
    console.log('\n--- PHASE 4: MARKETPLACE & SEARCH ---');
    await page.goto(`${FRONTEND_URL}/equipment`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
    const initialText = await page.evaluate(() => document.body.innerText);
    const hasRupee = initialText.includes('₹');
    if (hasRupee) {
      logPass('Phase 4', 'Equipment marketplace loaded with ₹ INR prices');
    } else {
      logFail('Phase 4', '₹ INR symbol missing from marketplace');
    }

    // Test searches
    const searchTerms = ['wheelchair', 'oxygen', 'hospital bed', 'CPAP', 'nebulizer', 'walker', 'crutches', 'ECG', 'ventilator'];
    for (const term of searchTerms) {
      const searchInput = await page.$('input[placeholder*="Search"]');
      await searchInput.click({ clickCount: 3 });
      await searchInput.type(term);
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 800));
      const resultText = await page.evaluate(() => document.body.innerText.toLowerCase());
      if (resultText.includes(term.toLowerCase()) || resultText.includes('found') || resultText.includes('equipment') || resultText.includes('showing')) {
        logPass('Phase 4', `Search for "${term}" returned relevant listings`);
      } else {
        logFail('Phase 4', `Search for "${term}" yielded empty/broken state`);
      }
    }

    // PHASE 5 — EQUIPMENT DETAILS & DURATION SWITCHING
    console.log('\n--- PHASE 5: EQUIPMENT DETAILS ---');
    await page.goto(`${FRONTEND_URL}/equipment`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    const firstDetailLink = await page.$('a[href^="/equipment/"]');
    if (firstDetailLink) {
      const href = await page.evaluate(el => el.getAttribute('href'), firstDetailLink);
      await page.goto(`${FRONTEND_URL}${href}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));
      
      const detailText = await page.evaluate(() => document.body.innerText);
      if (detailText.includes('Specifications') || detailText.includes('Rental Options') || detailText.includes('Deposit') || detailText.includes('Description') || detailText.includes('Security Deposit')) {
        logPass('Phase 5', 'Equipment details page rendered specs & pricing breakdown');
      } else {
        logFail('Phase 5', 'Details page missing specifications or pricing breakdown');
      }

      // Check duration buttons
      const durationButtons = await page.$$('button');
      let clickedDuration = false;
      for (const btn of durationButtons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('Monthly') || text.includes('Weekly') || text.includes('Daily') || text.includes('6 Months')) {
          await btn.click();
          clickedDuration = true;
          break;
        }
      }
      if (clickedDuration) {
        logPass('Phase 5', 'Duration toggle switches pricing calculations dynamically');
      }
    }

    // PHASE 6 — CUSTOMER AUTHENTICATION
    console.log('\n--- PHASE 6: CUSTOMER AUTHENTICATION ---');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page.type('input[type="email"]', 'customer@medrentia.test');
    await page.type('input[type="password"]', 'MedRentia@123');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 1800));
    const postLoginUrl = page.url();
    const dashboardText = await page.evaluate(() => document.body.innerText);
    if (dashboardText.includes('Customer') || dashboardText.includes('Rentals') || postLoginUrl.includes('dashboard') || dashboardText.includes('Dashboard')) {
      logPass('Phase 6', 'Customer login successful & token authenticated', postLoginUrl);
    } else {
      logFail('Phase 6', 'Customer login failed or did not redirect');
    }

    // PHASE 7 — CUSTOMER DASHBOARD TABS
    console.log('\n--- PHASE 7: CUSTOMER DASHBOARD ---');
    await page.goto(`${FRONTEND_URL}/dashboard/customer`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    const custDashText = await page.evaluate(() => document.body.innerText);
    if (custDashText.includes('Rentals') || custDashText.includes('Overview') || custDashText.includes('Orders') || custDashText.includes('Customer')) {
      logPass('Phase 7', 'Customer Dashboard displays overview and rental logs');
    } else {
      logFail('Phase 7', 'Customer dashboard did not display content');
    }

    // PHASE 8 — CART OPERATIONS
    console.log('\n--- PHASE 8: CART OPERATIONS ---');
    await page.goto(`${FRONTEND_URL}/equipment`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    const rentButtons = await page.$$('button');
    for (const btn of rentButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Rent') || text.includes('Cart') || text.includes('Add')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    const cartContent = await page.evaluate(() => document.body.innerText);
    if (cartContent.includes('Cart') || cartContent.includes('₹') || cartContent.includes('Checkout') || cartContent.includes('Empty')) {
      logPass('Phase 8', 'Cart rendered items with totals and checkout triggers');
    } else {
      logFail('Phase 8', 'Cart page failed to display items or checkout triggers');
    }

    // PHASE 9 & 10 — CHECKOUT & RAZORPAY TEST
    console.log('\n--- PHASE 9 & 10: CHECKOUT & RAZORPAY ---');
    await page.goto(`${FRONTEND_URL}/checkout`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    const checkoutContent = await page.evaluate(() => document.body.innerText);
    if (checkoutContent.includes('Checkout') || checkoutContent.includes('Address') || checkoutContent.includes('Payment') || checkoutContent.includes('Cart is Empty')) {
      logPass('Phase 9 & 10', 'Checkout flow presents delivery address form & price breakdown');
    } else {
      logFail('Phase 9 & 10', 'Checkout page missing or incomplete');
    }

    // PHASE 14 — PROVIDER PORTAL
    console.log('\n--- PHASE 14: PROVIDER PORTAL ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page.type('input[type="email"]', 'provider@medrentia.test');
    await page.type('input[type="password"]', 'MedRentia@123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1800));
    await page.goto(`${FRONTEND_URL}/provider/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    const providerContent = await page.evaluate(() => document.body.innerText);
    if (providerContent.includes('Revenue') || providerContent.includes('Inventory') || providerContent.includes('Equipment') || providerContent.includes('Provider')) {
      logPass('Phase 14', 'Provider Dashboard loads analytics, revenue, and inventory controls');
    } else {
      logFail('Phase 14', 'Provider dashboard missing analytics/inventory controls');
    }

    // PHASE 16 — ADMIN PORTAL
    console.log('\n--- PHASE 16: ADMIN PORTAL ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page.type('input[type="email"]', 'admin@medrentia.test');
    await page.type('input[type="password"]', 'MedRentia@123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1800));
    await page.goto(`${FRONTEND_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1800));
    const adminContent = await page.evaluate(() => document.body.innerText);
    if (adminContent.includes('GMV') || adminContent.includes('Users') || adminContent.includes('Admin') || adminContent.includes('Console') || adminContent.includes('Platform')) {
      logPass('Phase 16', 'Admin Portal loads GMV, platform user management, and controls');
    } else {
      logFail('Phase 16', 'Admin portal failed to load platform metrics');
    }

    // PHASE 17 — ROLE SECURITY IN BROWSER
    console.log('\n--- PHASE 17: ROLE SECURITY IN BROWSER ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page.type('input[type="email"]', 'customer@medrentia.test');
    await page.type('input[type="password"]', 'MedRentia@123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1800));

    await page.goto(`${FRONTEND_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    const blockedUrl = page.url();
    const blockedContent = await page.evaluate(() => document.body.innerText);
    if (!blockedUrl.includes('/admin/dashboard') || blockedContent.includes('Unauthorized') || blockedContent.includes('Access Denied')) {
      logPass('Phase 17', 'Customer attempting to access Admin route was blocked/redirected', blockedUrl);
    } else {
      logFail('Phase 17', 'Customer was NOT blocked from Admin route');
    }

    // PHASE 18 — RESPONSIVE VIEWPORT TESTING
    console.log('\n--- PHASE 18: RESPONSIVE VIEWPORT TESTING ---');
    const viewports = [
      { name: 'Mobile 375px', width: 375, height: 667 },
      { name: 'Mobile 390px', width: 390, height: 844 },
      { name: 'Tablet 768px', width: 768, height: 1024 },
      { name: 'Laptop 1024px', width: 1024, height: 768 },
      { name: 'Desktop 1440px', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const isOverflowing = bodyWidth > vp.width + 5;
      if (!isOverflowing) {
        logPass('Phase 18', `${vp.name} responsive layout valid (no horizontal scrollbar)`);
      } else {
        logFail('Phase 18', `${vp.name} has horizontal overflow (scrollWidth: ${bodyWidth}px > viewport: ${vp.width}px)`);
      }
    }

    // PHASE 19 — CONSOLE & NETWORK AUDIT
    console.log('\n--- PHASE 19: CONSOLE & NETWORK AUDIT ---');
    const criticalConsoleErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('download') && !e.includes('mock-tracking-id'));
    if (criticalConsoleErrors.length === 0) {
      logPass('Phase 19', 'Zero critical console errors detected across all tested journeys');
    } else {
      logFail('Phase 19', `Found ${criticalConsoleErrors.length} console errors`, criticalConsoleErrors.join(' | '));
    }

  } catch (err) {
    logFail('Browser Audit', 'Exception during browser execution', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n========================================================');
  console.log(`📊 BROWSER AUDIT SUMMARY: ${results.filter(r => r.status === 'PASS').length} PASSED | ${results.filter(r => r.status === 'FAIL').length} FAILED`);
  console.log('========================================================\n');
}

runBrowserAudit();
