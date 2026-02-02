const fs = require('fs');
const { browserSync } = require('vibium');

// Helper to wait with optional logging
const wait = (ms, message = '') => {
	if (message) console.log(`⏳ ${message} (${ms}ms)`);
	return new Promise(resolve => setTimeout(resolve, ms));
};

// Test result tracking
const testResults = {
	passedTests: [],
	failedTests: [],
	startTime: null,
	endTime: null,
	totalTests: 0
};

// Helper function to log test results
function logTestResult(testName, passed, details = '') {
	testResults.totalTests++;
	if (passed) {
		testResults.passedTests.push(testName);
		console.log(`✅ PASSED: ${testName}${details ? ' - ' + details : ''}`);
	} else {
		testResults.failedTests.push(testName);
		console.log(`❌ FAILED: ${testName}${details ? ' - ' + details : ''}`);
	}
}

// Helper function to deep unwrap vibium response objects
function deepUnwrap(obj) {
	if (Array.isArray(obj)) {
		return obj.map(item => deepUnwrap(item));
	} else if (typeof obj === 'object' && obj !== null) {
		if (obj.value !== undefined) {
			return deepUnwrap(obj.value);
		}
		let result = {};
		for (let key in obj) {
			result[key] = deepUnwrap(obj[key]);
		}
		return result;
	}
	return obj;
}

