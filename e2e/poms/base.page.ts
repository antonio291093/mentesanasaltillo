import { Page, expect } from '@playwright/test';

/**
 * Abstract base class for all Page Object Models.
 *
 * Every POM in the test suite must extend this class and implement
 * the setUp() and tearDown() lifecycle methods.
 */
export abstract class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==========================================
    // LIFECYCLE (abstract — every POM must implement)
    // ==========================================

    /**
     * Navigate to the page and clean up any stale data left by
     * previous failed test runs. Called once via test.beforeAll
     * in the spec file.
     */
    abstract setUp(): Promise<void>;

    /**
     * Clean up any data created during the test suite.
     * Called when needed in the spec (e.g. test.afterAll).
     */
    abstract tearDown(): Promise<void>;

    // ==========================================
    // REUSABLE HELPERS
    // ==========================================

    /**
     * Waits for a toast notification with the expected message
     * to appear, then verifies its text content.
     */
    async waitForToast(message: string): Promise<void> {
        const toast = this.page.getByRole('status');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText(message);
    }

    /**
     * Dismisses any open modal dialog by clicking its close button.
     */
    async dismissModal(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: /close/i }).click();
        await expect(dialog).not.toBeVisible();
    }

    /**
     * Waits for any loading indicator to disappear before proceeding.
     */
    async waitForLoadingComplete(): Promise<void> {
        const spinner = this.page.getByRole('progressbar');
        await expect(spinner).toBeHidden();
    }
}
