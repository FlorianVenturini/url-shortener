export class CreateShortUrlBody {
    redirectTo: string;

    activeUntil?: string; // Should be a valid Date
}