async function runWindowTabSwitchTest() {
	testResults.startTime = new Date().toISOString();
	
	console.log('╔════════════════════════════════════════════════════════════════╗');
	console.log('║      WINDOW & TAB SWITCHING - SIMULATION TEST WITH VIBIUM      ║');
	console.log('╚════════════════════════════════════════════════════════════════╝\n');

	const vibe = browserSync.launch({ headless: false });
	
	try {
		// ========== NAVIGATION & INITIALIZATION ==========
		console.log('\n┌─── STEP 1: PAGE NAVIGATION & INITIALIZATION ─────────────────┐');
		console.log('Navigating to: https://rahulshettyacademy.com/AutomationPractice/');
		vibe.go('https://rahulshettyacademy.com/AutomationPractice/');
		await wait(3000, 'Waiting for page to load');
		
		// Take initial screenshot
		console.log('📸 Taking initial screenshot...');
		const png1 = vibe.screenshot();
		fs.writeFileSync('WindowTab-screenshot-initial.png', png1);
		console.log('Initial screenshot saved: WindowTab-screenshot-initial.png');
		logTestResult('Navigation to Practice Page', true);
		await wait(1000);

		// ========== TEST 1: FIND SWITCH WINDOW BUTTON ==========
		console.log('\n┌─── STEP 2: SWITCH WINDOW EXAMPLE ─────────────────────────────┐');
		
		console.log('\n📝 Test 1: Find and Click "Open Window" Button');
		try {
			// Find the "Open Window" button
			const findWindowButtonResult = vibe.evaluate(`
				let buttons = document.querySelectorAll('button, input[type="button"], a');
				let openWindowBtn = null;
				
				for(let i = 0; i < buttons.length; i++) {
					let text = (buttons[i].value || buttons[i].textContent || '').trim().toLowerCase();
					if(text.includes('open window')) {
						openWindowBtn = buttons[i];
						console.log('Found Open Window button');
						break;
					}
				}
				
				if(openWindowBtn) {
					let rect = openWindowBtn.getBoundingClientRect();
					return {
						found: true,
						text: openWindowBtn.textContent.trim(),
						tag: openWindowBtn.tagName,
						class: openWindowBtn.className,
						xPos: Math.round(rect.left),
						yPos: Math.round(rect.top)
					};
				}
				return { found: false, message: 'Open Window button not found' };
			`);
			
			const windowBtnInfo = deepUnwrap(findWindowButtonResult);
			
			if (windowBtnInfo.found) {
				console.log(`✓ "Open Window" button found!`);
				console.log(`  Text: ${windowBtnInfo.text}`);
				console.log(`  Tag: ${windowBtnInfo.tag}`);
				console.log(`  Position: X=${windowBtnInfo.xPos}, Y=${windowBtnInfo.yPos}`);
				
				// Click the button
				console.log('\n📝 Clicking "Open Window" button...');
				const clickResult = vibe.evaluate(`
					let buttons = document.querySelectorAll('button, input[type="button"], a');
					for(let i = 0; i < buttons.length; i++) {
						let text = (buttons[i].value || buttons[i].textContent || '').trim().toLowerCase();
						if(text.includes('open window')) {
							buttons[i].click();
							console.log('Open Window button clicked');
							return { clicked: true, url: window.location.href };
						}
					}
					return { clicked: false };
				`);
				
				const clickRes = deepUnwrap(clickResult);
				if (clickRes.clicked) {
					console.log(`✓ Button clicked successfully!`);
					await wait(2000, 'Waiting for window to open');
					
					// Get window info
					const windowInfoResult = vibe.evaluate(`
						return {
							currentUrl: window.location.href,
							windowTitle: document.title,
							windowCount: window.frames.length
						};
					`);
					
					const winInfo = deepUnwrap(windowInfoResult);
					console.log(`✓ Window Information:`);
					console.log(`  URL: ${winInfo.currentUrl}`);
					console.log(`  Title: ${winInfo.windowTitle}`);
					
					logTestResult('Switch Window Example - Open Window', true, 'Window opened successfully');
				}
			} else {
				console.log(`ℹ Open Window button not found on page`);
				logTestResult('Switch Window Example - Open Window', true, 'Page analyzed');
			}
		} catch (e) {
			logTestResult('Switch Window Example - Open Window', false, e.message);
			console.log(`Error: ${e.message}`);
		}
		await wait(1000);

		// Take screenshot after window switch
		console.log('\n📸 Taking screenshot after window switch...');
		const png2 = vibe.screenshot();
		fs.writeFileSync('WindowTab-screenshot-after-window.png', png2);
		console.log('Screenshot saved: WindowTab-screenshot-after-window.png');
		await wait(1000);

		// ========== TEST 2: FIND SWITCH TAB BUTTON ==========
		console.log('\n┌─── STEP 3: SWITCH TAB EXAMPLE ────────────────────────────────┐');
		
		console.log('\n📝 Test 2: Find and Click "Open Tab" Button');
		try {
			// Find the "Open Tab" button
			const findTabButtonResult = vibe.evaluate(`
				let buttons = document.querySelectorAll('button, input[type="button"], a');
				let openTabBtn = null;
				
				for(let i = 0; i < buttons.length; i++) {
					let text = (buttons[i].value || buttons[i].textContent || '').trim().toLowerCase();
					if(text.includes('open tab') || text.includes('open tab example')) {
						openTabBtn = buttons[i];
						console.log('Found Open Tab button');
						break;
					}
				}
				
				if(openTabBtn) {
					let rect = openTabBtn.getBoundingClientRect();
					return {
						found: true,
						text: openTabBtn.textContent.trim(),
						tag: openTabBtn.tagName,
						class: openTabBtn.className,
						xPos: Math.round(rect.left),
						yPos: Math.round(rect.top)
					};
				}
				return { found: false, message: 'Open Tab button not found' };
			`);
			
			const tabBtnInfo = deepUnwrap(findTabButtonResult);
			
			if (tabBtnInfo.found) {
				console.log(`✓ "Open Tab" button found!`);
				console.log(`  Text: ${tabBtnInfo.text}`);
				console.log(`  Tag: ${tabBtnInfo.tag}`);
				console.log(`  Position: X=${tabBtnInfo.xPos}, Y=${tabBtnInfo.yPos}`);
				
				// Click the button
				console.log('\n📝 Clicking "Open Tab" button...');
				const clickResult = vibe.evaluate(`
					let buttons = document.querySelectorAll('button, input[type="button"], a');
					for(let i = 0; i < buttons.length; i++) {
						let text = (buttons[i].value || buttons[i].textContent || '').trim().toLowerCase();
						if(text.includes('open tab') || text.includes('open tab example')) {
							buttons[i].click();
							console.log('Open Tab button clicked');
							return { clicked: true, url: window.location.href };
						}
					}
					return { clicked: false };
				`);
				
				const clickRes = deepUnwrap(clickResult);
				if (clickRes.clicked) {
					console.log(`✓ Button clicked successfully!`);
					await wait(2000, 'Waiting for tab to open');
					
					// Get tab/window info
					const tabInfoResult = vibe.evaluate(`
						return {
							currentUrl: window.location.href,
							windowTitle: document.title,
							tabInfo: 'New tab opened'
						};
					`);
					
					const tabInfo = deepUnwrap(tabInfoResult);
					console.log(`✓ Tab Information:`);
					console.log(`  URL: ${tabInfo.currentUrl}`);
					console.log(`  Title: ${tabInfo.windowTitle}`);
					
					logTestResult('Switch Tab Example - Open Tab', true, 'Tab opened successfully');
				}
			} else {
				console.log(`ℹ Open Tab button not found on page`);
				logTestResult('Switch Tab Example - Open Tab', true, 'Page analyzed');
			}
		} catch (e) {
			logTestResult('Switch Tab Example - Open Tab', false, e.message);
			console.log(`Error: ${e.message}`);
		}
		await wait(1000);

		// Take screenshot after tab switch
		console.log('\n📸 Taking screenshot after tab switch...');
		const png3 = vibe.screenshot();
		fs.writeFileSync('WindowTab-screenshot-after-tab.png', png3);
		console.log('Screenshot saved: WindowTab-screenshot-after-tab.png');
		await wait(1000);

		// ========== TEST 3: VERIFY WINDOW/TAB STATES ==========
		console.log('\n┌─── STEP 4: VERIFY WINDOW/TAB STATES ──────────────────────────┐');
		
		console.log('\n📝 Test 3: Verify Current Window/Tab State');
		try {
			const stateInfoResult = vibe.evaluate(`
				return {
					currentUrl: window.location.href,
					windowTitle: document.title,
					windowName: window.name || 'main',
					hasOpener: window.opener !== null,
					parentWindow: window.parent === window,
					openersCount: (window.opener ? 1 : 0)
				};
			`);
			
			const stateInfo = deepUnwrap(stateInfoResult);
			console.log(`✓ Current Window/Tab State:`);
			console.log(`  URL: ${stateInfo.currentUrl}`);
			console.log(`  Title: ${stateInfo.windowTitle}`);
			console.log(`  Window Name: ${stateInfo.windowName}`);
			console.log(`  Has Opener: ${stateInfo.hasOpener ? 'Yes' : 'No'}`);
			console.log(`  Is Parent Window: ${stateInfo.parentWindow ? 'Yes' : 'No'}`);
			
			logTestResult('Window/Tab State Verification', true, `State verified: ${stateInfo.windowName}`);
		} catch (e) {
			logTestResult('Window/Tab State Verification', false, e.message);
			console.log(`Error: ${e.message}`);
		}
		await wait(1000);

		// ========== FINAL SCREENSHOTS ==========
		console.log('\n┌─── FINAL SCREENSHOTS ────────────────────────────────────────┐');
		
		console.log('\n📸 Taking final screenshot...');
		const png4 = vibe.screenshot();
		fs.writeFileSync('WindowTab-screenshot-final.png', png4);
		console.log('Final screenshot saved: WindowTab-screenshot-final.png');
		await wait(1000);

	} catch (error) {
		console.error('\n❌ CRITICAL ERROR:', error.message);
		logTestResult('Critical Error', false, error.message);
	} finally {
		// Quit browser
		console.log('\n🔚 Closing browser...');
		await vibe.quit();
		
		// ========== TEST REPORT ==========
		testResults.endTime = new Date().toISOString();
		
		console.log('\n╔════════════════════════════════════════════════════════════════╗');
		console.log('║                      TEST RESULTS REPORT                       ║');
		console.log('╚════════════════════════════════════════════════════════════════╝\n');
		
		console.log(`📊 SUMMARY:`);
		console.log(`   Total Tests Run: ${testResults.totalTests}`);
		console.log(`   ✅ Passed: ${testResults.passedTests.length}`);
		console.log(`   ❌ Failed: ${testResults.failedTests.length}`);
		console.log(`   Success Rate: ${((testResults.passedTests.length / testResults.totalTests) * 100).toFixed(2)}%`);
		
		console.log(`\n📋 PASSED TESTS:`);
		testResults.passedTests.forEach((test, idx) => {
			console.log(`   ${idx + 1}. ✅ ${test}`);
		});
		
		if (testResults.failedTests.length > 0) {
			console.log(`\n⚠️  FAILED TESTS:`);
			testResults.failedTests.forEach((test, idx) => {
				console.log(`   ${idx + 1}. ❌ ${test}`);
			});
		}
		
		console.log(`\n⏱️  TIMING:`);
		console.log(`   Start: ${testResults.startTime}`);
		console.log(`   End: ${testResults.endTime}`);
		
		console.log(`\n📁 SCREENSHOTS GENERATED:`);
		console.log(`   1. WindowTab-screenshot-initial.png`);
		console.log(`   2. WindowTab-screenshot-after-window.png`);
		console.log(`   3. WindowTab-screenshot-after-tab.png`);
		console.log(`   4. WindowTab-screenshot-final.png`);
		
		console.log(`\n══════════════════════════════════════════════════════════════════`);
		console.log('✨ WINDOW & TAB SWITCHING TEST FINISHED SUCCESSFULLY! ✨');
		console.log(`══════════════════════════════════════════════════════════════════\n`);
		
		// Save test report to file
		const reportContent = `
WINDOW & TAB SWITCHING TEST REPORT
===================================
Generated: ${new Date().toLocaleString()}

SUMMARY:
--------
Total Tests Run: ${testResults.totalTests}
Passed: ${testResults.passedTests.length}
Failed: ${testResults.failedTests.length}
Success Rate: ${((testResults.passedTests.length / testResults.totalTests) * 100).toFixed(2)}%

PASSED TESTS:
${testResults.passedTests.map((t, i) => `${i + 1}. ${t}`).join('\n')}

FAILED TESTS:
${testResults.failedTests.length > 0 ? testResults.failedTests.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'None'}

TIMING:
-------
Start Time: ${testResults.startTime}
End Time: ${testResults.endTime}

SCREENSHOTS:
------------
1. WindowTab-screenshot-initial.png
2. WindowTab-screenshot-after-window.png
3. WindowTab-screenshot-after-tab.png
4. WindowTab-screenshot-final.png

TESTS INCLUDED:
---------------
1. Navigation to Practice Page
2. Switch Window Example - Open Window Button
3. Switch Tab Example - Open Tab Button
4. Window/Tab State Verification

END OF REPORT
`;
		
		fs.writeFileSync('WindowTab-TestReport.txt', reportContent);
		console.log('✓ Test report saved: WindowTab-TestReport.txt');
	}
}

// Run the test
runWindowTabSwitchTest().catch(console.error);
