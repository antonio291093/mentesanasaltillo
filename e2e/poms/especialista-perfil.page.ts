import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class EspecialistaPerfilPage extends BasePage {
    constructor(page: InstanceType<typeof BasePage>['page'], private id: number) {
        super(page);
    }

    async setUp(): Promise<void> {
        await this.page.goto(`/especialistas/${this.id}`);
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    }

    async tearDown(): Promise<void> {}

    async assertNameVisible(): Promise<void> {
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async assertVerifiedBadgeVisible(): Promise<void> {
        await expect(this.page.getByText('Verificado')).toBeVisible();
    }

    /** Visible when NOT authenticated — shows "Ver información de contacto" button */
    async assertContactButtonVisible(): Promise<void> {
        await expect(
            this.page.getByRole('button', { name: /Ver información de contacto/i })
        ).toBeVisible();
    }

    /** Link to login within the contact section (unauthenticated state) */
    async assertLoginLinkInContactSection(): Promise<void> {
        await expect(
            this.page.getByRole('link', { name: /Inicia sesión/i })
        ).toBeVisible();
    }

    /** Visible when authenticated — shows the "Contacta directamente" message */
    async assertContactInfoVisible(): Promise<void> {
        await expect(
            this.page.getByText(/Contacta directamente/i)
        ).toBeVisible();
    }

    async goBackToListing(): Promise<void> {
        await this.page.getByRole('link', { name: /Todos los especialistas/i }).click();
        await this.page.waitForURL(/\/especialistas$/);
    }
}
