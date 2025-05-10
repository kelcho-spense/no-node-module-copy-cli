import { Test } from '@nestjs/testing';
import { CopyService } from '../src/copy.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CopyService (e2e)', () => {
    let copyService: CopyService;
    const testDir = path.join(__dirname, 'test-dir');
    const destDir = path.join(__dirname, 'dest-dir');

    // Create test directory structure
    beforeAll(() => {
        // Create test directories and files
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        // Create a node_modules directory (should be skipped)
        const nodeModulesDir = path.join(testDir, 'node_modules');
        if (!fs.existsSync(nodeModulesDir)) {
            fs.mkdirSync(nodeModulesDir, { recursive: true });
        }
        fs.writeFileSync(path.join(nodeModulesDir, 'test.txt'), 'This should be skipped');

        // Create normal files (should be copied)
        fs.writeFileSync(path.join(testDir, 'test1.txt'), 'Test file 1');

        // Create nested directories
        const nestedDir = path.join(testDir, 'nested');
        if (!fs.existsSync(nestedDir)) {
            fs.mkdirSync(nestedDir, { recursive: true });
        }
        fs.writeFileSync(path.join(nestedDir, 'test2.txt'), 'Test file 2');

        // Create another node_modules directory in nested dir (should be skipped)
        const nestedNodeModules = path.join(nestedDir, 'node_modules');
        if (!fs.existsSync(nestedNodeModules)) {
            fs.mkdirSync(nestedNodeModules, { recursive: true });
        }
        fs.writeFileSync(path.join(nestedNodeModules, 'test3.txt'), 'This should be skipped too');
    });

    // Clean up after tests
    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
        if (fs.existsSync(destDir)) {
            fs.rmSync(destDir, { recursive: true, force: true });
        }
    });

    beforeEach(async () => {
        // Clean destination directory before each test
        if (fs.existsSync(destDir)) {
            fs.rmSync(destDir, { recursive: true, force: true });
        }

        const moduleRef = await Test.createTestingModule({
            providers: [CopyService],
        }).compile();

        copyService = moduleRef.get<CopyService>(CopyService);
    });

    it('should copy files and skip node_modules directories', async () => {
        // Execute the copy operation
        await copyService.copyDirectory(testDir, destDir);

        // Check results

        // Root level files should be copied
        expect(fs.existsSync(path.join(destDir, 'test1.txt'))).toBeTruthy();
        expect(fs.readFileSync(path.join(destDir, 'test1.txt'), 'utf-8')).toEqual('Test file 1');

        // Nested files should be copied
        expect(fs.existsSync(path.join(destDir, 'nested', 'test2.txt'))).toBeTruthy();
        expect(fs.readFileSync(path.join(destDir, 'nested', 'test2.txt'), 'utf-8')).toEqual('Test file 2');

        // node_modules directories should be skipped
        expect(fs.existsSync(path.join(destDir, 'node_modules'))).toBeFalsy();
        expect(fs.existsSync(path.join(destDir, 'nested', 'node_modules'))).toBeFalsy();
    });
});
