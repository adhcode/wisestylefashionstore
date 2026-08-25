/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
 * 
 * This test encodes the expected behavior: the dev server should start successfully
 * without module resolution errors. When the bug exists, this test will fail.
 * After the fix is implemented, this test should pass.
 * 
 * Property: Dev Server Module Resolution
 * For any dev server start event where the PostCSS configuration references
 * the Tailwind CSS PostCSS plugin, the system SHALL successfully resolve
 * the module and start the dev server without module resolution errors.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Bug Condition Exploration: Tailwind PostCSS Module Resolution', () => {
  const DEV_SERVER_TIMEOUT = 30000; // 30 seconds to start dev server

  test('Property 1: Dev server should start without module resolution errors', async () => {
    // EXPECTED OUTCOME ON UNFIXED CODE: This test will FAIL with "Cannot find module '@tailwindcss/postcss'"
    // This failure is CORRECT - it proves the bug exists
    
    let serverProcess: any = null;
    
    try {
      // Attempt to start the dev server
      // We use a promise that resolves when we detect successful startup
      // or rejects when we detect the module resolution error
      
      const serverStartPromise = new Promise<string>((resolve, reject) => {
        const childProcess = exec('npm run dev', {
          cwd: process.cwd(),
        });

        let stdout = '';
        let stderr = '';
        let moduleErrorDetected = false;

        childProcess.stdout?.on('data', (data: string) => {
          stdout += data;
          console.log('[DEV SERVER STDOUT]:', data);
          
          // Check for successful server start
          if (data.includes('Ready in') || data.includes('Local:') || data.includes('localhost:3000')) {
            resolve('Server started successfully');
          }
        });

        childProcess.stderr?.on('data', (data: string) => {
          stderr += data;
          console.error('[DEV SERVER STDERR]:', data);
          
          // Check for the specific module resolution error
          if (data.includes("Cannot find module '@tailwindcss/postcss'") ||
              data.includes("Module not found: Error: Can't resolve '@tailwindcss/postcss'")) {
            moduleErrorDetected = true;
            reject(new Error(`Module resolution failed: ${data}`));
          }
        });

        childProcess.on('error', (error: Error) => {
          reject(new Error(`Process error: ${error.message}`));
        });

        childProcess.on('exit', (code: number | null) => {
          if (code !== 0 && !moduleErrorDetected) {
            reject(new Error(`Server exited with code ${code}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
          }
        });

        serverProcess = childProcess;
      });

      // Wait for server to start or fail
      await serverStartPromise;
      
      // If we get here, the server started successfully (expected behavior)
      console.log('✓ Dev server started successfully without module resolution errors');
      
    } catch (error: any) {
      // EXPECTED ON UNFIXED CODE: We should catch the module resolution error here
      console.error('✗ Dev server failed to start:', error.message);
      
      // Document the counterexample
      const counterexample = {
        action: 'start_dev_server',
        postcssConfig: '@tailwindcss/postcss',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      
      console.log('\n=== COUNTEREXAMPLE FOUND ===');
      console.log(JSON.stringify(counterexample, null, 2));
      console.log('===========================\n');
      
      // Re-throw to fail the test (this is expected on unfixed code)
      throw error;
      
    } finally {
      // Cleanup: kill the dev server process if it's running
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
        
        // Give it a moment to cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force kill if still running
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }
    }
  }, DEV_SERVER_TIMEOUT);

  test('Diagnostic: Direct module require test', async () => {
    // Attempt to require the module directly to confirm it doesn't exist
    try {
      await execAsync('node -e "require(\'@tailwindcss/postcss\')"');
      console.log('✓ Module @tailwindcss/postcss was found');
    } catch (error: any) {
      console.error('✗ Module @tailwindcss/postcss not found:', error.message);
      
      // Document the diagnostic finding
      console.log('\n=== DIAGNOSTIC: MODULE NOT RESOLVABLE ===');
      console.log('Module @tailwindcss/postcss cannot be resolved by Node.js');
      console.log('Error:', error.message);
      console.log('========================================\n');
      
      // This is expected to fail on unfixed code, confirming our hypothesis
      expect(error.message).toContain('Cannot find module');
    }
  });

  test('Diagnostic: Check tailwindcss package exports', async () => {
    // Inspect the tailwindcss package.json to understand actual exports
    try {
      const { stdout } = await execAsync('cat node_modules/tailwindcss/package.json');
      const packageJson = JSON.parse(stdout);
      
      console.log('\n=== DIAGNOSTIC: TAILWINDCSS PACKAGE STRUCTURE ===');
      console.log('Package name:', packageJson.name);
      console.log('Package version:', packageJson.version);
      console.log('Exports:', JSON.stringify(packageJson.exports, null, 2));
      console.log('Main:', packageJson.main);
      console.log('=================================================\n');
      
      // Check what the actual exports are
      if (packageJson.exports) {
        const hasPostCSSExport = JSON.stringify(packageJson.exports).includes('postcss');
        console.log('Has PostCSS export?', hasPostCSSExport);
      }
      
    } catch (error: any) {
      console.error('Could not inspect tailwindcss package:', error.message);
    }
  });

  test('Diagnostic: Test alternative imports', async () => {
    // Test if the main tailwindcss package can be resolved
    const alternatives = [
      'tailwindcss',
      'tailwindcss/postcss',
      '@tailwindcss/postcss',
    ];
    
    console.log('\n=== DIAGNOSTIC: ALTERNATIVE MODULE IMPORTS ===');
    
    for (const moduleName of alternatives) {
      try {
        await execAsync(`node -e "require('${moduleName}')"`);
        console.log(`✓ ${moduleName} - RESOLVED`);
      } catch (error: any) {
        console.log(`✗ ${moduleName} - NOT FOUND`);
      }
    }
    
    console.log('==============================================\n');
  });
});
