import { useEffect, useCallback } from 'react';

interface TkinterControlProps {
    host?: string;
    port?: number;
}

const TkinterControl: React.FC<TkinterControlProps> = ({
                                                           host = 'localhost',
                                                           port = 8888
                                                       }) => {
    const baseUrl = `http://${host}:${port}`;

    const makeRequest = useCallback(async (
        endpoint: string,
        data?: Record<string, any>
    ) => {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data || {}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }, [baseUrl]);

    const nextButton = useCallback(() => makeRequest('/next-button'), [makeRequest]);
    const skipButton = useCallback(() => makeRequest('/skip-button'), [makeRequest]);
    const previousButton = useCallback(() => makeRequest('/previous-button'), [makeRequest]);
    const reset = useCallback(() => makeRequest('/reset'), [makeRequest]);
    const selectProject = useCallback((index: number) => makeRequest('/select-project', { index }), [makeRequest]);
    const getStatus = useCallback(() => makeRequest('/status'), [makeRequest]);

    useEffect(() => {
        const handleKeyPress = async (event: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = event.key.toLowerCase();

            switch (key) {
                case 'n':
                    await nextButton();
                    break;
                case 's':
                    await skipButton();
                    break;
                case 'p':
                    await previousButton();
                    break;
                case 'r':
                    await reset();
                    break;
                case '?':
                    await getStatus();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    await selectProject(parseInt(key));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Get initial status on mount
        getStatus();

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [nextButton, skipButton, previousButton, reset, selectProject, getStatus]);

    // Return nothing - invisible component
    return null;
};

export default TkinterControl;